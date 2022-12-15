---
article_num: 150
layout:            post
title:             GC in Elasticsearch
lang:              en
date:              2020-08-30 14:32:49 +0200
series:            [es-admin]
categories:        [elasticsearch]
tags:              [elasticsearch, java]
permalink:         /2020/08/30/gc-in-elasticsearch/
comments:          true
excerpt:           >
    Basic information about garbage collection (GC) in Elasticsearch, including the
    default garbage collector used, JVM options, GC logging, and more.
image:             /assets/bg-pawel-czerwinski-RkIsyD_AVvc-unsplash.jpg
cover:             /assets/bg-pawel-czerwinski-RkIsyD_AVvc-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

This article explains the basic information about garbage collection (GC) in
Elasticsearch, including the default GC type, JVM options, GC logging, and
more. The goal of this article is to help you better operate your Elasticsearch
cluster by knowing how to observe the GC behavior and understand the right place to
change the settings. This article covers the settings of Elasticsearch 6 and
Elasticsearch 7. Now, let's get started!

## GC Types

Elasticsearch mainly uses two different garbage collectors of Java: Concurrent
Mark Sweep (CMS) Collector and Garbage-First (G1) Garbage Collector. The type of
GC chosen does not depend on the version of Elasticsearch but rather the version
of JDK. When using any JDK version between 8 and 13 (included), the default GC
used is Concurrent Mark Sweep GC; when using JDK version 14 or later, the
default GC used in G1 GC. This is the case for the latest version of
Elasticsearch 6.x and Elasticsearch 7.x.

JDK    | GC
:----- | :---
8 - 13 | Concurrent Mark Sweep (CMS) Collector
14+    | Garbage-First (G1) Garbage Collector

