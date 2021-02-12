---
layout:            post
title:             How CompletableFuture is tested in OpenJDK?
date:              2020-05-10 17:04:39 +0200
categories:        [java-concurrency, java-testing]
tags:              [java, concurrency]
comments:          true
excerpt:           >
    How CompletableFuture is tested in OpenJDK 14? What can we learn from it?
cover:             /assets/bg-mike-kenneally-tNALoIZhqVM-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

This article tries to answer one question:

_How `CompletableFuture` is tested in OpenJDK?_

In my daily job, I need to use `CompletableFuture` to write non-blocking code in
Java. While there are tutorials on the internet about the introduction of
completable future, I rarely saw any post about testing. So I spent some time
this weekend to read the source code of OpenJDK and try to answer the question
above.

The goal of this article is not to become an OpenJDK contributor or cover all
the important topics. (I'm clearly not qualified to write this.) The goal is to
learn some basic techniques about concurrency testing.
In the following sections, I am going to explain the file-structure and the
set-up. Then I will pick one example, `thenCompose`, to see how a typical
test-case works. Afterward, I will explain the usage of atomic classes and
count-down-latch. In the end, I will finish by recommending some resources for going
further on this topic.

This article uses the source code of OpenJDK 14
([jdk-14-ga](https://github.com/openjdk/jdk/tree/jdk-14-ga)) as support.

## Files

```
jdk ((jdk-14-ga)) $ fd --full-path --type file CompletableFuture test | xargs wc -l
     885 test/jdk/java/util/concurrent/CompletableFuture/Basic.java
      68 test/jdk/java/util/concurrent/CompletableFuture/ThenComposeAsyncTest.java
     122 test/jdk/java/util/concurrent/CompletableFuture/ThenComposeExceptionTest.java
    5132 test/jdk/java/util/concurrent/tck/CompletableFutureTest.java
    6207 total
```

From the command above, you can see that
several files are used for testing the `java.util.concurrent.CompletableFuture`
and they represent 6207 lines of code in total. What a heavy test suite!
Developers put a lot of effort to keep this bug-free for us... Thanks!

File | Description
:--- | :---
`Basic` | 885 lines. A basic test-suite for `CompletableFuture`
`ThenComposeAsyncTest` | 68 lines. It tests that `CompletableFuture.thenCompose` works correctly if the composing tasks is complete before composition.
`ThenComposeExceptionTest` | 122 lines. It tests that `CompletableFuture.thenCompose` works correctly if composing future completes exceptionally.
`CompletableFutureTest` | 5132 lines. A Technology Compatibility Kit (TCK) for `CompletableFuture`. It is a suite of tests that at least nominally checks a particular alleged implementation of a Java Specification Request (JSR) for  compliance.

## Set-Up

Normally, a test suite always contains a set-up phase, such as `@BeforeEach` in
JUnit 5. So I am curious to know what is done for `CompletableFuture`. When
reading the code, I don't see the common set up before each test. I think it's
because `CompletableFuture` can be created easily using either the constructor
or its factor methods. So there is no need to have any specific set up. However, to reuse
the same testing logic for several scenarios, there are one or more for-loops before some
tests, which are served as parameters of the test case. Here is an example from
`testThenCompose_normalCompletion`:

```java
// File: CompletableFutureTest.java L3055-L3069

public void testThenCompose_normalCompletion() {
    for (ExecutionMode m : ExecutionMode.values())
    for (boolean createIncomplete : new boolean[] { true, false })
    for (Integer v1 : new Integer[] { 1, null })
{
    ...
}}
```

As you can see, there are 3 input parameters for the tests: the execution mode
(`m`); whether we should create an incomplete completable future or not
(`createIncomplete`); and an input integer value (`v1`). Execution modes include
synchronous mode (`SYNC`), asynchronous mode (`ASYNC`), and executor mode
(`EXECUTOR`).

## Method thenCompose

Now we saw the basic structure, it's time to dig deeper and explore more detail
about testing. Here we continue on the same example to see how `thenCompose`
API is tested for its normal completion.

```java
/**
 * thenCompose result completes normally after normal completion of source
 */
public void testThenCompose_normalCompletion() {
    for (ExecutionMode m : ExecutionMode.values())
    for (boolean createIncomplete : new boolean[] { true, false })
    for (Integer v1 : new Integer[] { 1, null })
{
    final CompletableFuture<Integer> f = new CompletableFuture<>();  // 1
    final CompletableFutureInc r = new CompletableFutureInc(m);
    if (!createIncomplete) assertTrue(f.complete(v1));  // 2
    final CompletableFuture<Integer> g = m.thenCompose(f, r);  // 3
    if (createIncomplete) assertTrue(f.complete(v1));  // 4

    checkCompletedNormally(g, inc(v1));  // 5
    checkCompletedNormally(f, v1);
    r.assertValue(v1);
}}
```

We already saw the for-loops in previous section. Now, let me split the body
into 5 steps and explain them one by one.

### Step 1 Prepare

```java
final CompletableFuture<Integer> f = new CompletableFuture<>();  // 1
final CompletableFutureInc r = new CompletableFutureInc(m);
```

Firstly two objects are created for composition:

- A completable future `f` which returns a nullable integer
- An action `r` which is served as composition input and to
  capture the invocations.

More detail about the checked integer action `CompletableFutureInc`:

```java
// File: CompletableFutureTest.java L574-L583

static class CompletableFutureInc extends CheckedIntegerAction
    implements Function<Integer, CompletableFuture<Integer>>
{
    CompletableFutureInc(ExecutionMode m) { super(m); }
    public CompletableFuture<Integer> apply(Integer x) {
        invoked();
        value = x;
        return CompletableFuture.completedFuture(inc(x));
    }
}
```

### Step 2 Create Incomplete Before Composition

```java
if (!createIncomplete) assertTrue(f.complete(v1));  // 2
```

Depending on scenarios, we need the future `f` to be completed either before or
after the composition. If completed state is needed before composition, then `f.complete(v1)` is
called. To verify the completion is indeed triggered by `f.complete(v1)`, we
assert the result to be true. "Returning true" means this invocation caused the
completable future to transition to a completed state.

### Step 3 Call thenCompose

```java
final CompletableFuture<Integer> g = m.thenCompose(f, r);  // 3
```

Then the composition happens. During composition, class `CompletableFutureInc`
executes the logic of method `apply()`. More precisely, it marks the action as
"invoked" and saves the number of invocations; it saves the input value, passed
from completable future `f`; and finally, complete itself using the incremented
value `v + 1` or null if the input is null.

### Step 4 Create Incomplete After Composition

```java
if (createIncomplete) assertTrue(f.complete(v1));  // 4
```

Depending on scenarios, we need the future `f` to be completed either before or
after the composition. If completed state is needed after composition, the
`f.complete(v1)` is called. To verify the completion is indeed triggered by
`f.complete(v1)`, we assert the result to be true.

### Step 5 Assertions

```java
checkCompletedNormally(g, inc(v1));  // 5
checkCompletedNormally(f, v1);
r.assertValue(v1);
```

Finally, we assert the result of completable futures `f`, `g` and the action `v1`
to ensure the expected behaviors, e.g. future-isolation, number of invocations.

1. Ensure the future `g` is completed normally and its value is `v1 + 1` or null.
   The value is defined by action `r` when it completed its future
2. Ensure the future `f` is completed normally and its value is `v1` or
   null. The value is not `v2` because completable futures `f` and `g` are
   isolated. They represent two different completion stage, where `f` represents
   the 1st stage and `g` represents the 2nd stage. This is true regardless the
   moment of completion `f` (before or after composition) because the isolation is
   guaranteed by the method `thenCompose`
3. The last assertion is on the value of action `r`. Its value is always `v1`, passed by the method `thenCompose`. This is true
   regardless of the moment of completion `f` (before or after composition).

As you can see, the information is very intense inside the test, it's definitely
not easy to understand... we only talked about 14 lines of code, while there are
5000+ lines. In the following sections, I want to continue on two types of utility
classes: atomic classes and latch, to see how OpenJDK uses them for testing and
if we can get some inspiration from it.

## Atomic Classes

How to use atomic classes, e.g. `AtomicInteger` or `AtomicReference`? And why?

Atomic classes appear quite often in the tests. So I wonder how to use them and
why they are a good choice. Here is an example, testing the failed stage creation.

```java
// File: CompletableFutureTest.java L3879-L3891

/**
 * failedStage returns a CompletionStage completed
 * exceptionally with the given Exception
 */
public void testFailedStage() {
    CFException ex = new CFException();
    CompletionStage<Integer> f = CompletableFuture.failedStage(ex);
    AtomicInteger x = new AtomicInteger(0);
    AtomicReference<Throwable> r = new AtomicReference<>();
    f.whenComplete((v, e) -> {if (e != null) r.set(e); else x.set(v);});
    assertEquals(x.get(), 0);
    assertEquals(r.get(), ex);
}
```

Atomic classes, such as `AtomicInteger` and `AtomicReference` can be used to
capture the information obtained inside a completion stage. For example, in the
test `testFailedStage`, atomic reference `r` captures the throwable, passed as
the stage input `e` and atomic integer `x` captures the eventual stage input
`v`. Then, these values are used for assertions. This is practical
because these atomic values can be initialized outside of the completion stage and set the
value inside the stage with atomicity.

## CountDownLatch

Another powerful utility class is `CountDownLatch`. It is used only once in
`ThenComposeAsyncTest`:

```java
// File: ThenComposeAsyncTest.java L41-L67

public void testThenComposeAsync() throws Exception {
    CompletableFuture<String> cf1 =
        CompletableFuture.completedFuture("one");

    CountDownLatch cdl = new CountDownLatch(1);
    CompletableFuture<String> cf2 = cf1.thenCompose(str ->
        CompletableFuture.supplyAsync(() -> {
        while (true) {
            try {
                cdl.await();
                break;
            }
            catch (InterruptedException e) {
            }
        }
        return str + ", two";
    }));

    cdl.countDown();

    String val = cf2.get();
    Assert.assertNotNull(val);
    Assert.assertEquals(val, "one, two");
}
```

Before talking about `CountDownLatch`, let's first understand what is being
tested here. Here we test the `thenCompose` usage combined with `supplyAsync`.
Factory method `supplyAsync` creates an instance asynchronously. This is useful when the creation is slow and we don't
want to block the current thread. The logic is executed in another thread, in the default
asynchronous pool (`ASYNC_POOL`) of `CompletableFuture`.

To test "thenCompose + async", the main thread needs to wait the completion of
stage 2 "thenCompose" before asserting the result. But how to wait efficiently?
Via `CountDownLatch`.

```java
CompletableFuture.supplyAsync(() -> {
    while (true) {
        try {
            cdl.await();
            break;
        }
        catch (InterruptedException e) {
        }
    }
    return str + ", two";
})
```

Inside the thread of asynchronous pool, an endless while-loop is created and it
won't even exit when an interruption request is sent. It keeps waiting until the
latch `cdl` has counted down to zero (in main thread).

```java
cdl.countDown();

String val = cf2.get();
Assert.assertNotNull(val);
Assert.assertEquals(val, "one, two");
```

On the other side, the main thread controls the latch by performing the
count-down operation. And it does not wait -- the future result is returned and
asserted immediately after the operation. Compared to `CompletableFuture.join()`,
using `get()` ensures the returned `CompletableFuture` completes after call to
`thenCompose`. It guarantees that any premature internal completion will be
detected ([JDK-8029164](https://bugs.openjdk.java.net/browse/JDK-8029164),
[commit](https://github.com/openjdk/jdk/commit/8fb00644a929b3469d676768be814725d9f7485f)).

## Going Further

How to go further from here?

- If you were new to CompletableFuture, read Baeldung's article: Guide To CompletableFuture<br>
  <https://www.baeldung.com/java-completablefuture>
- To find the source code, visit the Open JDK source code on GitHub<br>
  <https://github.com/openjdk/jdk>
- To understand the motivation of using async methods, read the article
  "CompletableFutures - why to using async methods?" written by Lukáš Křečan.<br>
  <https://blog.krecan.net/2013/12/25/completablefutures-why-to-use-async-methods/>

## Conclusion

In this article, we explored `CompletableFuture` testing via some source code of
OpenJDK: we saw the 4 concerned files and their purposes; we
visited one test case as an example by going through the future-creation, the
condition set-up, the composition, and assertions; we continued on atomic
classes for capturing the nominal value and exception; we also saw the
count-down-latch pattern for testing async method composition; and finally, we
ended up with some useful resources for going further in this topic. Thank you
for reading this article.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Wikipedia, "Technology Compatibility Kit", _Wikipedia_, 2020.
  <https://en.wikipedia.org/wiki/Technology_Compatibility_Kit>
