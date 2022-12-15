---
article_num: 151
layout:            post
title:             "Elasticsearch: Common Index Exceptions"
lang:              en
date:              2020-09-13 17:56:58 +0200
series:            [es-admin]
categories:        [elasticsearch]
tags:              [elasticsearch, java]
permalink:         /2020/09/13/es-index-exceptions/
comments:          true
excerpt:           >
    Explain the common Elasticsearch exceptions occurred when indexing new
    documents, with sample messages, analysis, suggestions and external
    resources for further investigation.
image:             /assets/bg-sarah-kilian-52jRtc2S_VE-unsplash.jpg
cover:             /assets/bg-sarah-kilian-52jRtc2S_VE-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

Sending an index request to Elasticsearch is easy, you just need to prepare a
request and send it through the Elasticsearch client. Well, it is easy until
the client throws an exception... oops 🤦.
In this article, I am going to share with you some exceptions that I encountered
when indexing documents in Elasticsearch. Most of the examples are written in
Elasticsearch 6 but they should be still valid in Elasticsearch 7.

After reading this article, you will understand the sample message(s) of each
exception, a brief analysis of each of them, my suggestions, and some external resources
(Elasticsearch documentation, Stack Overflow questions, ...) to allow you to go
further in this topic. The goal of this article is not to solve all the
solutions right, but rather to bring you some additional information to those
problems and make problem-solving easier. Here is the list of exceptions
that we are going to talk about:

- EsRejectedExecutionException
- MapperParsingException
- IndexNotFoundException
- NodeNotConnectedException

Note that this list is probably incomplete, please leave a comment if you think
it is worth adding more exceptions here. Now, let's get started.

## EsRejectedExecutionException

