---
layout:            post
title:             Why Do We Need Completable Future?
date:              2020-06-26 21:33:12 +0200
categories:        [java-concurrency]
tags:              [java, concurrency]
comments:          true
excerpt:           >
    Why do we need CompletableFuture? What is its strength compared to
    synchronous code and classic future in Java? How to remember its APIs?
image:             /assets/bg-park-troopers-RAtKWVlfdf4-unsplash.jpg
ads:               none
---

## Introduction

`CompletableFuture` is a powerful class for concurrent programming available
since Java 8. I didn't know `CompletableFuture` a few months ago. When I started
using it, it was very confusing to me why people use it. Now after practicing it
every day for several months, I believe it's a good time to share my understanding
with you.

In this article, I'm going to explain what is completable future in
Java, what is the motivation to use it, the basic syntax, and simple use-cases.
Finally, how to go further from here. This article is written in Java 11, but most of the syntax should be available
in Java 8 as well. Now, let's get started!

## Basic Syntax

`CompletableFuture` is a `Future` that may be explicitly completed (setting its
value and status) and may be used as a `CompletionStage`, supporting dependent
functions and actions that trigger upon its completion. It's equivalent to
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
in Javascript. A very basic example of completable future can be expressed as
follows, where we perform step 1, then step 2, finally step 3, asynchronously
and in order:

```java
CompletableFuture
    .runAsync(this::doStep1)
    .thenRun(this::doStep2)
    .thenRun(this::doStep3)
    .join();
```

Completable future allows you to do much more than this. But before going
further, I'd like to discuss the motivation of using it first. It will
allow us to better understand the challenges we face and the limit of the actual
solutions without completable futures.

## Motivation

There are several challenges in Java applications, especially for back-end
development:

- We want to complete tasks as fast as possible.
- We want an easy way to handle the callback.
- We need to reduce blocking operations and their impact.
- We need to switch thread pools.
- We need a simple way to chain actions together, where downstream action will
  be triggered when upstream action is completed. 
- We want to increase the throughput of the server.

Let's take a look at some of the items in detail.

### Multi-Tasks

Completing tasks as fast as possible. The easiest way to write code is to write
it synchronously: we execute some logic and then execute some other.
Our implementation will be done in one thread. You can consider these logics as
stages: we cannot execute the next stage if the previous stage is still in
progress. But sometimes, stages can be done in parallel because they don't have
dependency between them. This is why we need concurrent programming in Java,
something better than synchronous logic. Traditionally, we can use `Runnable`
or `Callable` to encapsulate tasks and submit them into a thread pool, then wait
for the completion via `Future` API. Now, you can achieve the same goal using
`CompletableFuture`.

### Callback

While the `Future` can satisfy the concurrent execution as
mentioned above, it does not provide a good way to handle the callback. When a task
is completed, there is no easy solution to continue on further actions at the
`Future` level. You can handle the logic in your initial thread but it becomes
harder face to multiple futures, for example:

```java
var futures = executor.invokeAll(tasks);
for (var f : futures) {
  var result = f.get();
  // perform callback
}
```

This can be done easier with `CompletableFuture`. Completable future allows you
to handle the callback at a completable-future-level, so you can have more
control over each future. For example, you can use `thenAccept` to consume the
result returned by a completable future `cf`:

```java
cf.thenAccept(results::add);
```

But you can do much more than that. You can build dependency between actions
(stages), you can handle exceptions, isolate the action using another executor, ...
There are many other methods to support callbacks in a completable future. We will
discuss this a bit later in this article.

### Non-Blocking

We need to avoid blocking a thread whenever possible. When performing a
`Future#get(...)` or `Thread#join()`, the current thread is blocked waiting for the
target future or target thread to complete. During this time, the current thread
is doing nothing. This is a waste and can become an issue when too many threads are blocked in
the thread pool, it prevents other tasks to be executed and leads the thread
starvation.

```java
// bad: it blocks the current thread
Thread.sleep(100);
```

```java
// bad: it blocks the current thread
future.get();
```

`ComletableFuture` reduces blocking operations because you don't have to wait for
the completion explicitly at each stage. Its non-blocking design allows you to split tasks into
multiple stages so that each stage will be triggered automatically when upstream
is done. Also, it allows you
to provide optionally your executor (thread pool) to handle the stage.
Therefore, you can isolate long-running tasks into a blocking thread pool and reduce
the impact on other tasks.

```java
var cf = CompletableFuture.supplyAsync(this::getSthSlow, executor);
```

Note: I'm not saying that we don't block the thread anymore. With
`CompletableFuture`, we still need to block the thread when waiting for the
result, but we don't need to do that for all the stages. We just need to do that
only once for the entire `CompletableFuture`.

```java
CompletableFuture
    .runAsync(this::doStep1)
    .thenRun(this::doStep2)
    .thenRun(this::doStep3)
    // blocks the current thread only once
    // instead of doing it three times
    .join();
```

## Methods

