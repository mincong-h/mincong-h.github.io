---
layout:            post
title:             Vavr Jackson 1.0.0 Alpha 3
date:              2020-07-11 21:07:54 +0200
categories:        [java-serialization]
tags:              [java, vavr, jackson]
comments:          true
excerpt:           >
    Release note of Vavr Jackson 1.0.0 Alpha 3.
cover:             /assets/bg-aaron-burden-GFpxQ2ZyNc0-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

Vavr Jackson is a Jackson datatype module for Vavr library.
On July 04, 2020, Vavr Jackson 1.0.0-alpha-3 was released. This post describes
changes that were made between previous version 0.10.2 and the current version 1.0.0-alpha-3.
To use the new version, here is what you need to do in Maven or Gradle.

Maven:

```xml
<dependency>
  <groupId>io.vavr</groupId>
  <artifactId>vavr-jackson</artifactId>
  <version>1.0.0-alpha-3</version>
</dependency>
```

Gradle:

```groovy
compile("io.vavr:vavr-jackson:1.0.0-alpha-3")
```

If you never use it before, it's really simple: you just need to register the Vavr module
into your Jackson object mapper and Vavr Jackson will handle all the
serialization and deserialization of Vavr types for you:

```java
ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(new VavrModule());
```

Now, let's get started to see the changes!

## Testing

**Upgrade to JUnit 5.** The testing framework used by Vavr Jackson had been upgraded from JUnit 4 to
JUnit 5 thanks to the contribution of Edgar Asatryan
([@nstdio](https://github.com/nstdio)). Most of the assertions remain the same,
but it's still very valuable because it helps us to reduce technical debt, make
it possible to use new syntax and new features when writing new tests. The tests are
less verbose because the `public` modifier can be removed from test-cases. Also,
the expected exception pattern `@Test(expected = MyException.class)` is replaced by `assertThrows(...)`, which makes
exception-assertions more explicit.
<https://github.com/vavr-io/vavr-jackson/pull/137>

**Testing Jackson 2.7+.** Vavr Jackson can run with any Jackson version after
Jackson 2.7 (included), but we are missing some versions in our CI. To be 100%
sure we support them, now we are running our tests over all the latest
patch-versions of Jackson 2.7+: 2.7.2 / 2.8.11 / 2.9.10 / 2.10.4 / 2.11.0.
<https://github.com/vavr-io/vavr-jackson/pull/159>

**Testing Java 11 and 14.** Vavr Jackson is compiled with Java 8 and can be used
in Java 8+ environments, but we never tested it before. To more this more
explicit, we added the LTS versions: Java 11 and Java 14 to our CI. To support
this, the Gradle build version had been upgraded from 5.6 to 6.3 as well. <https://github.com/vavr-io/vavr-jackson/pull/151>

## Contextualization

In Jackson, contextualization is an important concept for serialization or
deserialization. It allows serializers and deserializers to be configured via
annotations. For example, if we have a date class `YearMonth` encapsulated by a
VAVR class `Option` as follows, where JSON format is configured outside of
`Option`:

```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-yyyy")
Option<YearMonth> operatingMonth;
```

In this case, without contextualization, the annotation will only be used by
`Option` serializer and deserializer, not
by `YearMonth`, because the context is lost. So serializing a year-month may
result to its ISO-format, which is "yyyy-MM". With contextualization, we can
create a custom serializer or deserializer with configuration preserved. So
serializing a year-month will result in text in the format "MM-yyyy", as specified
by the user. To support this, we implemented two Jackson interfaces,
respectively for VAVR serializers and VAVR deserializers:

- `com.fasterxml.jackson.databind.ser.ContextualSerializer`
- `com.fasterxml.jackson.databind.deser.ContextualDeserializer`

Now, all the serializers and deserializers of VAVR Jackson supports
contextualization: ArraySerializer, LazySerializer, MapSerializer,
MultimapSerializer, OptionSerializer, ArrayDeserializer, LazyDeserializer,
MapDeserializer, MultimapDeserializer, OptionDeserializer,
PriorityQueueDeserializer, SeqDeserializer, SetDeserializer.

Related issue: <https://github.com/vavr-io/vavr-jackson/issues/157>

## Key Comparator

The key comparator used by map-like deserializer was done incorrectly. As a
result, for ordered map-like objects whose keys are the values of an enum, the
default ordering was incorrect. We used alphabetical order instead of the enum
ordinal order. This bug is fixed in the current version.
<https://github.com/vavr-io/vavr-jackson/issues/142>

## Conclusion

In this article, we discussed the changes made in VAVR Jackson 1.0.0 Alpha 3.
You can visit our milestone
[v1.0.0-alpha-3](https://github.com/vavr-io/vavr-jackson/milestone/1?closed=1)
to access the complete list of issues and pull-requests.
If you had any feature request or found any bugs, please reach
us on GitHub by creating an issue:
<https://github.com/vavr-io/vavr-jackson/issues>.
Hope you enjoy this article, see you the next time!
