---
layout:            post
title:             "3 Ways to Handle Exception In Completable Future"
date:              2020-05-30 07:14:44 +0200
last_modified_at:  2020-05-31 18:57:21 +0200
categories:        [java-concurrency]
tags:              [java, concurrency]
comments:          true
excerpt:           >
    How to handle exception in CompletableFuture? This
    article explains the difference between handle(), whenComplete(), and
    exceptionally().
cover:             /assets/bg-willian-justen-de-vasconcellos-3fX0FvA-2us-unsplash.jpg
ads:               none
---

## Overview

Exception handling is important when writing code with `CompletableFuture`.
`CompletableFuture` provides three
methods to handle them: `handle()`, `whenComplete()`, and `exceptionally()`.
They look quite similar and it's easy to get lost when you are not familiar
with the API. This article discusses their difference and helps you
understand which is the best choice for you depending on the situation. I'm
going to explain the three APIs first, then compare their usage, and finally
provide some scenarios where each API fits best. This article is written in
Java 11, but most of the concepts should be available in Java 8.
Let's get started.

If you don't have time to read the entire article, here is a short summary the
most important conclusion:

Item                                  | handle() | whenComplete() | exceptionally()
------------------------------------- | :------: | :------------: | :-------------:
Access to success?                    | Yes      | Yes            | No
Access to failure?                    | Yes      | Yes            | Yes
Can recover from failure?             | Yes      | No             | Yes
Can transform result from `T` to `U`? | Yes      | No             | No
Trigger when success?                 | Yes      | Yes            | No
Trigger when failure?                 | Yes      | Yes            | Yes
Has an async version?                 | Yes      | Yes            | Yes (Java 12)

## handle

```java
public <U> CompletableFuture<U> handle(
    BiFunction<? super T, Throwable, ? extends U> fn) {
  ...
}
```

In method `handle()`, you have access to the result and exception of the
current completable future as arguments: you can transform the current result
another result or recover the exception.

For example, given a failed future with exception "Oops" which normally returns
a string, we can use `handle()` to handle the result and exception,
by either recovering from exception or returning the normal result `msg`
directly:

```java
CompletableFuture<String> cf0 =
    CompletableFuture.failedFuture(new RuntimeException("Oops"));

CompletableFuture<String> cf1 =
    cf0.handle((msg, ex) -> {
      if (ex != null) {
        return "Recovered from \"" + ex.getMessage() + "\"";
      } else {
        return msg;
      }
    });
```

This completable future `cf1` will contain the following result:

    Recovered from "Oops"

## whenComplete

```java
public CompletableFuture<T> whenComplete(
    BiConsumer<? super T, ? super Throwable> action) {
  ...
}
```

In method `whenComplete()`, you have access to the result and exception of the
current completable future as arguments: you can consume them and perform your
desired action. However, you cannot transform the current result or exception
to another result. You cannot return a value like in `handle()`. This method
is not designed to translate completion outcomes.

For example, given a failed future with exception "Oops" which normally returns
a string, we can use `whenComplete()` to record the result or exception of the
current completable future: 

```java
CompletableFuture<String> cf0 =
    CompletableFuture.failedFuture(new RuntimeException("Oops"));

CompletableFuture<String> cf1 =
    cf0.whenComplete((msg, ex) -> {
      if (ex != null) {
        System.out.println("Exception occurred");
      } else {
        System.out.println(msg);
      }
      /*
       * Cannot return value because method whenComplete
       * is not designed to translate completion outcomes.
       * It uses bi-consumer as input parameter:
       * BiConsumer<? super T, ? super Throwable> action
       */
    });

try {
  cf1.join();
} catch (CompletionException e) {
  System.out.println("Error: " + e.getMessage());
}
```

The program above will print the following messages in the console:

```
Exception occurred
Error: java.lang.RuntimeException: Oops
```

From the exception above, we can see that after calling `whenComplete`, the
failure of `cf0` was not recovered. `whenComplete` performed an action based on
result and exception, but it did not translate the completion outcomes.
Therefore, when calling `join()` later, the exception "Oops" is thrown,
encapsulated as a `CompletionException`.

## exceptionally

```java
public CompletableFuture<T> exceptionally(
    Function<Throwable, ? extends T> fn) {
  ...
}
```

In method `exceptionally()`, you only have access to the exception and not the
result. Because as the method name indicates, the method only handles
exceptional cases: when an exception happened. If the completable future was
completed successfully, then the logic inside "exceptionally" will be skipped.

For example, given a failed future with exception "Oops" which normally returns
a string, we can use `exceptionally` to recover from failure.

```java
CompletableFuture<String> cf0 =
    CompletableFuture.failedFuture(new RuntimeException("Oops"));

CompletableFuture<String> cf1 =
    cf0.exceptionally(ex -> "Recovered from \"" + ex.getMessage() + "\"");
```

The completable future `cf1` will contain the following result:

```
Recovered from "Oops"
```

Now, let's see another example where the execution is skipped. Given a
successful future which returns "OK". When adding another stage to handle the
exception, then the logic won't be executed. Completable future `cf1` will
simply return the same value as `cf0`.

```java
CompletableFuture<String> cf0 =
    CompletableFuture.completedFuture("OK");

CompletableFuture<String> cf1 =
    cf0.exceptionally(ex -> {
      /*
       * This is not called because `exceptionally` is only called
       * when an exception happened. It is not the case here.
       */
      System.out.println("Handling exception");
      return "Recovered from \"" + ex.getMessage() + "\"";
    });
```

## Comparison

If we summarize the behaviors of different APIs mentioned, we can conclude with
the following table:

