---
layout:              post
title:               Elasticsearch 快照仓库的内部结构
subtitle:            >
    这些文件，你都了解吗？

lang:                zh
date:                2021-09-04 10:11:10 +0200
categories:          [elasticsearch]
tags:                [elasticsearch, java]
comments:            true
excerpt:             >
    这篇文章带大家走进 Elasticsearch 快照仓库，看看它的内部结构，了解不同文件的内容和用途。

image:               /assets/bg-dmitrij-paskevic-YjVa-F9P9kk-unsplash.jpg
cover:               /assets/bg-dmitrij-paskevic-YjVa-F9P9kk-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
ads:                 none
---

<!--
  Replace asset link with following on Chinese Platforms:
  https://github.com/mincong-h/mincong-h.github.io/raw/master/
 -->

## 前言

如果你在生产线上使用 Elasticsearch 集群，那么我相信你一定听说过 Elasticsearch 的快照和恢复功能（snapshot and restore），因为它是保证集群数据不丢失的重要手段。网上有很多资料关于如何使用 Elasticsearch 快照，可是关于快照底层原理的文章却很少。今天，我想和大家来探讨一下 Elasticsearch 快照仓库（snapshot repository）的内部结构。明白这个结构，它能使我们对 Elasticsearch 快照功能有更好的了解，也能在生产线出问题的时候，提供更多排除故障的思路。

阅读本文后，你会明白：

- 什么是快照仓库？
- 快照仓库的文件类型
- 进一步了解 index-N 文件
- 进一步了解 index.latest 文件
- 进一步了解快照信息文件

事不宜迟，让我们马上开始吧！

## 什么是快照仓库？

快照仓库是 Elasticsearch 存储快照（snapshot）的地方，一个快照仓库可以存储多个快照。快照是 Elasticsearch 储存备份的方式，你可以对所有索引或者单个索引进行快照。在一个快照仓库中，快照是增量的：新的快照只会快照那些在之前快照中未被快照的部分，避免浪费时间和储存空间。快照仓库有多种类型：可以是文件系统仓库，也可以是云供应商的云存储仓库，比如 AWS S3、Google Cloud Storage、Azure Blob Storage、Aliyun OSS 等。

## 快照仓库的文件类型

