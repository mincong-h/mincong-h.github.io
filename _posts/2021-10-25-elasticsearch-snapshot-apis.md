---
layout:              post
title:               Elasticsearch Snapshot APIs
subtitle:            >
    Cheatsheet for snapshot and restore APIs.

lang:                en
date:                2021-10-25 16:34:05 +0200
categories:          [elasticsearch]
tags:                [elasticsearch, api]
ads_tags:            [aws, azure, hdfs, gcp]
comments:            true
excerpt:             >
    This article summarizes the list of APIs for "Snapshot and
    Restore" in Elasticsearch, which allows you to perform operations
    easily and navigate to official documentation if you need more detail.

image:               /assets/bg-alfons-morales-YLSwjSy7stw-unsplash.jpg
cover:               /assets/bg-alfons-morales-YLSwjSy7stw-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

When managing Elasticsearch clusters in production, you will probably need to
backup and restore a cluster or specific indices since this is an efficient way
to avoid data loss. This can be done using the feature "Snapshot And Restore" in
Elasticsearch. However, it's not easy to remember all the commands you need,
such as creating a new snapshot, listing existing snapshots, monitoring the
snapshot restore progress, canceling an ongoing snapshot, etc.
During my work at Datadog, I had the chance to work with the "Snapshot And
Restore" feature in AWS, GCP, and Azure. Therefore, I would like to share with
you the commands I used as a cheatsheet.

## Summary

Before getting started, you may ask: there are so many APIs, how can I remember
them?! Well, it's not that
complicated. All the APIs follow the hierarchy: snapshot plugin > snapshot
repository > snapshots (or snapshot expression) > snapshot specific endpoint.
And for restore operations, they are standard recovery operations, so you can
from them from cat recovery or indexing recovery API. Based on the rules above,
we can summarize them as the following list of APIs:

```
<METHOD> /_snapshot/<?repo>/<?snapshot>/<?_action>
```

```
GET     /_snapshot
GET     /_snapshot/_status

GET     /_snapshot/<repo>
PUT     /_snapshot/<repo>
DELETE  /_snapshot/<repo>
GET     /_snapshot/<repo>/_status
POST    /_snapshot/<repo>/_cleanup
POST    /_snapshot/<repo>/_verify
GET     /_snapshot/<repo>/_current

GET     /_snapshot/<repo>/<snapshot>
PUT     /_snapshot/<repo>/<snapshot>
POST    /_snapshot/<repo>/<snapshot>
DELETE  /_snapshot/<repo>/<snapshot>
GET     /_snapshot/<repo>/<snapshot>/_status
GET     /_snapshot/<repo>/<snapshot>/_restore

GET     /_cat/snapshots/{repo}
GET     /_cat/recovery

GET     /<index>/_recovery
---

snapshot_expression:
  - "snap_1"        -- snapshot 1
  - "snap_1,snap_2" -- snapshot 1 and 2, separated by comma ','
  - "snap_*"        -- all snapshots starting with "snap_"
  - "_all"          -- all snapshots
```

Now, let's go through them one by one.

## Snapshot APIs

### Create Snapshot

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/create-snapshot-api.html)]
Create a snapshot for the entire cluster or the target data streams and indices.

```
PUT  /_snapshot/<repository>/<snapshot>
POST /_snapshot/<repository>/<snapshot>
```

```
PUT /_snapshot/my_repo/snapshot_2?wait_for_completion=true

{
  "indices": "index_a,index_b",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": {
    "taken_by": "user123",
    "taken_because": "backup before upgrading"
  }
}
```

### Clone Snapshot

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/clone-snapshot-api.html)]
Clones part or all of a snapshot into a new snapshot within the same repository.

```
PUT /_snapshot/<repository>/<source_snapshot>/_clone/<target_snapshot>
```

```
PUT /_snapshot/my_repo/old_snapshot/_clone/new_partial_snapshot

{
  "indices": "index_a,index_b"
}
```

### Get Snapshot Info

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-api.html)]
Get information about one or more snapshots.

```
GET /_snapshot/<repository>/<snapshot>
```

### Get Snapshot Status

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-status-api.html)]
Get Snapshot Status API returns additional information beyond the Get Snapshot
Info API, such as shard status and file statistics:

```
GET /_snapshot/<repository>/<snapshot>/_status
```

