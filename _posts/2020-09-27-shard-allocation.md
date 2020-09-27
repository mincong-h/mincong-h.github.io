---
layout:            post
title:             18 Allocation Deciders in Elasticsearch
date:              2020-09-27 11:44:32 +0200
categories:        [elasticsearch]
tags:              [elasticsearch, java]
comments:          true
excerpt:           >
    This article explains the 18 allocation deciders in Elasticsearch: when
    they decide to allow, deny, or throttle the shard allocation under different
    circumstances. Also, a complete list of messages for unassigned shards.
image:             /assets/bg-robert-ruggiero-X2bcQMMhaow-unsplash.jpg
ads:               none
---

## Introduction

This article explains the 18 allocation deciders in Elasticsearch 7.8.0. It will
help you understand about unassigned shards or shard allocation in
general, by going through decisions made by different deciders.

After reading this article, you will understand:

* Different deciders in Elasticsearch 7.8
* Where to find the source code
* The list of decisions and related messages given by each decider
* The list of settings available
* A brief description of the decision making from Elasticsearch Javadoc.
* References to go further in each of these deciders

This is a long article. Now, let's get started!

## Overview

In Elasticsearch 7.8.0, allocation decisions are made by allocation deciders. To
find out all the deciders, you can search all the classes extending the base
class `AllocationDecider` under the source code of `server` directory:

```
elasticsearch ((v7.8.0)) $ rg -l --sort-files "extends AllocationDecider" server/src/main | sed 's/.*\///g'
AllocationDeciders.java
AwarenessAllocationDecider.java
ClusterRebalanceAllocationDecider.java
ConcurrentRebalanceAllocationDecider.java
DiskThresholdDecider.java
EnableAllocationDecider.java
FilterAllocationDecider.java
MaxRetryAllocationDecider.java
NodeVersionAllocationDecider.java
RebalanceOnlyWhenActiveAllocationDecider.java
ReplicaAfterPrimaryActiveAllocationDecider.java
ResizeAllocationDecider.java
RestoreInProgressAllocationDecider.java
SameShardAllocationDecider.java
ShardsLimitAllocationDecider.java
SnapshotInProgressAllocationDecider.java
ThrottlingAllocationDecider.java
```

In the sections below, we are going to visit all of them and see how they work.

## All

[org.elasticsearch.cluster.routing.allocation.decider.AllocationDeciders](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/AllocationDeciders.java)

A composite allocation decider combining the "decision" of multiple
allocation decider implementations into a single allocation decision.

## Awareness

[org.elasticsearch.cluster.routing.allocation.decider.AwarenessAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/AwarenessAllocationDecider.java)

Decision | Message
:---: | :---
YES | allocation awareness is not enabled, set cluster setting [cluster.routing.allocation.awareness.attributes] to enable it
NO | node does not contain the awareness attribute [%s]; required attributes cluster setting [cluster.routing.allocation.awareness.attributes=%s]
NO | there are too many copies of the shard allocated to nodes with attribute [%s], there are [%d] total configured shard copies for this shard id and [%d] total attribute values, expected the allocated shard count per attribute [%d] to be less than or equal to the upper bound of the required number of shards per attribute [%d]"_

Setting | Comment
:--- | :---
`cluster.routing.allocation.awareness.attributes` | Dynamic setting; Scope: Node; Default to empty list.
`cluster.routing.allocation.awareness.force.*` | Dynamic setting; Scope: Node; Defaults to empty list.

This allocation decider controls shard allocation based on
`awareness` key-value pairs defined in the node configuration.
Awareness explicitly controls where replicas should be allocated based on
attributes like node or physical rack locations. Awareness attributes accept
arbitrary configuration keys like a rack data-center identifier. For example
the setting:

```yml
cluster.routing.allocation.awareness.attributes: rack_id
```

will cause allocations to be distributed over different racks such that
ideally at least one replicas of the all shard is available on the same rack.
To enable allocation awareness in this example nodes should contain a value
for the `rack_id` key like:

```yml
node.attr.rack_id: 1
```

Awareness can also be used to prevent over-allocation in the case of node or
even "zone" failure. For example in cloud-computing infrastructures like
Amazon AWS a cluster might span over multiple "zones". Awareness can be used
to distribute replicas to individual zones by setting:

