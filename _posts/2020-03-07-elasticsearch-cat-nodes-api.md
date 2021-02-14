---
layout:            post
title:             "Elasticsearch: cat nodes API"
date:              2020-03-07 21:43:53 +0100
categories:        [elasticsearch]
tags:              [elasticsearch, cli, http]
comments:          true
excerpt:           >
    Use Elasticsearch cat nodes API to understand the state of your
    Elasticsearch: id, name, IP address, CPU, load, memory, and much more.
image:             /assets/bg-eric-han-WJ6fmN1D-h0-unsplash.jpg
cover:             /assets/bg-eric-han-WJ6fmN1D-h0-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Elasticsearch cat APIs are designed for people who need compact and aligned
text at a terminal. Today I am going to take one of its APIs, cat nodes API, as
an example to explain how it works and why it can facilitate operations
on an Elasticsearch cluster.

The cat nodes API returns information about a cluster's nodes:

    GET /_cat/nodes

## List Nodes

In default mode (calling the API without any parameters), the API returns the
list of nodes in the cluster with their IP address, the heap percentage, the
random-access memory (RAM), the recent CPU usage, the 1-minute load average, the
5-minute load average, the 15-minute load average, the roles of the node,
whether it is master, and its name.

```
$ curl localhost:9200/_cat/nodes
172.18.0.4 19 84 1 0.08 0.07 0.08 dilm - es02
172.18.0.2 35 84 1 0.08 0.07 0.08 dilm - es01
172.18.0.3 17 84 1 0.08 0.07 0.08 dilm * es03
```

This is hard to remember for those who are not familiar to Elasticsearch.
In that case, you might want to use the verbose mode by passing query parameter
`v` -- It will give you more space between columns and provide column names as
headers.

```
$ curl localhost:9200/_cat/nodes?v
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
172.18.0.3           32          81   3    0.14    0.39     0.45 dilm      *      es02
172.18.0.2           34          81   3    0.14    0.39     0.45 dilm      -      es03
172.18.0.4           39          81   3    0.14    0.39     0.45 dilm      -      es01
```

## Column Selection

Use query parameter `h` to select the list of headers to display,
separated by a comma ",". For example, only select ip, name, load, and node roles:

```
$ curl -s "localhost:9200/_cat/nodes?v&h=ip,name,role,master"
ip         name role master
172.18.0.4 es02 dilm -
172.18.0.2 es01 dilm -
172.18.0.3 es03 dilm *
```

Node role "dilm" means this node is a data node (`d`), an ingest node (`i`), a
machine learning node (`l`), and a master eligible node (`m`). But it is not a
coordinating node (`-`).

## Sorting

You can also sort the results by the columns specified as the parameter value,
this can be useful for some operations.

Sort by 15-minute load in ascending order:

```
$ curl -s "localhost:9200/_cat/nodes?v&h=ip,m,name,load_15m&s=load_15m"
ip         m name load_15m
172.18.0.4 - es02     0.03
172.18.0.2 - es01     0.03
172.18.0.3 * es03     0.04
```

Sort by 15-minute load in descending order by adding `:desc` at the end of the
column name in parameter value of sort (`s`):

```
$ curl -s "localhost:9200/_cat/nodes?v&h=ip,m,name,load_15m&s=load_15m:desc"
ip         m name load_15m
172.18.0.3 * es03     0.04
172.18.0.2 - es01     0.03
172.18.0.4 - es02     0.03
```

You can also sort by multiple columns, speparated by comma:
`s=column1,column2,column3`, to make the table sorted in ascending order by
column 1, in ascending order by column 2, and in ascending order by column 3.
But I think this feature is less frequently used than sorting by a single column.

## Help

There is a good chance that you cannot remember all the columns available in cat
nodes API. In this case, you can use the query parameter `help` to print the
available columns for you. The first column is the long column name, the
second column is the short column name(s), and the last column is the
description of the column.

```
$ curl -s localhost:9200/_cat/nodes?help
id           | id,nodeId | unique node id
pid          | p         | process id
ip           | i         | ip address
port         | po        | bound transport port
http_address | http      | bound http address
version      | v         | es version
flavor       | f         | es distribution flavor
type         | t         | es distribution type
build        | b         | es build hash
jdk          | j         | jdk version
...
```

## Reproduction

If you were interested in reproducing the demo, you need to install Git
and Docker in your machine. Then, you need to:

```sh
# clone project first
git clone https://github.com/mincong-h/learning-elasticsearch.git

# checkout the right tag
git checkout blog-cat-nodes

# run docker compose to start Elasticsearch cluster in localhost
docker-compose -f cluster-nodes/src/test/resources/docker-compose.yml up
```

## Going Further

Want to go further on this topic?
You can list all the `_cat` APIs available by sending a HTTP request to `_cat`
endpoint:

```
$ curl localhost:9200/_cat
=^.^=
/_cat/allocation
/_cat/shards
/_cat/shards/{index}
/_cat/master
/_cat/nodes
/_cat/tasks
/_cat/indices
/_cat/indices/{index}
/_cat/segments
/_cat/segments/{index}
/_cat/count
/_cat/count/{index}
/_cat/recovery
/_cat/recovery/{index}
/_cat/health
/_cat/pending_tasks
/_cat/aliases
/_cat/aliases/{alias}
/_cat/thread_pool
/_cat/thread_pool/{thread_pools}
/_cat/plugins
/_cat/fielddata
/_cat/fielddata/{fields}
/_cat/nodeattrs
/_cat/repositories
/_cat/snapshots/{repository}
/_cat/templates
```

You can also:

- Read the doc about [cat
  APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html)
- Read the doc about [cat
  nodes](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-nodes.html)
- Bookmark page "cat APIs" in your browser and use it as the main entrypoint for searching any cat-related
  APIs.

## Conclusion

In this article, we discovered the cat nodes API in Elasticsearch. We talked
about listing nodes via the default mode, having more info via the verbose mode (`v`),
select headers using `h`, sorting using `s` and using `help` if you don't
remember which are the available headers. We also talked about how to go further
in the cat APIs in general.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elastic, "cat APIs | Elasticsearch Reference \[7.6\]", _Elastic_, 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html>
- Elastic, "cat nodes API | Elasticsearch Reference \[7.6\]", _Elastic_, 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-nodes.html>
