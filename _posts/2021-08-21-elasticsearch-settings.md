---
layout:              post
title:               Elasticsearch Settings
subtitle:            >
    Cluster settings, index settings and node settings.

lang:                en
date:                2021-08-21 18:07:13 +0200
series:              [es-admin]
categories:          [elasticsearch]
tags:                [elasticsearch]
comments:            true
excerpt:             >
    This article describes the different types of settings of Elasticsearch: cluster settings, index settings, node settings, the difference between static and dynamic settings, and some commonly used curl commands.

image:               /assets/bg-anthony-roberts-82wJ10pX1Fw-unsplash.jpg
cover:               /assets/bg-anthony-roberts-82wJ10pX1Fw-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

This article is translated with Google Translate and reviewed by Mincong.
{:.info}

## Introduction

If you are using an Elasticsearch cluster, you will probably need to configure it. No matter what your use-case is, no matter which position you hold in the company, as long as you use Elasticsearch, you always need to have a certain understanding of its configuration, and adjust them to better meet your needs. But on the other hand, there are so many settings of Elasticsearch that it is a little bit difficult to start. So I want to write this article to discuss with you how to understand the different types of settings of Elasticsearch. After reading this article, you will understand:

- The scope of settings (cluster, index, node, snapshot repository, etc.)
- Cluster settings
- Index settings
- Node settings
- curl usage examples

This article is based on Elasticsearch 7, the specific content may be slightly different from the version you are using. Now, let's get started!

## Scope Of Settings

Different settings in Elasticsearch can be applied to different scopes.