```yml
cluster.routing.allocation.awareness.attributes: zone
```

and forcing allocation to be aware of the following zone the data resides in:

```yml
cluster.routing.allocation.awareness.force.zone.values: zone1,zone2
```

In contrast to regular awareness this setting will prevent over-allocation on
`zone1` even if `zone2` fails partially or becomes entirely
unavailable. Nodes that belong to a certain zone / group should be started
with the zone id configured on the node-level settings like:

```yml
node.zone: zone1
```

## Cluster-Rebalance

[org.elasticsearch.cluster.routing.allocation.decider.ClusterRebalanceAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ClusterRebalanceAllocationDecider.java)

Decision | Message
:---: | :---
NO|the cluster has unassigned primary shards and cluster setting [cluster.routing.allocation.allow\_rebalance] is set to [%s]
NO|the cluster has inactive primary shards and cluster setting [cluster.routing.allocation.allow\_rebalance] is set to [%s]
YES|all primary shards are active
NO|the cluster has unassigned shards and cluster setting [cluster.routing.allocation.allow\_rebalance] is set to [%s]
NO|the cluster has inactive shards and cluster setting [cluster.routing.allocation.allow\_rebalance] is set to [%s]
YES|all shards are active

Setting | Description
:---: | :---
`cluster.routing.allocation.allow_rebalance` | Dynamic setting; Scope: Node; Defaults to `indices_all_active`.

This allocation decider controls re-balancing operations based on the
cluster wide active shard state. This decided can not be configured in
real-time and should be pre-cluster start via
`cluster.routing.allocation.allow_rebalance`. This setting respects the following
values:

* `indices_primaries_active` - Re-balancing is allowed only once all
  primary shards on all indices are active.
* `indices_all_active` - Re-balancing is allowed only once all
  shards on all indices are active.
* `always` - Re-balancing is allowed once a shard replication group
  is active

## Concurrent-Rebalance

[org.elasticsearch.cluster.routing.allocation.decider.ConcurrentRebalanceAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ConcurrentRebalanceAllocationDecider.java)

Decision | Message
:---: | :---
YES | unlimited concurrent rebalances are allowed
THROTTLE | reached the limit of concurrently rebalancing shards [%d], cluster setting [cluster.routing.allocation.cluster_concurrent_rebalance=%d]
YES | below threshold [%d] for concurrent rebalances, current rebalance shard count [%d]

Setting | Type
:--- | :---:
`cluster.routing.allocation.cluster_concurrent_rebalance` | Integer

Similar to the `ClusterRebalanceAllocationDecider` this
`AllocationDecider` controls the number of currently in-progress
re-balance (relocation) operations and restricts node allocations if the
configured threshold is reached. The default number of concurrent rebalance
operations is set to `2`.

Re-balance operations can be controlled in real-time via the cluster update API using
`cluster.routing.allocation.cluster_concurrent_rebalance`. Iff this
setting is set to `-1` the number of concurrent re-balance operations
are unlimited.

## Disk-Threshold

[org.elasticsearch.cluster.routing.allocation.decider.DiskThresholdDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/DiskThresholdDecider.java)