Now we understand the benefit of using `CompletableFuture`, let's see how to
categorize its methods and ensure that you remember them efficiently. I believe
we can split the class into two parts: the future and completion stage:

```java
class CompletableFuture<T> implements Future<T>, CompletionStage<T> {...}
```

### Methods From Future

`CompletableFuture` is a `Future`. It overrides methods of future, meaning that
you can wait for the result of the future, with or without a timeout. You can request
the status of the future (whether it's done), etc.

Method | Description
:--- | :---
`get()` | Waits if necessary for this future to complete, and then returns its result.
`get(long timeout, TimeUnit unit)` | Waits if necessary for at most the given time for this future to complete, and then returns its result, if available.
`isDone()` | Returns true if completed in any fashion: normally, exceptionally, or via cancellation.
... | ...

### Methods From CompletionStage

`CompletableFuture` is a `CompletionStage`. You can use all the methods defined
by the completion stage:

- methods to transform the result
- methods to consume the result
- methods to run another logic
- methods to recover from failure
- methods to interact with another completion stage

There are other variant methods than the methods listed above. But once you
understand the main idea, it's easy to remember those. Following the categories
above, we can list the methods as the following table. This table consists of 3
columns: the name of the methods, the changes made by the input parameter
(lambda expression), and the associated description.

Method | Changes | Description
:--- | :---: | :---
`thenApply()` | `T -> U` | Returns a new CS which transforms the result `T` to another result `U`. 
`thenAccept()` | `T -> _` | Returns a new CS which consumes the result `T`.
`thenCompose()` | `T -> CS[U]` | Returns a new CS which flat-maps the result of another CS `CS[U]` tranformed from `T`.
`thenRun()` | `_ -> _` | Returns a new CS which execution the given action.
`handle()` | `(T, E) -> U` | Returns a new CS which handles both the normal result `T` or exception `E` of the previous stage, and return it as another result `U`.
`whenComplete()` | `(T, E) -> T` | Returns a new CS with the same result or exception of the previous stage, but it excutes the given callback action.
`exceptionally()` | `E -> T` | Returns a new CS which recovers the exception to a normal result `T` if the previous stage completes exceptionally.
`thenCombine()` | `(T, U) -> V` | Returns a new CS which combines the result of the previous stage `T` and the result of another stage `U` together and transform it into another result `V`.
`applyToEither()` | `(T, U) -> V` | Returns a new CS which takes either the result of the previous stage `T` or the result of another stage `U` and transforms them into a new result `V`.
`acceptEither()` | `(T, U) -> _` | Returns a new CS which accepts either the result of the previous stage `T` or the reuslt of another stage `U` and execute an action.
`thenAcceptBoth()` | `(T, U) -> _` | Returns a new CS which consumes the result of the previous stage `T` and the result of another stage `U` together.
`runAfterBoth` | `(_, _) -> _` | Returns a new CS which executes an action when both the previous stage is completed and another stage are completed.
`runAfterEither` | `(_, _) -> _` | Returns a new CS which executes an action when either the previous stage is completed or another stage is completed.
`xxxAsync()` | - | The asynchronous version of method `xxx`, where you can provide your executor to execute the stage asynchronously.

CS means `CompletionStage`.

## Usecases

You can use `CompletableFuture` directly to build your Java application. Or maybe
most of the cases, you will use it indirectly with reactive Java framework, such
as interacting with databases via [hibernate-reactive](https://github.com/hibernate/hibernate-reactive), writing resilient code with [resilience4j](https://github.com/resilience4j/resilience4j), providing RESTful APIs with JAX-RS 2.x asynchronous processing, building a scalable backend system with [Akka](https://akka.io) system, etc.

## Going Further

How to go further from here?

- To continue exploring "Completable Future", read Marius Herring's article "Java 8: Writing asynchronous code with CompletableFuture"<br>
  <https://www.deadcoderising.com/java8-writing-asynchronous-code-with-completablefuture/>
- To continue exploring "Completable Future", read Baeldung's article "Guide To CompletableFuture"<br>
  <https://www.baeldung.com/java-completablefuture>
- To better understand how to handle exceptions in CompletableFuture, read my article: "3 Ways to Handle Exception In Completable Future"<br>
  <https://mincong.io/2020/05/30/exception-handling-in-completable-future/>

## Conclusion

In this article, we explored a powerful concurrent class `CompletableFuture`,
available since Java 8. We saw its basic syntax for chaining actions, the
motivation of using it including the concurrent processing, callback handling,
non-blocking design. We list saw some tricks for remembering the methods
provided by `CompletableFuture`, by categorizing them into `Future` and
`CompletionStage`. Afterward, we discussed some use-cases you may use
`CompletableFuture` and how to go further from this article.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- MDN, "Promise - JavaScript", _MDN_, 2020.<br>
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise>
- Hibernate, "Hibernate Reactive", _GitHub_, 2020.<br>
  <https://github.com/hibernate/hibernate-reactive>
- Resilient4J, "Resilient4J", _GitHub_, 2020.<br>
  <https://github.com/resilience4j/resilience4j>
