---
layout:            post
title:             Write An Actor In Akka
date:              2020-06-20 18:21:23 +0200
categories:        [java-concurrency]
tags:              [java, akka, concurrency]
comments:          true
excerpt:           >
    How to write a new actor in Akka in Java? This post explains actor creation,
    message reception, and testing.
cover:             /assets/bg-coffee-2306471_1280.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Akka (<https://akka.io/>) is a toolkit for building highly concurrent, distributed, and resilient
message-driven applications for Java and Scala. If your project uses Akka, you
probably need to be familiar with actor creation. In this article, I am going to
explain some basic tasks to take care of when creating a new classic actor in Java.

After reading this article, you will understand:

- What is the prerequisite to use classic Akka actors?
- How to create a new Akka actor?
- How to handle message reception and reply to the sender?
- How to write tests?
- How to go further from here?

This article is written with Java 11 and (classic) Akka 2.6. However, please
do not confuse classic actors with typed actors, they are completely different.
This article only focuses
on classic actors. If you're looking for typed actors, please check Akka
documentation instead:
<https://doc.akka.io/docs/akka/current/typed/index.html>. Now, Let's get started :)

## Dependency

To use Akka Classic Actors, you need to use the following dependency in Maven:

```xml
<properties>
  <scala.binary.version>2.12</scala.binary.version>
</properties>
<dependency>
  <groupId>com.typesafe.akka</groupId>
  <artifactId>akka-actor_${scala.binary.version}</artifactId>
  <version>2.6.6</version>
</dependency>
```

Or gradle:

```groovy
versions += [
  ScalaBinary: "2.12"
]
dependencies {
  compile group: 'com.typesafe.akka', name: "akka-actor_${versions.ScalaBinary}", version: '2.6.6'
}
```

## Create An Actor

In the following paragraphs, we are going to write a simple actor to handle the user
subscription of a start-up company. Since this start-up does not have much money, they
just want to store the data in-memory in the actor. To achieve this, you can
create your actor by extending the abstract actor and override the
`createReceive` method:

```java
class UserSubscriptionActor extends AbstractActor {
  private final Set<String> subscribedUsers;

  private UserSubscriptionActor(Set<String> subscribedUsers) {
    this.subscribedUsers = subscribedUsers;
  }

  public static Props props() {
    return Props.create(UserSubscriptionActor.class,
        () -> new UserSubscriptionActor(new HashSet<>()));
  }

  @Override
  public Receive createReceive() { ... }

}
```

Once done, you should be able to create your actor via the factory method
`actorOf()` with the properties of `UserSubscriptionActor`, from the system or
the context:

```java
var actor = actorSystem.actorOf(UserSubscriptionActor.props());
```

```java
var actor = context().actorOf(UserSubscriptionActor.props());
```

Do not create an actor by calling its constructor directly as normal Java class.
An actor-initialization exception will be thrown if you do so:

```java
/*
 * /!\ Don't do this.
 *
 * akka.actor.ActorInitializationException: You cannot create an instance
 * of [io.mincongh.akka.WritingAnActorTest$UserSubscriptionActor]
 * explicitly using the constructor (new). You have to use one of the
 * 'actorOf' factory methods to create a new actor. See the documentation.
 */
new UserSubscriptionActor(new HashSet<>());
```

You have to use one of the `actorOf` factory methods to create a new actor.
The official documentation suggests to provide static factory methods for each
`Actor`. It helps to keep the creation of `Props` close to the actor definition
and avoid argument mismatch.

```java
// static factory method 1
public static Props props() {
  return Props.create(UserSubscriptionActor.class,
      () -> new UserSubscriptionActor(new HashSet<>()));
}

// static factory method 2 (for testing)
public static Props props(Set<String> subscribedUsers) {
  return Props.create(UserSubscriptionActor.class,
      () -> new UserSubscriptionActor(subscribedUsers));
}
```

## Receive Messages

To receive messages, the actor needs to override method `createReceive()` which
defines which messages the Actor can handle, along with the implementation of
how the messages should be processed. One possible solution is to use
`ReceiveBuilder` to build the receive. For example, to ensure that our actor can
subscribe, unsubscribe, and list subscriptions, we can create the receive as
follows:

```java
@Override
public Receive createReceive() {
  return receiveBuilder()
      .match(Subscribe.class, this::onSubscribe)
      .match(Unsubscribe.class, this::onUnsubscribe)
      .matchEquals("list-subscriptions", this::onList)
      .matchAny(this::onUnknown)
      .build();
}
```

Each `match*` method describes one type of message to match and a function to
handle these messages. Here we have 4 different cases: when receiving a message
of type `Subscribe.class`, when receiving a message of type `Unsubscribe.class`,
when receiving a message equals to `list-subscriptions`, when any other messages
arrive.

Method             | Description
:----------------- | :---------------
`match(...)`       | Match class type
`matchEquals(...)` | Match object
`matchAny(...)`    | Match anything

Another way to handle message reception is to use `UntypedAbstractActor`. But we
are not going to discuss this here. Seach "UntypedAbstractActor" in Akka
documentation: <https://doc.akka.io/docs/akka/current/actors.html>, it should give
you relevant results.

Note that messages sent to Akka actor should be immutable so that they can be
freely shared in multi-thread environment (Akka system). You can create
immutable objects by yourself, or you can rely on frameworks like
[Immutables](https://github.com/immutables/immutables), [Auto
Value](https://github.com/google/auto/tree/master/value), or
[Lombok](https://github.com/rzwitserloot/lombok).

## Reply

To reply to the sender, we can send the reply as follows:

```java
sender().tell(reply, self());
```

The syntax looks a bit difficult to understand (at least for me). But it's not
that difficult, to be honest. It means that a `reply` will be sent (`tell`) to
the `sender()`. This specific message is sent by the current actor (`self()`).
To dig a bit deeper into detail:

- `sender()` is the reference of the sender actor of the last received message.
  By "reference of the actor", it means that we don't get the actual class of
  that actor, but its reference as `ActorRef`.
- `reply` can be any object that you want to send
- `self()` is the reference of the current actor. You want to provide it if you
  want the original sender to know your reference. Otherwise, you can replace it as
  `ActorRef.noSender()`.

Besides replying to the sender, you can also send a message to another actor. This
is completely fine. But you need to design your message flow carefully to make
it meaningful and easy-to-understand.

## Testing

One possible solution for testing is to use Akka `TestKit`. You can send
message to the target actor and assert its reply.
Before going futher, let's install the dependency first.
To use Akka Testkit, you need to add the following dependency to your project:

```xml
<!-- Maven -->
<properties>
  <scala.binary.version>2.12</scala.binary.version>
</properties>
<dependency>
  <groupId>com.typesafe.akka</groupId>
  <artifactId>akka-testkit_${scala.binary.version}</artifactId>
  <version>2.6.6</version>
  <scope>test</scope>
</dependency>
```

```groovy
// Gradle
versions += [
  ScalaBinary: "2.12"
]
dependencies {
  test group: 'com.typesafe.akka', name: "akka-testkit_${versions.ScalaBinary}", version: '2.6.6'
}
```

Briefly speaking, you need 3 things to make the test work: an Akka system, the
test kit, and the actor under test. Akka system is the environment where both
actors (test kit and target actor) are running. Test kit is served as a client
who sends the message and asserts the reply later.
The message flow is simple and can be represented as:

```
            send
TestKit   -------->  UserSubscriptionActor
(sender)  <--------       (receiver)
            reply
```

In JUnit 5, the test can be written as follow:

```java
class WritingAnActorTest {

  private ActorSystem system;
  private TestKit probe;

  @BeforeEach
  void setUp() {
    system = ActorSystem.create();
    probe = new TestKit(system);
  }

  @AfterEach
  void tearDown() {
    TestKit.shutdownActorSystem(system);
  }

  @Test
  void subscribeAndUnsubscribe() {
    // Given an actor under test
    var actor = system.actorOf(UserSubscriptionActor.props());

    // When asking to subscribe
    actor.tell(new Subscribe("Foo"), probe.getRef());

    // Then subscription is successful
    probe.expectMsg("Subscription succeed for user Foo");

    // When asking to unsubscribe
    actor.tell(new Unsubscribe("Foo"), probe.getRef());

    // Then un-subscription is successful
    probe.expectMsg("User Foo unsubscribed");
  }
}
```

Akka Testkit provides methods for message assertions or ignoring.
These variant methods are different in terms of waiting duration, assertion bound
(exact-match, type-match), frequency (once, N times), condition (predicate,
supplier), etc. They are not covered by this post. You can see more tricks about
Akka testing in official documentation: "Testing Classic Actors"
<https://doc.akka.io/docs/akka/current/testing.html>.

## Going Further

How to go further from here?

- To learn more about classic actors, read the official documentation of Akka:
  "Classic Actors"<br>
  <https://doc.akka.io/docs/akka/current/actors.html>
- To learn the new typed actors, read the official documentation of Akka:
  "Actors"<br>
  <https://doc.akka.io/docs/akka/current/typed/index.html>
- To learn more about testing in classic actors, read the official documentation
  of Akka: "Testing Classic Actors"<br>
  <https://doc.akka.io/docs/akka/current/testing.html>

You can also visit the source code of this blog on
[GitHub](https://github.com/mincong-h/java-examples/blob/blog/akka-actor/akka/src/test/java/io/mincongh/akka/WritingAnActorTest.java).

## Conclusion

In this article, we saw how to create a new Akka actor and its good practices.
Then, we saw the receive-builder and its matching mechanism. We continued on the
message reply, and finally, ended up with Akka Testkit, a message-based testing
solution.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Lightbend, "Classic Actors (2.6.6)", _Akka_, 2020.<br>
  <https://doc.akka.io/docs/akka/2.6.6/actors.html>