Decision | Message
:---: | :---
NO | the node has fewer free bytes remaining than the total size of all incoming shards: free space [%sB], relocating shards [%sB]
NO | the node is above the low watermark cluster setting [cluster.routing.allocation.disk.watermark.low=%s], having less than the minimum required [%s] free space, actual free: [%s]
NO | the node is above the high watermark cluster setting [cluster.routing.allocation.disk.watermark.high=%s], having less than the minimum required [%s] free space, actual free: [%s]
NO | the node is above the low watermark cluster setting [cluster.routing.allocation.disk.watermark.low=%s], using more disk space than the maximum allowed [%s%%], actual free: [%s%%]
NO | the node is above the high watermark cluster setting [cluster.routing.allocation.disk.watermark.high=%s], using more disk space than the maximum allowed [%s%%], actual free: [%s%%]
NO | allocating the shard to this node will bring the node above the high watermark cluster setting [cluster.routing.allocation.disk.watermark.high=%s] and cause it to have less than the minimum required [%s] of free space (free: [%s], estimated shard size: [%s])
NO | allocating the shard to this node will bring the node above the high watermark cluster setting [cluster.routing.allocation.disk.watermark.high=%s] and cause it to use more disk space than the maximum allowed [%s%%] (free space after shard added: [%s%%])
NO | the shard cannot remain on this node because the node has fewer free bytes remaining than the total size of all incoming shards: free space [%s], relocating shards [%s]
NO | the shard cannot remain on this node because it is above the high watermark cluster setting [cluster.routing.allocation.disk.watermark.high=%s] and there is less than the required [%s] free space on node, actual free: [%s]
NO | the shard cannot remain on this node because it is above the high watermark cluster setting [cluster.routing.allocation.disk.watermark.high=%s] and there is less than the required [%s%%] free disk on node, actual free: [%s%%]
YES | the node is above the low watermark, but less than the high watermark, and this primary shard has never been allocated before
YES | enough disk for shard on node, free: [%s], shard size: [%s], free after allocating shard: [%s]
YES | this shard is not allocated on the most utilized disk and can remain
YES | there is enough disk on this node for the shard to remain, free: [%s]
YES | the disk threshold decider is disabled
YES | there is only a single data node present
YES | the cluster info is unavailable
YES | disk usages are unavailable

Setting | Type | Comment
:--- | :---: | :---
`cluster.routing.allocation.disk.watermark.enable_for_single_data_node` | Boolean | Will be removed in Elasticsearch 9
`cluster.routing.allocation.disk.watermark.low` | Percentage / Bytes | Defaults to 85%
`cluster.routing.allocation.disk.watermark.high` | Percentage / Bytes | Defaults to 90%

This allocation decider checks that the node a shard is potentially
being allocated to has enough disk space.

It has three configurable settings, all of which can be changed dynamically:

* `cluster.routing.allocation.disk.watermark.low` is the low disk
  watermark. New shards will not allocated to a node with usage higher than this,
  although this watermark may be passed by allocating a shard. It defaults to
  0.85 (85.0%).
* `cluster.routing.allocation.disk.watermark.high` is the high disk
  watermark. If a node has usage higher than this, shards are not allowed to
  remain on the node. In addition, if allocating a shard to a node causes the
  node to pass this watermark, it will not be allowed. It defaults to
  0.90 (90.0%).
* Both watermark settings are expressed in terms of used disk percentage, or
  exact byte values for free space (like "500mb")
* `cluster.routing.allocation.disk.threshold_enabled` is used to
  enable or disable this decider. It defaults to true (enabled).

## Enable

[org.elasticsearch.cluster.routing.allocation.decider.EnableAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/EnableAllocationDecider.java)

Decision | Message
:---: | :---
YES | explicitly ignoring any disabling of allocation due to manual allocation commands via the reroute API
YES | all allocations are allowed
NO | no allocations are allowed due to %s
YES | new primary allocations are allowed
NO | non-new primary allocations are forbidden due to %s
YES | primary allocations are allowed
NO | replica allocations are forbidden due to %s
NO | no rebalancing is allowed due to %s
YES | rebalancing is not globally disabled
YES | allocation is explicitly ignoring any disabling of rebalancing
YES | all rebalancing is allowed
NO | no rebalancing is allowed due to %s
YES | primary rebalancing is allowed
NO | replica rebalancing is forbidden due to %s
YES | replica rebalancing is allowed
NO | primary rebalancing is forbidden due to %s

Setting | Type | Comment
:--- | :---: | :---
`cluster.routing.allocation.enable` | Boolean |
`cluster.routing.rebalance.enable` | Boolean |
`index.routing.allocation.enable` | Boolean |
`index.routing.rebalance.enable` | Boolean |

This allocation decider allows shard allocations / rebalancing via the cluster wide settings
`cluster.routing.allocation.enable` / `cluster.routing.rebalance.enable` and the per index setting
`index.routing.allocation.enable` / `index.routing.rebalance.enable`.
The per index settings overrides the cluster wide setting.

Allocation settings can have the following values (non-casesensitive):

* `NONE` - no shard allocation is allowed.
* `NEW_PRIMARIES` - only primary shards of new indices are allowed to be allocated
* `PRIMARIES` - only primary shards are allowed to be allocated
* `ALL` - all shards are allowed to be allocated