| Scope | API | Description |
| :----------------------- | :----------------------- -| :----------------------------------------------- -------------------------------------------------- -------------------------------------------------- -------------------------------------------------- -------------------------------------------------- ------------------------------------------ |
| Cluster| `/_cluster/settings` | These settings will be applied to all nodes in the entire cluster, for example, ([cluster-level shard allocation and routing settings](https://www.elastic.co /guide/en/elasticsearch/reference/7.x/modules-cluster.html "cluster-level shard allocation and routing")) are cluster-level settings. |
| Index / Data stream / Alias ​​| `/{target}/_settings` | These settings will be applied to the selected target. The target can be one or more indexes, data streams. Multiple targets need to be separated by commas. |
| Node | - | The node settings mainly refer to the configuration of the role of the node: master / data / ingest / ml / ... This can be achieved by modifying the configuration file `elasticsearch.yml`. |
| Snapshot repository (plugin required) | `/_snapshot/{repository}` | Plugins also have their own settings. For example, the snapshot repository plugin provides settings for each snapshot repository, such as the location of the repository, the speed of snapshot creation, and the speed of snapshot restore. |

## Cluster Settings

<https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-update-settings.html>

```
GET /_cluster/settings
PUT /_cluster/settings
```

The cluster settings can be:

1. Persistent, which is still valid after the entire cluster restarts
2. Transient, that is, invalid after the entire cluster restarts

Examples of persistent settings (JSON starts with "persistent"):

```json
{
  "persistent": {
    "indices": {
      "recovery": {
        "max_bytes_per_sec": "20mb"
      }
    }
  }
}
```

Example of transient setting (JSON starts with "transient"):

```json
{
  "transient": {
    "indices": {
      "recovery": {
        "max_bytes_per_sec": "20mb"
      }
    }
  }
}
```

Precedence of cluster settings:

1. transient cluster settings
2. Persistent cluster settings
3. Settings in the configuration file `elasticsearch.yml`
4. Default settings

According to the official documentation [Cluster update settings API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-update-settings.html "Cluster update settings API"), the cluster-wide settings are recommended to be set through the `settings` API. Only use the file `elasticsearch.yml` to handle local configuration. In this way, you can ensure that the configuration of all nodes in the cluster is the same. Otherwise, you may accidentally set different configurations on different nodes, and such differences are very difficult to detect.

There are two types of cluster settings: static and dynamic:

| Type | Description |
| :-------------- | :-------------------------------- -------------------------------------------------- -------------------------------------------------- -------------------------------------------------- ---------------- |
| Static | These settings are only applied on nodes that have not been started or have been shut down, and are configured by `elasticsearch.yml`. Each node must be set individually. |
| Dynamic | These settings can be modified in a running cluster through the cluster update settings API. |

Examples of static and dynamic settings:

![Static and dynamic type example](/assets/20210821-type-of-settings.png)

Elasticsearch has many cluster-wide settings: security settings, shard allocation and routing settings, index lifecycle management (ILM) settings, logging settings, network settings, etc. We are not going into details here, but you can check the official documentation [Configuring Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html "Configuring Elasticsearch") and its related subpages for more information.

## Index Settings

<https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-update-settings.html>

```
GET /{target}/_settings
PUT /{target}/_settings
```

These settings will be applied to the selected target. The target can be one or more indexes, data streams, alias. Multiple targets need to be separated by commas `,`.

Index settings are divided into two types -- static and dynamic:

| Type | Description |
| :-------------- | :-------------------------------- ------------------------------------------------ |
| Static | These settings can only be modified when the index is created or after the index is closed. |
| Dynamic | These settings can be modified via the update-index-settings API in a live index. |

Elasticsearch has many index-wide settings: number of shards, compression method, startup check, refresh, etc. We are not going into details here, but you can check the official document [Index modules](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules.html "Index modules") for more details.

## Node Settings

<https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-node.html>

The node settings mainly refer to the configuration of node's role: master / data / ingest / ml / ... This can be achieved by modifying the configuration file `elasticsearch.yml`. The most important roles should be: master-eligible node (participating in the master election, which is vital to maintaining the existence of the cluster), data node (storing data), coordinating-only node (tasks coordination, similar to load balancing). See the official document above for details.

For example, in the configuration file `elasticsearch.yml`, you can set a node as a data node:

```yml
node.data: true
```

## curl cheatsheet

In the above article, we looked at different types of settings. But in actual work, it is not enough to just understand their types. You may need to query, update, or delete some settings to meet your actual needs. Next, let's take a look at how to use curl to operate dynamic cluster and index settings.

Examples of cluster-level settings:

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

Example of index level setting:

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

For static index settings, you need to close the index first, modify the settings, and then start:

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

## Going further

How to go further from this article?

- If you want to know more about cluster settings, please check the official document [Configuring Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html "Configuring Elasticsearch") and its related subpages.
- If you want to know more about node settings, please check the official document [Configuring Elasticsearch> Node](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-node .html "Configuring Elasticsearch> Node").
- If you want to know more about index settings, please check the official document [Index modules](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules.html "Index modules").
- When using `curl` to query or modify the settings of Elasticsearch, it is recommended to use it with the command `jq`. It can help you quickly modify the JSON content and get the results you need.

## Conclusion

In this article, we saw cluster settings, node settings, and index settings in Elasticsearch. We discussed the precedence of the settings. We see that the settings are divided into two types: static and dynamic. Static settings need to be modified in a static state, and dynamic settings can be modified directly through the API in the running state. We saw how to identify static and dynamic settings in the official documentation. We also listed some commonly used commands through `curl`. Finally, I also shared some resources so that you can go further from here. I hope this article can bring you some thoughts and give you a better understanding of Elasticsearch. You can subscribe to the [feed of my blog](/feed.xml), follow me on [Twitter](https://twitter.com/mincong_h) or [GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Opster Team, "Elasticsearch Settings", _Opster_, 2021. <https://opster.com/elasticsearch-glossary/elasticsearch-settings/>
- Elasticsearch, "Index modules", _Elastic_, 2021. <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules.html>
- Elasticsearch, "Node", _Elastic_, 2021. <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-node.html>
- Elasticsearch, "Configuring Elasticsearch", _Elastic_, 2021. <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html>
- Vincent Duan, "The difference between Elasticsearch Transient and Persistent", _CSDN_, 2020. <https://blog.csdn.net/vincent_duan/article/details/103927725>
