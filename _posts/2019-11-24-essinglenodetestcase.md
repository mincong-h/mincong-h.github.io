---
layout:            post
title:             Testing Elasticsearch with ESSingleNodeTestCase
date:              2019-11-24 10:01:48 +0100
categories:        [tech]
tags:              [java, elasticsearch, testing]
comments:          true
excerpt:           >
    Writing unit tests for Elasticsearch using Elasticsearch Single Node Test
    Case (ESSingleNodeTestCase), a derived class of ESTestCase which simplifies
    the testing set up for you.
image:             /assets/bg-coffee-2306471_1280.jpg
ads:               Ads idea
---

## Overview

Recently I need to learn Elasticsearch basics and the best way to do
that is to write some basic use-cases as unit tests. However, I did not
find many useful resources for Elasticsearch testing. There is an official
testing guide here: [Elasticsearch Reference \[7.4\] » Testing » Java Testing
Framework » Unit
tests](https://www.elastic.co/guide/en/elasticsearch/reference/current/unit-tests.html),
but it does not provide enough detail to make you get started. [This Stack
Overflow question](https://stackoverflow.com/questions/36702419/) also raises
the same disappointment: there are not enough code examples about
`ESTestCase` and `ESIntegTestCase` on the internet. See screenshot below:

> <img src="/assets/20191124-stackoverflow.png" alt="Stack Overflow: not enough code examples about ESTestCase">

That's why I want to share what I learn for you. In this article, I will mainly
focus on `ESSingleNodeTestCase`, a derived class of `ESTestCase` which
simplifies the testing set up for you and allows you to test the basic
Elasticsearch behavior easily. After reading this article, you will understand:

- Declare Elasticsearch Testing Framework dependency in Maven
- The basic structure of `ESSingleNodeTestCase`
- Testing the basics feature: index, get and search documents
- Avoid JAR hell problem

## Maven

To user Elasticsearch Testing Framework, you need to declare it as
Maven dependency in your Maven project. This version should be aligned with your
Elasticsearch server version. For example, I'm using Elasticsearch 7.4, so I use
the testing framework in 7.4 as well:

```xml
<dependency>
  <groupId>org.elasticsearch.test</groupId>
  <artifactId>framework</artifactId>
  <version>7.4.2</version>
</dependency>
```

However, declaring the Elasticsearch Testing Framwork is not enough, you may also
need to declare some additional dependencies to make it work. The first one is
the logging framework. Elasticsearch uses Log4J API as logging API:
_"org.apache.logging.log4j:log4j-api:jar:2.11.1"_, you need to find an
implementation for it to avoid classpath problem.
This dependency is added by transitivity, because the testing framework
(`framework`) depends on Elasticsearch (`elasticsearch`), which
depends on Log4J API (`log4j-api`).
This dependency-relationship can be inspected by performing command `mvn
dependency:tree` at the root directory of your Maven module:

```
io.mincongh:learning-elasticsearch-test-framework:jar:1.0-SNAPSHOT
\- org.elasticsearch.test:framework:jar:7.4.2:test
   +- org.elasticsearch:elasticsearch:jar:7.4.2:test
      ...
   |  +- org.apache.logging.log4j:log4j-api:jar:2.11.1:test
   |  \- org.elasticsearch:jna:jar:4.5.1:test
   +- junit:junit:jar:4.12:test
   ...
```

For example, you can use Log4J Core as the implementation of Log4J API. Make
sure the version used here is the same as the Log4J declared by Elasticsearch to
avoid potential compatibility problem.

```xml
<dependency>
 <groupId>org.apache.logging.log4j</groupId>
 <artifactId>log4j-core</artifactId>
 <version>2.11.1</version>
 <scope>test</scope>
</dependency>
```

Then you might also want to declare your JUnit version as 4.12 to ensure your
dependency is aligned with Elasticsearch:

```xml 
<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
</dependency>
```

This should be enough for getting started. If you encounter classpath conflicts,
please see [JAR Hell](#jar-hell) section for more detail.

## Basic Structure

Once the Maven dependencies are configured, writing tests with
`ESSingleNodeTestCase` is pretty straight forward. You just need to make sure
your test extends the base class `ESSingleNodeTestCase`. The rest like starting
an Elasticsearch node and stopping it will be handled by the base class.

```java
public class MyTest extends ESSingleNodeTestCase {
  @Test
  public void featureToTest() {
    ...
  }
}
```

Here is an excerpt of console logs (simplied) when a test is being executed. You can
see how different classes are called and the lifecycle of the Elasticsearch
node:

```
Running io.mincongh.elasticsearch.GetTest
[i.m.e.GetTest            ] [getRequest] before test
[o.e.e.NodeEnvironment    ] [getRequest] using [1] data paths, mounts [[/ (/dev/disk1s1)]], net usable_space [21.8gb], net total_space [112.8gb], types [apfs]
[o.e.e.NodeEnvironment    ] [getRequest] heap size [1.7gb], compressed ordinary object pointers [true]
[o.e.n.Node               ] [getRequest] node name [node_s_0], node ID [5ekbOv4lR4Kt3pACJJWahw], cluster name [single-node-cluster-TEST_WORKER_VM=[--not-gradle--]-CLUSTER_SEED=[-2261505275491799936]-HASH=[100CAA92EF5D]]
[o.e.n.Node               ] [getRequest] version[7.4.2], pid[5057], build[unknown/unknown/2f90bbf7b93631e52bafb59b3b049cb44ec25e96/2019-10-28T20:40:44.881551Z], OS[Mac OS X/10.14.6/x86_64], JVM[Oracle Corporation/Java HotSpot(TM) 64-Bit Server VM/1.8.0_131/25.131-b11]
[o.e.n.Node               ] [getRequest] JVM home [/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/Contents/Home/jre]
[o.e.n.Node               ] [getRequest] JVM arguments []
[o.e.p.PluginsService     ] [getRequest] no modules loaded
[o.e.p.PluginsService     ] [getRequest] loaded plugin [org.elasticsearch.test.MockHttpTransport$TestPlugin]
[o.e.p.PluginsService     ] [getRequest] loaded plugin [org.elasticsearch.transport.nio.MockNioTransportPlugin]
[o.e.d.DiscoveryModule    ] [getRequest] using discovery type [zen] and seed hosts providers [settings]
[o.e.n.Node               ] [getRequest] initialized
[o.e.n.Node               ] [getRequest] starting ...
[o.e.t.TransportService   ] [getRequest] publish_address {127.0.0.1:10300}, bound_addresses {[::1]:10300}, {127.0.0.1:10300}
[o.e.c.c.Coordinator      ] [getRequest] setting initial configuration to VotingConfiguration{5ekbOv4lR4Kt3pACJJWahw}
[o.e.c.s.MasterService    ] [node_s_0] elected-as-master ([1] nodes joined)[{node_s_0}{5ekbOv4lR4Kt3pACJJWahw}{Wrguql1hRcW2aQ7DCVT8NQ}{127.0.0.1}{127.0.0.1:10300}{dim} elect leader, _BECOME_MASTER_TASK_, _FINISH_ELECTION_], term: 1, version: 1, reason: master node changed {previous [], current [{node_s_0}{5ekbOv4lR4Kt3pACJJWahw}{Wrguql1hRcW2aQ7DCVT8NQ}{127.0.0.1}{127.0.0.1:10300}{dim}]}
[o.e.c.c.CoordinationState] [node_s_0] cluster UUID set to [8chdZxdtTaipVxnoGbtHpw]
[o.e.c.s.ClusterApplierService] [node_s_0] master node changed {previous [], current [{node_s_0}{5ekbOv4lR4Kt3pACJJWahw}{Wrguql1hRcW2aQ7DCVT8NQ}{127.0.0.1}{127.0.0.1:10300}{dim}]}, term: 1, version: 1, reason: Publication{term=1, version=1}
[o.e.n.Node               ] [getRequest] started
[o.e.g.GatewayService     ] [node_s_0] recovered [0] indices into cluster_state
[o.e.c.m.MetaDataIndexTemplateService] [node_s_0] adding template [one_shard_index_template] for index patterns [*]
[o.e.c.m.MetaDataIndexTemplateService] [node_s_0] adding template [random-soft-deletes-template] for index patterns [*]
[o.e.c.m.MetaDataCreateIndexService] [node_s_0] [users] creating index, cause [auto(bulk api)], templates [one_shard_index_template, random-soft-deletes-template], shards [1]/[0], mappings []
[o.e.c.r.a.AllocationService] [node_s_0] Cluster health status changed from [YELLOW] to [GREEN] (reason: [shards started [[users][0]]]).
[o.e.c.m.MetaDataMappingService] [node_s_0] [users/ol9p5f4xRJ-KKd-ZnDvKAQ] create_mapping [_doc]
[i.m.e.GetTest            ] [getRequest] after test
[o.e.c.m.MetaDataDeleteIndexService] [node_s_0] [users/ol9p5f4xRJ-KKd-ZnDvKAQ] deleting index
[o.e.n.Node               ] [suite] stopping ...
[o.e.n.Node               ] [suite] stopped
[o.e.n.Node               ] [suite] closing ...
[o.e.n.Node               ] [suite] closed
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.412 sec
```

## Writing Tests

Now it's time to write some tests. In the following paragraphs, I will show you
several basic tests: testing the Index API, Get API, and Search API of
Elasticsearch.

Index API (`/{index}/_doc/{id}`) allows you to put new document to Elasticsearch
index. I'm a big fan of Game of Throne. Imagine we will create an index
"users" and put Sansa Stark's personal information into the system. This can be
done as follows, where the id of the document is "sansa" and it contains two fields:
first name and last name. Briefly saying it is doing the following:

```
PUT /users/_doc/sansa
```

```json
{
  "firstName": "Sansa",
  "lastName": "Stark"
}
```

The equivalent [Index API in
Java](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-document-index.html)
can be written similarly. You need to prepare an index request with the index
name, the document id and the fields to be indexed. Note that the response
returned by method `#index(IndexRequest request)` is
`ActionFuture<IndexResponse>`, which is asynchronous. Performing
`actionGet()` can make it synchronous so that the test can wait until the action
is finished, then it can assert the response.

```java
@Test
public void indexApi() {
  IndexRequest idxRequest =
      new IndexRequest()
          .index("users")
          .id("sansa")
          .source(newSource());

  IndexResponse idxResponse = node().client().index(idxRequest).actionGet();
  assertEquals("users", idxResponse.getIndex());
  assertEquals(RestStatus.CREATED, idxResponse.status());
  assertEquals("sansa", idxResponse.getId());
  assertEquals(1L, idxResponse.getPrimaryTerm());
  assertEquals(0L, idxResponse.getSeqNo());
  assertEquals(1L, idxResponse.getVersion());

  ShardInfo shardInfo = idxResponse.getShardInfo();
  assertEquals(0, shardInfo.getFailed());
  assertEquals(1, shardInfo.getSuccessful());
  assertEquals(1, shardInfo.getTotal());
}

private Map<String, String> newSource() {
  Map<String, String> source = new HashMap<>();
  source.put("firstName", "Sansa");
  source.put("lastName", "Stark");
  return source;
}
```

Similar concepts for [Get
API](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-document-get.html)
and [Search
API](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high-search.html).
Both examples assume that there are at least two documents available in index
"users", which are "Sansa Stark" and "Arya Stark". I'm not going into detail
because they should be easy to understand.

```java
@Test
public void getApi() {
  GetResponse response =
      node()
          .client()
          .prepareGet()
          .setIndex("users")
          .setId("sansa")
          .execute()
          .actionGet();

  assertEquals("users", response.getIndex());
  assertEquals("sansa", response.getId());

  Map<String, Object> source = response.getSourceAsMap();
  assertEquals("Sansa", source.get("firstName"));
  assertEquals("Stark", source.get("lastName"));
}
```

```java
@Test
public void searchApi() {
  SearchResponse response =
      node()
          .client()
          .prepareSearch("users")
          .setQuery(QueryBuilders.termQuery("lastName", "stark"))
          .get();

  SearchHits hits = response.getHits();
  assertEquals(2L, hits.getTotalHits().value);
  assertEquals("sansa", hits.getHits()[0].getId());
  assertEquals("arya", hits.getHits()[1].getId());
}
```

Obviously, I only covered very few APIs in this section. To know more of them, I
suggest you visit the official documentation of Elasticsearch [Java High Level REST
Client](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high.html),
where you can find explanation and code examples about Document APIs,
Search APIs,
Index APIs,
Cluster APIs,
Ingest APIs,
Snapshot APIs,
and much more.

## JAR Hell

JAR hell problem occurs when two versions of the same artifact (JAR) appear on the
classpath. Elasticsearch checks this problem and throws an exception to prevent you
from going further.

```
Cause: java.lang.RuntimeException: found jar hell in test classpath
class: pkg.to.MyClass
jar1: /path/to/artifact/v1
jar2: /path/to/artifact/v2
```

It happens to me at least in the following places:

- Maven dependencies
- IDE classpath (IntelliJ)

In Maven dependencies, whenever you have a dependency which is used transitively
by Elasticsearch Testing framework, you might get this problem. My suggestion
about this is to align with Elasticsearch's dependencies whenever possible. Also,
try to clean up the test classpath by removing the unnecessary libraries. Maven
Dependency Plugin has a goal `dependency:tree` to inspect your dependency tree.
You can see my article: [Inspect Maven Dependency
Tree](/2019/11/11/inspect-maven-dependency-tree/) to learn how to perform this
action in detail.

When using IntelliJ to run Elasticsearch unit tests and integration tests, you
may encounter the same problem. Please following the official documentation
[Configuring IDEs And Running
Tests](https://github.com/elastic/elasticsearch/blob/master/CONTRIBUTING.md#configuring-ides-and-running-tests)
to get rid of this problem. In particular:

- Set VM option `idea.no.launcher=true` in _"Help > Edit VM Options"_
- Remove `ant-javafx.jar` from the classpath of your SDK in _"Project Structure
  (`cmd` + `;`) > 1.8 (Java 8) > Classpath"_

<img src="/assets/20191124-remove-ant-javafx.png"
     alt="Remove ant-javafx.jar from Java classpath in IntelliJ">

If these two actions were not enough, please read the official documentation
described above.

## Conclusion

In this article, I shared how to test Elasticsearch's basic features (index, get,
search) using class `ESSingleNodeTestCase` provided by the Elasticsearch testing
framework. The examples above are available on GitHub in my project
[mincong-h/learning-elasticsearch](https://github.com/mincong-h/learning-elasticsearch/tree/blog-ESSingleNodeTestCase).
Interested to know more? You can subscribe to [my blog feed](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elastic, "Java High Level REST Client", _Elastic_.
  <https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high.html>
