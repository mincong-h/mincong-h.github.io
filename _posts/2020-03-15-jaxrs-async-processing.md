---
layout:            post
title:             "Asynchronous Processing in JAX-RS 2.x"
lang:                en
date:              2020-03-15 16:32:31 +0100
categories:        [java-rest, java-concurrency]
tags:              [java, jax-rs, jersey, concurrency]
comments:          true
excerpt:           >
    Quick introduction of asynchrnous processing in JAX-RS 2.x
    on both server-side and client-side.
image:             /assets/bg-coffee-983955_1280.jpg
cover:             /assets/bg-coffee-983955_1280.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In this article, I want to share with you how to use asynchronous processing in
JAX-RS 2.x on both server-side and client-side. Asynchronous processing is a
technique that enables a better and more efficient use of processing threads.
On the client-side, a thread may be used for updating UI, it that thread is
blocked waiting for a response, it may degrade the user experience. On the
sever-side, a thread that is processing a request should avoid blocking while waiting
for an external event to complete so that other requests arriving to the server can
be processed.

After reading this article, you will understand:

- How to process asynchronously on the server-side via `AsyncResponse`
- How to process asynchronously on the server-side via `CompletableStage`
- Compatibility with other JAX-RS annotations
- How to process asynchronously on the client-side via `Invocation#async`
- How to go further on this topic

## Server API: AsyncResponse

The first choice of doing asynchronous processing in JAX-RS is to use
`AsyncResponse` combined with annotation `@Suspended`. In this way, we inform
the JAX-RS implementation that the response is not available upon return but
will be produced in the future. This is done by first _suspending_ the response
and only _resuming_ it once the asynchronous processing is done.

```java
@Path("async")
public class MyAsyncResource {

  @GET
  @Path("longRunning1")
  public void longRunning1(@Suspended AsyncResponse response) {
    executor.submit(() -> {
        Thread.sleep(100);
        response.resume("Welcome to async world!");
        return null;
    });
  }

  ...
}
```

In the code snippet above, instead of producing a response immediately, it
forks a (non-request) thread to execute a long-running operation and returns it
immediately. The connection is only resumed when `AsyncResponse#resume` is
called.

## Server API: CompletableStage

The second choice of doing asynchronous processing in JAX-RS is to return an
instance of `CompletableStage`, a new Java interface introduced in Java 8.
Returning a completable stage indicates to JAX-RS implementation that the
asynchronous processing is enabled.

```java
@Path("async")
public class MyAsyncResource {

  @GET
  @Path("longRunning2")
  public CompletionStage<String> longRunning2() {
    CompletableFuture<String> future = new CompletableFuture<>();
    executor.submit(() -> {
        Thread.sleep(100);
        future.complete("Welcome to async world, again!");
        return null;
    });
    return future;
  }

  ...
}
```

In the code snippet above, instead of producing a response immediately, it forks
a (non-request) thread to execute a long-running operation and returns it
immediately. The connection is only resumed when the future is completed, i.e.
when the method `CompletableFuture#complete` is called.

## Compatibility With Other Annotations

Asynchronous processing is compatible with JAX-RS annotations. When using
`@Suspended`, you can still use other JAX-RS annotations, such as `@PathParam`,
`@QueryParam`:

```java
@Path("async")
public class MyAsyncResource {

  @GET
  @Path("longRunning3/{id}")
  public void longRunning3(
      @PathParam("id") String id,
      @QueryParam("key") String value,
      @Suspended AsyncResponse response) {
    ...
  }
}
```

## Client API

Now, let's take a look on the client-side. The fluent API supports asynchronous
invocations as part of the invocation building process. Method `async` can be
used to set the invocation asynchronous:

```java
WebTarget target = ClientBuilder.newClient().target(uri);
Future<String> future = target
    .path("async/longRunning1")
    .request()
    .async()
    .get(
        new InvocationCallback<String>() {
          @Override
          public void completed(String s) {
            // do something
          }

          @Override
          public void failed(Throwable throwable) {
            // process error
          }
        });
```

## Going Further

How to go further from here?

- Read the [JAX-RS 2.1 specification (JSR 370)](https://jcp.org/en/jsr/detail?id=370), Chapter 8 - "Asynchronous Processing" to
  understand more about this topic. Not only it explains the concepts above, but
  also timeouts, callbacks, EJB, etc.
- Read [DZone: JAX-RS 2.0 Asynchronous Server and
  Client](https://dzone.com/articles/jax-rs-20-asynchronous-server-and-client)
  to understand more about this topic
- Read [Stack Overflow: Asynchronous vs synchronous execution, what does it
  really mean?](https://stackoverflow.com/questions/748175/) to understand their
  difference and how to distinguish with multi-threading.
- Read [Baeldung: Guide To
  CompletableFuture](https://www.baeldung.com/java-completablefuture) to learn
  more about this new API added in Java 8.
- Visit my GitHub project:
  [mincong-h/jaxrs-2.x-demo](https://github.com/mincong-h/jaxrs-2.x-demo/tree/blog-2020-async-processing/async)
  to see the complete code examples.

## Conclusion

In this article, we see how to use asynchronous processing in JAX-RS 2.x to
enable a better and more efficient use of processing threads. On the
server-side, we talked about `@Suspeded AsyncResponse` and `CompletableStage`;
on the client-side, we talked about `Invocation#async` in the fluent API.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Pavel Bucek and Santiago Pericas-Geertsen, "JAX-RS: Java<sup>TM</sup> API for
  RESTful Web Services (version 2.1)", _Java Community Process (JCP)_, 2017. <https://jcp.org/en/jsr/detail?id=370>
