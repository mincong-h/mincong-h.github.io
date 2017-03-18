---
layout:      post
title:       'OCA Review 3 - Online Test Chapter 1'
date:        2017-03-11 20:00:00 +0100
categories:  [java, weekly, ocajp]
---

Today, I'm going to review my online test, chapter 1 of Oracle Certified
Associate (OCA), provided by SYBEX. If you need to access to this online
resources, you need to buy their book first. See
<https://sybextestbanks.wiley.com/>.

<!--more-->

<style type="text/css">
  ol { list-style-type: upper-alpha; }
</style>

<p align="center">
  <img
    src="{{ site.url }}/assets/20170311-oca-online-test-chapter-1.png"
    alt="Result of OCA Online Test Chapter 1">
</p>

## Question 8 

Given the following class, which of the following calls print out `Blue Jay`?
(Choose all that apply)

{% highlight java %}
public class BirdDisplay {
  public static void main(String[] name) {
    System.out.println(name[1]);
  }
}
{% endhighlight %}

1. `java BirdDisplay Sparrow Blue Jay`
2. `java BirdDisplay Sparrow "Blue Jay"`
3. `java BirdDisplay Blue Jay Sparrow`
4. `java BirdDisplay "Blue Jay" Sparrow`
5. `java BirdDisplay.class Sparrow "Blue Jay"`
6. `java BirdDisplay.class "Blue Jay" Sparrow`

**The answer is B.** Choice A is wrong because the program takes 3 arguments,
and the argument at index 1, `Blue`, will be printed. Choice B is correct
because `"Blue Jay"` is a string which is considered as one argument. The same
logic: the choice C will print `Jay`; the choice D will print `Sparrow`. As for
choices E and F, they won't work because java uses the compiled class' name
without extension, so `java BirdDisplay.class` is illegal. If you do so, you'll
see the error message:

> Error: Could not find or load main class BirdDisplay.class.

## Question 19

Suppose we have a class named `Rabbit`. Which of the following statements are
true? (Choose all that apply)

{% highlight java linenos %}
public class Rabbit {
  public static void main(String[] args) {
    Rabbit one = new Rabbit();
    Rabbit two = new Rabbit();
    Rabbit three = one;
    one = null;
    Rabbit four = one;
    three = null;
    two = null;
    two = new Rabbit();
    System.gc();
  }
} 
{% endhighlight %}

1. The `Rabbit` object from line 3 is first eligible for garbage collection
   immediately following line 6.
2. The `Rabbit` object from line 3 is first eligible for garbage collection
   immediately following line 8.
3. The `Rabbit` object from line 3 is first eligible for garbage collection
   immediately following line 12.
4. The `Rabbit` object from line 4 is first eligible for garbage collection
   immediately following line 9.
5. The `Rabbit` object from line 4 is first eligible for garbage collection
   immediately following line 11.
6. The `Rabbit` object from line 4 is first eligible for garbage collection
   immediately following line 12.

**The answer is BD.** An object is no longer reachable, i.e. eligible for
garbage collection, when one of two situations occurs:

- The object no longer has any references pointing to it.
- All references to the object have gone out of scope.

So in the question, in line 6, object `one` revoked its reference, but that
rabbit is still referenced by `three` until line 8: so AC are wrong, and B is
correct. As for rabbit `two`, the instance created in line 4 has no reference
immediately following line 9, so D is correct. In line 10, a new instance had
been created, but that is not the same instance as the one created in line 4.

## Question 22

Which of the following are true statements? (Choose all that apply)

1. Java allows operator overloading.
2. Java code compiled on Windows can run on Linux.
3. Java has pointers to specific locations in memory.
4. Java is a procedural language.
5. Java is an object-oriented language.
6. Java is a functional programming language.

**The answer is BE.** C++ has operator overloading and pointers. Java made a
point of not having either. Java does have references to objects, but these are
pointing to an object that can move around memory. Option B is correct because
Java is platform independent. As for option F, while it does support some parts
of functional programming, these occur within a class, so Java is not a
functional programming language.
