---
layout:            post
title:             VAVR HashMap vs Java HashMap
date:              2019-01-15 21:17:34 +0100
categories:        [java-core]
tags:              [java, vavr, functional-programming]
comments:          true
excerpt:           >
    What is the difference between VAVR Collection API and Java Collection API?
    Why should you give it a try? Today, we will start comparing them via Map
    and HashMap, including the map creation, entries iteration, streaming, and
    the side effect.
cover:             /assets/bg-coffee-983955_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

[VAVR][vavr] is a functional component library that provides persistent data
types and functional control structures. I started using it recently, and really
loved it! Its simplicity, immutable data types, and the functional programming
concept are really remarkable. In this article, I will introduce VAVR's HashMap,
by doing a comparison with the built-in Java HashMap in Java 8. 

After reading this article, you will understand:

- Map creation
- Map entries iteration
- Entries streaming
- Side effect

## Map Creation

**With built-in Java Collection API**, you can create an empty HashMap
(`java.util.HashMap`) and put entries into this map. The constructor does not
allow you to provide any entries:

```java
// Java
Map<String, String> map = new HashMap<>();
map.put("cat", "🐱");
map.put("dog", "🐶");
```

**With VAVR Collection API**, you can create an empty HashMap
(`io.vavr.collection.HashMap`), or create a HashMap with entries.

```java
// VAVR
// Solution 1: of
Map<String, String> map = HashMap.of("cat", "🐱", "dog", "🐶");

// Solution 2: ofEntries
map = HashMap.ofEntries(Tuple.of("cat", "🐱"), Tuple.of("dog", "🐶"));

// Solution 3: ofAll
map = HashMap.ofAll(javaMap);
```

## Map Entries Iteration

**With built-in Java Collection API**, you need to use method `Map#entrySet()` to
retrieve the entry set from map. Then, use method `Entry#getKey()` and
`Entry#getValue` to retrieve the key and the value:

```java
// Java
for (Map.Entry<String, String> e : map.entrySet()) {
  System.out.println(e.getKey() + ": " + e.getValue());
}
// "cat: 🐱"
// "dog: 🐶"
```

You might ask, why HashMap does not implement `Iterator` interface?
From dasblinkenlight's answer on this [Stack Overflow question][1], `Map` in
general (and `HashMap` in particular) do not implement `Iterator` because it is
not clear what it should be iterating. There are three choices: Keys / Values /
Entries. None of the three choices above look entirely unreasonable: an argument
can be made in favor of each of these approaches. In the end, the library
designers decided not to make this choice for you, letting programmers pick what
to iterate explicitly.

**With VAVR Collection API**, they make the choice for you. Entries is the choice in
regards to iteration. Entries are represented as two-element tuple in VAVR
(`java.util.function.Function.Tuple2`). Therefore, the iteration looks like:

```java
// VAVR
for (Tuple2<String, String> t : map) {
  System.out.println(t._1 + ": " + t._2);
}
// "cat: 🐱"
// "dog: 🐶"
```
 
## Entries Streaming

In Java, if you want to map objects of type T to objects of type U, you can use
streaming API. No matter what data types you choose,
you need to start a stream, do the mapping, and finally collect the results.
Let's take an example of the previous map.

**With built-in Java Collection API**, you need to choose the entries, start a
stream, apply the map, and collection the results. Although it is explicit,
it is also very verbose:

```java
// Java
List<String> list =
    map.entrySet()
        .stream()
        .map(e -> e.getKey() + ": " + e.getValue())
        .collect(Collectors.toList());
```

**With VAVR Collection API**, you can do the same in one line:

```java
// VAVR
List<String> list = map.map(t -> t._1 + ": " + t._2).toList();
```

This is because VAVR chooses entry-iteration over key-iteration and
value-iteration. So starting a stream is easier. Then, in method `Map#map()`,
the iterator is implicitly called behind the screen. Finally, the toList
collector is made as a shortcut for collecting values.

## Side Effect

**With built-in Java Collection API**, when doing a `Map#get()`, it
returns `null` if this map contains no mapping for the key. This is dangerous
and requires extra caution about it. Either you need to check if the key exists,
or you need to check the null case on the returned value.

```java
// Java
String cat = map.get("cat");
System.out.println(cat.isEmpty());
// false

String duck = map.get("duck");
System.out.println(duck.isEmpty());
// NullPointerException! 💥
```

**With VAVR Collection API**, when doing a `Map#get()`, it returns an
`Option<T>`, which is an equivalent type of `java.util.Optional`. Therefore,
caller is informed about the situation, and understand that there's no guarantee
to find a mapped key.

```java
// VAVR
Option<String> cat = map.get("cat");
if (cat.isDefined()) {
  ...
}
```

## Conclusion

In this article, we learnt a new data type `Tuple`. We compared the usage of
VAVR's HashMap and Java's HashMap, in terms of creation, iteration, streaming,
and side effect. As usual, you can find the source code of this demo on GitHub:
[mincong-h/java-examples -
VAVR](https://github.com/mincong-h/java-examples/tree/master/vavr).
Hope you enjoy this article, see you the next time!

## References

- [VAVR: functional component library that provides persistent data types and
  functional control structures.][vavr]
- [StackOverflow: Reason HashMap does not implement Iterable interface?][1]

[vavr]: https://www.vavr.io
[1]: https://stackoverflow.com/questions/19422365/reason-hashmap-does-not-implement-iterable-interface