You can check this information in the
file `jvm.options`
([6.8](https://github.com/elastic/elasticsearch/blob/6.8/distribution/src/config/jvm.options)
/ [7.9](https://github.com/elastic/elasticsearch/blob/7.9/distribution/src/config/jvm.options)). For example, here is the excerpt from v7.9.0:

```sh
## GC configuration
8-13:-XX:+UseConcMarkSweepGC
8-13:-XX:CMSInitiatingOccupancyFraction=75
8-13:-XX:+UseCMSInitiatingOccupancyOnly

## G1GC Configuration
# NOTE: G1 GC is only supported on JDK version 10 or later
# to use G1GC, uncomment the next two lines and update the version on the
# following three lines to your version of the JDK
# 10-13:-XX:-UseConcMarkSweepGC
# 10-13:-XX:-UseCMSInitiatingOccupancyOnly
14-:-XX:+UseG1GC
14-:-XX:G1ReservePercent=25
14-:-XX:InitiatingHeapOccupancyPercent=30
```

According to [Oracle JDK
Documentation](https://docs.oracle.com/javase/9/gctuning/concurrent-mark-sweep-cms-collector.htm#JSGCT-GUID-FF8150AC-73D9-4780-91DD-148E63FA1BFF),
the Concurrent Mark Sweep (CMS) collector is designed for applications that
prefer shorter garbage collection pauses and that can afford to share processor
resources with the garbage collector while the application is running.
Typically applications that have a relatively large set of long-lived data (a
large old generation) and run on machines with two or more processors tend to
benefit from the use of this collector. ⚠️  Note that the CMS collector had been
deprecated since Java 9. The CMS collector is enabled with the command-line
option below:

```
-XX:+UseConcMarkSweepGC
```

According to [Oracle JDK
Documentation](https://docs.oracle.com/javase/9/gctuning/garbage-first-garbage-collector.htm#JSGCT-GUID-0394E76A-1A8F-425E-A0D0-B48A3DC82B42),
the Garbage-First (G1) garbage collector is targeted for multiprocessor machines
with a large amount of memory. It attempts to meet garbage collection pause-time
goals with high probability while achieving high throughput with little need for
configuration. G1 aims to provide the best balance between latency and
throughput using current target applications and environments. The G1 GC is the
default collector for Java 9+, so you don't have to perform any additional
actions. But you can explicitly enable it by providing the following
command-line:

```
-XX:+UseG1GC
```

## Logging

By default, GC logs are enabled in Elasticsearch. The settings are configured in
`jvm.options` and the logs are written in the same location as other
Elasticsearch logs. The default configuration rotates the logs every 64 MB and
can consumer up to 2 GB of disk space. For more information about GC logging,
you can visit the official documentation of Elasticsearch: [GC logging](https://www.elastic.co/guide/en/elasticsearch/reference/current/gc-logging.html).

Internally, Elasticsearch has a JVM GC Monitor Service (`JvmGcMonitorService`)
([6.8](https://github.com/elastic/elasticsearch/blob/6.8/server/src/main/java/org/elasticsearch/monitor/jvm/JvmGcMonitorService.java)
/
[7.9](https://github.com/elastic/elasticsearch/blob/7.9/server/src/main/java/org/elasticsearch/monitor/jvm/JvmGcMonitorService.java))
which monitors the GC problem smartly. This service logs the GC
activity if some GC problems were detected. According to the severity, the logs
will be written at different levels (DEBUG/INFO/WARN). In Elasticsearch 6.x and
Elasticsearch 7.x, two GC problems are logged: GC slowness and GC overhead. GC
slowness means the GC takes too long to execute. GC overhead means the GC
activity exceeds a certain percentage in a fraction of time.

GC Problem      |     Debug |     Info |   Warning
:-------------- | --------: | -------: | --------:
Slow GC (Young) |    400ms+ |   700ms+ |  1,000ms+
Slow GC (Old)   |  2,000ms+ | 5,000ms+ | 10,000ms+
GC Overhead     |      10%+ |     25%+ |      50%+

But these sound a bit abstract... Don't worry, let's take two concrete logs to
see how do they look like in real:

> _"\[gc\]\[young\]\[69127\]\[5329\] duration \[758ms\], collections
> \[1\]/\[1s\], total \[758ms\]/\[4.2h\], memory \[3.2gb\]->\[3.4gb\]/\[7.7gb\],
> all\_pools {...}"_

The message above logs the "Slow GC" problem: the GC of the
young generation was logged in the sequence 69127 as the Nº5329 garbage
collection. It took 758ms to complete. In the current round, GC happened once
over the last second (1s). In total, the GC collection time is 4.2 hours. The heap
changed from 3.2GB used to 3.4GB used after the GC. The max GC used was 7.7GB.
Then, the message continues with some detailed statistics about the JVM.

> _"\[gc\]\[1234\] overhead, spent \[287ms\] collecting in the last \[1s\]"_

The message above logs the "GC Overhead" problem. In the sequence 1234, we
observed that the GC was overhead, the Elasticsearch node spent 287ms doing
garbage collection in the last 1 second, which represents 28.7% of the activity.

## Default GC Options

If you want to know the default GC options in Java where your Elasticsearch node
is running, you can use the command below to list them:

```
java -XX:+PrintFlagsFinal -version
```

For example, finding the default value of `MaxGCPauseMillis` can be done as follow:

```
~ $ java -XX:+PrintFlagsFinal -version | grep MaxGCPauseMillis
    uintx MaxGCPauseMillis                         = 200                                       {product} {default}
openjdk version "14.0.2" 2020-07-14
OpenJDK Runtime Environment AdoptOpenJDK (build 14.0.2+12)
OpenJDK 64-Bit Server VM AdoptOpenJDK (build 14.0.2+12, mixed mode, sharing)
```

## Changing GC Options

If you want to tune the garbage collector settings, you need to change the GC
options. Normally you don't need to do that and the problem is probably from
elsewhere. Elasticsearch warns you about this
in the `jvm.options` file: _"All the (GC) settings below are considered expert
settings. Don't tamper with them unless you understand what you are doing."_.
But you really want to do that, you can follow the documentation ["Setting JVM
options"](https://www.elastic.co/guide/en/elasticsearch/reference/current/jvm-options.html)
to change the GC options. Depending on the distribution you used (tar/zip,
Debian/RPM package, Docker), there are different ways to change the options.
Roughly speaking, you can change them by: 1) overriding JVM options via JVM
options files either from `config/jvm.options` or `config/jvm.options.d/`; 2)
settings the JVM options via the `ES_JAVA_OPTS` environment variable. Please
read that document for more detail.

## Going Further

How to go further from here?

- To understand more about Concurrent Mark Sweep (CMS) Collector, visit Oracle's
  GC tuning guide about "Concurrent Mark Sweep (CMS) Collector". The link provided is
  for Java 9, make sure you change it to your desired Java version.<br>
  <https://docs.oracle.com/javase/9/gctuning/concurrent-mark-sweep-cms-collector.htm#JSGCT-GUID-FF8150AC-73D9-4780-91DD-148E63FA1BFF>
- To understand more about Garbage-First (G1) Garbage Collector, visit Oracle's
  GC tuning guide about "Garbage-First Garbage Collector". The link provided is
  for Java 9, make sure you change it to your desired Java version.<br>
  <https://docs.oracle.com/javase/9/gctuning/garbage-first-garbage-collector.htm#JSGCT-GUID-ED3AB6D3-FD9B-4447-9EDF-983ED2F7A573>
- To see a real world example about using G1GC in Elasticsearch, visit Prabin
  Meitei M's article "Garbage Collection in Elasticsearch and the G1GC" on
  Medium.<br>
  <https://medium.com/naukri-engineering/garbage-collection-in-elasticsearch-and-the-g1gc-16b79a447181>
- To modify the logging format of GC logs, check out the JDK Enhancement
  Proposal "JEP 158: Unified JVM Logging" and the future options not contained
  in the original JEP from the `java` command manual, section "Enable Logging
  with the JVM Unified Logging Framework".<br>
  <https://openjdk.java.net/jeps/158><br>
  <https://docs.oracle.com/en/java/javase/14/docs/specs/man/java.html#enable-logging-with-the-jvm-unified-logging-framework>

## Conclusion

In this article, we discussed the garbage collector (GC) usage in Elasticsearch
by going through the default GC used by Elasticsearch on different JDK versions,
the smart GC logs when GC problems happen (slowness, overhead), the command line
to print the GC options, how to change GC options, and how to go further from
here.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Oracle, "Concurrent Mark Sweep (CMS) Collector", _Oracle JDK 9 Documentation_,
  2017.<br>
  <https://docs.oracle.com/javase/9/gctuning/concurrent-mark-sweep-cms-collector.htm#JSGCT-GUID-FF8150AC-73D9-4780-91DD-148E63FA1BFF>
- Oracle, "Garbage-First Garbage Collector", _Oracle JDK 9 Documentation_,
  2017.<br>
  <https://docs.oracle.com/javase/9/gctuning/garbage-first-garbage-collector.htm#JSGCT-GUID-ED3AB6D3-FD9B-4447-9EDF-983ED2F7A573>
- Elasticsearch, "GC Logging", _Elasticsearch Reference \[7.9\]_, 2020.<br>
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/gc-logging.html>
- Elasticsearch, "Setting JVM options", _Elasticsearch Reference \[7.9\]_,
  2020.<br>
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.9/jvm-options.html>
