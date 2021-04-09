---
layout:              post
title:               "JUnit 5: Dynamic Tests with TestFactory"
date:                2021-04-09 08:54:59 +0800
categories:          [java-testing]
tags:                [java, junit, junit5, testing]
comments:            true
excerpt:             >
    How to write dynamic tests using @TestFactory in JUnit 5? This article
    explains the syntax, different return types, the test lifecycle, and
    potential use-cases.
image:               /assets/bg-mike-kenneally-tNALoIZhqVM-unsplash.jpg
cover:               /assets/bg-mike-kenneally-tNALoIZhqVM-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
ads:                 none
---

## Introduction

In this article, I am going to share with you how to write dynamic tests
in JUnit 5 using `@TestFactory`. Dynamic testing is a new programming model
introduced in JUnit 5. It is useful to create tests that cannot be defined at
compile time (e.g. loaded via an external resource) or to create tests
that cannot be expressed easily via `@ParameterizedTest`.

After reading this article, you will understand:

* The basic syntax of dynamic test
* Different return types for `@TestFactory`
* The lifecycle of dynamic test
* Checking the result in IDE
* How to go further from here

Now, let's get started!

## Basic Syntax

According to the [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/),
the standard `@Test` annotation in JUnit Jupiter described in Annotations is very
similar to the `@Test` annotation in JUnit 4. Both describe methods that implement
test cases. These test cases are static in the sense that they are fully
specified at compile-time, and their behavior cannot be changed by anything
happening at runtime. Assumptions provide a basic form of dynamic behavior but
are intentionally rather limited in their expressiveness.

In addition to these standard tests, a completely new kind of test programming
model has been introduced in JUnit Jupiter. This new kind of test is a dynamic
test which is generated at runtime by a factory method that is annotated with
`@TestFactory`.

The basic syntax of a dynamic test is:

```java
@TestFactory  // 1
Stream<DynamicTest> dynamicTestStream() {  // 2
  return IntStream.of(0, 3, 6, 9)
      .mapToObj(v ->
          dynamicTest(v + " is a multiple of 3", () -> assertEquals(0, v % 3))  // 3
      );
}
```

In the example above, we specified several things:

1. The annotation `@TestFactory` so that JUnit 5 can recognize this method as a
   test factory containing multiple dynamic tests.
2. The return type of the method is a stream of `DynamicTest`. Note that you
   don't have to use `Stream` and there are other choices. We will talk about
   that in the next section.
3. Use static method `org.junit.jupiter.api.DynamicTest.dynamicTest` to create a
   dynamic test. Each `dynamicTest` consists of two parts: a string for the
   display name and an `Executable` for the assertions.

Once we have them, we can run the test. There is no additional dependency
required. In the following sections, we are going
to explore a bit more into detail different pieces.

## Return Types For Test Factory

In the section above, we saw that we can return a list of dynamic tests as
`Stream<DynamicTest>`:

```java
Stream<DynamicTest> dynamicTests() { ... }
```

But it does not have to be in this way. We can also specify other types for
returning the tests. As far as this type is iterable, JUnit 5 is happy about it.
For example, you can use `Collection`, Iterable`, `Iterator`, `Stream`, or array
of `DynamicTest`. Besides that, you can also consider using `DynamicContainer`
which can contain multiple tests inside it. See [JUnit 5 - User
Guide](https://junit.org/junit5/docs/current/user-guide/) for more
information about that.

## Lifecycle Of Dynamic Tests

The execution lifecycle of a dynamic test is different from the standard `@Test`
case. The lifecycle callbacks, `@BeforeEach` and `@AfterEach`, are _not_
executed for each dynamic test, but the whole `@TestFactory`. Therefore, we
need to be very careful about using class-level variables because they won't be
reset properly.

Stardard `@Test`:

1. Execute `@BeforeEach`
2. Execute `@Test`
3. Execute `@AfterEach`

Dynamic tests via `@TestFactory`:

1. Execute `@BeforeEach`
2. Execute `@TestFactory`
  - Execute dynamic test 1
  - Execute dynamic test 2
  - Execute dynamic test 3
  - ...
3. Execute `@AfterEach`

## IDE

When running dynamic tests in IntelliJ IDEA (2020.3.1), you can find the results
as follows:

![Dynamic tests in IntelliJ IDEA](/assets/20210409-dynamic-test.png)

where each dynamic test has its result and its display name.

## Should We Use Dynamic Tests?

Actually, I prefer using `@ParameterizedTest` over `@TestFactory` because it
has the full lifecycle support (`@BeforeEach` and `@AfterEach`) while the test
factory doesn't. Both of them support display names so it's not a problem.
Usually,
the test cases can be defined at compile-time.

_So why should we dynamic tests?_

I believe there are two reasons: when the tests cannot be expressed at compile-time or when the parameterized tests are not good enough.

1. Runtime test sources. When the tests cannot be expressed at compiled time,
   you may want to load them at runtime. Dynamic tests support this via the
   following methods:

   ```java
   DynamicTest.dynamicTest(String, URI, Executable)
   DynamicContainer.dynamicContainer(String, URI, Stream)
   ```

   Therefore, you can pass the sources via a URI. It can be something in the
   classpath, in the filesystem, etc.

2. Because parameterized tests are not good enough. This is my test. I wanted to
   use some exceptions as input sources, and assert the exception handling
   mechanism by asserting these exceptions one after another. However, `@ParameterizedTest`
   seems only support basic Java types: primitives or `String`, so passing an
   exception as input is not possible. So I ended up using dynamic tests for
   this purpose.

There are probably other motivations as well. Please let me know what you think
by leaving a comment :)

## Going Further

How to go further from here?

- To learn more about JUnit 5 in general, read [JUnit 5 - User
  Guide](https://junit.org/junit5/docs/current/user-guide/)
- To learn more about JUnit 5 Parmaterized Tests, I have another blog post that
  may interest you [Writing Parameterized Tests in JUnit 5](/2021/01/31/juni5-parameterized-tests/)

You can also see the source code of this article on GitHub under
[mincong-h/java-examples](https://github.com/mincong-h/java-examples/blob/blog/junit5-dynamic-tests/junit5/src/test/java/io/mincong/junit5/dynamic_test/NumberTest.java).

## Conclusion

In this article, we saw how to write dynamic tests via `@TestFactory`, the
different return types for `@TestFactory`, such as `Collection`, `Iterable`,
`Iterator`, array, or `Stream` of dynamic tests. We also see the lifecycle of
dynamic tests, which do not benefit from the `@BeforeEach` and `@AfterEach`
callbacks for each individual dynamic test, how do the results look like in IDE,
and how to go further from here.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- JUnit Team, "JUnit 5 - User Guide", _junit.org_, 2021.
  <https://junit.org/junit5/docs/current/user-guide/>
- Baeldung, "Guide to Dynamic Tests in Junit 5", _baeldung.com_, 2021.
  <https://www.baeldung.com/junit5-dynamic-tests>
- Satish Varma, "Junit 5 dynamic tests @TestFactory with examples",
  _JavaByDeveloper_, 2020. <https://javabydeveloper.com/junit-5-dynamic-tests-testfactory-with-examples/>
