---
layout:            post
title:             "Logback: Test Logging Event"
lang:                en
date:              2020-02-02 15:46:36 +0100
date_modified:     2020-06-01 22:20:25 +0200
categories:        [java-testing]
tags:              [java, logging, test]
comments:          true
excerpt:           >
    Capture SLF4J + Logback logging events and test them in unit tests using
    ListAppender.
image:             /assets/bg-adrian-korte-5gn2soeAc40-unsplash.jpg
cover:             /assets/bg-adrian-korte-5gn2soeAc40-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In this article, I will explain how to capture Logback logging events and assert
the captured results in unit tests. This article is written using Java 11,
Logback 1.2.3, and SLF4J 1.7.30.
In the next paragraphs, I will create a unit test for asserting my `App` which
says hi by creating logging event:

```java
package io.mincong.logback;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class App {

  private static final Logger logger = LoggerFactory.getLogger(App.class);

  public static void sayHi(String username) {
    logger.info("Hi, {}!", username);
  }
}
```

Note that my application does not use Logback directly, it uses Simple Logging
Facade for Java (SLF4J) and uses Logback as implementation behind the screen.

## Dependency

If you are using Maven, you need the following dependencies for this example
(test dependencies excluded):

```xml
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-core</artifactId>
  <version>1.2.3</version>
</dependency>
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-classic</artifactId>
  <version>1.2.3</version>
</dependency>
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>1.7.30</version>
</dependency>
```

## Test

Here is the code for testing the logging events.

```java
package io.mincong.logback;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import ch.qos.logback.classic.Logger;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

public class AppTest {

  private ListAppender<ILoggingEvent> appender;
  private Logger appLogger = (Logger) LoggerFactory.getLogger(App.class);

  @Before
  public void setUp() {
    appender = new ListAppender<>();
    appender.start();
    appLogger.addAppender(appender);
  }

  @After
  public void tearDown() {
    appLogger.detachAppender(appender);
  }

  @Test
  public void testSayHi() {
    App.sayHi("Java");
    App.sayHi("Logback");

    assertThat(appender.list)
        .extracting(ILoggingEvent::getFormattedMessage)
        .containsExactly("Hi, Java!", "Hi, Logback!");
  }
}
```

First of all, retrieve the logger under test via SLF4J logger factory and cast it into
Logback logger (ch.qos.logback.classic.Logger). Doing so makes it possible to add list appender to the logger.

```java
// org.slf4j.Logger => ch.qos.logback.classic.Logger
Logger appLogger = (Logger) LoggerFactory.getLogger(App.class);
```

Then, create a `ListAppender` which appends logging events
(`ILoggingEvent`). Different from console appender or file appender, list
appender appends the logging events only in memory and stores them into
an array-list. This list appender needs to be registered to the logger under test
`appLogger`:

```java
appender = new ListAppender<>();
appender.start();
appLogger.addAppender(appender);
```

Once done, you can assert the logging events captured by the log appender. The
most commonly used method is `ILoggingEvent#getFormattedMessage`, which returns
the formatted messags. Formatted message are messages having variables injected
into the placeholders of the original message. Other useful methods:

Method | Description | Example
:----- | :---------- | :-----:
`ILoggingEvent#getMessage` | Get original message | "Hi, \{\}!"
`ILoggingEvent#getFormattedMessage` | Get formatted message | "Hi, Java!"
`ILoggingEvent#getLoggerName` | Get logger's name | "io.mincong.logback.App"
`ILoggingEvent#getThrowableProxy` | Get cause | -

The source code of the example above is available on
[GitHub](https://github.com/mincong-h/java-examples/blob/blog/2020-02-02-logback/logback/src/test/java/io/mincong/logback/AppTest.java).

## Conclusion

This article covers the basics of asserting logging events under SLF4J and
Logback. It can verify the correctness of your logging behavior. such as
ensuring the log events are logged; logs are created with the
right level; the cause is included; variables are injected into placeholder; ...
If you want to go further from here, I suggest the following resources for
further reading:

1. Stack Overflow: [Other solutions about intercepting SLF4J with logback logging via a JUnit
   test](https://stackoverflow.com/questions/29076981/)
2. Baeldung: [A Guide to Logback](https://www.baeldung.com/logback)

Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
