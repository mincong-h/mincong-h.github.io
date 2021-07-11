---
layout:            post
title:             "OCA Review 1 - Java Basics"
lang:                en
date:              2017-02-23 20:00:00 +0100
date_modified:     2020-06-25 21:44:14 +0200
categories:        [java-core]
tags:              [java, oca]
permalink:         /2017/02/23/oca-review-1-java-basics/
comments:          true
image:             /assets/bg-coffee-983955_1280.jpg
cover:             /assets/bg-coffee-983955_1280.jpg
redirect_from:
  - /2017/02/23/things-you-didnt-know-about-java/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

I'm preparing the OCAJP: Oracle Certified Associate Java SE 8 Programmer.
Here're something interesting that I learned from the study guide, chapter 1 and
chapter 2. They're rarely used in our daily mission, but I just wrote them down
for fun.

<!--more-->

## Numeric Literals

Numeric literals is a feature added in Java 7. You can have underscores in
numbers to make them easier to read. You can add underscores anywhere except at
the beginning of a literal, the end of a literal, right before a decimal, or
right after a decimal point.

{% highlight java %}
int million1 = 1000000;
int million2 = 1_000_000;
{% endhighlight %}

## Numeric Promotion

Java may do things that seem unusual to you. In numeric promotion, for example,
smaller data types, namely `byte`, `short`, and `char`, are first promoted to
`int` any time they're used with a Java binary arithmetic operator, even if
neither of the operands is `int`.

{% highlight java %}
short x = 10;
short y = 3;
short z = x * y;  // does not compile!
int z = x * y;    // ok: x and y are promoted to int
{% endhighlight %}

## Optional Label Parameter

The optional label parameter allows us to break out of a higher level outer
loop. For example:

{% highlight java %}
PARENT_LOOP: for (int i = 0; i < 10; i++) {
  for (int j = 0; j < 5; j++) {
    if (i * j == 8) {
      break PARENT_LOOP;
    }
  }
}
{% endhighlight %}

## Implicit Casting in Compound Assignment Operators

Besides the simple assignment operator `=`, there're also numerous _compound
assignment operators_, e.g. `+=` and `-=`. Compound operators are useful for
more than just shorthand—they can also save us from having to explicitly cast a
value. For example, consider the following example, in which the last line will
not compile due to the result being promoted to a `long` and assigned to an
`int` variable. This could be fixed using the compound assignment operator.

{% highlight java %}
// compound assignment operator
int a = 0;
a += 1;

// implicit casting
long x = 10;
int y = 5;
y = y * x; // does not compile!
y *= x;    // ok
{% endhighlight %}

## Precedence of Importing

Given the following classes, which of the following snippets can be inserted in
place of `INSERT IMPORTS HERE` and have the code compile? (Choose all that
apply)

```java
package aquarium;
public class Water {
  boolean salty = false;
}
```

```java
package aquarium.jellies;
public class Water {
  boolea salty = true;
}
```

```java
package employee;
// INSERT IMPORTS HERE
public class WaterFiller {
  Water water;
}
```

1. `import aquarium.*;`
2. `import aquarium.Water; import aquarium.jellies.*;`
3. `import aquarium.*; import aquarium.jellies.Water;`
4. `import aquarium.*; import aquarium.jellies.*;`
5. `import aquarium.Water; import aquarium.jellies.Water;`
6. None of these imports can make the code compile.

The answer is 123. Option 1 is correct because it imports all the classes in the
`aquarium` package including `aquarium.Water`. Option 2 and 3 are correct
because they import `Water` by classname. This is called single-type-import
declaration (JLS §7.5.1). Since importing by classname takes
precedence over wildcards, these statements compile. More precisely, type-import-on-demand
declarations are shadowed by the single-type-import declaration. Option 4
defines two type-import-on-demand declarations, both contain type `Water`:
`aquarium.Water` and `aquarium.jellies.Water`. This is ambiguous so it does not
compile. Similar for option 5.
