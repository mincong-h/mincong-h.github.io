---
layout:      post
title:       "OCA Review 2 - Java Core APIs"
date:        2017-03-04 08:30:00 +0100
categories:  [java, ocajp]
tags:        [java, ocajp]
comments:    true
---

I'm preparing the OCAJP: Oracle Certified Associate Java SE 8 Programmer. Here's
the second review of the certification training. In this review, I'll talk about
the Java Core APIs, including operations of `String`, `StringBuiler`, Arrays,
`ArrayList`, and Java Time in Java 8.

<!--more-->

## Concatenation with String

Placing one `String` before the other `String` and combining them together is
called string _concatenation_. In Java, the concatenation is called by using the
`+` operator. There're several roles to remember for this operator:

1. If both operands are numeric, `+` means numeric addition.
2. If either operand is a `String`, `+` means concatenation.
3. The expression is evaluated left to right.

Here're some examples:

{% highlight java %}
System.out.println(1 + 2);           // 3
System.out.println(1 + 2 + ".");     // 3.
System.out.println("It's " + true);  // It's true
System.out.println("It's " + 1);     // It's 1
System.out.println("It's " + "OK");  // It's OK
{% endhighlight %}

## The String Pool

Since strings are everywhere in Java, they uses up a lot of memory. In some
production applications, they can use up 25-40 percent of the memory in the
entire program. Therefore, JVM optimizes the usage of strings by introducing
the _string pool_ concept: the idea is to reuse the common ones the program in
an internal location of JVM (Java Virtual Machine). **The string pool contains
literal values appeared in the program.** For example, `"name"` is a literal
value, but `myObject.toString()` isn't.

{% highlight java %}
String literal = "name";
String nonLiteral1 = new String("name");
String nonLiteral2 = myObject.toString();
{% endhighlight %}

## Mutability and Chaining of StringBuilder

Previously, we saw the usage of `String`. Actually, `String` is immutable, which
means that if we keep using a lot of strings as intermediate references for
concatenation, it will be very inefficient: almost all of them are immediately
eligible for garbage collection after their creation.

Another solution is to use `StringBuilder`. The class `StringBuilder` is
mutable, and more interestingly, it can be used for chaining multiple
concatenations, which avoids the creation of string interims:

{% highlight java %}
String str = new StringBuilder()
    .append("hello")
    .append("string")
    .append("chaining")
    .toString();
{% endhighlight %}

## Understanding Java Arrays

Now, let's take a look in _Arrays_, an ordered list in Java. It can be created
in several ways:

{% highlight java %}
int[] numbers = new int[3];
int[] numbers = new int[]{1, 2, 3};
int[] numbers = {1, 2, 3};  // only works during asssignment
{% endhighlight %}

We can use `equals()` to compare two arrays because an array is an object.
However, the `equals()` method on arrays does not look at the elements of the
array. As for primitives, their array is still an object.

{% highlight java %}
int one = 1;                // primitive
int[] numbers = {1, 2, 3};  // object
{% endhighlight %}

There're still many things to explore about array, but I can't explain more
here because of the time limit.

## Converting Between Array and List

There're several ways to convert between an array and an `ArrayList`. Now, let's
take a look about how to convert a `List` to an array.

{% highlight java %}
List<String> list = new ArrayList<>();
list.add("one");
list.add("two");
String[] array = list.toArray(new String[0]);  // ["one", "two"]
{% endhighlight %}

You might ask: why we need to specify the size of 0 for the array input, is it
incorrect? Actually, `ArrayList` will create a new array of the proper size for
the return value, if the input size does not fit the return one. Here's the
source code of `ArrayList#toArray(T[] a)` in Java 8:

{% highlight java %}
@SuppressWarnings("unchecked")
public <T> T[] toArray(T[] a) {
    if (a.length < size)
        // Make a new array of a's runtime type, but my contents:
        return (T[]) Arrays.copyOf(elementData, size, a.getClass());
    System.arraycopy(elementData, 0, a, 0, size);
    if (a.length > size)
        a[size] = null;
    return a;
}
{% endhighlight %}

Now, let's take a look how to convert an array to `List` through 3 ways: using
`Arrays#asList(T...)`, `ArrayList`, and Java stream.

{% highlight java %}
String[] wordArray = {"one", "two"};

// 1. using Arrays#asList(T...)
List<String> wordList1 = Arrays.asList(wordArray);
wordList1.remove(1);     // unsupported operation
wordList1.add("three");  // unsupported operation

// 2. using ArrayList
List<String> wordListi2 = new ArrayList<>();
for (String word : wordArray) {
  wordList2.add(word);
}

// 3. using Java stream:
List<String> wordList3 = Stream.of(wordArray).collect(Collectors.toList());
{% endhighlight %}

## Working with Dates and Times

In Java 8, a famous Java Date library—Joda Time—has been integrated into the
built-in package as `java.time`. Thanks to this library, handling date and time
become much easier. Here's a table listing the most important classes we need to
remember:

Class | Date | Time | Time Zone
:--- | --- | --- | ---
`LocalDate` | Yes | No | No
`LocalTime` | No | Yes | No
`LocalDateTime` | Yes | Yes | No
`ZonedDateTime` | Yes | Yes | Yes

## Exam Essentials

In this post, I reviewed the most difficult / tricky part of Java Core APIs,
including operations of `String`, `StringBuiler`, Arrays, `ArrayList`, and Java
Time in Java 8. As for the exam essentials, you need to know about:

- Be able to determine the output of code using `String`.
- Be able to determine the output of code using `StringBuilder`.
- Understand the difference between `==` and `equals`.
- Be able to determine the output of code using `ArrayList`.
- Recognize invalid uses of dates and times.
