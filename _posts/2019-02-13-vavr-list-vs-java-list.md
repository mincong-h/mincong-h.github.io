---
article_num: 99
layout:            post
title:             Vavr List vs Java List
lang:                en
date:              2019-02-13 20:22:57 +0100
categories:        [java-core]
tags:              [java, vavr, functional-programming]
permalink:         /2019/02/13/vavr-list-vs-java-list/
comments:          true
excerpt:           >
    Difference between Vavr List and Java List? I'll compare them via CRUD
    operations, immutability, performance, streaming, and thread safety in
    this article.
image:             /assets/bg-coffee-1030971_1280.jpg
cover:             /assets/bg-coffee-1030971_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Vavr is a functional component library that provides persistent data types and
functional control structures. I started using it recently, and really loved
it! Its simplicity, immutable data types, and the functional programming
concept are really remarkable. In this article, I will introduce Vavr's List,
by doing a comparison with the built-in Java List and its implementations in
Java 8.

After reading this article, you will understand:

- List creation
- Add element
- Get element
- Update element
- Delete element
- List streaming
- From Vavr to Java
- Thread safety

For this article, I'm using Vavr 0.9.3 `io.vavr:vavr:0.9.3`.

## List Creation

In Java 8, you can create a list by calling the constructor of any
implementation of `java.util.List`. Or using a factory method which returns a
list.

```java
// java.util.List
List<String> animals = new ArrayList<>();
List<String> another = new ArrayList<>(animals);
```

```java
List<String> animals = new LinkedList<>();
List<String> another = new LinkedList<>(animals);
```

```java
List<String> animals = Arrays.asList("🐱", "🐶");
```

```java
List<String> animals = Collections.singletonList("🐱");
```

```java
List<String> animals = Collections.unmodifiableList(...);
```

In Vavr, you can create a list using the factory methods of interface
`io.vavr.collection.List`:

```java
// io.vavr.collection.List
List<String> animals = List.of("🐱", "🐶");
List<String> another = List.ofAll(animals);
List<String> empty = List.empty();
```

There're also other factory methods which allow you to create a list of
primitives. But I won't go into more detail here.

## Add Element

In Java, interface `java.util.List` defines method `add(E e)` for adding new
element of type `E` into the existing list. Therefore, all the implementations
of `List` must override the method `add`. The new element will be added at the
end of the list.

```java
// java.util.List
List<String> animals = new ArrayList<>();
animals.add("🐱");
animals.add("🐶");
// "🐱", "🐶"
```

```java
List<String> animals = new LinkedList<>();
animals.add("🐱");
animals.add("🐶");
// "🐱", "🐶"
```

In case of a read-only (immutable) list, an exception will throw when calling
the add method, which is a side-effect. This is tricky because when using
interface `List`, you don't know if the underlying implementation is immutable.

```java
// java.util.List
List<String> animals = Arrays.asList("🐱", "🐶");
animals.add("💥");
// java.lang.UnsupportedOperationException
```

```java
List<String> animals = Collections.singletonList("🐱");
animals.add("💥");
// java.lang.UnsupportedOperationException
```

```java
List<String> animals = Collections.unmodifiableList(Arrays.asList("🐱", "🐶"));
animals.add("💥");
// java.lang.UnsupportedOperationException
```

In Vavr, list does not have `add()` method. It has `prepend()` and `append()`,
which adds a new element respectively before and after the list, and creates a
new list. It means that the original list remains unchanged.

```java
// io.vavr.collection.List
List<String> animals = List.of("🐱", "🐶");
List<String> another = animals.prepend("🙂");
// animals: "🐱", "🐶"
// another: "🙂", "🐱", "🐶"
```

```java
List<String> animals = List.of("🐱", "🐶");
List<String> another = animals.append("😌");
// animals: "🐱", "🐶"
// another: "🐱", "🐶", "😌"
```

This is very similar to the `addFirst()` and `addLast()` methods of
`java.util.LinkedList`.

## Get Element

In Java, getting the element at the specified position in the list can be done
using `get(int)`.

```java
// java.util.List
List<String> animals = Arrays.asList("🐱", "🐶");
animals.get(0)
// "🐱"
```

In Vavr, you can get the first element using `get()` without input params, or
get the element at specific position using `get(int)`. You can also get the
first element using `head()` and get the last element using `last()`.

```java
// io.vavr.collection.List
List<String> animals = List.of("🐱", "🐶");
animals.get();
// "🐱"
animals.head();
// "🐱"
animals.get(1);
// "🐶"
animals.last();
// "🐶"
```

**Performance**. If you're doing "get" operation on a list with high volume of
elements, it's important to consider the performance issue. The "get" operation
with index in Vavr takes linear time to finish: O(N). While for Java lists, some
implementations, like `java.util.ArrayList` takes constant time to do the same
operation; and other implementations, like `java.util.LinkedList` takes linear
time. If you need something faster in Vavr, you might want to consider
`io.vavr.collection.Array`.

## Remove Element

Firstly, let's take a look on removing element.

