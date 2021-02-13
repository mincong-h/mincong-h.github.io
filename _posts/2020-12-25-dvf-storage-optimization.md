---
layout:            post
title:             "DVF: Storage Optimization"
date:              2020-12-25 18:36:01 +0100
categories:        [elasticsearch]
tags:              [java, elasticsearch]
comments:          true
excerpt:           >
    Part 3: How to optmize storage of a given index by 40% using force-merge.
image:             /assets/bg-vitor-pinto-2wzaK5KRE6o-unsplash.jpg
cover:             /assets/bg-vitor-pinto-2wzaK5KRE6o-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

In the previous articles, we set up Elasticsearch server and client, then
indexed the documents of then open dataset ["Demande de valeurs foncières
(DVF)"](https://cadastre.data.gouv.fr/dvf). However, the storage part is not
optimized. After indexing hundreds of thousands of documents, we introduced more
segments than we actually need. In this article, we will discuss how to
optimize the storage using the [Force Merge
API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-forcemerge.html).

After reading this article, you will understand:

- How does the index storage look like before force-merge?
- How to perform force-merge operation in REST API and Java High Level REST Client?
- How to monitor force-merge?

Now, let's get started!

## Current Situation

According to the Index Stats API, we can see that
after the indexing process, Elasticsearch uses 362.85 MB of disk space to store
these 827,105 documents. In terms of segments, there are 41 of them. They
represent 574.64 KB in memory for terms, stored fields, term vectors, norms,
points, and documents as you can see in the JSON response below.

```
GET /transactions/_stats
```

```js
    "transactions": {
      "uuid": "34BSS5xvTE2rI-2E9LSYlg",
      "primaries": {
        "docs": {
          "count": 587207,
          "deleted": 0
        },
        "store": {
          "size_in_bytes": 380484705,
          "reserved_in_bytes": 0
        },
        "indexing": {
          "index_total": 827105,
          ...
        },
        "segments": {
          "count": 41,
          "memory_in_bytes": 560780,
          "terms_memory_in_bytes": 405600,
          "stored_fields_memory_in_bytes": 21320,
          "term_vectors_memory_in_bytes": 0,
          "norms_memory_in_bytes": 44608,
          "points_memory_in_bytes": 0,
          "doc_values_memory_in_bytes": 89252,
          "index_writer_memory_in_bytes": 95522456,
          "version_map_memory_in_bytes": 0,
          "fixed_bit_set_memory_in_bytes": 0,
          "max_unsafe_auto_id_timestamp": -1,
          "file_sizes": {}
        },
```

We can also use the Index Segments API to inspect the low-level information about
segments in index shards. In the JSON response below, we can see that the shard 0 contains
multiple segments. In Elasticsearch, a shard is a Lucene index, and a Lucene
index is broken down into segments. Segments are internal storage elements in
the index where the index data is stored and are immutable. Smaller segments are
periodically merged into larger segments to keep the index size at bay and to
expunge deletes.

```
GET /transactions/_segments
```

```js
    ...
    "transactions": {
      "shards": {
        "0": [
          {
            "routing": {
              "state": "STARTED",
              "primary": true,
              "node": "PrmdeZKcQJmTAxW7brcOhA"
            },
            "num_committed_segments": 17,
            "num_search_segments": 29,
            "segments": {
              "_11": {
                "generation": 37,
                "num_docs": 28816,
                "deleted_docs": 0,
                "size_in_bytes": 8179972,
                "memory_in_bytes": 12604,
                "committed": false,
                "search": true,
                "version": "8.7.0",
                "compound": false,
                "attributes": {
                  "Lucene87StoredFieldsFormat.mode": "BEST_SPEED"
                }
              },
              ...
              "_2s": {
                "generation": 100,
                "num_docs": 5074,
                "deleted_docs": 0,
                "size_in_bytes": 1636756,
                "memory_in_bytes": 12452,
                "committed": false,
                "search": false,
                "version": "8.7.0",
                "compound": true,
                "attributes": {
                  "Lucene87StoredFieldsFormat.mode": "BEST_SPEED"
                }
              }
            }
          }
        ]
      }
    }
```

## Force-Merge

To optimize the storage of index `transactions`, we can use the [Force Merge
API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-forcemerge.html)
to trigger a merge manually. This will reduce the number of segments and also
frees up the space used by deleted documents. ⚠️  According to [the documentation of
Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-forcemerge.html),
_"force merge should only be called against an index after you have finished
writing to it."_ In our case, it's totally fine because we finished writing to
it. To perform a force merge operation, we can send a POST request to the
index as follows. We include query parameter `max_num_segments`, which refers to
the number of segments to merge to. We set it to 1 so that we can fully merge
these segments into one large segment. If we don't specify this argument,
Elasticsearch will check if a merge is needed and will only execute it if it's
the case.

```
POST /transactions/_forcemerge?max_num_segments=1
```

```js
{
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}
```

To perform a force merge in Java High Level REST Client, it's easy as well. You
can perform it as follows.

```java
var request = new ForceMergeRequest("transactions").maxNumSegments(1);
var response = restClient.indices().forcemerge(request, RequestOptions.DEFAULT);
```

Be careful about the index names specified as input parameters. Without
specifying a target index, it means that all the indices will be merged. To
avoid this situation, you may want to check the size of the input index names
before creating an force merge request.

```java
if (indices.length == 0) {
  logger.info("No indices to be merged");
}
var request = new ForceMergeRequest(indices);
...
```

Now the force merge operation is done. Let's compare the difference in terms of
storage before and after the force-merge using Index Stats API
(`/transactions/_stats`). To facilitate the reading, I converted the results
into a table:

Item | Before | After | Changes
:---: | ---: | ---: | ---:
Segments | 41 | 1 | -97.6%
Memory | 574.64 KB | 12.73 KB | -97.7%
Storage size | 362.85 MB | 217.43 MB | -40.1%

As you can see, it optimized the disk storage and reduced the size in memory.
All segments are rewritten into a new one.

According to the documentation ["thread
pools"](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-threadpool.html),
Elasticsearch 7 uses thread pool `force_merge` for force-merge operations. The thread
pool type is `fixed` with a size of 1 and an unbounded queue size. Therefore,
there is a maximum of one ongoing force merge task in a target node. About the API
calls, the calls block until the merge is complete. If the client connection is
lost before the completion, then the force merge process will continue in the
background. New requests targeting the same indices will block until the ongoing
task is complete as well.

## Monitoring

In the previous section, we saw the benefit of calling the Force Merge API after
we stop writing to an index. But can we go further? In this section, I suggest we
take a look at monitoring. But ... why should we care about monitoring? Because
the force-merge operations have an impact to your Elasticsearch cluster. Or in a
bigger scope, segments and merge operations (automatic or manual) have an impact
on your Elasticsearch cluster. So you may
want to monitor that. For example, a long-running force-merge task can block
other force-merge tasks; If a data node contains too many segments, it may be
slow to reply or unable to reply which leads to shard allocation failures
(unassigned shards); The merging process may impact other activities
like search as well. That's why it's important to monitor segments and
merge operations.

### Monitoring Segments

To monitor segments, you can use Segments-Stats ([source code](https://github.com/elastic/elasticsearch/blob/7.x/server/src/main/java/org/elasticsearch/index/engine/SegmentsStats.java)), retrieved from either Elasticsearch [Index Stats
API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-stats.html) for index-level analysis or [Node Stats API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-nodes-stats.html) for node-level analysis.
For example, using
`nodes.<nodeId>.indices.segments.count`, you can determine the balance
of segments in different nodes. The ratio between shard count and segment count
to determine whether the merge operations are done etc. A more detailed version is documented in the table below. 

Metric | Description
:--- | :---
`count` | The number of segments.
`memory_in_bytes` | Estimation of the memory usage used by a segment.
`terms_memory_in_bytes` | Estimation of the terms dictionary memory usage by a segment.
`stored_fields_memory_in_bytes` | Estimation of the stored fields memory usage by a segment.
`term_vectors_memory_in_bytes` | Estimation of the term vectors memory usage by a segment.
`norms_memory_in_bytes` | Estimation of the norms memory usage by a segment.
`points_memory_in_bytes` | Estimation of the points memory usage by a segment.
`doc_values_memory_in_bytes` | Estimation of the doc values memory usage by a segment.
`index_writer_memory_in_bytes` | Estimation of the memory usage by index writer
`version_map_memory_in_bytes` | Estimation of the memory usage by version map
`fixed_bit_set_memory_in_bytes` | Estimation of how much the cached bit sets are taking. (which nested and p/c rely on)
`max_unsafe_auto_id_timestamp` | Returns the max timestamp that is used to de-optimize documents with auto-generated IDs in the engine. This is used to ensure we don't add duplicate documents when we assume an append only case based on auto-generated IDs
`file_sizes` | Missing Javadoc.

### Monitoring Merge Operations

To monitor the merge operations, you can use Merge Stats ([source code](https://github.com/elastic/elasticsearch/blob/7.x/server/src/main/java/org/elasticsearch/index/merge/MergeStats.java)), retrieved from either Elasticsearch [Index Stats API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-stats.html) for index-level analysis or [Node Stats API](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-nodes-stats.html) for node-level analysis. A more detailed version is documented in the table below.

Metric | Description
:--- | :---
`current` | The current number of merges executing.
`current_docs` | Number of document merges currently running.
`current_size_in_bytes` | Memory, in bytes, used performing current document merges.
`total` | The total number of merges executed.
`total_time_in_millis` | The total time merges have been executed (in milliseconds).
`total_docs` | Total number of merged documents.
`total_size_in_bytes` | Total size of document merges in bytes. Or its derivative to measure the merge speed.
`total_stopped_time_in_millis` | The total time large merges were stopped so smaller merges could finish.
`total_throttled_time_in_millis` | The total time merge IO writes were throttled.
`total_auto_throttle_in_bytes` | Size, in bytes, of automatically throttled merge operations. 

### Other Monitoring

We can also:

* Monitor the thread pool `force_merge` via Node Stats API to know the number of tasks in its queue, the number of active threads, the number of tasks completed by the thread pool executor, etc.
* Use the Task Management API to fetch the actions starting with
  `indices:admin/forcemerge`. Since Elasticsearch 7.4.0, if you provide query
  parameter detailed, a description is also attached the task explain the
  indices being force-merged ([pull
request](https://github.com/elastic/elasticsearch/pull/41365)):
  ```
  GET /_tasks?actions=indices:admin/forcemerge*&detailed
  ```
  ```json
  "bWByk2_lTGKufmq24Inu9g:418" : {
   "node" : "bWByk2_lTGKufmq24Inu9g",
   "action" : "indices:admin/forcemerge",
   "id" : 418,
   "headers" : {},
   "cancellable" : false,
   "running_time_in_nanos" : 161112867379,
   "description" : "Force-merge indices[twitter], maxSegments[-1], onlyExpungeDeletes[false], flush[true]",
   "start_time_in_millis" : 1555624171922,
   "type" : "transport"
  }
  ```
* We can also consider other monitors related to the operating system, network,
  file I/O, JVM, disk usage, and much more.

## Going Further

How to go further from here?

- To know more about merge operation in Elasticsearch, visit page
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules-merge.html>
- To know more about Force Merge API, visit page
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-forcemerge.html>
- To know more about node-level statistics, visit page
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cluster-nodes-stats.html>
- To know more about index-level statistics, visit page
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-stats.html>
- To know more about different thread pools in Elasticsearch, visit page
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-threadpool.html>

## Conclusion

In this article, we saw how to optimize the storage using Force Merge API,
which reduced the storage by 40%. We saw how easy it is to perform a force-merge
request via RESTful API and via Java High Level REST Client. We finished by
looking at different tricks for force-merge monitoring.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elasticsearch, "Index Segments API", 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-segments.html>
- Elasticsearch, "Force Merge API", 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-forcemerge.html>
- Elasticsearch, "Merge", 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index-modules-merge.html>
- Elasticsearch, "Thread Pools", 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-threadpool.html>
