---
layout:            post
title:             Create A Throttler In Java
date:              2020-11-07 14:12:25 +0100
categories:        [java-core]
tags:              [java, reliability]
comments:          true
excerpt:           >
    What is throttling and how to write a simple throttler in Java.
image:             /assets/bg-tian-kuan-9AxFJaNySB8-unsplash.jpg
ads:               none
---

## Introduction

In a data-intensive application or any high throughput scenario, you may want to
regulate the computation to protect the system and avoid it being overloaded.
This process is called throttling. In this article, I want to go into this topic
by sharing the motivation, some types of throttling, a small sample in Java.
Now, let's get started!

## Motivation

_Why do we need throttling?_

When hosting a backend service, it's usually difficult to predict customers'
traffic. When the business grows, the traffic grows. A huge amount of requests can
make the system overloaded or even out-of-service. Also, customers' traffic can
be seasonal, such as there is more traffic in some hours of the day than
other hours. When processing requests from different customers, there is also a
risk that one abusive customer may impact the requests of others and degrade the
user experience of the product. Therefore, it's important to set up a mechanism
to protect the system from being overloaded. That's why we need throttling.

A throttling mechanism can be just as simple as rejecting or postpone the
incoming requests above the threshold. Meaning that the clienti will either need
to send
the request again or wait longer for getting the response. Throttling
can be done in many aspects. You can:

* throttle the requests by frequency, e.g. no more than 1,000 requests/s
* throttle the messages by volume, e.g. no more than 1,000 messages
* throttle the messages by size (bytes), e.g. no more than 100MB
* throttle the messages by source IP address, e.g. no more than 100 simultaneous requests
  coming from the same IP
* ...

I'm sure you can find other aspects. The main idea is to find and use the one
the most adapted to your business and your system.

## Simple Throttler

Now, let's see how it really works in reality. Here is a small demo
written in Java 11 to demonstrate the logic of throttling the messages after
reaching the quota `messageLimit`:

```java
public ThrottleResult throttle(List<String> messages) {
  var passed = new ArrayList<String>();
  var throttled = new ArrayList<String>();
  var quota = messageLimit;

  for (var message : messages) {
    if (quota > 0) {
      passed.add(message);
      quota--;
    } else {
      throttled.add(message);
    }
  }
  return new ThrottleResult(passed, throttled);
}
```

As you can see, you just need to pass a list of messages as input, set a quota
and accept no more than that many messages. The accepted messages are considered
as passed and stored in the list `passed`. While the remaining messages are
throttled and store in another list `throttled`. Combining two lists together,
we have the final throttle result that can be returned to the caller. If you're
interested to see the source code, you can find it on
[GitHub](https://github.com/mincong-h/java-examples/blob/blog/throttler/reliability/src/main/java/io/mincong/reliability/Throttler.java).

Based on your business requirements, you may want to modify the logic to use
other throttling: by bytes, by frequency, by source, ... But the key logic
should remain the same.

It's also useful to add some logs or metrics about the throttling result so that
you can have better observability on the system. You may want to know which
machines are being throttled, which consumers are impacted, how frequent the
throttling happens, how many resources are being throttled, the correlation
between the throttling and other events happened in the system (CPU, memory,
I/O), etc.

## Going Further

How to go further from here?

* If you use Elasticsearch, you can read the source code of [Throttling
  Allocation Decider
(v7.9.3)](https://github.com/elastic/elasticsearch/blob/v7.9.3/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ThrottlingAllocationDecider.java)
  to see how are shard allocations throttled when the current recoveries are
  higher than the threshold defined for primary or replica shards.
* To know more about the throttling process in software, read the Wikipedia page
  "Throttling process (computing)".
  <https://en.wikipedia.org/wiki/Throttling_process_%28computing%29>

## Conclusion

In this article, we saw the definition of throttling, the motivation of using it
in your system, the different types of things to use for throttling, the source
code of a simple throttler in Java. I hope this article can make your
application more reliable than before.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