In Java, removing an element can be done using `List#remove(Object)`. Note that
the input parameter is not parameterized `T`, but `Object`. So you can pass any
object to try to remove it from the list. They don't need to have the same
type. The element will be removed if it is equal to the input object. For more
detail, see [Stack Overflow: Why aren't Java Collections remove methods
generic?](https://stackoverflow.com/q/104799).

```java
List<String> animals = Arrays.asList("🐱", "🐶");
List<String> animals = new ArrayList<>();
animals.add("🐱");
animals.add("🐶");
animals.remove(true); // remove(Object)
// "🐱", "🐶"
animals.remove("🐱");
// "🐶"
```

In Vavr, removing an element can be done using `List#remove(T)`. This method is
defined by `io.vavr.collection.Seq`, which removes the first occurrence of the
given element. Different from Java, it requires the input object has the same
type `T` as the type of elements in the list. Note that list is immutable, and a
new list is returned when doing remove operation.

```java
// io.vavr.collection.List
List<String> animals = List.of("🐱", "🐶");
List<String> another = animals.remove("🐱");
// animals: "🐱", "🐶"
// another: "🐶"
```

Now, let's take a look at removing by index.

In Java, removing an element by index can be done using `List#remove(int)`.
Note that this operation is very tricky when having a list of integer
`List<Integer>` which auto-boxes the primitives.

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(2);
numbers.add(3);
// numbers: 2, 3
numbers.remove(Ingeter.valueOf(1)); // remove(Object)
// numbers: 2, 3
numbers.remove(1); // remove(int)
// numbers: 2
```

In Vavr, removing an element by index is done via another method, called
`removeAt(int)`. It makes the operation more explicit, and avoids error-prone.

```java
List<Integer> numbers = List.of(2, 3);
List<Integer> another = numbers.removeAt(1);
// numbers: 2, 3
// another: 2
```

## Streaming API

In Java, the streaming API is very explicit. From a collection `x`, you can
start a stream using `stream()` method, followed by the operation wished, then
ends with the desired collections using `collect(...)`. There's no shortcut /
default options to make it simpler.

```
x.stream().$OPERATION.collect(...);
```

In Vavr, the stream-like operations are more implicit. You can simply call the
operation and Vavr will transform it to a collection with the same type. Then,
if you need something else, you can convert it using a collector method.

```
x.$OPERATION;
```

For example, in Java:

```java
Arrays.asList("🐱", "🐶")
      .stream()
      .map(s -> s + s)
      .collect(Collectors.toList());
// "🐱🐱", "🐶🐶"
```

```java
Arrays.asList("🐱", "🐶")
      .stream()
      .filter("🐱"::equals)
      .collect(Collectors.toList());
// "🐱"
```

```java
List<String> cats = Arrays.asList("🐱", "🐈");
List<String> dogs = Arrays.asList("🐶", "🐕");
List<List<String>> lists = Arrays.asList(cats, dogs);
List<String> animals = lists.stream().flatMap(Collection::stream).collect(Collectors.toList());
// "🐱", "🐈", "🐶", "🐕"
```

In Vavr:

```java
List.of("🐱", "🐶").map(s -> s + s);
// "🐱🐱", "🐶🐶"
```

```java
List.of("🐱", "🐶").filter("🐱"::equals)
// "🐱"
```

```java
List<String> cats = List.of("🐱", "🐈");
List<String> dogs = List.of("🐶", "🐕");
List<List<String>> lists = List.of(cats, dogs);
List<String> list = lists.flatMap(Function.identity());
// "🐱", "🐈", "🐶", "🐕"
```

## From Vavr to Java

Vavr provides a lot of methods to convert a Vavr collection to Java collection.
This is done by using syntax `toJava*`:

```
toJavaSet()
toJavaList()
toJavaMap()
...
```

## Thread Safety

When developing concurrent Java application, let's important to choose a
thread-safe collections. In Java, you might consider the _synchronized
collections classes_, _concurrent collections_, _blocking queues_ etc.
In Vavr, I believe everything is thread safe since they are immutable.
However, I never had chance to develop complex concurrent application, so I
will not go further in this topic.

## Conclusion

In this article, we compare the differences of list between Java and Vavr: we
discussed the CRUD operations, immutability, transformation (streaming), and
thread safety. Hope you enjoy this article, see you the next time!

## References

- Daniel Dietrich and Robert Winkler, "Vavr User Guide (version 0.9.3) -
  §3.4.3. Performance Characteristics," _www.vavr.io_, Jan. 19, 2019. [Online].
  Available: <http://www.vavr.io/vavr-docs/#_performance_characteristics>
- Chris Mazzola, "Why aren't Java Collections remove methods generic?,"
  _stackoverflow.com_, Sep. 19, 2008. [Online].
  Available: <https://stackoverflow.com/q/104799>
- Yuval Adam, "Properly removing an Integer from a List\<Integer\>,"
  _stackoverflow.com_, Dec. 26 2010. [Online].
  Available: <https://stackoverflow.com/q/4534146>
- Brian Goetz with Tim Peierls et al., _Java Concurrency in Practice_. Addison
  Wesley: 2006.
