---
layout:            post
title:             Indexing New Data in Elasticsearch
date:              2019-12-02 21:17:48 +0100
categories:        [elasticsearch]
tags:              [java, elasticsearch]
comments:          true
excerpt:           >
    Initializing Elasticsearch client, sending a single index request or a bulk
    index request, index response, different content types, refresh policy etc.
cover:             /assets/bg-coffee-2242213_1280.jpg
ads:               Ads idea
---

## Overview

In this article, I want to share some basics I learned recently about Elasticsearch: how to
index new data using Elasticsearch Java client. More precisely, I will talk
about how to send a single index request or multiple index requests in bulk.
This article is written under Elastchsearch 7.5 with Java client
(`org.elasticsearch.client.Client`) and Java 11.

## Create Client

Before sending index requests, you need to create an Elasticsearch Java client. For
example, you can create a new `TransportClient` which connects remotely to an Elasticsearch cluster
using the transport module. According to [Elastcisearch Java API
\[7.5\]](https://www.elastic.co/guide/en/elasticsearch/client/java-api/current/transport-client.html),
you can do it as follows:

```java
// on startup
TransportClient client = new PreBuiltTransportClient(Settings.EMPTY)
    .addTransportAddress(new TransportAddress(InetAddress.getByName("host1"), 9300))
    .addTransportAddress(new TransportAddress(InetAddress.getByName("host2"), 9300));

// on shutdown
client.close();
```

If you were like me using the Elasticsearch Testing Framework, this is provided
by the `ESSingleNodeTestCase` or `ESIntegTestCase`, you can retrieve the
client from the base class:

```java
public MyTest extends ESSingleNodeTestCase {
  @Test
  public void testIndex() throws Exception {
    // retrieve the client
    Client client = client();
    // index or do something else
    ...
  }
}
```

**Note** Although this article is mainly written with Legacy Client
(`org.elasticsearch.client.Client`), you should consider using Java High-Level
REST Client instead. More detail can be reached in the official [Migration
Guide](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.5/java-rest-high-level-migration.html).
The Java High Level REST Client depends on the Elasticsearch core project. It
accepts the same request arguments as the `TransportClient` and returns the
same response objects. I chose the legacy Transport Client because I
heavily rely on Elasticsearch Testing Framework to write Elasticsearch blog
posts, the testing framework only provides builtin support for Legacy Client
and not the Java High-Level REST Client.

## Index Request

Once established a connection with Elasticsearch server, you can use
Elasticsearch Client (`org.elasticsearch.client.Client`) to prepare a new index
request. Inside an index request, you have to provide the necessary information to make
the request valid: the target index name and the source to index. All other
parameters are optional. For example, the document id: if you don't provide
that id, Elasticsearch will generate one for you. More advanced options are also
available, like routing, pipeline, type of operation, etc. The simplest form of
an index request looks like this:

```java
IndexRequest idxRequest = new IndexRequest("my_index").source("{\"msg\":\"Hello world!\"}", XContentType.JSON);
IndexResponse idxResponse = client.index(idxRequest).actionGet();
```

If the specified index does not already exist, by default, it will be
automatically created by the index operation.
If no mapping exists, the index operation creates a dynamic mapping. By default, new
fields and objects are automatically added to the mapping if needed.

## Index Response

Here is the cURL version of the request above

```sh
curl -X POST http://localhost:9200/my_index/_doc/?pretty \
  -H 'Content-Type: application/json' \
  -d '{"msg":"hello world!"}'
```

And the response looks like this:

```json
{
  "_index" : "my_index",
  "_type" : "_doc",
  "_id" : "lkOn8W4BnUQvY76RSQ7m",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

The reply contains the index, type, document id, current version of the
document, the change that occurred to the document. It also provides
information about the replication process of the index operation. For example,
`_shards.total` indicates the number of shards the index operation should be
executed on, `_shards.successful` and `_shards.failed` tell the number of shards the index
operation succeeded on and the number of shards the index operation failed on.
All these pieces of information have equivalent in Java object, but I'm not going into
more detail right now.

## Prepared Index Request

You can also create an index request in a similar way using "prepare-\*" method in
client. This is a builder pattern for method chaining:

```java
IndexResponse idxResponse =
    client
        .prepareIndex()
        .setIndex("msg")
        .setSource("{\"msg\":\"Hello world!\"}", XContentType.JSON)
        .execute()
        .actionGet();
```

Personally I prefer method chaining, because on one side, it makes the code easy
to format and read, and on the other side, it states explicitly the name of each
paramter filled, which makes to code easy to understand. It makes up the lack of
support of named parameters in Java.

## Bulk Index Request

Bulk request allows you to send multiple index requests at the same time. You
just need to create a `BulkRequest` or `BulkRequestBuilder`, then add the index
requests into it.

```java
BulkResponse response =
    client
        .prepareBulk()
        .add(indexRequest1)
        .add(indexRequest2)
        ...
        .execute()
        .actionGet();
```

However, after sending a bulk request, you will receive two levels of response: the
bulk response and the bulk item responses related to each index request. Please check
them carefully.

## Content-Type

Support of different content type (XContent). XContent is a generic abstraction
on top of handling content, inspired by JSON and pull parsing.

```java
new IndexRequest("msg").source("{\"key\":\"value\"}", XContentType.JSON);
```

Here is a list of XContent type supported by Elasticsearch 7:

Name | Media Type | Enum
:--- | :--------- | :---
JSON | `application/json` | `XContentType.JSON`
SMILE | `application/smile` | `XContentType.SMILE`
YAML | `application/yaml` | `XContentType.YAML`
CBOR | `application/cbor` | `XContentType.CBOR`

SMILE is a computer data interchange format based on JSON. It can also be
considered a binary serialization of the generic JSON data model, which means
tools that operate on JSON may be used with Smile as well, as long as a proper
encoder/decoder exists for the tool. The name comes from first 2 bytes of the
4 byte header, which consists of Smiley ":)" followed by a linefeed: choice made
to make it easier to recognize Smile-encoded data files using textual
command-line tools. See
[Wikipedia](https://en.wikipedia.org/wiki/Smile_%28data_interchange_format%29)
for more detail. There is also a very nice article on Medium [Understanding
Smile — A data format based on
JSON](https://medium.com/code-with-ayush/understanding-smile-a-data-format-based-on-json-29972a37d376)
written by Ayush Gupta.

## Refresh Policy

In each index request or a bulk request, it is possible to
define a refresh policy. This setting is to control when changes made by this
request are made visible to search. This can be defined by the enum
"RefreshPolicy" or string marked in parentheses:

- NONE (`false`). This is the default policy, which means do not refresh
  after the request.
- IMMEDIATE (`true`). Force a refresh as part of this request. This refresh
  policy does not scale for high indexing or search throughput but is useful
  to present a consistent view for indices with very low traffic. And it is
  wonderful for tests!
- WAIT\_UNTIL (`wait_for`). Leave this request open until a refresh has made
  the contents of this request visible to search. This refresh policy is
  compatible with high indexing and search throughput but it causes the request
  to wait to reply until a refresh occurs.

## Conclusion

In this article, we saw the basics of sending a single request or a bulk
request to Elasticsearch. We saw the structure of the index response.
We also took a quick look at the supported content types and the refresh policy.
The source code is available on GitHub as
[mincong-h/learning-elasticsearch](https://github.com/mincong-h/learning-elasticsearch),
see classes
[IndexTest](https://github.com/mincong-h/learning-elasticsearch/blob/blog-indexing-data/test-framework/src/test/java/io/mincongh/elasticsearch/IndexTest.java)
and
[HttpIndexIT](https://github.com/mincong-h/learning-elasticsearch/blob/blog-indexing-data/docker/src/test/java/io/mincongh/elasticsearch/HttpIndexIT.java).
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elastic, "Index API", _Elastic_, 2019.
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html>
- Elastic, "Migration Guide | Java REST Client \[7.5\]", _Elastic_, 2019.
  <https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.5/java-rest-high-level-migration.html>
- Elastic, "?refresh | REST APIs", _Elastic_, 2019.
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-refresh.html>
- Ayush Gupta, "Understanding Smile — A data format based on JSON", _Medium_, 2019.
  <https://medium.com/code-with-ayush/understanding-smile-a-data-format-based-on-json-29972a37d376>

