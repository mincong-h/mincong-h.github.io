---
layout:            post
title:             Wrap Elasticsearch Response Into CompletableFuture
lang:                en
date:              2020-07-26 10:42:41 +0200
categories:        [elasticsearch, java-concurrency]
tags:              [java, concurrency, elasticsearch]
permalink:         /2020/07/26/es-client-completablefuture/
comments:          true
excerpt:           >
    Wrap Elasticsearch client response into CompletableFuture in Java for
    Elasticsearch transport client or Java high level REST client.
image:             /assets/bg-coffee-2242213_1280.jpg
cover:             /assets/bg-coffee-2242213_1280.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

Today I would like to share with you how to wrap an Elasticsearch client
response into Java's `CompletableFuture` in different clients: the [Transport
Client](https://www.elastic.co/guide/en/elasticsearch/client/java-api/7.x/transport-client.html)
and the [Java High Level REST
Client](https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.x/java-rest-high.html)
in Elasticsearch 7. The motivation of doing this is quite simple: being able to
perform tasks concurrently in the "standard" Java way. For example, it's useful
when you want to send multiple requests to Elasticsearch concurrently, when
you want to request multiple Elasticsearch clusters, or when you want to create
your client interacting with Elasticsearch and exposing asynchronous APIs to
callers.

After reading this article, you will understand:

- How to wrap transport client calls into `CompletableFuture`?
- How to choose executor (thread-pool)?
- How to handle timeout?
- How to do these in Java High Level REST Client?
- How to go further from here?

This article is written in Java 11. Now, let's get started!

> Actually, Elasticsearch has a pull-request to ["Replace custom Future implementations by
> CompletableFuture"](https://github.com/elastic/elasticsearch/pull/32512), made
> by Yannick Welsch. But this feature won't be available before v8.0.0.

## Action Listener Wrapping

The easiest way to wrap the response into `CompletableFuture` is to do it via
`ActionListener`. Elasticsearch Transport Client provides an asynchronous API
which accepts an action listener as input. Therefore, you can control the
`CompletableFuture` completion inside the listener:

```java
var cf = new CompletableFuture<ClusterStateResponse>(); // 1
client
    .admin()
    .cluster()
    .prepareState()
    .execute(ActionListener.wrap(cf::complete, cf::completeExceptionally)); // 2
var stateFuture = cf.thenApply(ClusterStateResponse::getState); // 3
```

In this code snippet,

1. Completable future `cf` is created at the beginning, but it's incomplete.
2. Completable future `cf` is wrapped into an action listener. When the cluster
   state response is received, the completable future will be completed via
   `cf::complete`. If any error occurs, then the completable future will be
   completed exceptionally via `cf::completeExceptionally`. How the action listener
   is hooked into the Elasticsearch client is delegated to Elasticsearch
   transport client.
3. You can manipulate the response `ClusterStateResponse` as you desired in the
   down-stream. You can retrieve the cluster state via `thenApply`; you can
   add a log; you can return the completable future as method output, etc. It's
   up to you.

## Custom Action Listener

A sightly different approach is to create a custom action listener as an
anonymous class:

```java
var cf = new CompletableFuture<ClusterStateResponse>();
client
    .admin()
    .cluster()
    .prepareState()
    .execute(new ActionListener<>() {
      @Override
      public void onResponse(ClusterStateResponse response) {
        cf.complete(response); // 1
      }

      @Override
      public void onFailure(Exception e) {
        cf.completeExceptionally(e); // 2
      }
    });
```

Compared to the previous approach, we have more flexibility about the completable
future completion. We can transform the response, use variables from outside of
the anonymous class, etc. This is valid for both point "1" and "2". Personally, I
prefer the previous approach because it's less verbose and makes the code easier
to read. About the transformation, we can do it in the completable future via
`thenApply` or other `thenXxx` methods anyway.

## Thread Pool

_I'm neither an Elasticsearch expert nor a Java concurrency expert so please leave me
a comment if you think the analysis below is wrong._

Since communicating with Elasticsearch is an I/O blocking operation, it means
that you may want to treat the response carefully and avoid blocking the common
fork-join pool, used by default by `CompletableFuture`. The two approaches
mentioned above via `ActionListener` should handle it well because our code
didn't block the method waiting for the response of Elasticsearch before returning
it. A 3rd approach to do so is to use the `CompletableFuture.supplyAsnyc(...)`
method with an executor (thread pool):

```java
// I don't think you need this, `client` has a thread pool already
var cf = CompletableFuture.supplyAsync(
    () -> client.admin().cluster().prepareState().get(), executor);
```

But in my opinion, this is a waste because Elasticsearch client already
uses a separate thread pool to handle its requests ([source code](https://github.com/elastic/elasticsearch/blob/v7.8.0/server/src/main/java/org/elasticsearch/node/Node.java#L356)). Using yet
another thread pool is not a good idea.

## Timeout

Setting the timeout is important. It allows you to control the actions and avoid
waiting too long. When using Elasticsearch Java clients in a synchronous way,
you can use the `ActionFututure#actionGet(...)` methods to set the timeout. But
you cannot do this anymore with `CompletableFuture`... With `CompletableFuture`,
there are mainly two ways to set the timeouts: `get(...)` or `orTimeout(...)`
after Java 9.

In Java 8+, you can use `get(long timeout, TimeUnit unit)`. Use it to
set the timeout at the end of the completion stages (end of
completable future). But the problems of this approach are: 1) when you have
multiple dependents on the downstream of Elasticsearch response, you need to set
them all, but actually only the Elasticsearch response timeout matters. 2) the
timeout is not accurate: it does not measure the response time of the
Elasticsearch call, but the entire completable future instead. 3) the method
throws a checked exception, so you have to handle the exception or re-throw it.

```java
var response = cf.get(3000, TimeUnit.MILLISECONDS);
```

In Java 9+, you can use `orTimeout(long timeout, TimeUnit unit)`. Use it to
complete exceptionally this future with `TimeoutException` if this
future is not completed before the given timeout. It also solves the problems
mentioned above: we set the timeout once; we can control the future of the
response explicitly instead of controlling their dependents; the timeout is
accurate; how to handle exception will depend on your choices.

```java
var responseFuture = cf.orTimeout(3000, TimeUnit.MILLISECONDS);
```

If you were using Java Time or Elasticsearch Time Value, here are two blocks
showing you how to use them for controlling the timeout:

```java
// java.time.Duration
var timeout = Duration.ofSeconds(3);
var responseFuture = cf.orTimeout(timeout.toMillis(), TimeUnit.MILLISECONDS);
```

```java
// org.elasticsearch.common.unit.TimeValue
var timeout = TimeValue.timeValueSeconds(3);
var responseFuture = cf.orTimeout(timeout.millis(), TimeUnit.MILLISECONDS);
```

## Java High Level REST Client

As you may know, Java transport client was deprecated in Elasticsearch 7.0.0 in
favour of the Java High Level REST Client and will be removed in Elasticsearch
8.0. So I believe it is worth to mention how to do the same thing in the new
REST client as well, i.e. creating a completable future from the Elasticsearch
response. The code looks very similar to the previous ones:

```java
var cf = new CompletableFuture<ClusterHealthResponse>();
restClient
    .cluster()
    .healthAsync(
        new ClusterHealthRequest(),
        RequestOptions.DEFAULT,
        ActionListener.wrap(cf::complete, cf::completeExceptionally));

// TODO: implement your logic about completable future here
```

## Going Further

How to go further from here?

- To know more about Elasticsearch Transport Client, read Elasticsearch official
  documentation: "Transport Client (7.x)"<br>
  <https://www.elastic.co/guide/en/elasticsearch/client/java-api/7.x/transport-client.html>
- To know more about Elasticsearch Java High Level REST Client, read
  Elasticsearch official documentation: "Java High Level REST Client (7.x)"<br>
  <https://www.elastic.co/guide/en/elasticsearch/client/java-rest/7.x/java-rest-high.html>

If you want to see the source code of this article, you can visit them on GitHub
as
[CompletableFutureTransportClientTest](https://github.com/mincong-h/learning-elasticsearch/blob/blog-completable-future/basics/src/test/java/io/mincong/elasticsearch/CompletableFutureTransportClientTest.java)
and
[CompletableFutureRestClientIT](https://github.com/mincong-h/learning-elasticsearch/blob/master/basics/src/test/java/io/mincong/elasticsearch/CompletableFutureRestClientIT.java).

## Conclusion

In this article, we discussed how to wrap a response into
`CompletableFuture` from Elasticsearch Transport Client or Java High
Level REST Client via action listener or completable future's `supplyAsync`. We
saw different ways to control the timeout for the completable future. And how to
go further by reading the official documentation of Elasticsearch.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
