---
layout:            post
title:             "ExecutorService.invokeAll()"
lang:                en
date:              2019-01-29 20:22:31 +0100
categories:        [java-concurrency]
tags:              [java, concurrency]
comments:          true
excerpt:           >
    Using 100% CPU effortlessly in Java: submit all your tasks to thread
    pool and wait for completion.
image:             /assets/bg-powerboat-2784250_1280.jpg
cover:             /assets/bg-powerboat-2784250_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Recently, I used thread pool to do intensive computation. I've 11G of raw data
stored as files and I need to extract information from it as fast as possible.
As you can imagine, using Java concurrency correctly become important in use
case. This article explains how I use `ExecutorService#invokeAll()` method to
use 100% CPU effortlessly.

Note that this article only covers the case where all tasks are defined before
getting started and no new task is added during the execution. Java 8 is used.

## Create Thread Pool

Before the computation, create a thread pool that reuses a fixed number of
threads operating off a shared unbounded queue. At any point, at most `nThreads`
threads will be active processing tasks. If any thread terminates due to a
failure during execution prior to shutdown, a new one will take its place if
needed to execute subsequent tasks. The threads in the pool will exist until it
is explicitly `shutdown()`.

In my case, I use exactly the same number of threads as the number of
processors available to the Java virtual machine. It allows to have one thread
per processor, so that thread switching can be avoided.

```java
int nThreads = Runtime.getRuntime().availableProcessors();
ExecutorService threadPool = Executors.newFixedThreadPool(nThreads);
```

Note that the number of available processors in JVM is the number of logical
CPUs in your machine. You can check it using the following commands.

Linux:

```
$ lscpu | grep -E '^Thread|^CPU\('
CPU(s):                4
Thread(s) per core:    2
```

Mac OS:

```
$ sysctl hw.physicalcpu hw.logicalcpu
hw.physicalcpu: 2
hw.logicalcpu: 4
```

Windows:

```
>echo %NUMBER_OF_PROCESSORS%
4
```

## Submit Tasks

ExecutorService accepts a collection of `Callable<T>` as input for method
`invokeAll()`:

```java
<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
    throws InterruptedException;
```

So you should create a class (separated, anonymous, or lambda) which implements
the `Callable<T>` interface. Then, submit them into thread pool. Here's what I
did (simplified):

```java
public class MyTask implements Callable<MyResult> {

  private final Path path;

  public MyTask(Path path) {
    this.path = path;
  }

  @Override
  public MyResult call() {
    ...
  }
}
```

```java
// prepare
List<MyTask> tasks = new ArrayList<>();
while (!paths.isEmpty()) {
  Path = paths.poll();
  tasks.add(new MyTask(p));
}
// invoke
List<Future<MyResult>> futures = threadPool.invokeAll(tasks);
```

## During Execution

If you want to monitor the execution progress, there're several ways to do it.

**Watch the logs.** You can watch the logs. Each log
entry has a thread name, and from there you can know which task is being
executed by which thread. By default, the thread name created by default thread
factory (`java.util.concurrent.Executors.DefaultThreadFactory`). It starts with
"pool-N" and follows by "thread-M", where `N` is the sequence number of this
factory and `M` is the sequence number of the thread created by this factory.

```sh
"pool-${N}-thread-${M}"
```

For example:

```
2019-01-29 21:54:22.172 [pool-1-thread-4] INFO  MyTask - ...
2019-01-29 21:54:22.172 [pool-1-thread-3] INFO  MyTask - ...
2019-01-29 21:54:22.172 [pool-1-thread-1] INFO  MyTask - ...
2019-01-29 21:54:22.172 [pool-1-thread-2] INFO  MyTask - ...
2019-01-29 21:54:22.331 [pool-1-thread-3] INFO  MyTask - ...
2019-01-29 21:54:22.352 [pool-1-thread-2] INFO  MyTask - ...
2019-01-29 21:54:22.364 [pool-1-thread-1] INFO  MyTask - ...
```

I'm using Log4J, and the conversion pattern is the following, where `%t`
represents the thread name:

```
%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5p %c{1} - %m%n
```

**Using JConsole.** From your terminal, use command `jconsole` to open JConsole
(Java Monitoring & Management Console). Then connect to the specific JVM using
its process ID (PID). If you don't know it, use `jps` to find it out. Once
connect, go to tab "Threads" and you will see the detail about threads.

![Monitoring using JConsole](/assets/20190129-jconsole.png)

**Using JStack.** From your terminal, use command `jstack <pid>` to do a thread
dump, which allows to understand what happens at the moment T.

## Completion: All Tasks Done

Thread pool returns a list of Futures holding their status and results when all
complete. `Future#isDone` is true for each element of the returned list. Note
that a completed task could have terminated either normally or by throwing an
exception. The results of this method are undefined if the given collection is
modified while this operation is in progress.

```java
List<Future<MyResult>> futures = threadPool.invokeAll(tasks);
```

You can perform post-actions by retrieving result `T` from `Future<T>`. For
example, analyse the results of all futures: how many tasks were successful,
how many were failed etc.

```java
for (Future<MyResult> future : futures) {
  if (!future.isCancelled()) {
    try {
      MyResult r = future.get();
      // TODO: Add post-invoke logic
    } catch (ExecutionException e) {
      logger.error("Failed to get result", e);
    } catch (InterruptedException e) {
      logger.error("Interrupted", e);
      Thread.currentThread().interrupt();
    }
  }
}
```

## Shutdown

After having processed all the tasks, you need to shutdown the thread pool
manually in your code. Method `shutdown()` initiates an orderly shutdown in
which previously submitted tasks are executed, but no new tasks will be
accepted. Invocation has no additional effect if already shut down.

```java
threadPool.shutdown();
```

This method does not wait for previously submitted tasks to complete execution
(use `awaitTermination()` to do that). However, in our case, it's fine because
`invokeAll()` guarantees that all tasks are done before returning the results.

## Conclusion

In this article, we saw how to create a fixed thread pool, submit tasks, invoke
all tasks, monitoring the execution, perform post-action and shutdown the thread
pool. Hope you enjoy this article, see you the next time!

## References

- Oracle n.d., _ExecutorService (Java Platform SE 8)_,
  viewed 29 January 2019, <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html>
- Oracle n.d., _Executors (Java Platform SE 8)_,
  viewed 29 January 2019, <https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html>
- Mr ASquare 2015, _How to know number of cores of a system in Linux?_,
  viewed 29 January 2019, <https://unix.stackexchange.com/questions/218074>
- Mike DeSimone 2009, _How to discover number of logical cores on Mac OS X?_,
  viewed 29 January 2019, <https://stackoverflow.com/questions/1715580>
- Mustafa 2014, _Find Number of CPUs and Cores per CPU using Command Prompt_,
  viewed 29 January 2019, <https://stackoverflow.com/questions/22919076>
