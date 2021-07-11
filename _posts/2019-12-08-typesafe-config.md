---
layout:            post
title:             Typesafe Config Introduction
lang:                en
date:              2019-12-08 17:58:50 +0100
categories:        [tech]
tags:              [java, config]
permalink:         /2019/12/08/typesafe-config/
comments:          true
excerpt:           >
    Typesafe Config library: its basic structure, loading mechanism, parsing,
    substitutions, merging, inclusion, unit format support, IDE plugin, and more.
image:             /assets/bg-anthony-roberts-82wJ10pX1Fw-unsplash.jpg
cover:             /assets/bg-anthony-roberts-82wJ10pX1Fw-unsplash.jpg
ads:               Ads idea
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Recently I discovered an awesome Java library about configuration --- [Typesafe
Config](https://github.com/lightbend/config). It supports Java properties, JSON
and a human-friendly JSON superset. It can load resources from different places: files,
URLs, classpath. It supports types, loading convention, substitutions,
properties merging, etc. It's why I'm very excited to show what I learned to you.
After reading this article, you will understand:

- The basic structure of the configuration
- Its loading mechanism and different ways of parsing
- Substitution
- Include
- Unit format support
- IDE support

Let's get started.

## Dependency

If you want to use Typesafe Config in Java project via Maven, you can do:

```xml
<dependency>
  <groupId>com.typesafe</groupId>
  <artifactId>config</artifactId>
  <version>1.4.0</version>
</dependency>
```

## Basic Structure

Here are some examples of the basic usage of Typesafe Config. It supports
types such as integer, long, boolean, double, string, list and object.
There are two ways to write comments: using either `//` or `#`. Comments can be
written inline at the tail of the line or they can be written in separated lines.
More advanced features are presented in the following sections.

```
// This is a comment
# This is a comment, too

myInteger: 1234
myBoolean: true
myDouble: 1.000
myString: Hello

myList: [1, 2, 3]

userA {
  firstName: Mincong
  lastName: Huang
}
userB { firstName: Foo, lastName: Bar }
userC { firstName = Foo, lastName = Bar }
```

**Type support.** Configuration instance can retrieve the field value using
syntax `getXxx("key")`, where `Xxx` is the type of the field value, such as
getBoolean(), getInt(), getLong(), getDouble, getString(). If the target is
a list, you can do `getXxxList("key")`, such as getBooleanList(), getIntList(),
getLongList(), getDoubleList(), getStringList().

**Flexibility**. Typesafe Config uses interface `com.typesafe.config.Config` to
represent configuration. Retrieving a sub-tree of the given `Config` returns
another `Config`. This is very flexible. It allows you to define
configuration anywhere in your code with minimal knowledge of the whole
configuration structure. Therefore, the source code is well decoupled from the
configuration. It has many benefits, such as having different configuration
structures based on different implementations or making tests easy to write.

**Immutable.** `com.typesafe.config.Config` is
immutable, whenever you want to change something, it creates a new instance for
you. It means it is safe to use even in a multi-threaded situation.

## Loading Mechanism

You can use `ConfigFactory#load()` to loads the available configuration.
According to the official documentation, the [standard
behavior](https://github.com/lightbend/config#standard-behavior) loads the
following (first-listed are higher priority):


- system properties
- "application.conf" (all resources on classpath with this name)
- "application.json" (all resources on classpath with this name)
- "application.properties" (all resources on classpath with this name)
- "reference.conf" (all resources on classpath with this name)

The idea is that libraries and frameworks should ship with a `reference.conf`
in their jar. Applications should provide an `application.conf`, or if they
want to create multiple configurations in a single JVM, they could use
ConfigFactory.load("myapp") to load their own `myapp.conf`.

Beside method `ConfigFeature#load()`, you can also use the following methods to
create a config object. They are convenient for tesing:

```java
// Create Config from String
Config c = ConfigFactory.parseString("foo: bar");
```

```java
// Create Config from Map<String, ?>
Config c = ConfigFactory.parseMap(myMap);
```

```java
// Create Config from File
Config c = ConfigFactory.parseFile(myFile);
```

```java
// Get an empty Config
Config c = ConfigFactory.empty();
```

## Substitution

Another powerful feature of Typesafe config is its substitution. It helps you to
avoid duplicating your logic. For example:

```
user {
  firstName: Mincong
  lastName: Huang
  fullName: ${user.firstName} ${user.lastName} // Mincong Huang
}
```

You can also take advantage of this for "inheritance" or optional system or
environment variable overrides.

## Include

Typesafe Config allows you to store configuration into separated files and use
`include` keyword to include configuration of those files. Here is a concrete
example for `myApp` which relies on the configuration of `moduleA` and `moduleB`.

```
$ tree .
.
├── moduleA.conf
├── moduleB.conf
└── myApp.conf

0 directories, 3 files
```

```
# file: moduleA.conf
moduleA {
  msg: "Hello from Module A"
}
```

```
# file: moduleB.conf
moduleB {
  msg: "Hello from Module B"
}
```

```
# file: myApp.conf
include "moduleA"
include "moduleB"

app {
  msg: "Hello from App"
}

// Results:
//   app.msg     => "Hello from App"
//   moduleA.msg => "Hello from Module A"
//   moduleB.msg => "Hello from Module B"
```

`include` feature merges the root object of the referenced object into the current
one. If a key in the included object occurred before the include statement in
the including object, the included key's value overrides or merges with the
earlier value, exactly as with duplicate keys found in a single file. When
including file, extensions (`.conf`, `.json`, `.properties`) are not
needed. You can also include configuration from URL or classpath. See [the HOCON spec](https://github.com/lightbend/config/blob/master/HOCON.md#includes) for more
detail.

## Unit Format

Typesafe Config supports unit form: Duration, Memory Size, and Period.

```
delay = 10 minutes
```

**Duration.**
Gets a value as a duration in a specified
[TimeUnit](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/TimeUnit.html).
If the value is already a number, then it's taken as milliseconds and then
converted to the requested TimeUnit; if it's a string, it's parsed understanding units
 suffixes like "10m" or "5ns" as documented in the
[HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) spec.

Java                  | Unit
:-------------------- | :-----------------------
TimeUnit.MILLISECONDS | ms, millis, milliseconds
TimeUnit.MICROSECONDS | us, micros, microseconds
TimeUnit.NANOSECONDS  | ns, nanos, nanoseconds
TimeUnit.DAYS         | d, days
TimeUnit.HOURS        | h, hours
TimeUnit.SECONDS      | s, seconds
TimeUnit.MINUTES      | m, minutes

There are two ways to retrieve a duration in Java: either use
`Config#getDuration(String)` or `Config#getDuration(String, TimeUnit)`. The
first one returns a `java.time.Duration` and the second one returns a long value
corresponding to the requested time unit.

```java
config.getDuration("delay"); // Duration.ofMinutes(10)
config.getDuration("delay", TimeUnit.MINUTE); // 10
```

Now, let's take a look on memory size.

```
minSize = 128K
```

**Memory Size.**
Gets a value as an amount of memory (parses special strings like
"128M"). If the value is already a number, then it's left alone; if it's a string,
it's parsed understanding unit suffixes such as "128K".

For powers of ten, exactly these strings are supported:

Bytes  | Unit
:----- | :---
10 ^ 3 | kB, kilobyte, kilobytes
10 ^ 6 | MB, megabyte, megabytes
10 ^ 9 | GB, gigabyte, gigabytes
10 ^ 12 | TB, terabyte, terabytes
10 ^ 15 | PB, petabyte, petabytes
10 ^ 18 | EB, exabyte, exabytes
10 ^ 21 | ZB, zettabyte, zettabytes
10 ^ 24 | YB, yottabyte, yottabytes

For powers of two, exactly these strings are supported:

Bytes | Unit
:---- | :---
2 ^ 10 | K, k, Ki, KiB, kibibyte, kibibytes
2 ^ 20 | M, m, Mi, MiB, mebibyte, mebibytes
2 ^ 30 | G, g, Gi, GiB, gibibyte, gibibytes
2 ^ 40 | T, t, Ti, TiB, tebibyte, tebibytes
2 ^ 50 | P, p, Pi, PiB, pebibyte, pebibytes
2 ^ 60 | E, e, Ei, EiB, exbibyte, exbibytes
2 ^ 70 | Z, z, Zi, ZiB, zebibyte, zebibytes
2 ^ 80 | Y, y, Yi, YiB, yobibyte, yobibytes

There is other unit format(s), like Period.
For more accurate and up-to-date documentation custom types, see [units format
in the HOCON
spec](https://github.com/lightbend/config/blob/master/HOCON.md#units-format).

## IDE Support 

If you use HOCON files (`*.conf`) in IntelliJ IDEA, you may want to 
use [HOCON Plugin](https://plugins.jetbrains.com/plugin/10481-hocon). Its main
features are syntax highlighting, brace matching and code folding; code
formatting; breadcrumbs; copy reference; move statement up/down; quick
documentation; auto-completion; etc.
See more detail in the [IntelliJ Plugin
page](https://plugins.jetbrains.com/plugin/10481-hocon) or the README of
their [source code](https://github.com/AVSystem/intellij-hocon).

## Conclusion

In this article, I shared with you the basic features of Typesafe Config: its
structure, loading mechanism, substitution, include, unit format support
and IDE support. The source code of this article is available on
[GitHub](https://github.com/mincong-h/java-examples/tree/blog/2019-12-08-config/typesafe-config).
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Roman Janusz, AVSystem, JetBrains, "HOCON Plugins | JetBrains", _JetBrains_.
  <https://plugins.jetbrains.com/plugin/10481-hocon>
- Typesafe Config authors, "HOCON Spec", _Lightend_.
  <https://github.com/lightbend/config/blob/master/HOCON.md>
