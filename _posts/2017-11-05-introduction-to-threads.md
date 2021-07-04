---
layout:      post
title:       "Introduction to Threads"
lang:                en
date:        "2017-11-05 13:47:29 +0100"
categories:  [java-concurrency]
tags:        [java, multithreading]
excerpt:     >
  Today, I want to share with you an introduction to multithreading in Java. In
  order to make the blog post more fun, I'll use the roles of "Game of Thrones" in
  my examples: white walkers and the Night King. After reading the blog post,
  you'll understand: How to create and run a thread, use wait(), notify(),
  notifyAll() and join().
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, I want to share with you an introduction to multithreading in Java. In
order to make the blog post more fun, I'll use the roles of "Game of Thrones" in
my examples: white walkers and the Night King. After reading the blog post,
you'll understand:

1. How to create and run a thread
2. How a thread notifies others using `wait()`, `notify()`, and `notifyAll()`
3. How a thread notifies others using `join()`

Let's get started.

<p align="center">
  <img src="{{ site.url }}/assets/20171105-night-king.jpg"
       alt="The Night King"
       width="1000"
       style="border-radius: 0; box-shadow: 2px 2px 10px #BBB;" />
</p>
<p align="center"><small>The Night King and his army | HBO</small></p>

<!--more-->

## 1. How to Create and Use Threads

First of all, let's ensure we know how to create and use threads. There're
several ways to create and start a thread.

### 1.1. Extending Class Thread

You can create your own Java object by extending the class `java.lang.Thread`,
and override the `Thread#run()` method.

Once everything is done, you _must_ start the thread by calling method
`Thread#start()`. When a new thread of execution stats, it will execute the code
defined in the thread instance's method `run()`. Method `start()` will trigger
creation of a new thread of execution, allocating resources to it.

{% highlight java %}
public class WhiteWalker extends Thread {
  @Override
  public void run() {
    System.out.println("From inheritance");
  }
}

/* Somewhere else */
WhiteWalker whiteWalker = new WhiteWalker();
whiteWalker.start();
{% endhighlight %}

However, when you create a thread class by extending class `Thread`, you lose
the flexibility of inheriting any other class. To get around this, instead of
extending class `Thread`, you can implement the `java.lang.Runnable` interface,
which will be discussed later.

### 1.2. Using Anonymous Class

If you want to create a `Thread` without being bothered by the inheritance, you
can use the anonymous class, which overrides the `Thread#run()` method in-place:

{% highlight java %}
Thread thread = new Thread() {
  @Override
  public void run() {
    System.out.println("From anonymous");
  }
}
thread.start();
{% endhighlight %}

### 1.3. Implementing Interface Runnable

If a class implements `java.lang.Runnable`, its instances can be executed by
threads of execution via method `#run()`. For example:

{% highlight java %}
public class WhiteWalker implements Runnable {
  @Override
  public void run() {
    System.out.println("From Runnable");
  }
}
{% endhighlight %}

This class can be executed by `Thread`:

{% highlight java %}
Thread thread = new Thread(new WhiteWalker());
thread.start();
{% endhighlight %}

### 1.4. Using Lambda

In Java 8, you can forget all the ceremonies and use lambda expression :)

{% highlight java %}
Thread thread = new Thread(() -> System.out.println("From lambda"));
thread.start();
{% endhighlight %}

<hr>

Now I would like to explain how threads wait, and notify others using different
approaches: wait-notify, or join. There're many other models, but only these two
will be discussed in the blog post. These actions are related to thread
lifecycle.

Let's ues white walkers as our context. Assume that there's a Night King and
many white walkers. The Night King and each white walker uses its own thread,
but the white walkers cannot move before the Night King is ready. Once ready,
the white walkers can prepare and follow the king after that. How can we
implement this scene?

## 2. Wait, Notify and NotifyAll

<p align="center">
  <img src="{{ site.url }}/assets/20171105-notify.png"
       alt="The Night King notifies his army."
       width="1000"
       style="border-radius: 0; box-shadow: 2px 2px 10px #BBB;" />
</p>
<p align="center"><small>The Night King notifies his army. | HBO</small></p>

{% highlight shell %}
$ java io.mincong.ocpjp.threads.ThreadWait
Night King is preparing...
A is waiting...
B is waiting...
C is waiting...
Night King is ready.
C follows.
B follows.
A follows.
{% endhighlight %}

### 2.1. White Walker

Firstly, we need to write a class for the army—white walkers. White walker
extends the class `Thread`, so that they can be started easily. A Night King
instance is assigned to the white walker, so the white walker can understand
who to follow:

{% highlight java %}
public class WhiteWalker extends Thread {