**Source code:**
[6.8](https://github.com/elastic/elasticsearch/blob/6.8/server/src/main/java/org/elasticsearch/common/util/concurrent/EsRejectedExecutionException.java)
/ [7.9](https://github.com/elastic/elasticsearch/blob/7.9/server/src/main/java/org/elasticsearch/common/util/concurrent/EsRejectedExecutionException.java)

**Message:**

> _"org.elasticsearch.transport.RemoteTransportException:\[elasticsearch-cluster-1-data-2\]\[192.168.1.16:9300\]\[indices:data/write/bulk\[s\]\]
> Caused by:
> org.elasticsearch.transport.RemoteTransportException:\[elasticsearch-cluster-1-data-2\]\[192.168.1.16:9300\]\[indices:data/write/bulk\[s\]\[p\]\]
> Caused by:
> org.elasticsearch.common.util.concurrent.EsRejectedExecutionException:
> rejected execution of org.elasticsearch.transport.TransportService$7@1234abcd
> on EsThreadPoolExecutor\[bulk queue capacity = 2000,
> org.elasticsearch.common.util.concurrent.EsThreadPoolExecutor@bcd1234\[Running,
> pool size = 8, active threads = 8, queued tasks = 2001, completed tasks =
> 654321\]\] ..."_

Elasticsearch node uses several thread pools to manage memory consumption.
Queues associated with many of the thread pools enable pending requests to be
held instead of discarded. There are several thread pools: generic, search,
search\_throttled, get, analyze, write, snapshot, etc. In the error message
above, the queue of the thread pool "bulk" (`bcd1234`) is full. All the workers
are busy handling a task and the size of the queue reached size 2001, which is
higher than the limit 2000.

Several factors can contribute to this problem: insufficient shards,
insufficient data nodes, thread pool queue size too small, etc. An in-depth
analysis is written by Christian Dahlqvist as
["Why am I seeing bulk rejections in my Elasticsearch
cluster?"](https://www.elastic.co/blog/why-am-i-seeing-bulk-rejections-in-my-elasticsearch-cluster),
I recommend reading this blog post. In short, the solution varies from
use-case to use-case and there is not the one-size-fits-all solution here.

**Suggestions:**

1. **Retry.** If the rejection above happens for bulk index requests, consider retrying
   the failing part of the bulk a bit later to mitigate the full queue problem.
2. **Scale-out.** Observe the metrics of the cluster: the system load, CPU usage, incoming
   traffic, the frequency of these exceptions, etc to determine whether the cluster
   is overloaded. If yes, consider adding more data nodes to the cluster to
   scale out.
3. **Exclude.** Observe the metrics of the cluster as mentioned above. Determine
   whether the node is bad (high IOWait, unresponsive, ...) and exclude this
   data node
4. **Reconfigure.** Determine whether the queue size is the desired configuration. It’s very
   rare, but maybe the cluster is misconfigured. Perform a curl command to the
   cluster to validate the setting of the queue size of the thread pool, e.g. the
   thread pool "bulk":

   ```sh
   curl "localhost:9200/_cluster/settings?flat_settings&include_default&pretty" | grep thread_pool.bulk.queue_size
   ```

5. Read the Elasticsearch blog post [Why am I seeing bulk rejection in my
   Elasticsearch
cluster](https://www.elastic.co/fr/blog/why-am-i-seeing-bulk-rejections-in-my-elasticsearch-cluster),
   written by Christian Dahlqvist to analyze different settings and how it impacts
   the rejection to find a better solution.

**More information:**

1. Thread pools, Elasticsearch Reference [7.9], 2020.
   <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/modules-threadpool.html>
2. EsRejectedExecutionException in elasticsearch for parallel search, Stack Overflow, 2015.
   <https://stackoverflow.com/questions/27793530>
3. elasticsearch es_rejected_execution_exception, Stack Overflow, 2018.
   <https://stackoverflow.com/questions/49873853>
4. Coordinating nodes
   <https://www.elastic.co/guide/en/elasticsearch/reference/6.8/modules-node.html>

## MapperParsingException

**Source code:**
[6.8](https://github.com/elastic/elasticsearch/blob/6.8/server/src/main/java/org/elasticsearch/index/mapper/MapperParsingException.java)
 / [7.9](https://github.com/elastic/elasticsearch/blob/7.9/server/src/main/java/org/elasticsearch/index/mapper/MapperParsingException.java)

**Message 1:**

> _"org.elasticsearch.index.mapper.MapperParsingException: Field \[\_id\] is a
> metadata field and cannot be added inside a document. Use the index API
> request parameters"_

The document source to index contains a field called "\_id" which is reserved as
metadata inside Elasticsearch. According to Elasticsearch documentation, each
document has metadata associated with it, such as the `_index`, mapping `_type`,
and `_id` metadata fields. Here is a complete list of metadata fields in
Elasticsearch 7.9:

Category | Fields
:------- | :-----
Identity metadata fields | \_index / \_type / \_id
Document source metadata fields | \_source / \_size
Indexing metadata fields | \_field\_names / \_ignored
Routing metadata field | \_routing
Other metadata field | \_meta

**Suggestions:**

1. Rename the field to avoid the conflicts.

**Message 2:**

> _"org.elasticsearch.index.mapper.MapperParsingException: object mapping for
> \[test\] tried to parse as object, but got EOF, has a concrete value been
> provided to it?"_
>
> _"org.elasticsearch.index.mapper.MapperParsingException: failed to parse field
> \[updated\] of type \[date\] in document with id 'vZLKg3QBwzbK8KxrfutG'.
> Preview of field's value: '{date=2020-09-12, time=21:12:00}'"_

This can happen when you change the structure of the document which does not
respect the existing mapping of the document anymore. For example, in the error
message above, what could happen is that in the index “test”, the mapping of the
field “updated” is dynamic but its type has been changed in different index
requests. In the beginning, it's a string field containing a date-time object in
ISO-8601 format as:

```json
{
    "updated": "2020-09-12T21:12:00"
}
```

Then, the structure of the document was changed in the second request:

```js
// Note: not the same structure anymore!
// => MapperParsingException
{
    "updated": {
        "date": "2020-09-12",
        "time": "21:12:00"
    }
}
```

To fix this, you need to provide the same structure for the field “updated”. Or
you need to update the mappings and the existing documents, according to Yoga
Gowda in this Stack Overflow
[answer](https://stackoverflow.com/a/59741583/4381330).

**More information:**

1. Field \[\_id\] is a metadata field and cannot be added inside a document. Use
   the index API request parameters, GitHub, 2016.
   <https://github.com/elasticquent/Elasticquent/issues/53>
2. My demo MapperParsingExceptionTest.java
   <https://github.com/mincong-h/learning-elasticsearch/blob/blog-index-exceptions/basics/src/test/java/io/mincong/elasticsearch/index/MapperParsingExceptionTest.java>
3. Metadata fields, Elasticsearch Reference [7.9], 2020.
   <https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-fields.html>
4. How to solve MapperParsingException: object mapping for \[test\] tried to
   parse as object, but got EOF, Stack Overflow, 2015.
   <https://stackoverflow.com/questions/30454108>

## IndexNotFoundException

**Source code:**
[6.8](https://github.com/elastic/elasticsearch/blob/6.8/server/src/main/java/org/elasticsearch/index/IndexNotFoundException.java) /
[7.9](https://github.com/elastic/elasticsearch/blob/7.9/server/src/main/java/org/elasticsearch/index/IndexNotFoundException.java)

**Message:**

> _"org.elasticsearch.index.IndexNoutFoundException: no such index ..."_

Elasticsearch client is trying to index a new document but the target index does
not exist. By default, the index is created automatically when the first index
request arrives into the cluster. If it's not the case, it means that you have
an automatic index creation policy. Automatic index creation is controlled by the
`action.auto_create_index` setting. This setting defaults to true, which allows
any index to be created automatically. You can modify this setting to explicitly
allow or block automatic creation of indices that match specified patterns, or
set it to false to disable automatic index creation entirely. Specify a
comma-separated list of patterns you want to allow, or prefix each pattern with
+ or - to indicate whether it should be allowed or blocked. When a list is
specified, the default behavior is to disallow.

**Suggestions:**

1. Understand the reason why the index does not exist. Check the automatic index creation settings. Check if the index was deleted mistakenly.
2. Create the index manually, modify the auto-creation settings or investigate if it can be something wrong related to your business logic (data lifecycle)

**More information:**

1. Index API > Automatically create data streams and indices, Elasticsearch
   Reference \[7.9\], 2020.
   <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/docs-index_.html#index-creation>
2. My demo IndexNotFoundExceptionTest
   <https://github.com/mincong-h/learning-elasticsearch/blob/blog-index-exceptions/basics/src/test/java/io/mincong/elasticsearch/index/IndexNotFoundExceptionTest.java>

## NodeNotConnectedException

**Source code:** [6.8](https://github.com/elastic/elasticsearch/blob/6.8/server/src/main/java/org/elasticsearch/transport/NodeNotConnectedException.java) / [7.9](https://github.com/elastic/elasticsearch/blob/7.9/server/src/main/java/org/elasticsearch/transport/NodeNotConnectedException.java)

**Message:**

> _"org.elasticsearch.transport.NodeNotConnectedException:
> [”elasticsearch-cluster-1-data-2”][192.168.1.16:9300] Node not connected"_

The data node "elasticsearch-cluster-1-data-2" is not connected. It can be a hard
disk problem or system-level error. To confirm it’s a disk problem, you can
observe the following metrics from your monitoring system (if you have one):

- The high ratio of System CPU IOWait
- The brutal increased number of unassigned shards (shards are lost on that data node)
- The brutal increased number of relocations
- The brutal increased size of the bulk thread pool queue on that data node
  (tasks cannot be executed because of the bad disk)
- The node variation of the cluster (-1 node)
- Cluster health status changed from [GREEN] to [YELLOW] because we lost a node.

**Suggestions:**

- Terminate the underlying host and replace it with a new host
- Retry the index request

**More information:**

- Read Discovery and cluster formation from Elasticsearch.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/modules-discovery.html>

## Conclusion

In this article, we saw the common exceptions threw by Elasticsearch client when
an index request failed, including EsRejectedExecutionException,
MapperParsingException, IndexNotFoundException, and NodeNotConnectedException.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
