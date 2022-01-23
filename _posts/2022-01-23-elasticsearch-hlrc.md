---
layout:              post
type:                classic
title:               Internal Structure Of Elasticsearch Java High-Level REST Client
subtitle:            >
    How is it implemented and what can we learn from it?

lang:                en
date:                2022-01-23 15:47:40 +0100
categories:          [elasticsearch, system-design]
tags:                [elasticsearch, java, rest, api, system-design]
ads_tags:            []
comments:            true
excerpt:             >
    This article explores the implementation of Elasticsearch Java High-Level
    REST Client (HLRC) by analyzing the structure of the client, the dependencies, the error handling
    mechanism, serialization, its observability, and more.

image:               /assets/bg-mike-kenneally-tNALoIZhqVM-unsplash.jpg
cover:               /assets/bg-mike-kenneally-tNALoIZhqVM-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

The [Elasticsearch Java High-Level REST
Client](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high.html)
was [out in
2017](https://www.elastic.co/fr/blog/the-elasticsearch-java-high-level-rest-client-is-out)
as the replacement of the classical native Java Client (also known as the
Transport Client). This client can be used for communicating to the
Elasticsearch cluster via RESTful API. During my side project [DVF - Demande de
Valeurs Foncières](/en/series/dvf/), I had the chance to use this client to
index documents in Elasticsearch and search them. Then recently, I need to create an internal API
client for our team to communicate with a Java backend service. That's why
I am interested in the implementation of
Elasticsearch's REST client and want to get some
inspiration from it. If you are a Java developer, a database administrator
(DBA), or a regular user of Elasticsearch, this article is also for you:
it can help you to better understand the design of this client and the different
aspects of an API library.

After reading this article, you will understand:

* The client and sub-clients
* The structure of the Java package
* Its dependencies
* Error handling mechanism
* JSON serialization and deserialization
* Asynchronous processing
* Observability

By the way, this article is written with the source code of Elasticsearch
v7.16.2 and Java 16. And to simplify the naming, you will see the acronym
"HLRC", which means High-Level REST Client. Now, let's get started!

## Client

To initialize a `RestHighLevelClient` instance, you need a REST low-level client
builder to be built as follows:

```java
var builder = RestClient.builder(
    new HttpHost("localhost", 9200, "http"),
    new HttpHost("localhost", 9201, "http"));

try (var restClient = new RestHighLevelClient(builder)) {
  // implement logic here
  var response = client.indices().create(request, RequestOptions.DEFAULT);
  ...
} catch (IOException e) {
  // handle exception here
}
```

### Builder

As you can see from the initialization, Elasticsearch High-Level REST Client
(HLRC) uses a [builder
pattern](https://refactoring.guru/design-patterns/builder/java/example) to build
the client. This builder allows us to set
a lot of parameters that are used for each HTTP request, or in general, allows
us to set configurations that are valid during the entire lifecycle of the API
client. Here are some examples:

- `setDefaultHeaders` -- the default HTTP request headers that will be sent
  along with each HTTP request
- `setFailureListener` -- to be notified for each request failure
- `setCompressionEnable` -- whether the request should be compressed using gzip
  content

Thanks to this builder class, we can set configuration easily in a
single place -- inside the class whether we construct the API client. Each
parameter has its method, served as a named parameter. In Java, we don't have
named parameters, so this is an excellent alternative. The presence of the
builder also makes the signature of the API client constructor simple. this is
also extensive for Elasticsearch developers -- when they need more parameters,
they just need to add those parameters in the builder without breaking the
`RestHighLevelClient`.

### Closeable

The client is auto-closeable. It means that a user can use it with the concise
try-with-resources syntax in Java because the actual closing logic is delegated
to HLRC.

```java
try (var restClient = new RestHighLevelClient(builder)) {
  ...
}
```

Going further into this direction, we can see that the closing logic is simple:
it just calls the underlying client `CloseableHttpAsyncClient`, a class from
the HTTP async Client (org.apache.httpcomponents:httpasyncclient:4.1.4), one
of the [Apache HttpComponents
Client](https://github.com/apache/httpcomponents-client).

```java
@Override
public void close() throws IOException {
   client.close();
}
```

### Sub-clients

Elasticsearch is a complex ecosystem these days. There are many modules in it:
cluster, core, index-lifecycle, cross-cluster replication (CCR), search,
analytics, security, snapshot lifecycle management (SLM), ... There is no way
that all APIs can fit inside one single client. To better organize the code,
Elasticsearch groups the APIs by domain inside the `RestHighLevelClient`, so
that the interaction with that one domain is handled specifically by the domain
sub-client. Here is the code:

```java
public class RestHighLevelClient implements Closeable {

  private final IndicesClient indicesClient = new IndicesClient(this);
  private final ClusterClient clusterClient = new ClusterClient(this);
  private final IngestClient ingestClient = new IngestClient(this);
  ...
}
```

As you may see, each sub-client is instantiated using the instance of the
rest client, such as `new IndicesClient(this)`. This is because the sub-client does
not handle the actual HTTP request, it asks the low-level rest client to do it. This is a
smart choice because, at the low level, the domain notion is gone -- it's just a
matter of sending the JSON payload from the client to the server and waiting for the
response. Then, inside the sub-client, there is a pointer to the original class:

```java
public final class IndicesClient {
   private final RestHighLevelClient restHighLevelClient;

   IndicesClient(RestHighLevelClient restHighLevelClient) {
       this.restHighLevelClient = restHighLevelClient;
   }
   ...
}
```

From a user point of view, the API can be accessed as follows:

```java
client.indices().create(request, RequestOptions.DEFAULT);
```

And inside the create method, the implementation is:

```java
public CreateIndexResponse create(
  CreateIndexRequest createIndexRequest,
  RequestOptions options) throws IOException {
  return restHighLevelClient.performRequestAndParseEntity(
      createIndexRequest,
      IndicesRequestConverters::createIndex,
      options,
      CreateIndexResponse::fromXContent,
      emptySet()
  );
}
```

where the wrapper class `InidicesClient` just calls the rest client to perform
the actual HTTP request. More precisely, the rest client performs the HTTP
request using the given input structure (`CreateIndexRequest`), the
converter `IndicesRequestConverters` for JSON serialization, alongside the
given request options. Then, when receiving the response, it uses the method
`fromXContent` to deserialize the JSON content back to the Java structure.

From my point of view, having sub-clients is a brilliant idea. It is extremely
useful when the server APIs grow and become more complex. Having these
sub-clients allows the framework developers (the Elastic employees or community
contributors) to:

1. Avoid a giant class containing all the logic.
2. Decouple the business logic (high-level) and the actual API logic
   (low-level), where the business logic is delegated to different sub-client,
   specific to a target module (index, cluster, snapshot, ...) and let the rest
   client itself to handle the low-level HTTP request and response.
3. It increases significantly the readability of the code.

## Packaging

As a library, how is the High-Level REST Client (HLRC) organized? What can we
learn from it? Since Elasticsearch is open-source, let's go to the source code
and find it out. 👀

### Request And Response

From the following `tree` command, we can see that the request and response
representations are stored inside a package, specific to the given domain, like
asynchronous search, cluster, core, etc.

```
➜  elasticsearch git:(v7.16.2-rest-client u=) tree -P 'cluster|core|asyncsearch' --matchdirs -L 2 client/rest-high-level/src/main/java/org/elasticsearch/client | head -n 20
client/rest-high-level/src/main/java/org/elasticsearch/client
├── analytics
├── asyncsearch
│   ├── AsyncSearchResponse.java
│   ├── DeleteAsyncSearchRequest.java
│   ├── GetAsyncSearchRequest.java
│   └── SubmitAsyncSearchRequest.java
├── ccr
├── cluster
│   ├── ProxyModeInfo.java
│   ├── RemoteConnectionInfo.java
│   ├── RemoteInfoRequest.java
│   ├── RemoteInfoResponse.java
│   └── SniffModeInfo.java
├── common
├── core
│   ├── AcknowledgedResponse.java
│   ├── BroadcastResponse.java
│   ├── CountRequest.java
│   ├── CountResponse.java
```

This is a good idea because it provides a clear separation between different
modules and ensure that the structure remains clear when the business grows --
i.e. when we will have more and more modules in the API client.

However, there is a counter-example -- the machine learning (ML) package,
which contains 107 files, most of them are structures of request and response.
Maybe it's time for Elasticsearch to split them into a better structure, i.e.
multiple sub-domains for machine learning.

### Other Classes

Sub-clients and converters are stored directly inside the root directory. There
are other classes as well but let's focus on sub-clients and converters first.

```
➜  elasticsearch git:(v7.16.2-rest-client u=) tree -I '*Request.java|*Response.java' -L 1 client/rest-high-level/src/main/java/org/elasticsearch/client | head
client/rest-high-level/src/main/java/org/elasticsearch/client
├── AsyncSearchClient.java
├── AsyncSearchRequestConverters.java
├── CcrClient.java
├── CcrRequestConverters.java
├── ClusterClient.java
├── ClusterRequestConverters.java
├── EnrichClient.java
├── EnrichRequestConverters.java
├── EqlClient.java
```

I am not sure why they are not stored inside the domain packages. Putting them
into sub-packages could simplify the structure of the root package
(`org.elasticsearch.client`).
Perhaps it has to be in the root package because the conversion methods are
package-private (without `private`, `public` modifiers), so they have to be in
the same Java package of the rest client so that they can be used during the
HTTP request handling.

## Dependencies

_What are the dependencies used by this client?_

Understanding the list of dependencies is useful for software development. It
gives us some hints about the structure of the client, its complexity, the
potential vulnerabilities, classpath conflicts, etc. We can find the list using
the [Gradle dependency command](https://riptutorial.com/gradle/example/10909/list-dependencies):

```
gradle <subproject>:dependencies
```

in our case, it is:

```
➜  elasticsearch git:(v7.16.2-rest-client u=) ./gradlew client:rest-high-level:dependencies
```

Here we can see the dependencies used by the compile classpath. There are
dependencies coming from Elasticsearch, dependencies from Jackson for
serialization, dependencies from Log4J for logging, and dependencies from Apache
HTTP for HTTP requests, etc.

```
compileClasspath - Compile classpath for source set 'main'.
+--- project :server
|    +--- project :libs:elasticsearch-core
|    +--- project :libs:elasticsearch-secure-sm
|    +--- project :libs:elasticsearch-x-content
|    |    +--- project :libs:elasticsearch-core
|    |    +--- org.yaml:snakeyaml:1.26
|    |    +--- com.fasterxml.jackson.core:jackson-core:2.10.4
|    |    +--- com.fasterxml.jackson.dataformat:jackson-dataformat-smile:2.10.4
|    |    +--- com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:2.10.4
|    |    \--- com.fasterxml.jackson.dataformat:jackson-dataformat-cbor:2.10.4
|    +--- project :libs:elasticsearch-geo
|    +--- project :libs:elasticsearch-lz4
|    |    +--- org.lz4:lz4-java:1.8.0
|    |    \--- project :libs:elasticsearch-core
|    +--- org.apache.lucene:lucene-core:8.10.1
|    +--- org.apache.lucene:lucene-analyzers-common:8.10.1
|    +--- org.apache.lucene:lucene-backward-codecs:8.10.1
|    +--- org.apache.lucene:lucene-grouping:8.10.1
|    +--- org.apache.lucene:lucene-highlighter:8.10.1
|    +--- org.apache.lucene:lucene-join:8.10.1
|    +--- org.apache.lucene:lucene-memory:8.10.1
|    +--- org.apache.lucene:lucene-misc:8.10.1
|    +--- org.apache.lucene:lucene-queries:8.10.1
|    +--- org.apache.lucene:lucene-queryparser:8.10.1
|    +--- org.apache.lucene:lucene-sandbox:8.10.1
|    +--- org.apache.lucene:lucene-spatial3d:8.10.1
|    +--- org.apache.lucene:lucene-suggest:8.10.1
|    +--- project :libs:elasticsearch-cli
|    |    +--- net.sf.jopt-simple:jopt-simple:5.0.2
|    |    \--- project :libs:elasticsearch-core
|    +--- com.carrotsearch:hppc:0.8.1
|    +--- joda-time:joda-time:2.10.10
|    +--- com.tdunning:t-digest:3.2
|    +--- org.hdrhistogram:HdrHistogram:2.1.9
|    +--- org.apache.logging.log4j:log4j-api:2.17.0
|    +--- org.apache.logging.log4j:log4j-core:2.17.0
|    \--- net.java.dev.jna:jna:5.10.0
+--- project :client:rest
|    +--- org.apache.httpcomponents:httpclient:4.5.10
|    +--- org.apache.httpcomponents:httpcore:4.4.12
|    +--- org.apache.httpcomponents:httpasyncclient:4.1.4
|    +--- org.apache.httpcomponents:httpcore-nio:4.4.12
|    +--- commons-codec:commons-codec:1.11
|    \--- commons-logging:commons-logging:1.1.3
+--- project :modules:mapper-extras
+--- project :modules:parent-join
+--- project :modules:aggs-matrix-stats
+--- project :modules:rank-eval
\--- project :modules:lang-mustache
     \--- com.github.spullara.mustache.java:compiler:0.9.6
```

## Serialization

_How to serialize Java request into JSON and deserialize it from JSON to Java?_

### XContent

In Elasticsearch, `XContent` is a generic abstraction for content handling,
inspired by JSON and pull parsing. There are 4 types of XContent:

Type | Description
:--- | :---
JSON | A JSON based content type.
SMILE | The jackson based smile binary format. Fast and compact binary format.
YAML | A YAML based content type.
CBOR | A CBOR based content type.

In our case, we are mostly interested in the JSON content type.

### Serialization

The serialization of the request is handled by the converters. There are many of
them, perhaps one per domain (sub-client). Their naming convention is the name
of the domain, followed by the suffix `*Converters.java`.

```
source: org.elasticsearch.client.{domain}.XxxRequest
target: org.elasticsearch.client.Request
```

In each converter, you can find a manual process for converting each field of a
domain-specific request into a low-level HTTP request.

### Deserialization

On the other side, there is a `fromXContent(XContentParser parser)` method for
deserialization. You can from it in the domain-specific response, which allows
parsing the low-level JSON response back to a high-level response in Java.

Here is an example from the Cluster Health API:

```java
public ClusterHealthResponse health(ClusterHealthRequest healthRequest, RequestOptions options) throws IOException {
    return restHighLevelClient.performRequestAndParseEntity(
        healthRequest, // domain-specific request
        ClusterRequestConverters::clusterHealth, // serialization
        options,
        ClusterHealthResponse::fromXContent, // deserialization
        singleton(RestStatus.REQUEST_TIMEOUT.getStatus())
    );
}
```

## Error Handling

According to the Javadoc of the HTTP response listener, there are two main
categories of failures: connection failures (usually I/O exception), or
responses that were treated as errors based on their error response code as
`ResponseException`.

### IOException

The I/O exception is thrown during the execution of the HTTP request, in case of
a problem or the connection was aborted. Unfortunately, I didn't find out more
information about this part. If you know more details about it, please let me
know.

### ResponseException

Response exception is an exception thrown when an Elasticsearch node responds to
a request with a status code that indicates an error. It holds the response that
was returned. Its message contains the HTTP method, the host name, the URI, and
the status line (protocol version, status code, and the reason), the list of
warnings if there is any, and finally the entity of the HTTP response. Here is
the structure:

```
method [{method}], host [{host}], URI [{uri}], status line [{status}]
Warnings: {warnings}
{entity}
```

A response exception is constructed after having received the HTTP response in
the low-level RESTful client. You can see that in the following code block
(after the try-catch statement):

```java
private Response performRequest(final NodeTuple<Iterator<Node>> tuple, final InternalRequest request, Exception previousException)
    throws IOException {
    RequestContext context = request.createContextForNextAttempt(tuple.nodes.next(), tuple.authCache);
    HttpResponse httpResponse;
    try {
        httpResponse = client.execute(context.requestProducer, context.asyncResponseConsumer, context.context, null).get();
    } catch (Exception e) {
        ...
    }
    // Note: conversion happens here
    ResponseOrResponseException responseOrResponseException = convertResponse(request, context.node, httpResponse);
    if (responseOrResponseException.responseException == null) {
        return responseOrResponseException.response;
    }
    ...
}
```

### RuntimeException

It is also possible that the client throws a runtime exception. From what I
see, it happens in at least the two following cases: when the input argument is
invalid and when the parsing failed during the deserialization.

When the input argument is incorrect, such as giving a negative value to a field
that requires a positive number, it raises a runtime exception:

```java
public HeapBufferedAsyncResponseConsumer(int bufferLimit) {
    if (bufferLimit <= 0) {
        throw new IllegalArgumentException("bufferLimit must be greater than 0");
    }
    this.bufferLimitBytes = bufferLimit;
}
```

Another case in the XContent parsing:

```java
XContentParser.Token token;
if (parser.currentToken() != XContentParser.Token.START_OBJECT) {
    token = parser.nextToken();
    if (token != XContentParser.Token.START_OBJECT) {
        throw new ParsingException(parser.getTokenLocation(), "Failed to parse object: Expected START_OBJECT but was: " + token);
    }
}
```

### Exception Retry

Elasticsearch HLRC may connect to multiple nodes of a given cluster. It selects
a host out of the provided ones in a round-robin fashion. Failing hosts are
marked dead and retried after a certain amount of time (minimum 1 minute,
maximum 30 minutes), depending on how many times they priviously failed (the more
failures, the later they will be retried). In case of failures, all of the alive
nodes (or dead nodes that deserve a retry) are retried until one responds or
none of them does, in which case an `IOException` will be thrown.

To mark a node as dead, the client reads the status code returned by the HTTP
response and determines if it is one of the following codes (`isRetryStatus`): [502 Bad
Gateway](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502), [503
Service
Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503), and
[504 Gateway
Timeout](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504). If yes,
then the host is marked as dead. Otherwise, the host is marked alive and the request
won't be retried as the error should be a request problem. We can find the logic
inside the response conversion method of the low-level RESTful client:

```java
ResponseException responseException = new ResponseException(response);
if (isRetryStatus(statusCode)) {
    // mark host dead and retry against next one
    onFailure(node);
    return new ResponseOrResponseException(responseException);
}
// mark host alive and don't retry, as the error should be a request problem
onResponse(node);
throw responseException;
```

## Testing

_How is the source code tested?_

There are several types of tests in this package: unit tests for a given method,
unit tests with a mock HTTP server, and integration tests with a real
Elasticsearch environment. In this section, we are going to take a quick look
into them.

### Unit Test

Unit tests are stored in files having the name `*Tests.java` in the Git repository.
If I take `RestClientBuilderTests` as an example, we can see that it tests the
input validation of the builder. That is, the builder should raise an example
when the input argument is not valid: hosts must not be null nor empty, default
headers must not be null, etc. These tests are simple unit tests without an HTTP
server.

### Mock HTTP Server

Some tests are specific for validating a given HTTP behavior. For example,
the `RestClientGzipCompressionTests`, which validates the Gzip compression.
These tests are also considered as unit tests in Elasticsearch, since their
filenames also end with `*Tests.java`. In the example of Gzip tests, the test
suite sets up an HTTP server (`com.sun.net.httpserver.HttpServer`) with a Gzip
response handler. The test suite ensure that the low-level REST client handles
the compression correctly according to the client options
(`setCompressionEnabled(boolean)`).

### Integration Test

Integration tests are stored in files having the name `*IntegTests.java` or
`*IT.java`. They extend the class `ESRestTestCase` which can talk to a real
Elasticsearch cluster with a list of hosts. The high-level client wraps the
low-level client and the low-level client connects to those `clusterHosts`.
Therefore, we can create a request, let it be handled by the cluster, and then
assert the response.

## Observability

When running code in production, it's important to have the possibility to observe
the behavior of the source code, for troubleshooting problems or other purposes.
In this section, we are going to discuss what the rest client offers us.

### Logging

The client contains a `RequestLogger`, which provides methods to log requests and
responses. More precisely, it can log failed requests and successful or failed
responses. In other words, a successful request won't be logged until a response
is returned -- which makes sense, because having the request and response in the
same log is more contextual, it provides more information for troubleshooting.

The request logger can be used as follows:

```java
RequestLogger.logResponse(logger, request.httpRequest, node.getHost(), httpResponse);
```

As you can see, the logger is injected as the first input argument of the
method. In this way, the logger used by the helper class `RequestLogger` is
always to the logger of the caller. It facilitates the lookup of the failure
since all the logs can be found by filtering one single class (logger).

There are three levels of logs that are used inside the logger for logging HTTP
responses:

- `WARN`: when warn level is enabled, the logger logs the warnings retrieved from
  the HTTP response header `Warning`.
- `DEBUG`: when debug level is enabled, the logger logs the debug HTTP request and
  response, including the method name, the host, the URI, and the status line
  from the response
- `TRACE`: when trace level is enabled, the internal tracer (another logger)
  will build a `curl` request so that you can reproduce the HTTP request
  directly in your terminal without using HLRC! 😲

You can also find more information from the official documentation [Logging
(7.15)](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.15/java-rest-low-usage-logging.html)
of Elasticsearch.

### Tracing

If you need a tracing solution, I think there is no built-in solution. However, I
saw that there is a third-party library that helps to do this: it's the
[OpenTracing Elasticsearch Client
Instrumentation](https://github.com/opentracing-contrib/java-elasticsearch-client).

```java
// Instantiate tracer
Tracer tracer = ...

// Optionally register tracer with GlobalTracer
GlobalTracer.register(tracer);

// Build RestClient adding TracingHttpClientConfigCallback
var builder = RestClient.builder(
    new HttpHost("localhost", 9200, "http"),
    new HttpHost("localhost", 9201, "http"))
.setHttpClientConfigCallback(new TracingHttpClientConfigCallback(tracer))
// set more options...
```

From what I see in the source code, the class `TracingHttpClientConfigCallback`
implements the method of Elasticsearch's HLRC interface
`HttpClientConfigCallback`:

```java
public interface HttpClientConfigCallback {
    HttpAsyncClientBuilder customizeHttpClient(HttpAsyncClientBuilder var1);
}
```

in which it registers two interceptors into the rest client: an HTTP request
interceptor and an HTTP response interceptor. More precisely, the HTTP request
interceptor is registered at the **last** position of the HTTP request
interceptor chain, while the HTTP response interceptor is registered at the
**first** position of the HTTP response interceptor chain. This makes sense
because we want to record the request only if it will be successfully sent and
after all the modifications; as for the response, we want to record it as soon
as possible before any modification, such as transforming the response into
exception. Here is the source code:

```java
  @Override
  public HttpAsyncClientBuilder customizeHttpClient(
      final HttpAsyncClientBuilder httpAsyncClientBuilder) {
    ...
    httpClientBuilder.addInterceptorLast((HttpRequestInterceptor) (request, context) -> { ... });
    httpClientBuilder.addInterceptorFirst((HttpResponseInterceptor) (response, context) -> { ... });
    return httpClientBuilder;
  }
```

## Going Further

How to go further from here?

- If you want to learn more about Java High Level REST Client, visit the
  official documentation [Java High Level REST Client](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.15/java-rest-high.html).
- If you want to learn more about the Java API Client, the replacement of Java
  High Level REST Client, visit the official documentation [Elasticsearch Java
API
Client](https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/index.html).
- If you want to learn more about the instrumentation of the Elasticsearch client,
  visit GitHub project [OpenTracing Elasticsearch Client
Instrumentation](https://github.com/opentracing-contrib/java-elasticsearch-client).
- If you are interested in other system-design articles, you can find them in my
  blog by filtering the [system-design](/en/archive/?tag=system-design) tag. I
  wrote two posts last year related to Elasticsearch: the internal structure of
  a snapshot repository and the decision system for the shard allocation in
  Elasticsearch.
- If you are interested in learning more design patterns, [Refactoring
  Guru](https://refactoring.guru/) is an amazing website for you. It is visual
  and provides code examples in different programming languages.
- To learn more about Apache HttpComponents Client, you can visit their project
  on [GitHub](https://github.com/apache/httpcomponents-client/).

## Conclusion

In this article, we explored the Java High-Level REST Client of Elasticsearch.
We saw its client by visiting the builder pattern, the auto-closing behavior,
and the domain-driven sub-client structure. We saw its packaging, including
request, response, sub-client, and converters. We also saw its dependencies, its
serialization and deserialization, and the error handling mechanism. Inside the
error handling, we discussed different types of exceptions, their meaning, and how to
retry. Then, we saw the testing part and the observability part of the client.
Finally, I provided some resources for going further on this
topic. Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- ["Apache HttpComponents
  Client"](https://github.com/apache/httpcomponents-client), _GitHub_, 2021.
- ["HTTP response status
  codes"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status), _MDN Web
  Docs_, 2022.
- ["OpenTracing Elasticsearch Client
  Instrumentation"](https://github.com/opentracing-contrib/java-elasticsearch-client),
  _GitHub_, 2022.