  WhiteWalker(String name, NightKing king) {
    this.name = name;
    this.king = king;
  }
  ...
}
{% endhighlight %}

Now, let's take a look in the method `run()`. Inside the `run()` method, white
walker waits until the `king` is ready. When digging deeper, you can notice that
a `synchronized` statement is used before calling method `wait()`. This is
because a thread _must_ acquire a lock on an object monitor, before it can
execute the synchronized statements. The state of thread `WhiteWalker` is
_RUNNABLE_ before the waiting the king.

When thread `WhiteWalker` calls `king.wait(1000)`, it is placed in the waiting
set of threads for the object `king`, gives up `king` 's monitor lock, and waits
utils:

- Another thread invokes `notify()` or `notifyAll()` on the same object `king`.
- Some other threads interrupt `WhiteWalker`, e.g. Jon Snow :)
- The timeout 1000 ms is reached, in which case the white walker will die.

Immediately after calling `Thread#wait(long)`, the current thread `WhiteWalker`
changes its thread state, from _RUNNABLE_ to _TIMED\_WAITING_. _TIMED\_WAITING_
means a thread is waiting for another thread to perform an action for up to a
specified time is in this state.

Here's the implementation:

{% highlight java %}
@Override
public void run() {
  System.out.println(name + " is waiting...");
  synchronized (king) {
    try {
      king.wait(1000);
    } catch (InterruptedException e) {
      throw new IllegalStateException(e);
    }
  }
  if (king.isReady.get()) {
    System.out.println(name + " follows.");
  } else {
    System.out.println(name + " is dead (king is not ready).");
  }
}
{% endhighlight %}

### 2.2. King

Let's take a look on class `NightKing`. Night king will be ready 100 ms after
having started its preparation. Once ready, he will notify all the white
walkers, the entire army that is waiting for him:

{% highlight java %}
public static class NightKing extends Thread {

  AtomicBoolean isReady = new AtomicBoolean(false);

  @Override
  public void run() {
    System.out.println("Night King is preparing...");
    try {
      Thread.sleep(100);
    } catch (InterruptedException e) {
      throw new IllegalStateException(e);
    }
    ready();
  }
  ...
}
{% endhighlight %}

In method `ready()`, king uses method `Thread#notifyAll()` to notify his army.
It means that king will wake up all threads that are waiting on this object's
monitor:

{% highlight java %}
private synchronized void ready() {
  System.out.println("Night King is ready.");
  isReady.set(true);
  notifyAll();
}
{% endhighlight %}

Notice that in the method above, the keyword `synchronized` is necessary to
acquire a monitor of the Night King instance. The threads waiting on this
object's monitor, they will compete in the usual manner to acquire a lock on the
object's monitor and resume their execution.

### 2.3 Source code

{% highlight java %}
package io.mincong.ocpjp.threads;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * @author Mincong Huang
 */
public class ThreadWait {

  /**
   * Milliseconds required to let the king be ready.
   * <p>
   * You can change this value and / or the value of {@link
   * #MS_TO_WAIT} to modify the behaviors of white walkers.
   *
   * @see #MS_TO_WAIT
   */
  private static final int MS_TO_READY = 100;

  /**
   * Milliseconds required to wait the king.
   * <p>
   * You can change this value and / or the value of {@link
   * #MS_TO_READY} to modify the behaviors of white walkers.
   *
   * @see #MS_TO_READY
   */
  private static final int MS_TO_WAIT = 1_000;

  public static void main(String... args) {
    NightKing king = new NightKing();
    List<WhiteWalker> walkers = Arrays.asList(
        new WhiteWalker("A", king),
        new WhiteWalker("B", king),
        new WhiteWalker("C", king)
    );
    king.start();
    walkers.forEach(Thread::start);
  }

  public static class WhiteWalker extends Thread {

    private String name;

    private final NightKing king;

    WhiteWalker(String name, NightKing king) {
      this.name = name;
      this.king = king;
    }

    @Override
    public void run() {
      System.out.println(name + " is waiting...");
      synchronized (king) {
        try {
          king.wait(MS_TO_WAIT);
        } catch (InterruptedException e) {
          throw new IllegalStateException(e);
        }
      }
      if (king.isReady.get()) {
        System.out.println(name + " follows.");
      } else {
        System.out.println(name + " is dead (king is not ready).");
      }
    }

    @Override
    public String toString() {
      return name;
    }
  }

  public static class NightKing extends Thread {

    AtomicBoolean isReady = new AtomicBoolean(false);

    @Override
    public void run() {
      System.out.println("Night King is preparing...");
      try {
        Thread.sleep(MS_TO_READY);
      } catch (InterruptedException e) {
        throw new IllegalStateException(e);
      }
      ready();
    }

