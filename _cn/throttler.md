---
layout:              post
title:               用Java创建一个简单的节流阀
subtitle:            >
    系统瞬时负荷过载？要不试试节流阀（throttler）？

lang:                zh
date:                2021-04-25 10:41:58 +0800
categories:          [reliability]
tags:                [java, reliability]
comments:            true
excerpt:             >
    瞬时负荷过载？要不试试节流阀（throttler）吧！这篇文章讲述什么是节流（throttling）以及如何用Java创建一个简单的节流阀。

image:               /assets/bg-tian-kuan-9AxFJaNySB8-unsplash.jpg
cover:               /assets/bg-tian-kuan-9AxFJaNySB8-unsplash.jpg
redirect_from:
  - /2021/04/25/throttler-cn/
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
ads:                 none
---

## 前言

在一个数据密集型的应用或者任何高吞吐量的应用场景下面，你可能想要调节计算量来保护系统，防止系统超载。一个简单的调节方法就是节流：限制最大流量，延迟接受剩余任务的时间，使得负荷更加平滑。这样的机制就是节流（throttling）。在这篇文章中，我想带大家进入节流这个话题，探讨为什么要节流、不同类型的节流阀、以及如何在Java中写一个简单的实现。

## 节流的目的

_为什么我们需要节流？_

当我们运营一个后端服务的时候，我们通常很难准确地预测客户的流量。当业务增长时，后端服务的流量也会增长。大量的请求会使系统超载甚至使服务中断。另外，客户的流量可能是季节性的，例如一天中的营业时间的流量比下班时间的流量多。在处理来自不同客户的请求时，还存在一个滥用客户影响其他客户的风险，因为服务器很可能是共用的。系统超载会降低产品的用户体验，甚至会导致不可遇见的错误出现。因此，建立一个机制来保护系统避免超载是很有必要的。这就是为什么我们需要节流。

节流机制不一定会很复杂。最简单的节流阀只要在超过阈值以后，推迟或者拒绝新的请求就可以了。在节流阀起效时，这意味着客户要么需要比平时等待更长的时间才能得到响应，要么它需要再次发送请求。节流可以在许多方面进行，比如说：

* 对于请求的频率节流，不能超过1000请求/秒
* 对于请求的总量节流，不能超过1000请求/次
* 对于请求的大小节流，不能超过100MB/次
* 对于请求的来源节流，一个IP地址不能超过100个请求
* ...

这里我只是举了几个例子。具体的需求，还是要根据公司具体的业务逻辑来制定。

## 简单的Java实现

现在，让我们看看一个如何真正地实现一个节流阀吧。下面是一个用Java 11写的一个简单的例子， 来演示在配额用完以后（quota）以后，如何拒绝新的消息：

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

从上面的代码你可以看到，这个函数接受一个消息列表（messages）作为输入，它设置一个配额（quota）来限定最大的接受量。如果还有剩余配额，那么新的消息将会通过节流阀并存储在通过的列表（passed）中。而其余的消息则全部不允许通过，它们被存储在另一个节流的列表（throttled）中。将两个列表组合在一起，我们得到了最后的节流结果（通过和没通过的）并以函数结果输出。如果你有兴趣看源代码，你可以在我的GitHub项目[mincong-h/java-examples](https://github.com/mincong-h/java-examples/blob/blog/throttler/reliability/src/main/java/io/mincong/reliability/Throttler.java)中找到。

根据你的业务要求，你可能需要修改逻辑以使用其他限制：按字节、按频率、按来源等来调整节流。但关键逻辑应该是差不多的。

在可观测性方面，添加一些与节流结果有关的一些日志或metrics也很有用，这样你就可以在系统上更好地观察节流阀的决策。你可能想知道哪些机器正在被节流，哪些用户受到影响，节流发生的频率，有多少资源被节流，节流与系统中发生的其他事件（CPU、内存、I/O）之间的相关性等等。

## 拓展

如果你还想了解更多的关于节流相关的信息，下面是我的一些建议。

* 如果你在使用Elasticsearch，你可以读一下节流型分配决策器[Throttling Allocation Decider (v7.12.0)](https://github.com/elastic/elasticsearch/blob/v7.12.0/server/src/main/java/org/elasticsearch/cluster/routing/allocation/decider/ThrottlingAllocationDecider.java)的源代码。看看Elasticsearch是如何通过它来对分片分配（shard allocations）进行节流的，尤其是当正在恢复的分片数量（current recoveries）超过阈值时，对primary shards和secondary shards分配的影响。
* 如果你想了解更多关于分流在软件行业中的应用，可以浏览维基百科：["Throttling process (computing)"](https://en.wikipedia.org/wiki/Throttling_process_%28computing%29)
* 如果你想了解节流阀在别的行业的应用，也可以浏览百度百科：[节流阀](https://baike.baidu.com/item/%E8%8A%82%E6%B5%81%E9%98%80)

## 结论

在这篇文章里面，我们看了节流阀的定义，为什么要在系统中使用节流阀，以及如何在Java里面实现一个简单的节流阀。希望这篇文章能够给你带来一些思考，让你的系统变得更加稳健可靠。谢谢大家！
