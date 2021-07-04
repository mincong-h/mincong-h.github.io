---
layout:            post
title:             "Mockito: 3 Ways to Init Mock in JUnit 5"
lang:                en
date:              2020-04-19 17:25:16 +0200
categories:        [java-testing]
tags:              [mockito, java, testing, junit]
comments:          true
excerpt:           >
    Initialize Mockito mock objects in JUnit 5 using MockitoExtension,
    MockitoAnnotations#initMocks, or Mockito#mock.
image:             /assets/bg-edward-howell-hYcriIw0gHc-unsplash.jpg
cover:             /assets/bg-edward-howell-hYcriIw0gHc-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today, I will share with you three different ways to initialize mock objects in
JUnit:

- `MockitoExtension`
- `MockitoAnnotations#initMocks`
- `Mockito#mock`

I will share not only the source code, but also their advantage and
inconvenience to let you better choose which approach is the best for you.
This article is written with JUnit 5.6.2 and Mockito 2.28.2.

## Prerequisites

To use the core features of Mockito 2, you need to import the following
dependency into your Maven project:

```xml
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-core</artifactId>
  <version>2.28.2</version>
  <scope>test</scope>
</dependency>
```

## MockitoExtension

In JUnit 4, Mock objects can be created using Mockito JUnit Runner.
In JUnit 5, "Runner", "TestRule", and "MethodRule" extension points, available
in JUnit 4, are replaced by the Extension API. You can register the Mockito
extension via `@ExtendWith`. The Mockito extension:

- Initializes mocks annotated with `@Mock`, so that explicit usage of
  `MockitoAnnotations#initMocks(Object)` is not necessary. Mocks are
  initialized before each test method.
- Validates framework usage after each test method.
  See the Javadoc of [Mockito#validateMockitoUsage()][validateMockitoUsage]

[validateMockitoUsage]: https://site.mockito.org/javadoc/current/org/mockito/Mockito.html#validateMockitoUsage()

But before doing so, you need to add an additional dependency to your project:

```xml
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-junit-jupiter</artifactId>
  <version>2.28.2</version>
  <scope>test</scope>
</dependency>
```

Here's an example of how you can use it:

```java
@ExtendWith(MockitoExtension.class)
class BookReaderAnnotationWithExtensionTest {

  @Mock private Book mockedBook;

  private BookReader reader;

  @BeforeEach
  void setUp() {
    reader = new BookReader(mockedBook);
  }

  @Test
  void testGetContent() {
    Mockito.when(mockedBook.getContent()).thenReturn("Mockito");
    assertEquals("Mockito", reader.getContent());
  }
}
```

In JUnit 4, the annotation `@RunWith` can only be used once. It was not a
repeatable annotation. Using `@MockitoJUnitRunner` means you cannot use other
runners anymore. However, In JUnit 5, the annotation `@ExtendWith` is repeatable,
so you can use it without worrying about the exclusivity.

After each test case, Mockito extension validates the framework state to detect
invalid use of Mockito. For example, if you disable the assertion from method
`testGetContent`, you will see the test failed with the following exception:

_"org.mockito.exceptions.misusing.UnnecessaryStubbingException: 
Unnecessary stubbings detected.
Clean & maintainable test code requires zero unnecessary code.
Following stubbings are unnecessary (click to navigate to relevant line of
code):_

  1. _-> at ...testGetContent(BookReaderAnnotationWithExtensionTest.java:38))_

_Please remove unnecessary stubbings or use 'lenient' strictness. More info:
javadoc for UnnecessaryStubbingException class."_

Pros:

- No need for explicit `MockitoAnnotations#initMocks(Object)`
- Validates framework usage after each test method
- Declarative thanks to `@Mock` annotation
- Easy to create mocks
- Easy to read
- Compatible with other extensions because `@ExtendWith` is repeatable.

Cons:

- Additional dependency on `org.mockito:mockito-junit-jupiter`

## MockitoAnnotations.initMocks

Mock objects can be initialized using Mockito annotation `@Mock` and
`MockitoAnnotations#initMocks(Object)`.

```java
// you don't need: @ExtendWith(MockitoExtension.class)
class BookReaderAnnotationWithSetupTest {

  private BookReader reader;

  @Mock private Book mockedBook;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.initMocks(this);
    reader = new BookReader(mockedBook);
  }

  @Test
  void testPrintContent() {
    mockedBook.printContent();
    Mockito.verify(mockedBook).printContent();
  }

  @Test
  void testGetContent() {
    Mockito.when(mockedBook.getContent()).thenReturn("Mockito");
    assertEquals("Mockito", reader.getContent());
  }
}
```

Pros:

- Declarative thanks to `@Mock` annotation
- Easy to read
- Easy to create mocks

Cons:

- Missing framework-usage validation after each test

## Mockito.mock

Create mock object of given class or interface using `Mockito#mock(Class<T>
classToMock)` or its overloaded methods.

```java
class BookReaderClassicMockTest {

  private BookReader reader;
  private Book mockedBook;

  @BeforeEach
  void setUp() {
    mockedBook = Mockito.mock(Book.class);
    reader = new BookReader(mockedBook);
  }

  @Test
  void testPrintContent() {
    mockedBook.printContent();
    Mockito.verify(mockedBook).printContent();
  }

  @Test
  void testGetContent() {
    Mockito.when(mockedBook.getContent()).thenReturn("Mockito");
    assertEquals("Mockito", reader.getContent());
  }
}

```

Pros:

- More control on the mock you need to create
- No need to share mock variables across all test cases as class-variables

Cons:

- More verbose
- Less declarative
- Missing framework-usage validation after each test

## Going Further

How to go further from here?

- To understand more about JUnit 5, read the official user guide<br>
  <https://junit.org/junit5/docs/current/user-guide/>
- See the discussion about how to use Mockito with JUnit 5 on Stack Overflow<br>
  <https://stackoverflow.com/questions/40961057>
- To have a more complete vision about Mockito, read the latest documentation from their Javadoc<br>
  <https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html>

## Conclusion

Today, I shared 3 different ways to initialize mock objects in JUnit 5, using
Mockito Extension (`MockitoExtension`), Mockito Annotations
(`MockitoAnnotation#initMocks`), and the traditional `Mockito#mock`.
The source code of the examples above are available on GitHub
[mincong-h/java-examples](https://github.com/mincong-h/java-examples/tree/blog/2020-04-19-mockito-junit5/mockito/mockito-junit5).
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Mockito, "Mockito framework site", _Mockito_, 2020.
  <https://site.mockito.org/>
