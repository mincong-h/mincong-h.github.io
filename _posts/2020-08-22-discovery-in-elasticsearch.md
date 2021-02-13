---
layout:            post
title:             Discovery in Elasticsearch
date:              2020-08-22 18:38:54 +0200
categories:        [elasticsearch]
tags:              [elasticsearch]
comments:          true
excerpt:           >
    How does discovery work in Elasticsearch? This article explains different
    mechanisms of discovery, the key settings, fault detection, related logs,
    and more.
image:             /assets/bg-tim-graf-ErO0E8wZaTA-unsplash.jpg
cover:             /assets/bg-tim-graf-ErO0E8wZaTA-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

Discovery is an important topic when running an Elasticsearch cluster on
production. Discovering nodes within the cluster or running a master election,
these are the two main tasks of the discovery module. The goal of this article
is to share the basic concepts about the discovery in Elasticsearch 6 so that you
can better configure your cluster or better handle operations about it.

After reading this article, you will understand:

- The different mechanisms of discovery
- Key settings about discovery
- Fault detection
- Logs about discovery
- Discovery in Elasticsearch 7
- How to go further on this topic?

Note that this article is mainly focused on Elasticsearch 6. If you need to know
about the discovery in Elasticsearch 7, please jump to the "Discovery in
Elasticsearch 7" section or read the official documentation of Elasticsearch
directly. Now, let's get started!

## ~~Multicast Discovery~~