    private synchronized void ready() {
      System.out.println("Night King is ready.");
      isReady.set(true);
      notifyAll();
    }
  }

}
{% endhighlight %}

## 3. Method join()

A thread might need to pause its own execution when it is waiting for another
thread to complete its task. If thread A calls `join()` on a thread instance B,
A will wait for B to complete its execution before A can proceed to its own
completion. Now let's see how "join" can change the white walker army's
behaviors.

### 3.1 White Walker

Comparing to the previous approach in section 2, where we need to acquire a
monitor of the Night King, now using "join", we can simply describe the workflow
as:  _"Any white walker following the Night King will join him when he's
ready."_

{% highlight java %}
public void run() {
  try {
    System.out.println(name + " is waiting...");
    king.join(1000);
  } catch (InterruptedException e) {
    throw new IllegalStateException(e);
  }
  if (king.isReady.get()) {
    System.out.println(name + " follows.");
  } else {
    System.out.println(name + " is dead (king is not ready).");
  }
}
{% endhighlight %}

When a white walker calls `king.join()`, the thread of white walker waits for
the king to complete its execution before executing the rest of its code. Method
`join()` guarantees that the calling thread won't execute its remaining code
until the thread on which it calls `join()` completes. Behind the scenes,
`join()` is implemented using methods `wait()`, `isAlive()`, and `notifyAll()`.

### 3.2 Night King

This approach also simplifies the logic for the Night King, who does not need to
notify all the threads anymore:

{% highlight java %}
public void run() {
  System.out.println("Night King is preparing...");
  try {
    Thread.sleep(MS_TO_READY);
  } catch (InterruptedException e) {
    throw new IllegalStateException(e);
  }
  System.out.println("Night King is ready.");
  isReady.set(true);
}
{% endhighlight %}

However, we must understand that this approach is not the same as the notify-all
approach. Using method `join()` requires the execution of target thread (king)
to be complete, before the army can resume their execution. While using
notify-all, you can let king to notify all in middle of his execution, then
resume after that.

### 3.3 Source Code

{% highlight java %}
package io.mincong.ocpjp.threads;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * @author Mincong Huang
 */
public class ThreadJoin {

  /**
   * Milliseconds required to let the king be ready.
   * <p>
   * You can change this value and / or the value of {@link
   * #MS_TO_WAIT} to modify the behaviors of white walkers.
   *
   * @see #MS_TO_WAIT
   */
  private static final int MS_TO_READY = 100;

  /**
   * Milliseconds required to wait the king.
   * <p>
   * You can change this value and / or the value of {@link
   * #MS_TO_READY} to modify the behaviors of white walkers.
   *
   * @see #MS_TO_READY
   */
  private static final int MS_TO_WAIT = 1_000;

  public static void main(String... args) {
    NightKing king = new NightKing();
    List<WhiteWalker> walkers = Arrays.asList(
        new WhiteWalker("A", king),
        new WhiteWalker("B", king),
        new WhiteWalker("C", king)
    );
    king.start();
    walkers.forEach(Thread::start);
  }

  public static class WhiteWalker extends Thread {

    private String name;

    private final NightKing king;

    WhiteWalker(String name, NightKing king) {
      this.name = name;
      this.king = king;
    }

    @Override
    public void run() {
      try {
        System.out.println(name + " is waiting...");
        king.join(MS_TO_WAIT);
      } catch (InterruptedException e) {
        throw new IllegalStateException(e);
      }
      if (king.isReady.get()) {
        System.out.println(name + " follows.");
      } else {
        System.out.println(name + " is dead (king is not ready).");
      }
    }

    @Override
    public String toString() {
      return name;
    }
  }

  public static class NightKing extends Thread {

    AtomicBoolean isReady = new AtomicBoolean(false);

    @Override
    public void run() {
      System.out.println("Night King is preparing...");
      try {
        Thread.sleep(MS_TO_READY);
      } catch (InterruptedException e) {
        throw new IllegalStateException(e);
      }
      System.out.println("Night King is ready.");
      isReady.set(true);
    }
  }

}
{% endhighlight %}

I'm not 100% about these two approaches. If you found some wrong in this blog
post, please don't hesitate to leave me a comment. Hope you enjoy this one, see
you the next time!

## 4. References

- ['Game of Thrones': Surprising Facts About the Night King][1]
- [OCP Java SE 7 Programmer II Certification Guide, Mala Gupta][2]

[1]: https://www.cheatsheet.com/entertainment/game-of-thrones-surprising-facts-about-the-night-king.html/?a=viewall
[2]: https://www.amazon.com/OCP-Java-Programmer-Certification-Guide/dp/161729148X/
