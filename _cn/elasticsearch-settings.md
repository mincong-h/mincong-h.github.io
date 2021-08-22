---
layout:              post
title:               一文了解 Elasticsearch 设置
subtitle:            >
    集群设置、索引设置、节点设置

lang:                zh
date:                2021-08-21 18:07:13 +0200
categories:          [elasticsearch]
tags:                [elasticsearch]
comments:            true
excerpt:             >
    这篇文章讲述 Elasticsearch 的常见设置：集群设置、索引设置、节点设置，静态与动态设置的区别，以及一些常用的 curl 命令。

image:               /assets/bg-anthony-roberts-82wJ10pX1Fw-unsplash.jpg
cover:               /assets/bg-anthony-roberts-82wJ10pX1Fw-unsplash.jpg
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

如果你正在使用 Elasticsearch 集群，你一定离不开对它的配置。无论你的应用场景是什么、无论你在公司任职哪个职位，只要你使用到了 Elasticsearch，那么总是需要对它的配置有一定的了解，通过调整它们来更好地实现你的需求。可是另一方面，Elasticsearch 的配置有如此之多，让人有些无从下手。所以我想写这篇文章，跟大家分析一下如何快速明白 Elasticsearch 的常见设置。阅读本文后，你会明白：

- 设置的应用范围（集群、索引、节点、快照仓库等）
- 集群设置
- 索引设置
- 节点设置
- curl 用法举例

本文根据 Elasticsearch 7 所写，具体内容可能与你使用的版本略有不同。好了，事不宜迟，让我们马上开始吧！

## 设置的应用范围

Elasticsearch 中不同的设置可以应用到不同的范围。

| 范围                     | API                       | 描述                                                                                                                                                                                                                                                                                               |
| :----------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 集群                     | `/_cluster/settings`      | 这些设置会被应用到整个集群的所有节点，比如集群分片分配和路由（[cluster-level shard allocation and routing settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-cluster.html "cluster-level shard allocation and routing")）就属于集群级别的设置。                         |
| 索引/数据流/别名         | `/{target}/_settings`     | 这些设置会被应用到被选中的目标。目标可以是一个或者多个索引（index）、数据流（data stream）、别名（alias）。多个目标中间需要用逗号隔开。                                                                                                                                                       |
| 节点                     | -                         | 配置节点（node）主要指的是配置节点的角色：master / data / ingest / ml / ... 这个可以通过修改配置文件 `elasticsearch.yml` 实现。 |
| 快照仓库（需要安装插件） | `/_snapshot/{repository}` | 插件也有自己的设置。比如快照仓库插件（snapshot repository plugin）就对于每个快照仓库提供设置，比如仓库位置、快照创建速度、快照恢复速度等。                                                                                                                                                         |

## 集群设置

<https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-update-settings.html>

```
GET /_cluster/settings
PUT /_cluster/settings
```

集群的设置可以是：

1. 持久的（persistent），也就是在整个集群重启以后依然有效
2. 暂时的（transient），也就是在整个集群重启以后无效

persistent 设置的例子（JSON 以 "persistent" 开头）：

```json
{
  "persistent" : {
    "indices" : {
      "recovery" : {
        "max_bytes_per_sec" : "20mb"
      }
    }
  }
}
```

transient 设置的例子（JSON 以 "transient" 开头）：

```json
{
  "transient" : {
    "indices" : {
      "recovery" : {
        "max_bytes_per_sec" : "20mb"
      }
    }
  }
}
```

集群设置的载入优先级：

1. transient 集群设置
2. persistent 集群设置
3. 配置文件 `elasticsearch.yml` 中的设置
4. 默认设置

根据官方文档 [Cluster update settings API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-update-settings.html "Cluster update settings API") 的说法，集群级别的设置建议通过 `settings` API 来设定。仅用文件 `elasticsearch.yml` 来处理本地配置。这样，你可以保证集群所有节点的配置都是一样的。不然的话，你可能会意外地在不同的节点设置了不同的配置，而且这样的差异非常难被察觉。

集群设置分为静态和动态两种类型：

| 类型            | 描述                                                                                                                                                                                                    |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 静态（static）  | 这些设置只有在未被启动或者已经关机的节点上被应用，通过 `elasticsearch.yml` 配置。每一个节点都要被单独设置。                                                                                             |
| 动态（dynamic） | 这些设置可以在一个正在运行的集群中，通过 Cluster update settings API 被修改。 |

静态和动态类型的设置举例：

![静态和动态类型举例](/assets/20210821-type-of-settings.png)

Elasticsearch 有很多可以自定义的集群设置：安全设置、分片分配和路由设置、索引生命周期（ILM）设置、日志设置、网络设置等。这里不展开，具体可以查看官方文档 [Configuring Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html "Configuring Elasticsearch") 以及它相关的子页面。

## 索引设置

<https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-update-settings.html>

```
GET /{target}/_settings
PUT /{target}/_settings
```

这些设置会被应用到被选中的目标。目标可以是一个或者多个索引（index）、数据流（data stream）、别名（alias）。多个目标中间需要用逗号 `,` 隔开。

索引设置分为静态和动态两种类型：

| 类型            | 描述                                                                              |
| :-------------- | :-------------------------------------------------------------------------------- |
| 静态（static）  | 这些设置只有在索引创建时或者在索引关闭以后才可以被修改。                          |
| 动态（dynamic） | 这些设置可以在一个正在被使用（live）索引中通过 update-index-settings API 被修改。 |