Rebalancing settings can have the following values (non-casesensitive):

* `NONE` - no shard rebalancing is allowed.
* `REPLICAS` - only replica shards are allowed to be balanced
* `PRIMARIES` - only primary shards are allowed to be balanced
* `ALL` - all shards are allowed to be balanced

## Filter

[org.elasticsearch.cluster.routing.allocation.decider.FilterAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/FilterAllocationDecider.java)

Decision | Message
:---: | :---
YES | node passes include/exclude/require filters
NO | initial allocation of the shrunken index is only allowed on nodes [%s] that hold a copy of every shard in the index
NO | node does not match index setting [index.routing.allocation.require] filters [%s]
NO | node does not match index setting [index.routing.allocation.include] filters [%s]
NO | node matches index setting [index.routing.allocation.exclude] filters [%s]
NO | node does not match cluster setting [cluster.routing.allocation.require] filters [%s]
NO | node does not cluster setting [cluster.routing.allocation.include] filters [%s]
NO | node matches cluster setting [cluster.routing.allocation.exclude] filters [%s]

Setting | Type | Comment
:--- | :---: | :---
`index.routing.allocation.require.{attribute}`|String|
`index.routing.allocation.include.{attribute}`|String|
`index.routing.allocation.exclude.{attribute}`|String|
`cluster.routing.allocation.require.{attribute}`|String|
`cluster.routing.allocation.include.{attribute}`|String|
`cluster.routing.allocation.exclude.{attribute}`|String|

This `AllocationDecider` control shard allocation by include and
exclude filters via dynamic cluster and index routing settings.

This filter is used to make explicit decision on which nodes certain shard
can / should be allocated. The decision if a shard can be allocated, must not
be allocated or should be allocated is based on either cluster wide dynamic
settings (`cluster.routing.allocation.*`) or index specific dynamic
settings (`index.routing.allocation.*`). All of those settings can be
changed at runtime via the cluster or the index update settings API.

Note: Cluster settings are applied first and will override index specific
settings such that if a shard can be allocated according to the index routing
settings it wont be allocated on a node if the cluster specific settings
would disallow the allocation. Filters are applied in the following order:

1. `required` - filters required allocations.
   If any `required` filters are set the allocation is denied if the index is **not** in the set of `required` to allocate
   on the filtered node
2. `include` - filters "allowed" allocations.
   If any `include` filters are set the allocation is denied if the index is **not** in the set of `include` filters for
   the filtered node
3. `exclude` - filters "prohibited" allocations.
   If any `exclude` filters are set the allocation is denied if the index is in the set of `exclude` filters for the
   filtered node

References:

* Index-level shard allocation filtering | Elasticsearch References 7.8
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.8/shard-allocation-filtering.html>

## Max-Retry

[org.elasticsearch.cluster.routing.allocation.decider.MaxRetryAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/MaxRetryAllocationDecider.java)

Decision | Message
:---: | :---
NO | shard has exceeded the maximum number of retries [%d] on failed allocation attempts - manually call [\/\_cluster\/reroute?retry\_failed=true] to retry, [%s]
YES | shard has failed allocating [%d] times but [%d] retries are allowed
YES | shard has no previous failures

An allocation decider that prevents shards from being allocated on any node if the shards allocation has been retried N times without
success. This means if a shard has been INITIALIZING N times in a row without being moved to STARTED the shard will be ignored until
the setting for `index.allocation.max_retry` is raised. The default value is 5.
Note: This allocation decider also allows allocation of repeatedly failing shards when the `/_cluster/reroute?retry_failed=true`
API is manually invoked. This allows single retries without raising the limits.

## Node-Version

[org.elasticsearch.cluster.routing.allocation.decider.NodeVersionAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/NodeVersionAllocationDecider.java)

Decision | Message
:---: | :---
YES | the primary shard is new or already existed on the node
YES | no active primary shard yet
YES | can relocate primary shard from a node with version [%s] to a node with equal-or-newer version [%s]
NO | cannot relocate primary shard from a node with version [%s] to a node with older version [%s]
YES | can allocate replica shard to a node with version [%s] since this is equal-or-newer than the primary version [%s]
NO | cannot allocate replica shard to a node with version [%s] since this is older than the primary version [%s]
YES | node version [%s] is the same or newer than snapshot version [%s]
NO | node version [%s] is older than the snapshot version [%s]