### Restore Snapshot

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/restore-snapshot-api.html)]
Restore Snapshot API allows you to restore all indices (complete restore) of a
given snapshot or only restore a subset of them (partial restore):

```
POST /_snapshot/<repository>/<snapshot>/_restore
```

### Delete Snapshot

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/delete-snapshot-api.html)]
Delete a snapshot.

```
DELETE /_snapshot/<repository>/<snapshot>
```

## Snapshot Repository APIs

### List Repositories

[[Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-repo-api.html)]
List all the snapshot repositories.

```
GET /_snapshot/
GET /_snapshot/_all
```

### Get Repository

[[Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-snapshot-repo-api.html)]
Get information about one or more registered snapshot repositories.

```
GET /_snapshot/<repository>
```

### Create/Update Repository

[[Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-snapshot-repo-api.html)] Registers or updates a snapshot repository.

```
PUT /_snapshot/<repository>
```

```
PUT /_snapshot/my_repository
{
  "type": "fs",
  "settings": {
    "location": "my_backup_location"
  }
}
```

### Verify Repository

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/verify-snapshot-repo-api.html)]
Verifies that a snapshot repository is functional.

```
POST /_snapshot/<repository>/_verify
```

### Delete Repository

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/delete-snapshot-repo-api.html)]
Unregisters one or more snapshot repositories.

NOTE: When a repository is unregistered, Elasticsearch only removes the
reference to the location where the repository is storing the snapshots. The
snapshots themselves are left untouched and in place. To delete the actual
snapshots, you should use the "Delete Snapshot API". This API handles the
snapshot repository.

```
DELETE /_snapshot/<repository>
```

### Clean up Repository

[[documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/clean-up-snapshot-repo-api.html)]
Triggers the review of a snapshot repository's contents and deletes any stale
data that is not referenced by existing snapshots.

```
POST /_snapshot/<repository>/_cleanup
```

## Monitoring APIs

Description extracted from official documentation [Monitor snapshot and restore
progress | Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-monitor-snapshot-restore.html).

### Snapshot In Progress

Use the `_current` parameter to get all currently running snapshots in the
cluster:

```
GET /_snapshot/<repository>/_current
```

or a single one:

```
GET /_snapshot/<repository>/snapshot_1
```

Retrieve all currently running snapshots with detailed status info:

```
GET /_snapshot/_status
```

... limit the results to a target repository:

```
GET /_snapshot/<repository>/_status
```

... limit the result to the given snapshot (even if it's not currently running):

```
GET /_snapshot/<repository>/<snapshot>/_status
```

### Restore In Progress

The restore process is a standard recovery mechanism of Elasticsearch. So you
can use the cat recovery API to monitor the snapshot restore as other
recoveries. Perhaps you want to `grep snapshot` to filter snapshots.

```
GET /_cat/recovery
```

or using the index recovery API to have a JSON result with more detailed
information:

```
GET /<index>/_recovery
```

### Cancel Snapshot Creation

You can do that using the delete snapshot API.

```
DELETE /_snapshot/<repo>/<snapshot>
```

### Cancel Snapshot Restore

You can do that by deleting data streams and indices that are being restored. Be
careful! The data for all deleted data streams and indices will be removed from
the cluster.

## Going Further

How to go further from here?

- To learn more about different APIs related to snapshot repository or snapshot
  themselves, visit the official documentation
  ["Snapshot and restore APIs | Elasticsearch"](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore-apis.html).
- To monitor snapshot and restore progress, visit the official documentation
  ["Monitor snapshot and restore progress |
Elasticsearch"](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-monitor-snapshot-restore.html).

## Conclusion

In this article, we saw how to remember different APIs efficiently by
using the resource hierarchy (`_snapshot/<repo>/<snapshot>/<action>`) and the
relationship between restore and recovery; we saw the list of APIs for snapshot
operations and snapshot repository operations; we also saw how to monitor the
snapshot or restore progress and cancel them; finally, I shared some resources to
let you go further from this article.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elastic, ["Snapshot and
  restore"](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html), _Elasticsearch Documentation_, 2021.
- Opster Team, ["Elasticsearch Snapshot"](https://opster.com/elasticsearch-glossary/elasticsearch-snapshot/), _Opster_, 2021.