Multicast discovery does not exist anymore. It was only available as a plugin
from Elasticsearch 2.0 onwards, and that plugin was removed in Elasticsearch
5.0, according to Clinton Gormley on [this comment](https://github.com/elastic/elasticsearch/issues/18686#issuecomment-223078307).

## Unicast Discovery

Unicast discovery configures a static list of hosts for use as seed nodes. These hosts can be specified as hostnames or IP addresses; hosts specified as hostnames are resolved to IP addresses during each round of pinging.
Here is an example of a unicast configuration inside the Elasticsearch configuration file
(`elasticsearch.yml`):

```yml
discovery.zen.ping.unicast.hosts: ["10.0.0.3:9300", "10.0.0.4:9300", "10.0.0.5:9300"]
```

> But what is the location of `elasticsearch.yml`? If you’re using the Elasticsearch
> Docker image, the default absolute path of the configuration file is
> /usr/share/elasticsearch/config/elasticsearch.yml
> ([reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-config-bind-mount)).
> You can also check directory `$ES_HOME/config/` or `$ES_PATH_CONF` as
> mentioned in "Configuring Elasticsearch"
> ([6.8](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/settings.html)).

Not all of the Elasticsearch nodes in the cluster need to be present in the
unicast list to discover all the nodes, but enough addresses should be
configured for each node to know about an available gossip node.

## File-based Discovery

In addition to hosts provided by the setting `discovery.zen.ping.unicast.hosts`,
you can provide a list of hosts via an external file. Elasticsearch can detect
changes on this file and reload it so that the list of seed hosts can be
changed dynamically without needing to restart a node. To enable the filed-based
discovery, configure the `file` hosts provider as:

```yml
discovery.zen.hosts_provider: file
```

Then, you need to create a new file under the configuration directory of
Elasticsearch as `$ES_PATH_CONF/unicast_hosts.txt` as the format below.

```
10.0.0.6:9300
10.0.0.7:9300
```

Combined with the values defined by `discovery.zen.ping.unicast.hosts` in the
previous section, the
final list of seed hosts will be `10.0.0.{2,3,4,5,6,7}:9300` because both the
values defined by the unicast and defined by the file `unicast_hosts.txt` are
used. For more detail, you can see the "File-based" section of [Zen Discovery
(6.8)](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/modules-discovery-zen.html).

## Discovery Settings

In Elasticsearch 6, there are two important settings for discovery, they should be configured before going to production:

- discovery.zen.ping.unicast.hosts
- discovery.zen.minimum_master_nodes

Let's go into more detail about these settings.

### discovery.zen.ping.unicast.hosts

This setting defines a static list of hosts for use as seed nodes for Zen
discovery. These hosts can be specified as hostnames or IP addresses; hosts
specified as hostnames are resolved to IP addresses during each round of
pinging. Each value should be in the form of `host:port` or `host`. In other
words, the port of the host is optional. If empty, the `port` defaults to the
setting `transport.profiles.default.port` falling back to `transport.port` if
not set. A hostname that resolves to multiple IP addresses will try all resolved
addresses. You can also provide IPv6 addresses. Additionally, the
`discovery.zen.ping.unicast.resolve_timeout` configures the amount of time to wait for DNS lookups on each round of pinging. This is specified as a time unit and defaults to 5s.

### discovery.zen.minimum_master_nodes

This setting defines the minimum of master-eligible nodes to form a cluster. It
is essential to form a cluster correctly and prevent data loss. Without this
setting, the cluster may suffer from split-brain issues. A split-brain scenario is when a subset of your cluster (one or more nodes) loses communication to the master node and forms a new cluster. It means that two different Elasticsearch clusters are running independently of each other. To prevent this from happening, set the minimum of master nodes as half of the master-eligible nodes plus one, i.e the minimum value to be majority:

    (master_eligible_nodes / 2) + 1

For example, if you have 3 master-eligible nodes, set the minimum of master nodes as 2 because “(3 / 2) + 1 = 2”.

```yml
discovery.zen.minimum_master_nodes: 2
```

## Fault Detection

Fault detection ensures that master node and other nodes are connected and
healthy so that a master election or a node removal does not need to be held. On
one side, the elected master periodically checks the connectivity and health of each
of the nodes in the cluster; on the other side, each node in the cluster checks
the health of the elected master. These checks are known as "follower checks" and
"leader checks". Elasticsearch allows these checks to occasionally fail or timeout. It considers
a node to be faulty only after several consecutive checks have failed. Here
are the settings to configure to fault detection (`fd`):

Setting                          | Description
:------------------------------- | :------
`discovery.zen.fd.ping_interval` | How often a node gets pinged. Defaults to `1s`.
`discovery.zen.fd.ping_timeout`  | How long to wait for a ping response, defaults to `30s`.
`discovery.zen.fd.ping_retries`  | How many ping failures/timeouts cause a node to be considered failed. Defaults to `3`.

For more detail, check the Elasticsearch official document "Cluster fault detection"
([7.9](https://www.elastic.co/guide/en/elasticsearch/reference/7.9/cluster-fault-detection.html)).

## Logs

Here are some logs related to Zen Discovery that may help you to identify the
problem of your cluster.

### Not enough master nodes discovery during pinging

> WARN: not enough master nodes discovered during pinging (found [...], but need [2]),
> pinging again

There aren't enough master nodes discovered during pinging. Only N
master-eligible nodes were found but the minimum required nodes are 2. The nodes
found are described in the list above `[...]`. It happens probably because one
or more master eligible-nodes were disconnected from the network or shutdown.
Therefore, the `discovery.zen.minimum_master_nodes` setting is not satisfied. A master
election cannot happen because there are not enough master to elect from.
This is a critical error and prevents the cluster to be fully operational. According
to documentation ["Zen Discovery > no master block
(6.8)"](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/modules-discovery-zen.html#no-master-block),
when it happens, by default, the write operations will be rejected. Read
operations will succeed, based on the last know cluster configuration. If the
setting of `discovery.zen.no_master_block` is not the default option (`write`)
but option `all`, then both read and write operations will be rejected.

[Source
code in Elasticsearch
6.8](https://github.com/elastic/elasticsearch/blob/v6.8.12/server/src/main/java/org/elasticsearch/discovery/zen/ZenDiscovery.java#L954-L955).

### Master left

> WARN: master left (reason = failed to ping, tried [3] times, each with maximum [30s]
> timeout), current nodes: ...

This is part of the fault detection as "leader checks".
A node failed to ping master node after 3 times, each with a maximum 30s timeout,
so it considers master node is left and decides the join another master.
Before doing so, the list of current nodes is logged to record the current
situation. The list of nodes is retrieved from the cluster state.
This can happen when heavy network issues happen or the master node is
disconnected/stopped.

[Source code in Elasticsearch 6.8](https://github.com/elastic/elasticsearch/blob/v6.8.12/server/src/main/java/org/elasticsearch/discovery/zen/ZenDiscovery.java#L993).

### Other Logs

I only documented some of the logs here, if you need more, you can find them from
[ZenDiscovery.java](https://github.com/elastic/elasticsearch/blob/v6.8.12/server/src/main/java/org/elasticsearch/discovery/zen/ZenDiscovery.java)
or the Zen module
([org.elasticsearch.discovery.zen](https://github.com/elastic/elasticsearch/tree/v6.8.12/server/src/main/java/org/elasticsearch/discovery/zen))
in general. If you have a service collecting logs for you, you find search logs
related to logger `ZenDiscovery` to find them out.

## Discovery in Elasticsearch 7

The implementation of discovery is rewritten in Elasticsearch 7 as Zen2. Philipp
Krenn has an excellent video about this topic. You can see his talk _"Reaching
Zen in ElasticSearch's Coordination"_ (2019) on YouTube:

<iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/Ns1Erg4I92U" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

This talk shows the main improvements of the new implementation: Master
elections are much faster, the infamous `minimum_master_nodes` setting has been
removed, growing and shrinking clusters becomes safer and easier, and leaves
less room to misconfigure the system. If you need more information about how
discovery works on Elasticsearch 7, you can also reach the official
documentation
[Discovery](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-hosts-providers.html)
of Elasticsearch.

## Plugins

Other plugins exist for discovery:

Plugin | Description
:----- | :---
Azure Classic Discovery Plugin ([6.8](https://www.elastic.co/guide/en/elasticsearch/plugins/6.8/discovery-azure-classic.html)) | (Deprecated in 5.0.0) This plugin uses the Azure Classic API for unicast discovery. The development of its replacement Azure ARM Discovery Plugin was discontinued ([Issue #19146](https://github.com/elastic/elasticsearch/issues/19146)).
Google Compute Engine Discovery Plugin ([6.8](https://www.elastic.co/guide/en/elasticsearch/plugins/6.8/discovery-gce.html)) | This plugin uses the GCE API for unicast discovery.
EC2 Discovery Plugin ([6.8](https://www.elastic.co/guide/en/elasticsearch/plugins/6.8/discovery.html)) | This plugin uses the AWS API for unicast discovery.

## Going Further

How to go further from here?

- To better understand Zen Discovery, read the official documentation of Zen
  Discovery on Elasticsearch 6.8.
  <https://www.elastic.co/guide/en/elasticsearch/reference/6.8/modules-discovery-zen.html>
- To better understand the implementation of Zen Discovery, read the source code
  of [ZenDiscovery.java (6.8)](https://github.com/elastic/elasticsearch/blob/v6.8.12/server/src/main/java/org/elasticsearch/discovery/zen/ZenDiscovery.java)
  on GitHub and other classes in the same package.
- To better understand discovery and cluster formation, see the official
  documentation of "Discovery and cluster formation" on Elasticsearch 7.9.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/modules-discovery.html>
- To see the full list of log errors related to this Elasticsearch discovery,
  see Opster's article: Elasticsearch Discovery.
  <https://opster.com/elasticsearch-glossary/elasticsearch-discovery/>
- To learn more about Elasticsearch, I highly recommend the book "Elasticesarch
  in Action" written by Radu Gheorghe, Matthew Lee Hinman, and Roy Russo.
  <https://www.manning.com/books/elasticsearch-in-action>

## Conclusion

In this article, we saw different types of discovery: unicast discovery,
file-based discovery, plugin-based discovery; we saw the two most important
settings for unicast discovery for the list of seed hosts and the minimum number
of master-eligible nodes; we took a look about fault detection in Elasticsearch
using pings; we saw some logs related to zen discovery; we also the changes
about the discovery in Elasticsearch 7. Finally, I shared some resources which
allow you to go further on this topic.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

* Radu Gheorghe, Matthew Lee Hinman, Roy Russo, “Elasticsearch in Action”,
  _Manning_, 2016. [book]
* Opster, "Elasticsearch Discovery", _Opster_, 2020.<br>
  <https://opster.com/elasticsearch-glossary/elasticsearch-discovery/>
* Philipp Krenn, "Reaching Zen in Elasticsearch's Coordination", _Berlin
  Buzzwords_, 2019.<br>
  <https://www.youtube.com/watch?v=Ns1Erg4I92U>
* Elasticsearch, "Install Elasticsearch with Docker", _Elasticsearch_,
  2020.<br>
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html>
* Elasticsearch, "Configuring Elasticsearch", _Elasticsearch_,
  2020.<br>
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html>
* Elasticsearch, "Zen Discovery", _Elasticsearch_,
  2020.<br>
  <https://www.elastic.co/guide/en/elasticsearch/reference/6.8/modules-discovery-zen.html>
* Elasticsearch, "Cluster fault detection", _Elasticsearch_, 2020.<br>
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/cluster-fault-detection.html>
* Clinton Gormley, Answer of Issue "Elasticsearch 5.0 (5.0.0-alpha2) Disable
  multicast - unknown setting error", _GitHub_, 2016.<br>
  <https://github.com/elastic/elasticsearch/issues/18686>