An allocation decider that prevents relocation or allocation from nodes
that might not be version compatible. If we relocate from a node that runs
a newer version than the node we relocate to this might cause `org.apache.lucene.index.IndexFormatTooNewException`
on the lowest level since it might have already written segments that use a new postings format or codec that is not
available on the target node.

## Rebalance-Only-When-Active

[org.elasticsearch.cluster.routing.allocation.decider.RebalanceOnlyWhenActiveAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/RebalanceOnlyWhenActiveAllocationDecider.java)

Decision | Message
:---: | :---
NO | rebalancing is not allowed until all replicas in the cluster are active
YES | rebalancing is allowed as all replicas are active in the cluster

Only allow rebalancing when all shards are active within the shard replication group.

## Replica-After-Primary-Active

[org.elasticsearch.cluster.routing.allocation.decider.ReplicaAfterPrimaryActiveAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ReplicaAfterPrimaryActiveAllocationDecider.java)

Decision | Message
:---: | :---
YES | shard is primary and can be allocated
NO | primary shard for this replica is not yet active
YES | primary shard for this replica is already active

An allocation strategy that only allows for a replica to be allocated when the primary is active.

## Resize

[org.elasticsearch.cluster.routing.allocation.decider.ResizeAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ResizeAllocationDecider.java)

Decision | Message
:---: | :---
NO | resize source index [%s] doesn't exists
NO | source primary shard [%s] is not active
YES | source primary is allocated on this node
NO | source primary is allocated on another node
YES | source primary is active

An allocation decider that ensures we allocate the shards of a target index for resize operations next to the source primaries.

## Restore-In-Progress

[org.elasticsearch.cluster.routing.allocation.decider.RestoreInProgressAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/RestoreInProgressAllocationDecider.java)

Decision | Message
:---: | :---
YES | ignored as shard is not being recovered from a snapshot
YES | shard is currently being restored
NO | shard has failed to be restored from the snapshot [%s] because of [%s] - manually close or delete the index [%s] in order to retry to restore the snapshot again or use the reroute API to force the allocation of an empty primary shard

This allocation decider prevents shards that have failed to be
restored from a snapshot to be allocated.

## Same-Shard

[org.elasticsearch.cluster.routing.allocation.decider.SameShardAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/SameShardAllocationDecider.java)

Decision | Message
:---: | :---
NO | a copy of this shard is already allocated to host %s [%s], on node [%s], and [cluster.routing.allocation.same\_shard.host] is [true] which forbids more than one node on this host from holding a copy of this shard
NO | this shard is already allocated to this node [%s]
NO | a copy of this shard is already allocated to this node [%s]
YES | this node does not hold a copy of this shard

Setting | Type | Comment
:---|:---:|:---
`cluster.routing.allocation.same_shard.host` | Boolean | Dynamic, node scope

An allocation decider that prevents multiple instances of the same shard to
be allocated on the same `node`.

The `cluster.routing.allocation.same_shard.host` setting allows to perform a check to prevent
allocation of multiple instances of the same shard on a single `host`,
based on host name and host address. Defaults to `false`, meaning that no
check is performed by default.

Note: this setting only applies if multiple nodes are started on the same
`host`. Allocations of multiple copies of the same shard on the same
`node` are not allowed independently of this setting.

## Shards-Limit

[org.elasticsearch.cluster.routing.allocation.decider.ShardsLimitAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ShardsLimitAllocationDecider.java)

Decision | Message
:---: | :---
YES | total shard limits are disabled: [index: %d, cluster: %d] <= 0
NO | too many shards [%d] allocated to this node, cluster setting [cluster.routing.allocation.total\_shards\_per\_node=%d]
NO | too many shards [%d] allocated to this node for index [%s], index setting [index.routing.allocation.total\_shards\_per\_node=%d]
YES | "the shard count [%d] for this node is under the index limit [%d] and cluster level node limit [%d]"

Setting | Type | Comment
:---|:---:|:---
`index.routing.allocation.total_shards_per_node`|Integer|Index scope. Controls the maximum number of shards per index on a single Elasticsearch node. Negative values are interpreted as unlimited.
`cluster.routing.allocation.total_shards_per_node`|Integer|Node scope. Controls the maximum number of shards per node on a global level. Negative values are interpreted as unlimited.