下面，我们看看一个快照仓库的不同文件的概况。这里引用关于[快照仓库存储的 Elasticsearch 7.12 版的官方 Javadoc（节选）](https://github.com/elastic/elasticsearch/blob/7.12/server/src/main/java/org/elasticsearch/repositories/blobstore/package-info.java "快照仓库存储的 Javadoc - Elasticsearch 7.12")：

```
 STORE_ROOT
 |- index-N           - JSON serialized {@link org.elasticsearch.repositories.RepositoryData} containing a list of all snapshot ids
 |                      and the indices belonging to each snapshot, N is the generation of the file
 |- index.latest      - contains the numeric value of the latest generation of the index file (i.e. N from above)
 |- incompatible-snapshots - list of all snapshot ids that are no longer compatible with the current version of the cluster
 |- snap-20131010.dat - SMILE serialized {@link org.elasticsearch.snapshots.SnapshotInfo} for snapshot "20131010"
 |- meta-20131010.dat - SMILE serialized {@link org.elasticsearch.cluster.metadata.Metadata } for snapshot "20131010"
 |                      (includes only global metadata)
 |- snap-20131011.dat - SMILE serialized {@link org.elasticsearch.snapshots.SnapshotInfo} for snapshot "20131011"
 |- meta-20131011.dat - SMILE serialized {@link org.elasticsearch.cluster.metadata.Metadata } for snapshot "20131011"
 .....
 |- indices/ - data for all indices
    |- Ac1342-B_x/ - data for index "foo" which was assigned the unique id Ac1342-B_x (not to be confused with the actual index uuid)
    |  |             in the repository
    |  |- meta-20131010.dat - JSON Serialized {@link org.elasticsearch.cluster.metadata.IndexMetadata} for index "foo"
    |  |- 0/ - data for shard "0" of index "foo"
    |  |  |- __1                      \  (files with numeric names were created by older ES versions)
    |  |  |- __2                      |
    |  |  |- __VPO5oDMVT5y4Akv8T_AO_A |- files from different segments see snap-* for their mappings to real segment files
    |  |  |- __1gbJy18wS_2kv1qI7FgKuQ |
    |  |  |- __R8JvZAHlSMyMXyZc2SS8Zg /
    |  |  .....
    |  |  |- snap-20131010.dat - SMILE serialized {@link org.elasticsearch.index.snapshots.blobstore.BlobStoreIndexShardSnapshot} for
    |  |  |                      snapshot "20131010"
    |  |  |- snap-20131011.dat - SMILE serialized {@link org.elasticsearch.index.snapshots.blobstore.BlobStoreIndexShardSnapshot} for
    |  |  |                      snapshot "20131011"
    |  |  |- index-123         - SMILE serialized {@link org.elasticsearch.index.snapshots.blobstore.BlobStoreIndexShardSnapshots} for
    |  |  |                      the shard (files with numeric suffixes were created by older versions, newer ES versions use a uuid
    |  |  |                      suffix instead)
    |  |
    |  |- 1/ - data for shard "1" of index "foo"
    |  |  |- __1
    |  |  |- index-Zc2SS8ZgR8JvZAHlSMyMXy - SMILE serialized {@code BlobStoreIndexShardSnapshots} for the shard
    |  |  .....
    |  |
    |  |-2/
    |  ......
    |
    |- 1xB0D8_B3y/ - data for index "bar" which was assigned the unique id of 1xB0D8_B3y in the repository
    ......
```

以表格形式再整理一下：

文件路径 | 解释
:--- | :---
`index-N` | 以 JSON 格式序列化的 `RepositoryData`，包含所有的快照 IDs 以及它们所对应的索引。N 代表这个文件是第几代。
`index.latest` | 文件是一个指针，以数字形式表示最后一代的 index 文件，也就是上面所说的数字 N。这里的 N 是一个 16 进制的数字，比如说第 100 代的 index（十进制），最后就以 16 进制中的 64 表示，因为 64 = 16*6 + 4。
`incompatible-snapshots` | 所有的已经不再与与当前集群版本兼容的快照 ID 列表
`snap-20131010.dat` | 以 SMILE 格式序列化的 `SnapshotInfo`，用来表示快照 20131010 所对应的信息
`meta-20131010.dat` | 以 SMILE 格式序列化的 `Metadata`，用来表示快照 20131010 所对应的全局元数据（global metadata）
`indices/` | 所有的索引数据
`indices/Ac1342-B_x/` | 索引 foo 所对应的数据。索引在仓库中的 UUID 是 Ac1342-B_x。但不要跟索引的 UUID 混淆。
`indices/Ac1342-B_x/meta-20131010.dat` | 索引 foo 以 JSON 格式序列化的 `IndexMetadata`
`indices/Ac1342-B_x/0/` | 索引 foo 分片 0 所对应的数据
`indices/Ac1342-B_x/0/__1` | 以数字结尾的文件是由旧版的 Elasticsearch 创建的
`indices/Ac1342-B_x/0/__2` | 同上
`indices/Ac1342-B_x/0/__VPO5oDMVT5y4Akv8T_AO_A` | segments 文件，具体的跟真正 segment 的 mappings 见 `snap-*` 文件
`indices/Ac1342-B_x/0/__1gbJy18wS_2kv1qI7FgKuQ` | 同上
`indices/Ac1342-B_x/0/__R8JvZAHlSMyMXyZc2SS8Zg` | 同上
`indices/Ac1342-B_x/0/snap-20131010.dat` | 快照 20131010 以 SMILE 格式序列化的 `BlobStoreIndexShardSnapshot`
`indices/Ac1342-B_x/0/snap-20131011.dat` | 快照 20131011 以 SMILE 格式序列化的 `BlobStoreIndexShardSnapshot`
`indices/Ac1342-B_x/0/index-123` | 分片 0 以 SMILE 格式序列化的 `BlobStoreIndexShardSnapshots`。如果以数字结尾的话，证明是旧版 Elasticsearch 创建的，如果是以 UUID 结尾的话，则是被新版 Elasticsearch 创建的。

## 准备数据

接下来，让我们来看看一些比较重要的文件。

不过在开始前，先在本地准备一下，启动 Elasticsearch，创建一些数据和快照。

```sh
es_repo="${HOME}/es-backup/blog-snapshot-repo-structure/"

# Start Elasticsearch
docker run \
  --rm \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "cluster.name=es-docker-cluster" \
  -e "path.repo=/opt/elasticsearch/backup" \
  -v "${es_repo}:/opt/elasticsearch/backup" \
  docker.elastic.co/elasticsearch/elasticsearch:7.12.0

# Create document
curl -X PUT localhost:9200/my_index/_doc/1 \
  -H 'Content-Type: application/json' \
  -d '{"msg": "Hello Elasticsearch"}'

# Create snapshot repository
curl -X PUT localhost:9200/_snapshot/my_repo \
  -H 'Content-Type: application/json' \
  -d '{
  "type": "fs",
  "settings": {
    "location": "my_repo"
  }
}'

# Create snapshot
curl -X PUT localhost:9200/_snapshot/my_repo/my_snapshot_1 \
  -H 'Content-Type: application/json' \
  -d '{
  "indices": "my_index",
  "include_global_state": false,
  "metadata": {
    "taken_by": "Mincong",
    "taken_because": "https://mincong.io is the best blog for learning Elasticsearch"
  }
}'
```

然后进入本地文件夹 blog-snapshot-repo-structure，确保仓库 my_repo 以及里面的文件都准备就绪：

```
➜  blog-snapshot-repo-structure find my_repo
my_repo
my_repo/index-0
my_repo/indices
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg/0
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg/0/index-MwjmFzyOT_2NI6DdXLcsNw
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg/0/__IlzZcMdOSkC-j6xx0Qj04A
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg/0/snap-2hiUzvH3RPCp9iOeiTa6TQ.dat
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg/0/__jQbQk7YYTwW8G5gL_RtR8w
my_repo/indices/Uxom82JcSfORXgbtZ4jLSg/meta-N1BHtXsBYxjWXi8lXhTR.dat
my_repo/index.latest
my_repo/meta-2hiUzvH3RPCp9iOeiTa6TQ.dat
my_repo/snap-2hiUzvH3RPCp9iOeiTa6TQ.dat
```

下面，我们可以进一步探索文件内容啦！

## index-N 文件

```sh
cat index-0 | jq
```

```js
{
  "min_version": "7.12.0",
  "uuid": "C87ijmZURAK3ij8MsAaDAw",
  "cluster_id": "aSNpPgDAShyYAiKhsun6IA",
  "snapshots": [
    {
      "name": "my_snapshot_1",
      "uuid": "2hiUzvH3RPCp9iOeiTa6TQ",
      "state": 1,
      "index_metadata_lookup": {
        "Uxom82JcSfORXgbtZ4jLSg": "Uz7B9HV2SJ6peiLiUMJhyg-_na_-1-2-1"
      },
      "version": "7.12.0"
    }
  ],
  "indices": {
    "my_index": {
      "id": "Uxom82JcSfORXgbtZ4jLSg",
      "snapshots": [
        "2hiUzvH3RPCp9iOeiTa6TQ"
      ],
      "shard_generations": [
        "MwjmFzyOT_2NI6DdXLcsNw"
      ]
    }
  },
  "index_metadata_identifiers": {
    "Uz7B9HV2SJ6peiLiUMJhyg-_na_-1-2-1": "N1BHtXsBYxjWXi8lXhTR"
  }
}
```

```
$ curl "localhost:9200/_cat/indices/my_index?v"
health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   my_index Uz7B9HV2SJ6peiLiUMJhyg   1   1          1            0      3.9kb          3.9kb
```

上述文件 index-0 表示第 0 代（generation 0）快照。它是以 JSON 格式序列化的 `RepositoryData`，包含所有的快照 IDs 以及它们所对应的索引。索引 my_index 在仓库中的 UUID 是 Uxom82JcSfORXgbtZ4jLSg，它在集群中对应的 UUID 是 Uz7B9HV2SJ6peiLiUMJhyg。这个索引被一个快照所引用，也就是快照 my_snapshot_1（2hiUzvH3RPCp9iOeiTa6TQ）。

## index.latest 文件

index.latest 文件是一个指针，以数字形式表示最后一代的 index 文件，也就是上面所说的数字 N。这里的 N 是一个 16 进制的数字，比如说第 100 代的 index（十进制），最后就以 16 进制中的 64 表示，因为 64 = 16*6 + 4。在上文准备的仓库 my_repo 中，因为是只进行了一次快照，所以它是第 0 代：

```
➜  hexdump index.latest
0000000 00 00 00 00 00 00 00 00
0000008
```

下面，让我们生成更多的文档，然后造出更多的快照，这样我们就可以更好地查看 `index.latest` 的变化：

```sh
for i in {2..20}
do
  echo "Creating document ${i}"
  curl -s -X PUT "localhost:9200/my_index/_doc/${i}" \
    -H 'Content-Type: application/json' \
    -d "{\"msg\": \"Hello Elasticsearch ${i}\"}"

  echo "Creating snapshot ${i}"
  curl -s -X PUT "localhost:9200/_snapshot/my_repo/my_snapshot_${i}" \
    -H 'Content-Type: application/json' \
    -d '{
    "indices": "my_index",
    "include_global_state": false,
    "metadata": {
      "taken_by": "Mincong",
      "taken_because": "https://mincong.io is the best blog for learning Elasticsearch"
    }
  }'
done
```

这个时候，index.latest 变成了第 19 代（从 0 代开始，所以其实是第 20 次）。19 = 16*1 + 3

```
➜  hexdump index.latest
0000000 00 00 00 00 00 00 00 13
0000008
```

```
➜  echo 'ibase=16; 13' | bc
19
```

那 Elasticsearch 是如何通过 index-N 和 index.latest 文件加载仓库数据 `RepositoryData` 的呢？

加载 RepositoryData 以及索引名称到其仓库 IndexId 的映射，这是通过调用 BlobStoreRepository.getRepositoryData 完成的。具体实现如下：

1. 第一步：储存
   1. blobstore 仓库将 RepositoryData 存储在仓库根目录下的 /index-N 处以递增后缀 N 命名的文件中。
   2. 对于每个 BlobStoreRepository，集群状态中都存在一个 RepositoryMetadata 类型的条目。它跟踪当前有效的第 N 代以及尝试写入的最新一代。
   3. blobstore 还将最近的 N 存储为 64 位长度，直接在存储库根目录下的文件 /index.latest 中。
2. 第二步：确定 N 的值
   1. 首先，通过在仓库根目录下列出所有带有前缀 index- 的 blob，然后选择 N 值最高的文件，获取所有索引为 N 的文件列表，从而找到最新的  `RepositoryData`
   2. 如果此操作因仓库的 BlobContainer 不支持列表操作而失败（在只读仓库会出现这样的情况），则从 index.latest 文件中读取 N 的最大值。
3. 第三步：反序列化
   1. 使用刚刚确定的 N 值并获取 /index-N blob 并从中反序列化 RepositoryData。
   2. 如果由于存储库中既不存在 index.latest 也不存在任何 index-N 文件，则找不到 N 的值，则假定它为空并返回 `RepositoryData.EMPTY`。

## 仓库层面的快照信息

以 SMILE 格式序列化的 `SnapshotInfo`，用来表示快照所对应的信息。下面是快照 my_snapshot_20 所对应的信息 `snap-WbjaeQk1T4u2JrGfsWlHsw.dat`。值得一提的是，SMILE格式的文件没办法直接查看（比如使用 cat）。你需要专门的解调工具，比如 [cowtowncoder/Jackformer](https://github.com/cowtowncoder/Jackformer "cowtowncoder/Jackformer")。转成 JSON 以后得到以下的结果：

```js
// decoded version of repository-level snapshot info
// $STORE_ROOT/snap-WbjaeQk1T4u2JrGfsWlHsw.dat
{
  "snapshot" : {
    "name" : "my_snapshot_20",
    "uuid" : "WbjaeQk1T4u2JrGfsWlHsw",
    "version_id" : 7120099,
    "indices" : [ "my_index" ],
    "data_streams" : [ ],
    "state" : "SUCCESS",
    "include_global_state" : false,
    "metadata" : {
      "taken_by" : "Mincong",
      "taken_because" : "https://mincong.io is the best blog for learning Elasticsearch"
    },
    "start_time" : 1630835219489,
    "end_time" : 1630835222295,
    "total_shards" : 1,
    "successful_shards" : 1,
    "failures" : [ ],
    "feature_states" : [ ]
  }
}
```

## 分片层面的快照信息

```js
// decoded version of shard-level snapshot info
// $STORE_ROOT/indices/Uxom82JcSfORXgbtZ4jLSg/0/snap-WbjaeQk1T4u2JrGfsWlHsw.dat
{
  "name" : "my_snapshot_20",
  "index_version" : 12,
  "start_time" : 1630835221092,
  "time" : 0,
  "number_of_files" : 0,
  "total_size" : 0,
  "files" : [ {
    "name" : "__5NSZ0_cESkq6xuZO0KsflA",
    "physical_name" : "_b.cfe",
    "length" : 479,
    "checksum" : "10v9n85",
    "part_size" : 9223372036854775807,
    "written_by" : "8.8.0"
  }, {
    "name" : "__409YH-VqThKfHoKO64Jw3A",
    "physical_name" : "_c.cfs",
    "length" : 3921,
    "checksum" : "aro23l",
    "part_size" : 9223372036854775807,
    "written_by" : "8.8.0"
  }, {
    "name" : "__-y2SRorARLmutzx_8R0pdA",
    "physical_name" : "_7.cfs",
    "length" : 2954,
    "checksum" : "40ricv",
    "part_size" : 9223372036854775807,
    "written_by" : "8.8.0"
  }, {
    "name" : "v__eBFWiPBIRqetvzlHocSdmg",
    "physical_name" : "_c.si",
    "length" : 405,
    "checksum" : "1raps0i",
    "part_size" : 9223372036854775807,
    "written_by" : "8.8.0",
    "meta_hash" : "P9dsFxNMdWNlbmU4NlNlZ21lbnRJbmZvAAAAAIZgkzI3PmaEHCzgC37ywlIAAAAACAAAAAgAAAAAAQAAAAgAAAAIAAAAAAAAAA4BDAJvcwVMaW51eAxqYXZhLnZlcnNpb24GMTUuMC4xB29zLmFyY2gFYW1kNjQUamF2YS5ydW50aW1lLnZlcnNpb24IMTUuMC4xKzkGc291cmNlBW1lcmdlCm9zLnZlcnNpb24QNS4xMC4yNS1saW51eGtpdAtqYXZhLnZlbmRvcgxBZG9wdE9wZW5KREsPamF2YS52bS52ZXJzaW9uCDE1LjAuMSs5Dmx1Y2VuZS52ZXJzaW9uBTguOC4wE21lcmdlTWF4TnVtU2VnbWVudHMCLTELbWVyZ2VGYWN0b3ICMTAJdGltZXN0YW1wDTE2MzA4MzUyMTg2MDQDBl9jLmNmcwVfYy5zaQZfYy5jZmUBH0x1Y2VuZTg3U3RvcmVkRmllbGRzRm9ybWF0Lm1vZGUKQkVTVF9TUEVFRADAKJPoAAAAAAAAAADkIQAS"
  }, {
    "name" : "v__H3vg9g8aRsCMh3Ni-GypSA",
    "physical_name" : "_b.si",
    "length" : 367,
    "checksum" : "1ms49nm",
    "part_size" : 9223372036854775807,
    "written_by" : "8.8.0",
    "meta_hash" : "P9dsFxNMdWNlbmU4NlNlZ21lbnRJbmZvAAAAAIZgkzI3PmaEHCzgC37ywlEAAAAACAAAAAgAAAAAAQAAAAgAAAAIAAAAAAAAAAMBCgJvcwVMaW51eAtqYXZhLnZlbmRvcgxBZG9wdE9wZW5KREsMamF2YS52ZXJzaW9uBjE1LjAuMQ9qYXZhLnZtLnZlcnNpb24IMTUuMC4xKzkObHVjZW5lLnZlcnNpb24FOC44LjAHb3MuYXJjaAVhbWQ2NBRqYXZhLnJ1bnRpbWUudmVyc2lvbggxNS4wLjErOQZzb3VyY2UFZmx1c2gKb3MudmVyc2lvbhA1LjEwLjI1LWxpbnV4a2l0CXRpbWVzdGFtcA0xNjMwODM1MjE5MTkzAwZfYi5jZmUGX2IuY2ZzBV9iLnNpAR9MdWNlbmU4N1N0b3JlZEZpZWxkc0Zvcm1hdC5tb2RlCkJFU1RfU1BFRUQAwCiT6AAAAAAAAAAA09nN4g=="
  },
  ... ]
}
```

## 扩展

如何从这篇文章中拓展出去？

- 如果你想了解更多关于 Snapshot Repository 的内部文件格式或者加载机制，可以查看[快照仓库存储的 Elasticsearch 7.12 版的官方 Javadoc](https://github.com/elastic/elasticsearch/blob/7.12/server/src/main/java/org/elasticsearch/repositories/blobstore/package-info.java "快照仓库存储的 Javadoc - Elasticsearch 7.12")
- 如果你想了解更多关于 Snapshot Repository 的运行原理，可以查看 Steve Mushero 在 Medium 上面写的文章 [How Elasticsearch Snapshots Work](https://steve-mushero.medium.com/how-elasticsearch-snapshots-work-3824fdfc4493 "How Elasticsearch Snapshots Work")
- 如果你想了解更多关于 SMILE 格式的信息，可以查询维基百科 [Smile (data interchange format)](https://en.wikipedia.org/wiki/Smile_%28data_interchange_format%29 "Smile (data interchange format) - Wikipedia")或者查看 Ayush Gupta 在 Medium 上面写的文章 [Understanding Smile — A data format based on JSON](https://medium.com/code-with-ayush/understanding-smile-a-data-format-based-on-json-29972a37d376 "Understanding Smile — A data format based on JSON")

## 结论

在本文中，我们走进 Elasticsearch 的快照仓库，看到了它的内部结构。我们还进一步地了解了 index-N、index.latest、和一些跟快照相关的文件。希望明白这个结构，它能使你对 Elasticsearch 快照功能有更好的了解，也能在生产线出问题的时候，提供更多排除故障的思路。最后，我们简要地看到了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你的系统变得更好用。如果你有兴趣了解更多的资讯，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h "GitHub") 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

- Tatu Saloranta, ["Web app for flexible data transforms"](https://github.com/cowtowncoder/Jackformer), _GitHub_, 2021.
- Ayush Gupta, ["Understanding Smile — A data format based on JSON"](https://medium.com/code-with-ayush/understanding-smile-a-data-format-based-on-json-29972a37d376), _Medium_, 2019.
- Wikipedia, ["Smile (data interchange format)"](https://en.wikipedia.org/wiki/Smile_%28data_interchange_format%29), _Wikipedia_, 2021.

<!--
 WeChat:
   写作不易，希望大家点个赞、点个在看支持一下，谢谢！
   ![](https://mincong.io/assets/wechat-QR-code.jpg)

 CSDN:
   ![扫码关注](https://img-blog.csdnimg.cn/img_convert/f07c6cc9272c721180bad20c599e4ff7.png#pic_center =600x333)
-->
