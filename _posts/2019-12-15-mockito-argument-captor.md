---
layout:            post
title:             "Mockito: ArgumentCaptor"
date:              2019-12-15 21:03:20 +0100
categories:        [java-testing]
tags:              [java, mockito, testing]
comments:          true
excerpt:           >
    Three ways to create ArgumentCaptor in unit tests (Mockito JUnit Runner,
    annotations, or factory method) and its different usage.
cover:             /assets/bg-romet-tagobert-ytrbFQSJBxw-unsplash.jpg
ads:               Ads idea
---

## Overview

For those who don't know Mockito, [Mockito](https://site.mockito.org/) is the
most popular mocking framework in Java, which allows the creation of mock
objects in unit tests. Today I'm going to share with you one of its powerful
features: `ArgumentCaptor`. After reading this article, you will understand:

- How to create argument captor
- How to use it

This article is written with Mockito 1.10.19. Let's get started.

## Argument Captor

Argument captor captures argument values for further assertions. Mockito
verifies argument values in natural Java style: by using an `equals()` method.
This is also the recommended way of matching arguments because it makes tests
clean and simple. In some situations though, it is helpful to assert on certain
arguments after the actual verification.
Here are two different ways to create an instance of `ArgumentCaptor`: using
annotation `@Captor` or using static method `ArgumentCaptor#forClass`.

The first way to create the argument captor is to use annotation `@Captor`
declared on field. If you are using JUnit 4, you can initialize it with Mockito
JUnit Runner.

```java
@RunWith(MockitoJUnitRunner.class)
public class MockitoArgumentCaptorTest {

  @Captor
  private ArgumentCaptor<String> stringCaptor;

  ...
}
```

If you have already another runner, or you don't like Mockito JUnit Runner, you
can also initialize the argument captor with method
`MockitoAnnotations#initMocks` before each test via set up method `@Before`.

```java
public class MockitoArgumentCaptor2Test {

  @Captor
  private ArgumentCaptor<String> stringCaptor;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);
  }

  ...
}
```

The third way is to use the static method available in Argument Captor class.

```java
ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
```

The parameterized type T is `String` in my examples, it stands for the type of
the argument to be captured.

## Usage

Argument captor captures argument values for further assertions. It means
asserting argument after the actual verification of Mockito. For example, in the
following example, instead of verifying "Foo" is added, we capture the value
into `ArgumentCaptor<String> stringCaptor` and assert it later via method
`#getValue`, which returns "Foo". This can be useful when it's difficult to
construct the actual argument, when you only want to assert the key parts of that
argument, when you believe it increases the readability of the test etc.

```java
List<String> strings = Mockito.spy(new ArrayList<>());
strings.add("Foo");

// actual verification
Mockito.verify(strings).add(stringCaptor.capture());

// assert argument
assertThat(stringCaptor.getValue()).isEqualTo("Foo");
```

Argument captor can capture multiple argument instances. Whenever the method is
called, the argument is captured. After verifications, you can retrieve all the
argument instances captured in order. For example, if it captured two words
"Foo" (earlier) and "Bar" (later), calling method `ArgumentCaptor#getAllValues`
will return "Foo" and "Bar" in order. However, `ArgumentCaptor#getValue` will
return the latest one.

```java
List<String> strings = Mockito.spy(new ArrayList<>());
strings.add("Foo");
strings.add("Bar");

// actual verification
Mockito.verify(strings, times(2)).add(stringCaptor.capture());

// assert last capture
assertThat(stringCaptor.getValue()).isEqualTo("Bar");

// assert all captures
assertThat(stringCaptor.getAllValues()).containsExactly("Foo", "Bar");
```

Sometimes, you will face to more complex cases where the method under test
accepts multiple arguments. In this case, you need to be careful about your
argument captors. Putting argument captor means you want to use argument
matchers. You can NOT use argument matcher in a single parameter, you must use
it on all the parameters. Here is a conterexample:

```java
/*
 ---------------
  /!\ ERROR /!\
 ---------------
 org.mockito.exceptions.misusing.InvalidUseOfMatchersException:
 Invalid use of argument matchers!
 2 matchers expected, 1 recorded:
 -> at io.mincongh.library.mockito.verify.MockitoArgumentCaptorTest.captureOneParam(MockitoArgumentCaptorTest.java:54)

 This exception may occur if matchers are combined with raw values:
     //incorrect:
     someMethod(anyObject(), "raw String");
 When using matchers, all arguments have to be provided by matchers.
 For example:
     //correct:
     someMethod(anyObject(), eq("String by matcher"));
*/
Mockito.verify(strings).add(0, stringCaptor.capture()); // DON'T do this
```

Instead, you need to either capture all the arguments, or use an ANY matcher to
skip the capture. There are similar methods for different primitive types (int,
long, double, boolean, ...), collections (List, Set, ...), and Object. You need
to choose the most appropriated one to your case.

```java
List<String> strings = Mockito.spy(new ArrayList<>());
strings.add(0, "Foo");

// use Matchers#anyInt because we don't want to check the index (0)
// we only care about the value captured
Mockito.verify(strings).add(anyInt(), stringCaptor.capture());
assertThat(stringCaptor.getValue()).isEqualTo("Foo");
```

## Conclusion

In this article, I shared two different ways to initialize Argument Captor via
static method or annotations (JUnit Runner or annotations initialization before
each test). The source code is available on
[GitHub](https://github.com/mincong-h/java-examples/tree/blog/2019-12-15-mockito-argument-captor/mock/src/test/java/io/mincongh/library/mockito).
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Wikipedia, "Mockito", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/Mockito>
