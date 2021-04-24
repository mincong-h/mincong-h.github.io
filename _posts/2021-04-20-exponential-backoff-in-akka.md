---
layout:              post
title:               "通过Akka学习指数退避（Exponential Backoff）"
subtitle:            >
    程序总出错，光重试还不行？

date:                2021-04-20 11:21:16 +0800
categories:          [java-core]
tags:                [java, akka]
comments:            true
excerpt:             >
    让我们通过Akka框架学习什么是指数退避（Exponential Backoff），它在高负荷环境下如何担任重要的角色。它的基本参数，如何测试，应用场景，软件监控等等。

image:               /assets/bg-ocean-ng-L0xOtAnv94Y-unsplash.jpg
cover:               /assets/bg-ocean-ng-L0xOtAnv94Y-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
ads:                 none
wechat:              true
---

## 前言

在软件开发中，我们免不了要跟各种错误异常打交道。比如说，当一个服务在调用另一个服务的时候，很可能会出现一些错误，而且这些错误不一定跟业务逻辑相关。一些常见的错误是：大批量调用API，导致限流报错；网络不稳定，导致连接断开；对方服务器暂时不可用等等。面对这些问题，我们该如何处理呢？今天，让我们通过Akka这个框架来了解一下什么指数退避（Exponential Backoff）。

读完这篇文章，你会明白：

* 什么是指数退避？
* 如何理解它的各个参数？
* 它的一些应用场景
* 指数退避在别的框架中的实现
* 怎么从这篇文章拓展出去

事不宜迟，我们马上开始吧！

## 什么是指数退避