Elasticsearch 有很多可以自定义的索引设置：分片数量、压缩方式、启动检查、refresh 等。这里不展开，具体可以查看官方文档 [Index modules](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules.html "Index modules")。

## 节点设置

<https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-node.html>

配置节点（node）主要指的是配置节点的角色：master / data / ingest / ml / ... 这个可以通过修改配置文件 `elasticsearch.yml` 实现。最重要的几个角色应该是：master-eligible 节点（参与 master 竞选，对于维持集群存在至关重要）、data 节点（存储数据）、coordinating-only 节点（专门协调任务，类似负载平衡）。详情上方的见官方文档。

在配置文件 `elasticsearch.yml` 中，将一个节点设为数据节点：

```yml
node.data: true
```

## curl 用法举例

在上面的文章中，我们看了不同类型的设置。可是在实际工作中，明白它们的类型并不够。你很可能需要查询、更新、删除一些设置来满足你的实际需要。下面，我们来看看如何用 curl 来操作动态的集群和索引设定。

集群级别设置举例：

```sh
# list cluster-wide settings (explicitly defined)
curl "localhost:9200/_cluster/settings"

# list cluster-wide settings (explicitly defined) in flat format
curl "localhost:9200/_cluster/settings?flat_settings"

# list cluster-wide settings (including defaults)
curl "localhost:9200/_cluster/settings?include_defaults"

# list cluster-wide settings (including defaults) in flat format
curl "localhost:9200/_cluster/settings?include_defaults&flat_settings"

# update a cluster-wide setting
curl -X PUT "localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d'
{
  "persistent.indices.recovery.max_bytes_per_sec": "50mb"
}
'

# reset a cluster-wide setting to the default value
curl -X PUT "localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d'
{
  "persistent.indices.recovery.max_bytes_per_sec": null
}
'
```

索引级别设置举例：

```sh
# list index-wide settings (explicitly defined)
curl "localhost:9200/index1/_settings"

# list index-wide settings (explicitly defined) for index1 and index2
curl "localhost:9200/index1,index2/_settings"

# list index-wide settings (explicitly defined) for indices starting with "index"
curl "localhost:9200/index*/_settings"

# list index-wide settings (explicitly defined) for all indices
curl "localhost:9200/_all/_settings"

# list index-wide settings (explicitly defined) in flat format
curl "localhost:9200/index1/_settings?flat_settings"

# list index-wide settings (including defaults)
curl "localhost:9200/index1/_settings?include_defaults"

# list index-wide settings (including defaults) in flat format
curl "localhost:9200/index1/_settings?include_defaults&flat_settings"

# update an index-wide setting for index1
curl -X PUT "localhost:9200/index1/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "number_of_replicas": 2
  }
}
'

# reset an index-wide setting to the default value
curl -X PUT "localhost:9200/index1/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "refresh_interval": null
  }
}
'
```

对于静态的索引设置，需要先关闭索引，修改设置，再启动：

```sh
curl -X POST "localhost:9200/index1/_close?wait_for_active_shards=0"

curl -X PUT "localhost:9200/index1/_settings" -H 'Content-Type: application/json' -d'
{
  "analysis": {
    "analyzer": {
      "content": {
        "type": "custom",
        "tokenizer": "whitespace"
      }
    }
  }
}
'

curl -X POST "localhost:9200/index1/_open"
```

## 扩展

如何从这篇文章中拓展出去？

- 如果你想知道更多的关于集群设置的信息，请查看官方文档 [Configuring Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html "Configuring Elasticsearch") 以及它相关的子页面。
- 如果你想知道更多的关于节点设置的信息，请查看官方文档 [Configuring Elasticsearch > Node](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-node.html "Configuring Elasticsearch > Node")。
- 如果你想知道更多的关于索引设置的信息，请查看官方文档 [Index modules](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules.html "Index modules")。
- 当使用 `curl` 来查询或者修改 Elasticsearch 的设置的时候，建议配合命令 `jq` 使用。它可以帮助你快速修改 JSON 内容，得到你需要的结果。

## 结论

在本文中，我们看到了 Elasticsearch 中的集群设置、节点设置、索引设置。我们讨论了设置的加载顺序。我们看到设置分为静态动态两种：静态设置需要在静止状态下修改，动态设置则可以在运行状态下直接通过 API 修改。我们也看到了如何在官方文档中识别静态和动态的设置。我们还通过 curl 列举了一些常用的命令。最后，我还分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你对 Elasticsearch 有进一步的了解。如果你有兴趣了解更多的资讯，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h "GitHub") 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

- Opster Team, "Elasticsearch Settings", _Opster_, 2021. <https://opster.com/elasticsearch-glossary/elasticsearch-settings/>
- Elasticsearch, "Index modules", _Elastic_, 2021. <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules.html>
- Elasticsearch, "Node", _Elastic_, 2021. <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-node.html>
- Elasticsearch, "Configuring Elasticsearch", _Elastic_, 2021. <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html>
- Vincent Duan, "Elasticsearch Transient 与 Persistent 的区别", _CSDN_, 2020. <https://blog.csdn.net/vincent_duan/article/details/103927725>

<!--
 WeChat:
   写作不易，希望大家点个赞、点个在看支持一下，谢谢！
   ![](https://mincong.io/assets/wechat-QR-code.jpg)

 CSDN:
   ![扫码关注](https://img-blog.csdnimg.cn/img_convert/f07c6cc9272c721180bad20c599e4ff7.png#pic_center =600x333)
-->