Item                                  | handle() | whenComplete() | exceptionally()
------------------------------------- | :------: | :------------: | :-------------:
Access to success?                    | Yes      | Yes            | No
Access to failure?                    | Yes      | Yes            | Yes
Can recover from failure?             | Yes      | No             | Yes
Can transform result from `T` to `U`? | Yes      | No             | No
Trigger when success?                 | Yes      | Yes            | No
Trigger when failure?                 | Yes      | Yes            | Yes
Has an async version?                 | Yes      | Yes            | Yes (Java 12)

Method `handle()` and `whenComplete` have access to completable future's
success result (`T`) and failure (`Throwable`) as input arguments.
On the other hand, method `exceptionally()` only has access to
failure as an input argument. Method `handle()` and `exceptionally()` can recover
from failure by return a value `T`. However, `whenComplete()` only consumes the
arguments without changing the result of the completable future. More precisely,
`handle()` can either return the value of type `T` or another value of type `U`
as a transformation, but `exceptionally()` can only return the same type `T`.

In case of success, the logic inside `exceptionally()` will be skipped, only
the logic of `handle()` and `whenComplete()` will be executed. However, in case of
failure, the logic of these three methods will be triggered. All the APIs
mentioned above have an asynchronous version with suffix _"Async"_ in the method
name: `handleAsync`, `whenCompleteAsync`, and `exceptionallyAsync`. But
`exceptionallyAsyc` is only available since Java 12.

## Use-Cases

After all the explanation above, you may still feel a bit confused about these APIs.
To make it clear, here are some use-cases that I imagine and the preferred API
to use. Obviously, there are no standard answers, but I hope that they can bring
you some inspirations for your use-cases.

### Logging

Question: _"I want to ensure the result of my completable future to be logged
because this is an important stage. But I don't want to modify the result
regardless of the situation."_

Answer: In this case, the preferred API is `whenComplete`, because it consumes the
success and failure as a callback action without translating the outcomes.

```java
cf.whenComplete((result, ex) -> {
  if (ex != null) {
    logger.error("Execution failed", ex);
  } else {
    logger.info("Execution completed: {}", result);
  }
});
```

### Exception-Only

Question: _"I want to focus exclusively on exception handling and I don't care
about the normal result when the execution is successful."_

Answer: In this case, the preferred API is `exceptionally` because it takes only
the exception as input. Since normal result (success) is not important,
ignoring it brings additional benefit: it simplifies the input arguments, and
the if-statement for exception null-check can be avoided.

### Exception-Only Without Recovery

Question: _"I want to focus exclusively on exception handling as above. However,
I don't want to recover from failure. By the way, I need to chain the current
completable future with another stage by applying a funtion."_

Answer: In thise case, you can create two dependents on the completable future.
One dependent handles the exception using `exceptionally()` and the other dependent applies the function.
Therefore, the recovery of the first dependent will not affect the second
dependent, since they are two separated downstreams.

```java
var cf = asyncCode();

// dependent 1
cf.exceptionally(ex -> {
  logger.error("Something failed", ex);
  return null;
});
// dependent 2
cf.thenApply(user -> "Hi, " + user);
```

Do not chain both dependents together because `exceptionally()` will recover
from failure and return a _null_ in the case above. This is probably not want
you want in `thenApply`. I found this use-case on DZone: [Asynchronous Timeouts with
CompletableFuture](https://dzone.com/articles/asynchronous-timeouts), written by
Tomasz Nurkiewicz.

### Transformation

Question: _"Both normal result and exception are important for me and I need to
transform the result type to the downstream."_

Answer: In this case, the preferred API is `handle` becaues it takes care both
normal result and exception. Also, it has the possibility to transform a result
type `T` to another result type `U` because of its bi-function input
`BiFunction<? super T, Throwable, ? extends U> fn`:

```java
// CompletableFuture<User> to CompletableFuture<Response>
cf.handle((user, ex) -> {
  if (ex != null) {
    return Response.failure("Unknown user");
  } else {
    return Response.success(user);
  }
}
```

### JAX-RS Async Processing

Question: _"I'm using JAX-RS 2.1 with asynchronous processing (JSR-370 Chapter
8) where the HTTP response is suspended waiting for the completion of the
current completable future. I want to resume the HTTP response as soon as it is
done."_

Answer: In this case, the preferred API is `whenComplete`, because you need to
access to both normal result and exception. Also, the intention is not to modify
the result, but to perform a downstream action based on the completion, i.e.
resume the HTTP response.

```java
cf.whenComplete((result, ex) -> {
  if (ex != null) {
    asyncResponse.resume(ex);
  } else {
    asyncResponse.resume(result);
  }
}
```

## Going Further

How to go further from here?

- All the methods mentioned in this article have an asynchronous version with
  suffix _"Async"_ in the method name: `handleAsync` (Java 8+),
  `whenCompleteAsync` (Java 8+), `exceptionallyAsync` (Java 12+). Read Javadoc
  in Java 14 for more detail:<br>
  <https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/concurrent/CompletableFuture.html>
- To understand these APIs from another angle, read "Java CompletableFuture -
  Exception Handling" written by Logic Big.<br>
  <https://www.logicbig.com/tutorials/core-java-tutorial/java-multi-threading/completion-stages-exception-handling.html>

You can also visit the source code of this article on [GitHub](https://github.com/mincong-h/java-examples/blob/blog/cf-exception-handling/concurrency/src/main/java/io/mincong/concurrency/completablefuture/ExceptionHandlingDemo.java).

## Conclusion

In this article, we saw three APIs for exception handling in completable future:
`handle()`, `whenComplete()`, and `exceptionally()`. We compared their
difference in terms of input arguments, recovery, transformation, triggering,
and asynchronous support. We discussed some potential use-cases as Q&A and ended
up by a list of additional resources for further lectures.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
