---
layout:              post
type:                Q&A
title:               Change Log Level At Runtime in Logback
subtitle:            >
    How to do that dynamically without restarting your Java application?

lang:                en
date:                2021-12-18 09:02:43 +0100
categories:          [java-core]
tags:                [java, logging]
ads_tags:            []
comments:            true
excerpt:             >
    This Q&A explains how to change logger level dynamically at runtime via
    RESTful API for your Java application when using Logback.

image:               /assets/bg-icons8-team-dhZtNlvNE8M-unsplash.jpg
cover:               /assets/bg-icons8-team-dhZtNlvNE8M-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Question

I have a Java application using [Logback](http://logback.qos.ch/) as
implementation for logging. I want to change log level at runtime for a given
Java package or a given Java class without restarting my Java application. Is
it possible? In particular, I am interested in enable the DEBUG level logs for a
given package a short period of time so that I can troubleshoot issues in
production.

## Answer

One possible solution is to retrieve the logger from logger context and modify
its log level. Let's say that you are uring [SLF4J](http://www.slf4j.org/) as
interface and Logback as implementation, you can do that as follows:

```java
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;

public class LogbackLevelChanger {

  public static void setLevel(String name, Level level) {
    var context = (LoggerContext) LoggerFactory.getILoggerFactory();
    var logger = context.getLogger(name);
    if (logger != null) {
      logger.setLevel(level);
    } else {
      // handle missing logger here
    }
  }
}
```

Then you can expose this method to your RESTful API so that the log level can be
changed remotely at runtime:

```java
@PUT
@Path("/log-level/{name}/{level}")
public void setLogLevel(
    @PathParam("name") String name,
    @PathParam("level") String level) {
  ...
}
```

If you are using this technique for troubleshooting, you may consider adding a
duration for the expiry so that the log level can be reset after the given
duration. This avoid creating additional logs and potentially increase the fee
for logging.

## Going Further

The solution described above is not the only solution. Milind Deobhankar
described [5 ways to change log levels at
runtime](https://dzone.com/articles/5-ways-to-change-the-log-levels-at-runtime)
in his post, including:

1. Using the Spring Boot Admin
2. Scan the logback.xml
3. Access logback.xml via URL
4. Creating API To Change the Log Levels (what we discussed in this post)
5. Pub / Sub -- the application instance needs to subscribe to the topic where log level changes will get published.

It's worth reading if you need more options.

Hope you enjoy this article, see you the next time!

## References

- ["Logback Project"](http://logback.qos.ch/), _Logback_, 2021.
- Milind Deobhankar, ["5 ways to change log levels at
  runtime"](https://dzone.com/articles/5-ways-to-change-the-log-levels-at-runtime),
  _DZone_, 2020.
