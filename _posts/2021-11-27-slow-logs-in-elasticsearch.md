---
article_num: 191
layout:              post
title:               Slow Query Logs In Elasticsearch
subtitle:            >
    How to better understand slow query logs in Elasticsearch?

lang:                en
date:                2021-11-27 09:19:02 +0100
series:              [es-admin]
categories:          [elasticsearch]
tags:                [elasticsearch]
ads_tags:            []
comments:            true
excerpt:             >
    Better understand the slow queries in Elasticsearch by using the slow logs. In this article, we discuss the log structure, the thresholds, and some potential root causes.

image:               /assets/bg-nareeta-martin-cOWn-bYGmlc-unsplash.jpg
cover:               /assets/bg-nareeta-martin-cOWn-bYGmlc-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

If you are using Elasticsearch in production, you are probably familiar with
slow logs. Slow logs are logs provided by Elasticsearch, which help you to
troubleshoot the slowness of the write path (index) or the read path
(search). It's useful for determing the root cause of the problem and may
provide hints to mitigations and solutions. In this article, I want to discuss
slow logs with you, in particular:

* How does the log look like?
* How to change thresholds?
* Root causes of slow queries?
* How to go further from this article?

Now, let's get started!

## Query Slow Log

Let's analyze a slow log provided Elasticsearch official documentation ([link](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-slowlog.html)):

> [2030-08-30T11:59:37,786][WARN ][i.s.s.query              ] [node-0] [index6][0]
> took[78.4micros], took_millis[0], total_hits[0 hits], stats[],
> search_type[QUERY_THEN_FETCH], total_shards[1],
> source[{"query":{"match_all":{"boost":1.0}}}], id[MY_USER_ID],

If we split the log into pieces, we can obtain the following table:

Field | Value | Description
:--- | :--- | :---
Timestamp | 2030-08-30T11:59:37,786 | The timestamp of the log.
Log Level | WARN | It means that the query execution time is higher than the query "warn" threshold. This is configured in index settings API.
Logger | i.s.s.query | This is a concise version of logger name (class name): "index.search.slowlog.query". This is useful for users to determine the type of slowness: index or search.
Node | node-0 | It means that the slowness happens on node-0. If you select a time range and group by nodes, it will help you determine the distribution of the slowness across the cluster. In other words, determine if the slowness happens on one single node or happens on multiple ones. Also, if you name the node with some special meaning, e.g. roles (fresh, warm, cold), you will be able to determine which roles are slow.
Index name | index6 | The name of the index that is impacted. We have similar troubleshooting ideas as the "node" mentioned above. Additionally, you may have the customer's id, product type, timestamp, or other useful information as part of the index names. Therefore, it's useful for you to determine which customer, which product, or which range of indices are impacted.
Shard | 0 | The shard id.
Took | 78.4micros | Execution time in human-readable format. It determines how slow the query is.
Took in milliseconds | 0 | Execution time in milliseconds in numeric value. If you have the possibility to transform this value in your log pipelines, you can calculate filter the queries that are slower than a certain threshold, e.g. ">= 2 seconds". Therefore, you can reduce noises and better identify the source of the problem. This transformation can be done using a grok parser. Here is a great beginner's guide about [Logstash Grok](https://logz.io/blog/logstash-grok/) and here is the documentation of [Grok Parser in Datadog](https://docs.datadoghq.com/logs/log_configuration/processors/).
Stats | | Statistics
Search type | QUERY_THEN_FETCH | The type of search.
Total shards | 1 | Total number of shards.
Source | { "query": { "match_all": { "boost ": 1.0 } } } | The source of of the query. This is one of the most important fields. It allows us the determine how the query looks like and gives us an idea of what kind of information that the user is looking for.
ID | MY_USER_ID | The user ID. It may help you determine whether the query problems come from the same user.

## Thresholds

You can use thresholds to better define the level of logs depending on your requirements. Note that these settings are dynamic so you can change them without restarting the server. The 3 different kinds of thresholds that you can define are index (`index`), the query phase of search (`query`), and the fetch phase of the search (`fetch`).

```
PUT /my-index-000001/_settings
```