This `AllocationDecider` limits the number of shards per node on a per
index or node-wide basis. The allocator prevents a single node to hold more
than `index.routing.allocation.total_shards_per_node` per index and
`cluster.routing.allocation.total_shards_per_node` globally during the allocation
process. The limits of this decider can be changed in real-time via a the
index settings API.

If `index.routing.allocation.total_shards_per_node` is reset to a negative value shards
per index are unlimited per node. Shards currently in the
`ShardRoutingState#RELOCATING relocating` state are ignored by this
`AllocationDecider` until the shard changed its state to either
`ShardRoutingState#STARTED started`,
`ShardRoutingState#INITIALIZING inializing` or
`ShardRoutingState#UNASSIGNED unassigned`

Note: Reducing the number of shards per node via the index update API can
trigger relocation and significant additional load on the clusters nodes.

## Snapshot-In-Progress

[org.elasticsearch.cluster.routing.allocation.decider.SnapshotInProgressAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/SnapshotInProgressAllocationDecider.java)

Decision|Description
:---:|:---
YES|no snapshots are currently running
THROTTLE|waiting for snapshotting of shard [%s] to complete on this node [%s]
YES|the shard is not being snapshotted

This allocation decider prevents shards that
are currently been snapshotted to be moved to other nodes.

## Throttling

[org.elasticsearch.cluster.routing.allocation.decider.ThrottlingAllocationDecider](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ThrottlingAllocationDecider.java)

Decision|Description
:---:|:---
THROTTLE|reached the limit of ongoing initial primary recoveries [%d], cluster setting [cluster.routing.allocation.node\_initial\_primaries\_recoveries=%d]
YES|below primary recovery limit of [%d]
THROTTLE|reached the limit of incoming shard recoveries [%d], cluster setting [cluster.routing.allocation.node\_concurrent\_incoming\_recoveries=%d] (can also be set via [cluster.routing.allocation.node_concurrent_recoveries])currentInRecoveries
NO|primary shard for this replica is not yet active
THROTTLE|reached the limit of outgoing shard recoveries [%d] on the node [%s] which holds the primary, cluster setting [cluster.routing.allocation.node\_concurrent\_outgoing\_recoveries=%d] (can also be set via [cluster.routing.allocation.node_concurrent_recoveries])
NO|primary shard for this replica is not yet active
YES|below shard recovery limit of outgoing: [%d < %d] incoming: [%d < %d]

Setting|Type|Comment
:---|:---:|:---
`cluster.routing.allocation.node_concurrent_recoveries`|Integer|Defaults to 2. Node scope.
`cluster.routing.allocation.node_initial_primaries_recoveries`|Integer|Defaults to 4. Node scope.
`cluster.routing.allocation.node_concurrent_incoming_recoveries`|Integer|Node scope.
`cluster.routing.allocation.node_concurrent_outgoing_recoveries`|Integer|Node scope.


This allocation decider controls the recovery process per node in
the cluster. It exposes two settings via the cluster update API that allow
changes in real-time:

* `cluster.routing.allocation.node_initial_primaries_recoveries` -
  restricts the number of initial primary shard recovery operations on a single
  node. The default is `4`
* `cluster.routing.allocation.node_concurrent_recoveries` -
  restricts the number of total concurrent shards initializing on a single node. The
  default is `2`

If one of the above thresholds is exceeded per node this allocation decider
will return `Decision#THROTTLE` as a hit to upstream logic to throttle
the allocation process to prevent overloading nodes due to too many concurrent recovery
processes.

## Conclusion

In this article we went through all the allocation deciders available in
Elasticsearch 7.8, pointing out the link of the source code, listing all the
possible decision and their messages, their associated settings, and also a
brief description of each decider.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elasticsearch Contributors, "elastic/elasticsearch: Open Source, Distributed,
  RESTful Search Engine", _GitHub_, 2020.
  <https://github.com/elastic/elasticsearch>
- Emily Change, "How to Resolved Unassigned Shards in Elasticsearch", _Datadog_, 2020.<br>
  <https://www.datadoghq.com/blog/elasticsearch-unassigned-shards/>
