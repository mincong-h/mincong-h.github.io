---
layout:      post
title:       "Method Execution In Multithreading"
date:        "2018-07-01 16:22:45 +0200"
categories:  [java, multithreading, study-note]
comments:    true
---

Today I met some multithreading problems. Many Java syntax become very confusing
in a multithreading environment. So I created a mini Java program, and wrote
this study note to clarify the unclear methods. This blog post will go through
the following steps:

1. Source code and execution
2. Understand `Thread#join()`
3. Understand logic sharing
4. Understand variable sharing

<!--more-->

## Source Code and Execution

My mini Java program:

{% highlight java %}
import java.util.logging.Level;
import java.util.logging.Logger;

public class App {

  private static final Logger logger = Logger.getLogger("App");

  public static void main(String[] args) throws Exception {
    logger.info("[" + Thread.currentThread().getName() + "] Main thread started.");
    Slave slave = new Slave();
    Master master = new Master(slave);
    Thread sThread = new Thread(slave, "Slave");
    Thread mThread = new Thread(master, "Master");

    sThread.start();
    Thread.sleep(2000);
    mThread.start();
    mThread.join();
    logger.info("[" + Thread.currentThread().getName() + "] Main thread finished.");
  }

  private static class Master implements Runnable {

    private final Slave slave;

    public Master(Slave slave) {
      this.slave = slave;
    }

    @Override
    public void run() {
      logger.info("[" + Thread.currentThread().getName() + "] Closing slave...");
      slave.close();
      logger.info("[" + Thread.currentThread().getName() + "] Slave is closed.");
    }
  }

  private static class Slave implements Runnable {

    private volatile boolean running = true;

    @Override
    public void run() {
      // do an infinite loop and wait master's call
      while (running) {
        logger.info("[" + Thread.currentThread().getName() + "] Slave is running");
        try {
          Thread.sleep(200);
        } catch (InterruptedException e) {
          logger.log(Level.SEVERE, "Sleep interrupted.", e);
          Thread.currentThread().interrupt();
        }
      }
    }

    public void close() {
      logger.info("[" + Thread.currentThread().getName() + "] Closed in 1 second.");
      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        logger.log(Level.SEVERE, "Sleep interrupted.", e);
        Thread.currentThread().interrupt();
      }
      Thread.yield();
      running = false;
      logger.info("[" + Thread.currentThread().getName() + "] Slave is closed.");
    }
  }
}
{% endhighlight %}

Execution:

```
$ java -Djava.util.logging.SimpleFormatter.format='%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS.%1$tL %4$-6s %2$s: %5$s%6$s%n' App
2018-07-01 16:34:17.209 INFO   App main: [main] Main thread started.
2018-07-01 16:34:17.240 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:17.445 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:17.650 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:17.853 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:18.059 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:18.264 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:18.469 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:18.675 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:18.881 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.086 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.242 INFO   App$Master run: [Master] Closing slave...
2018-07-01 16:34:19.242 INFO   App$Slave close: [Master] Closed in 1 second.
2018-07-01 16:34:19.289 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.493 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.699 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.905 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:20.109 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:20.245 INFO   App$Slave close: [Master] Slave is closed.
2018-07-01 16:34:20.246 INFO   App$Master run: [Master] Slave is closed.
2018-07-01 16:34:20.247 INFO   App main: [main] Main thread finished.
```

## Thread.join()

This section explains how to use `Thread.join()`.
In the mini program, there's a line which uses method `Thread#join()`:

{% highlight java %}
Thread mThread = new Thread(master, "Master");
...
mThread.join();
{% endhighlight %}

It means that the main thread waits for thread _Master_ to die. The waiting will
last forever without timeout. This can be verified by the log trace, too—main
thread did not quit until master is finished:

```
2018-07-01 16:34:17.209 INFO   App main: [main] Main thread started.
...
2018-07-01 16:34:20.246 INFO   App$Master run: [Master] Slave is closed.
2018-07-01 16:34:20.247 INFO   App main: [main] Main thread finished.
```

This can be used for any scenario where a thread needs to wait for another
thread's termination, e.g. as a shutdown hook.

## Logic Sharing

This section explains the logic sharing.
In the mini program, master closes the slave by invoking method `Slave#close()`.
But, in which thread this logic is invoked in reality? When seeing the following
code block, it's confusing and unclear how it works:

{% highlight java %}
private static class Master implements Runnable {

  private final Slave slave;
  ...

  @Override
  public void run() {
    logger.info("[" + Thread.currentThread().getName() + "] Closing slave...");
    slave.close();
    logger.info("[" + Thread.currentThread().getName() + "] Slave is closed.");
  }
}
{% endhighlight %}

To clarify the situation, let's check the log trace. The class and method name
defined after the log level is the location of the logic; the value in the
square bracket _\[...\]_ is the name of the thread:

```
2018-07-01 16:34:19.242 INFO   App$Master run: [Master] Closing slave...
2018-07-01 16:34:19.242 INFO   App$Slave close: [Master] Closed in 1 second.
2018-07-01 16:34:19.289 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.493 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.699 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:19.905 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:20.109 INFO   App$Slave run: [Slave] Slave is running
2018-07-01 16:34:20.245 INFO   App$Slave close: [Master] Slave is closed.
```

Even though object `slave` is submit to thread `Slave`, thread `Master` is the
one which closes the slave. In other words, thread `Master` executed the logic
of `Slave#close()`.

This is very interesting. It means that each thread runs its own logic, and
there's no way to do cross-thread control. The only thing a thread can do is to
"ask" another thread to perform action: how the other thread acts depends
completely its own implementation, it might or might not cooperate correctly.
We'll see that in the next section.

## Variable Sharing

In order the make threads cooperate together, we can use shared variables.
There're multiple ways to share variables between 2 threads. You can use
atomic variables (classes in Java concurrent package `java.util.concurrent`),
use volatile variables, or use synchronization around the code.

In my mini program, I used `volatile`.
If you want to know more about these approaches, check:

- [Baeldung: An Introduction to Atomic Variables in Java][3]
- [Javamex: The volatile keyword in Java][4]

The important part is: one thread cannot control another. It sends signal (2) or
shares variable (1) to another, and let that thread controls itself. In our case,
slave watches the variable `running`, and quit when it turns to false:

{% highlight java %}
while (running) {  // 1
  logger.info("[" + Thread.currentThread().getName() + "] Slave is running");
  try {
    Thread.sleep(200);
  } catch (InterruptedException e) {  // 2
    logger.log(Level.SEVERE, "Sleep interrupted.", e);
    Thread.currentThread().interrupt();
  }
}
{% endhighlight %}

The slave thread will stop if:

1. Running becomes false
2. A thread interruption request is received (exception raised)

## Conclusion

In Java, class is an encapsulation of logic and variables. Threads, on the other
hand, are logic executors. When thread A executes `task.doSth()`, you should not
interpret it as _"Task `task` does something"_, but _"Thread A does
something"_. In OOP, object does not describe the real world. Thread do. When
thinking in this way, it helps to understand multithreading. After all, hope you
enjoy this post, see you the next time!

## References

- [Stack Overflow: How do I get java logging output to appear on a single line?][1]
- [Thread (Java Platform SE 8)][2]
- [Baeldung: An Introduction to Atomic Variables in Java][3]
- [Javamex: The volatile keyword in Java][4]

[4]: https://www.javamex.com/tutorials/synchronization_volatile.shtml
[3]: http://www.baeldung.com/java-atomic-variables
[2]: https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html
[1]: https://stackoverflow.com/questions/194765/how-do-i-get-java-logging-output-to-appear-on-a-single-line