```json
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.query.debug": "2s",
  "index.search.slowlog.threshold.query.trace": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "800ms",
  "index.search.slowlog.threshold.fetch.debug": "500ms",
  "index.search.slowlog.threshold.fetch.trace": "200ms"
}
```

... but what is query-then-fetch?

According to "Elasticsearch: The Definitive Guide", there are two phases in the search: query and fetch.

* **query**: during the initial query phase, the query is broadcast to a shard copy (a primary or replica shard) of every shard in the index. Each shard executes the search locally and builds a priority queue of matching documents. It identifies which documents satisfy the search request.
* **fetch**: we retrieve the documents themselves.

For more details, you can visit ["Elasticsearch: The Definitive Guide 2.x"](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html), especially the sections: ["Query Phase"](https://www.elastic.co/guide/en/elasticsearch/guide/current/_query_phase.html) and ["Fetch Phase"](https://www.elastic.co/guide/en/elasticsearch/guide/current/_fetch_phase.html).

## Root Causes

Unfortunately, I don't have much experience working with slow queries. However, I know that Opster has an excellent article about analyzing slow logs. In their article ["Elasticsearch Slow Query Troubleshooting Guide"](https://opster.com/guides/data-structuring/elasticsearch-slow-search-query-guide/), they mention that the causes can be:

1. Poorly written or expensive search queries.
2. Poorly configured Elasticsearch clusters or indices.
3. Saturated CPU, Memory, Disk and network resources on the cluster.
4. Periodic background processes like snapshots or merging segments that consume cluster resources (CPU, Memory, disk) causing other search queries to perform slowly as resources are sparsely available for the main search queries.
5. Segment merging is used to reduce the number of segments so that search latency is improved, however, merges can be expensive to perform, especially on low IO environments.

Another great article comes from the engineering blog of Elasticsearch, written by Louis Ong as ["Advanced tuning: finding and fixing slow Elasticsearch queries"](https://www.elastic.co/blog/advanced-tuning-finding-and-fixing-slow-elasticsearch-queries). He mentioned that the common causes are:

1. High resource utilization when inactive
2. High thread pool rejected count
3. High CPU and indexing latency
4. Increased latency with more replica shards
5. High utilization when sharing resources
6. High heap aggregating highly unique fields

Also, there is this article written by Burak Altaş on Medium as ["How to Optimize Elasticsearch for Better Search Performance"](https://medium.com/@burak.altas/how-to-optimize-elasticsearch-for-better-search-performance-283492e475f8), talking about index configuration, shard optimization, Elasticsearch (cluster) configuration. Check it out.

## Going Further

How to go further from here?

- Due to time constraints, I only discuss slow query logs here but didn't mention much about index logs. In other words, we only discussed the read path and not the write path. You may want to explore that as well.
- To learn more about how to fix the problems, check out the more detailed solutions mentioned in the "Root Causes" section.

## Conclusion

In this article, we discussed the slow log structure in Elasticsearch, its thresholds, and the possible root causes of the problem.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Ran Ramati, Gedalyah Reback, ["A Beginner’s Guide to Logstash Grok"](https://logz.io/blog/logstash-grok/), _Logz_, 2020.
- ["Processors"](https://docs.datadoghq.com/logs/log_configuration/processors/), _Datadog Documentation_, 2021.
- Vineeth Mohan, ["Slow Logs in Elasticsearch"](https://qbox.io/blog/slow-logs-in-elasticsearch-search-index-config-example), _QBOX_, 2018.
- Clinton Gormley, Zachary Tong, ["Elasticsearch: The Definitive Guide 2.x"](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html), _Elasticsearch_, 2014-2015.
- Opster Team, ["Elasticsearch Slow Query Troubleshooting Guide"](https://opster.com/guides/data-structuring/elasticsearch-slow-search-query-guide/), _Opster_, 2021.
- Louis Ong, ["Advanced tuning: finding and fixing slow Elasticsearch queries"](https://www.elastic.co/blog/advanced-tuning-finding-and-fixing-slow-elasticsearch-queries), _Elastic_, 2019.
- Burak Altaş, ["How to Optimize Elasticsearch for Better Search Performance"](https://medium.com/@burak.altas/how-to-optimize-elasticsearch-for-better-search-performance-283492e475f8), _Medium_, 2019.