指数退避是退避技术（backoff）中很常见的一种，它是处理重负荷的一个很有效的方法。指数退避中最常用的估计是二进制退避技术。根据[百度百科](https://baike.baidu.com/item/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%8C%87%E6%95%B0%E9%80%80%E9%81%BF%E7%AE%97%E6%B3%95/3405081)，二进制退避技术（Binary Exponential Backoff）指在遇到重复的冲突时，站点将重复传输，但在每一次冲突之后，随着时延的平均值将加倍。二进制指数退避算法提供了一个处理重负荷的方法。尝试传输的重复失败导致更长的退避时间，这将有助于负荷的平滑。如果没有这样的退避，以下状况可能发生：两个或多站点同时尝试传输，这将导致冲突，之后这些站点又立即尝试重传，导致一个新冲突。

啊，太抽象，看不懂？不要紧，那么让我来画个图帮助大家理解：

<img src="/assets/20210420-expotential-backoff.png"
     alt="二进制指数退避示意图">

上面这幅图，它的横轴是时间，上面的点是发生异常和重试的时刻。第一次（0）收到服务器异常在第0秒，我们决定1秒以后重试；结果重试失败，第二次（1）再次重试，这时候重试时间翻倍，定在2秒以后；结果又失败，第三次（2）重试，这个时候重试时间再次翻倍，定在4秒以后。结果又失败，第四次（4）重试，这个时候重试时间再次翻倍，定在8秒以后…如此类推。这就是基本的二进制指数退避算法。

这里面涉及的两个基本参数：

* 初始退避时长（initial backoff duration）：1秒
* 指数：2

## Akka中的指数退避

在Akka中，创建一个普通的actor可以通过创造它的属性（Props）来实现，然后把props交给Akka系统：

```java
var creatorProps = Props.create(
    DocumentCreator.class,
    () -> new DocumentCreator(externalServiceClient, managerRef, request));
```

如果要实现指数退避的话，那么可以不直接把props传递回去，而是先加入一个退避监督者（BackoffSupervisor），然后再返回：

```java
var props = DocumentCreator.props(externalServiceClient, managerRef, request);

var creatorProps = BackoffSupervisor.props(
    BackoffOpts.onFailure(props, "document-creator", minBackOff, maxBackOff, 0.1)
        .withSupervisorStrategy(
            new OneForOneStrategy(
                    DeciderBuilder.match(TooManyRequestsException.class, e -> restart())
                        .matchAny(o -> stop())
                        .build())
                .withMaxNrOfRetries(maxRetries)));
```

这段代码长得有点奇葩，希望不影响大家阅读。接下来，让我们仔细分析一下它的几个参数：

**最小退避时长（minBackoff）**也是初始退避时长，它决定了actor在终止（terminiated）以后，多久以后被重启。主要用途是为了避免马上重启。那么多久的时间比较合适呢？我认为应该根据不同的服务、不同异常类型来决定。如果是因为过度调用对方API导致限流，那么应该视乎对方的冷却时间来决定什么时候重试。如果是因为网络不好，可以把最小初始重试时间调短一点。

**最大退避时长（maxBackoff）**决定了退避时长增加到哪一个点以后不会继续增加。可能是为了避免产生过大的时长。

**随机值（randomFactor）**是一个随机的增量。它决定了在计算好下一个退避时长的时候，要随机增加多少额外的时间。赋予0.2代表随机增加不超过20%的时间。这个做法是为了避免多个actors在同一时刻退避，增加了那个时刻对方服务器的负荷。这样的做法使得负荷更加的平滑。如果不想要这个随机增量的话，可以把它设成0.0。

**监督机制（supervisorStategy）**：Akka 提供了两种监管策略，一种是OneForOneStrategy，另一种是AllForOneStrategy。两者都配置了从异常类型到监督指令的映射，并限制了在终止之前允许子级失败的频率。它们之间的区别在于前者只将获得的指令应用于失败的子级，而后者也将其应用于所有的子级。通常，你应该使用OneForOneStrategy，如果没有明确指定，它也是默认的选项。在上面的示例代码里面，我们规定了如果actor遇到过多请求的异常（TooManyRequestsException），它是会被重启的；如果actor遇到了任何别的异常，直接让它关掉。我这么做是因为我每次创建一个新的文档的时候，都让系统创建一个新的actor，所以它的生命周期本身就很短，关掉也没有影响。但我这里只是做个示范，如果你需要写类似代码的话，请仔细考虑什么最适合你。

**最大重试次数（maxNrOfRetries）**是决定最多退避多少次就停止。这个是一个选填参数，默认重试无限次。有时候你需要这个参数，因为出错了就是出错了，可能再尝试也是没有结果的。比如我的工作中一个例子是，Elasticsearch的客户端在询问Elasticsearch是不是含有数据，可是对应的Elasticsearch集群已经被删除了，这个时候就没有必要无限次的问下去，因为对方已经不存在了。

## 如何测试

可是怎么测试这个退避呢？我们先看看akka的逻辑，也就是这个DocumentCreator的逻辑，它是我们要测试的对象。

```java
public class DocumentCreator extends AbstractActor {
  ...

  @Override
  public Receive createReceive() {
    return receiveBuilder()
        .match(CreateDocumentRequest.class, this::createDoc)
        .build();
  }

  @Override
  public void preStart() throws Exception {
    super.preStart();
    logger.info("Starting actor");
    self().tell(request, ActorRef.noSender());
  }

  private void createDoc(CreateDocumentRequest request) {
    logger.info("Creating document for user {}", request.user());
    var response = externalServiceClient.createDocument(request);

    // only submit successful response, failure will be retried
    managerRef.tell(response, self());
  }
}
```

大家可以看出来它的逻辑很简单，它启动的时候给自己发一封信，类型是CreateDocumentRequest。当它收到这封信的时候，它呼叫外部服务去创建一个文档。创建成功的话，返回一个response。如果创建失败的话，那就会抛出一个异常。为了简化这个例子，我们没有处理异常。异常留给Akka的监督机制（supervisorStategy）去处理。

好了，所以怎么测试呢？这里我的想法是通过Mockito把第三方的服务mock掉，然后让它抛出特定的异常值TooManyRequestsException。这样，我们就可以测试退避的机制了。然后，我们把这个假的第三方服务注入到我们要测试的actor，也就是我们的文档创建者（DocumentCreator）。注入并启动这个actor后，这个actor会自动执行创建文件的逻辑（因为我把它写在prestart里面了）。然后我们就期待它一直不会返回任何正确的response：

```java
@Test
@Timeout(60) // avoid incorrect implementation
void exceptionBackoff_TooManyRequestsException() {
  // Given
  var count = new AtomicInteger();
  when(externalServiceClient.createDocument(any()))
      .thenAnswer((Answer<CreateDocumentResponse>) invocation -> {
          throw new TooManyRequestsException("" + count.getAndIncrement());
      });
  var maxBackOff = Duration.ofSeconds(3);

  // When
  system.actorOf(
      DocumentCreator.propsWithBackoff(
          externalServiceClient,
          testKit.getRef(),
          new CreateDocumentRequest("Tom"),
          Duration.ofMillis(1),
          maxBackOff,
          MAX_RETRIES));

  // Then
  testKit.expectNoMessage(maxBackOff);
  // initial (1) + retries (N)
  assertThat(count.get()).isEqualTo(1 + MAX_RETRIES);
}
```

结果测试通过了，真的没有返回任何response。而且我们有在mock里面设置了一个计数器，记录到底抛出了多少个异常。然后得到的结果是比最大重试次数多一个，也就是一开始失败了。然后重试N次也都失败了。全部加起来，一共失败了N+1次。其实怎么测试不是重点，重点是想让大家理解思路。如果对代码有兴趣的同学可以去我的GitHub里看，都放在上面了。链接在文末。

## 应用场景

那什么情况下适合运用退避技术呢？总体上来说，我认为数据量大的服务应该使用退避技术，这个可以减轻对方服务的峰值负荷。如果要通过网络来交互，也可以考虑退避技术。还有跟业务逻辑无关的错误可以考虑退避技术。这么说可能有点抽象，让我来举几个实例吧！

* 第三方API请求。如果API调用次数过多，容易被对方限流（rate limited）。被限制以后再发也没用，反而可能延长冷却时间，得不偿失。这个时候适合使用退避技术。
* 数据库操作。有时候数据库由于网络问题，连接超时。这个时候可以考虑退避。或者说数据库又异常，集群丢失了一个或多个节点，剩余节点由于要处理的任务很多，压力很大。它可能会拒绝接受新的请求来保护自己。这个时候，作为数据库的使用者，我们的服务如果有退避技术，可以缓解当时的压力，避免雪上加霜。
* 前端退避。前端app与后端交流时，如果后端已经无法反应（5xx错误），使用退避技术可以缓解局面。

上文指的“对方服务”，也不一定说是别人公司的第三方服务。它也可能是同个公司别人组的服务，可能是自己组的另一个服务。这里主要想强调我们是这个服务的客户端（client）。另外，退避也不是万能的。它只能够使得对方服务的负荷更平滑，但是不能够从根本上解决负荷很大的问题。关于负荷很大的问题，大家有兴趣的话，我们可以下次讲。

## 如何监控

如果退避做得好的话，可以避免一些不必要的线上事故，也能提高用户体验。如果从可观测性（observability）的角度，我们可以如何观测退避呢？我觉得可以先不急着回答这个问题，先明白观测的目的。观测退避本身不是目的，它只是一个手段而已。目的是为了更快、更准确地发现问题。这么一想，目标就明确了。我们可以按照服务器、客户端、网络三方面来说。

服务器的话，主要是保证它不要过载，不要超负荷运作。那么如果是数据库的话，可以看连接的个数、查询写入的个数、内存、硬盘的读写、CPU、集群状态等等。客户端的话，我们可以看请求的总个数，错误个数和错误率，尤其是需要退避的错误的个数和错误率。对实时数据有要求的应用，我们也可以看由于退避引起的对于上下游的实时影响：延迟、百分比、客户方面的端到端（end-to-end）的影响等。网络方面，如果是基于TCP，可以看看总量，延迟，重传（retransmissions）等。刚才说到的主要是数据点/指标（metrics）。当然也可以看看日志，看错误的类型、频率、造成的后果等等。

监控这个事其实没有标准答案，可以视乎app的情况制定和完善。

## 拓展

_除了Akka，那么有没有别的框架有退避？_

我相信大部分框架都是有的。我自己经历过有两个例子，跟大家分享一下。

第一个是Kubernetes。当启动一个pod的时候，启动有可能会失败。这个时候Kubernetes会不断地重试。一个简单的例子就是你的Docker Image是从Docker官方的Registry下载的，然后下载次数太多又没给钱，他们就不乐意了。这个时候，作为第三方服务的Docker公司对你限流，然后无法下载Docker Image，于是无法启动pod。然后Kubernetes会迟一点再重试。当然，也有可能是不可恢复的错误，那么Kubernetes会不断重试，然后在某一时刻，pod会进入CrashLoopBackOff的状态。具体原因可以通过“kubectl describe”看到。

第二个是Temporal。Temporal是一个比较新的devops工具，做workflow自动化的。它的每一个job的每一个步骤，也就是他们所说的每个activity，都有退避技术。当acitivity抛出异常的时候，默认是重试的。然后如果是workflow自己，也就是job自己抛出异常的话不会重试。如果略读以下的Go文件，你可以看出我们上文提到的那些参数：

```go
// RetryPolicy defines the retry policy.
RetryPolicy struct {
    // Backoff interval for the first retry. If coefficient is 1.0 then it is used for all retries.
    // Required, no default value.
    InitialInterval time.Duration

    // Coefficient used to calculate the next retry backoff interval.
    // The next retry interval is previous interval multiplied by this coefficient.
    // Must be 1 or larger. Default is 2.0.
    BackoffCoefficient float64

    // Maximum backoff interval between retries. Exponential backoff leads to interval increase.
    // This value is the cap of the interval. Default is 100x of initial interval.
    MaximumInterval time.Duration

    // Maximum number of attempts. When exceeded the retries stop even if not expired yet.
    // If not set or set to 0, it means unlimited
    MaximumAttempts int32

    // Non-Retriable errors. This is optional. Temporal server will stop retry if error type matches this list.
    // Note:
    //  - cancellation is not a failure, so it won't be retried,
    //  - only StartToClose or Heartbeat timeouts are retryable.
    NonRetryableErrorTypes []string
}
```

如果你对Akka本身感兴趣的话，建议看看官方英语版的原文[“Classic Fault Tolerance - Delayed restarts for classic actors”](https://doc.akka.io/docs/akka/current/fault-tolerance.html#delayed-restarts-for-classic-actors)。里面有提到别的退避技术以及更多的退避参数。你也可以在我的Github项目[minong-h/java-examples](https://github.com/mincong-h/java-examples/tree/blog/akka-backoff/akka)里面的akka文件夹里面找到这篇文章相对应的源代码。

## 结论

在今天的文章里面，我们讨论了什么是指数退避、如何理解它的各个参数、怎么测试它、它的一些应用场景、如何监控、以及指数退避在别的框架中的实现。谢谢大家读完，希望这篇文章对你有用！

## 参考文献

* 百度词条贡献者，《二进制指数退避算法》，百度百科，2020年。<https://baike.baidu.com/item/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%8C%87%E6%95%B0%E9%80%80%E9%81%BF%E7%AE%97%E6%B3%95/3405081>
* CG国斌，《Akka 中文指南 - 监督和监控》，Github，2020年。<https://github.com/guobinhit/akka-guide>
* Prodesire，《指数退避（Exponential backoff）在网络请求中的应用》，阿里云，2020年。<https://developer.aliyun.com/article/748634>
* Lightbend，《Classic Fault Tolerance》，Akka Documentation，2021年。<https://doc.akka.io/docs/akka/current/fault-tolerance.html>
* Temporal，《Activities - Retries》，Temporal，2021年。<https://docs.temporal.io/docs/concept-activities/#retries>
