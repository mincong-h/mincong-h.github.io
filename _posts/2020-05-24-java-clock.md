---
layout:            post
title:             Controlling Time with Java Clock
date:              2020-05-24 15:27:19 +0200
categories:        [java-core, java-testing]
tags:              [java, date, testing]
comments:          true
excerpt:           >
    Use java.time.Clock to control time in your unit tests. This article will
    mainly focus on usage of fixed clock and offset clock.
cover:             /assets/bg-sonja-langford-eIkbSc3SDtI-unsplash.jpg
ads:               none
---

## Overview

As a Java developer, it's very common to write code related to date and time.
Whenever you need to manage the lifecycle of some objects or keep track of the
key events, you likely need some objects to represent date and time.
Since Java 8, Joda Time became Java Time (JSR-310) and it is now part of the
Java built-in APIs. It provides significant values to the Java community without
the need to add additional dependencies. Today, I'm going to explain
`java.time.Clock`, an essential class for controlling date/time objects in
`java.time`, especially in tests.

After reading this article, you will understand:

- What is a fixed clock?
- What is an offset clock?
- Which APIs accept clock as an input?
- How to go further on this topic?

This article is written in Java 11, but most of the concepts should be available
since Java 8.

## Fixed Clock

A fixed clock is a clock that always returns the same instant. It freezes the
world at a fixed moment. This is useful for testing: asserting any
calculation which uses an instant T as reference. It ensures that the tests do
not depend on the current clock. For example:

* Asserting the code behavior before or after the instant T, such as testing a feature
  flag that will change the code behavior and will be enabled at the instant T.
* Asserting a method which computes the result based on current instant `now`.

```java
// Given a clock fixed at 2020-05-24 14:00:00
var datetime = LocalDateTime.of(2020, 5, 24, 14, 0);
var instant = ZonedDateTime.of(datetime, ZoneId.systemDefault()).toInstant();
var clock = Clock.fixed(instant, ZoneId.systemDefault());

// When asking the "now" via this clock
var now = LocalDateTime.now(clock);

// Then "now" is not now, but 2020-05-24 14:00:00
assertThat(now).isEqualTo(datetime);
```

As you can see, instead of returning the actual "now", local-date-time's
`now(Clock)` returns the local date time instant controlled by the fixed clock,
i.e. 24 May 2020 at 14h00.

## Offset Clock

Offset clock adjusts the underlying clock with the specified duration added or subtracted.
This is useful for testing: asserting any behavior that requires a duration to take effect.
In other words, simulating something in the future or the past. For example:
asserting the cache invalidation after its time-to-live (TTL).

Here is a small class to demonstrate how the clock works: it contains
multiple entries, stored inside an underlying hash-map. You can use `put(String,
Instant)` to put more entries to the cache or using `clearExpired(Clock)` to
clear the expired entries.

```java
class Cache {
  static final Duration TTL = Duration.ofHours(1);
  final Map<String, Instant> cache = new HashMap<>();

  /**
   * Remove expired entries.
   *
   * @param clock clock to control the time
   * @return expired entries being removed
   */
  List<Entry<String, Instant>> clearExpired(Clock clock) {
    var now = Instant.now(clock);
    var it = cache.entrySet().iterator();
    var expired = new ArrayList<Map.Entry<String, Instant>>();

    while (it.hasNext()) {
      var entry = it.next();
      if (entry.getValue().plus(TTL).isBefore(now)) {
        it.remove();
        expired.add(entry);
      }
    }
    return expired;
  }

  void put(String key, Instant value) {
    cache.put(key, value);
  }
}
```

For testing, the challenge is to test the time-to-live (`TTL`) by making some
entries cache expired. Without a clock, this is difficult to achieve. We can use
`Thread.sleep(long)` to make the current thread sleep and wait for one hour...
But this is far from ideal, because not only it increases the execution time of
the tests, but it may also lead to non-deterministic scenarios in some cases.
In other words, it may introduce random failures. On the contrary, using offset
clock just works: it adds exactly 1 hour offset to the system default clock as
shown below.

```java
var clock = Clock.offset(Clock.systemDefaultZone(), Cache.TTL);
```

In this approach, we simulate the future in 1h and test the expiry successfully
without any wait time. Here is how the complete assertion looks like:

```java
// Given a cache with some entries
var instant = Instant.now();
var cache = new Cache();
cache.put("k1", instant);
cache.put("k2", instant);
cache.put("k3", instant.plusSeconds(7_200));

// When removing expired entries from the cache
var clock = Clock.offset(Clock.systemDefaultZone(), Cache.TTL);
var removed = cache.clearExpired(clock);

// Then removed entries contains exactly k1 and k2
assertThat(removed).containsExactly(entry("k1", instant), entry("k2", instant));
```

## APIs

But you may ask: which APIs accept `Clock` as an input parameter? Well, all the
methods which create a `java.time` object, they all accept `Clock` as an alternate clock
for testing. For example: `Instant`, `LocalDate`, `LocalTime`, `LocalDateTime`,
`ZonedDateTime`, `OffsetTime`, `OffsetDateTime`, `Year`, `YearMonth`, ...

## Going Further

Still want to go further from here? Here are some resources that you may be
interested:

- To understand different clocks provided by Java Time, read "Guide to the Java
  Clock Class" on Baeldung.<br>
  <https://www.baeldung.com/java-clock>
- To see more discussions and options about unit testing a class with clock,
  check "Unit testing a class with a Java 8 Clock" on Stack Overflow.<br>
  <https://stackoverflow.com/questions/27067049/>
- Still not familiar with Java Time? See the package summary from Javadoc.<br>
  <https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html>
- To understand the motivation of using Joda Time, check its website.<br>
  <https://www.joda.org/joda-time/>
- To understand the motivation behind dependency injection via Clock, review the
  SOLID principles of object-oriented design on Baeldung, written by Sam
  Millington. Especially the principle "Dependency Inversion" for software
  decoupling.<br>
  <https://www.baeldung.com/solid-principles>

You can also check the source code of this article on
[GitHub](https://github.com/mincong-h/java-examples/blob/blog/java-clock/date/src/test/java/io/mincongh/date/ClockTest.java).

## Conclusion

In this article, we saw how to use a fixed clock and offset clock from
`java.time.Clock` to control the date and time in your tests. A fixed clock
ensures that tests are not dependent on the current clock; an offset clock
simulates an instant in the future or the past. They are useful for writing
tests and avoid increasing execution time or random test failures. All Java Time
classes representing a date/time accept clock as its input parameter.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
