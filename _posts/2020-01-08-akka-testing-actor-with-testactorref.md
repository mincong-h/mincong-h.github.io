---
layout:            post
title:             'Akka: Testing Actor with TestActorRef'
date:              2020-01-08 20:56:26 +0100
categories:        [java-concurrency]
tags:              [java, akka, concurrency]
comments:          true
excerpt:           >
    Unit testing Akka actor with "TestActorRef", which gives you access to
    underlying actor instance and runs the logic synchronously in a
    single-threaded environment.
image:             /assets/bg-board-2450236_1280.jpg
ads:               Ads idea
---

## Overview

This article demonstrates how to use `akka.testkit.TestActorRef` in Akka TestKit.
After reading this article, you will understand the motivation of using
`TestActorRef<T>`, its usage and its limit.

## Motivation

Here is a simple actor `MyActor`: it contains a state `value` and has different
behaviors based on the message of its mailbox. When receiving an "increment"
message, it increments its value; when receiving a "decrement" message, it
decrements its value; when receiving a "reply" message, it replies to the
sender with the value received.

```java
class MyActor extends AbstractActor {
  final AtomicInteger value = new AtomicInteger(0);

  @Override
  public Receive createReceive() {
    return receiveBuilder()
        .matchEquals("increment", msg -> value.incrementAndGet())
        .matchEquals("decrement", msg -> value.decrementAndGet())
        .matchEquals("reply", msg -> sender().tell(value.get(), self()))
        .build();
  }
}
```

Testing this with Akka `TestKit` is not easy. You have to send a message from a
test kit and assert the reply. It could be something like:

```java
@Test
public void normalReplyTesting() {
  // Given an actor under test
  Props props = Props.create(MyActor.class);
  TestActorRef<MyActor> myActor = TestActorRef.create(system, props);
  // And a test kit
  TestKit probe = new TestKit(system);

  // When asking for reply
  myActor.tell("reply", probe.getRef());

  // Then the reply is returned
  probe.expectMsgEquals(Duration.ofSeconds(2), 0);
}
```

It works for message "reply" but it does not work for message "increment" or
"decrement" because when those messages are received, `myActor` will not reply
to the sender --- only the state of the actor is changed. Also, the test kit
cannot initialize the actor with a predefined state. While this is good in
production for its strong encapsulation, it makes unit testing hard. That's why
`TestActorRef` can be a good alternative for unit testing.

## Create Actor

The following code snippet demonstrates how to create
an actor using actor configuration object `Props` for the actor under
test and an existing actor system:

```java
Props props = Props.create(MyActor.class);
TestActorRef<MyActor> ref = TestActorRef.create(system, props);
```

There are also overloaded methods available such as:

```java
TestActorRef<T> create(ActorSystem system, Props props);
TestActorRef<T> create(ActorSystem system, Props props, String name);
TestActorRef<T> create(ActorSystem system, Props props, ActorRef supervisor);
TestActorRef<T> create(ActorSystem system, Props props, ActorRef supervisor, String name);
```

## Get Underlying Actor

The underlying actor `T` can be retrieved from `TestActorRef#underlyingActor`.
Then, you can access to its states (class attributes) and its methods for
testing purpose.

```java
MyActor a = ref.underlyingActor();
```

Note that when using `TestActorRef`, the messages sent to the actor are
process synchronously on the current thread and answers may be sent back as
usual. One command use-case is setting up the actor into a specific internal
state before sending the test message. Another command use-case is to verify
correct internal state transitions after having sent the test message.

```java
@Test
public void decrement() {
  Props props = Props.create(MyActor.class);
  TestActorRef<MyActor> ref = TestActorRef.create(system, props);
  /*
   * Note: one common use case is setting up the actor into a
   * specific internal state before sending the test message.
   */
  ref.underlyingActor().value.set(1);

  /*
   * Note: messages sent to the actor are process synchronously on
   * the current thread and answers may be sent back as usual.
   */
  ref.tell("decrement", ActorRef.noSender());

  /*
   * Note: another is to verify correct internal state transitions
   * after having sent the test message.
   */
  assertEquals(0, ref.underlyingActor().value.get());
}
```

`TestActorRef` extends class `ActorRef`, so you can use the methods defined by
`ActorRef` as in other Akka tests. The limit of this solution is that it cannot
test the communication between actors, scheduling, etc. You need to think about
asynchronicity again and use `TestKit` for that.

## Conclusion

In this article, I demonstrated how to use TestActorRef to test your actor,
including creation and retrieving the underlying reference. The source code is
available on
[GitHub](https://github.com/mincong-h/java-examples/blob/blog/2020-01-08-TestActorRef/akka/src/test/java/io/mincongh/akka/TestActorRefTest.java).
I also recommend you to read the official Akka documentation: [Testing Classic
Actors](https://doc.akka.io/docs/akka/current/testing.html) for more
information. Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Akka authors, "Testing Classic Actors", _Akka_, 2019.
  <https://doc.akka.io/docs/akka/current/testing.html>
