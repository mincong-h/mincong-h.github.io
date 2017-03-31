---
layout: post
title:  "OCA Review 1 - Java Basics"
date:   2017-02-23 20:00:00 +0100
categories: [java, weekly, ocajp]
comments:    true
redirect_from:
  - /2017/02/23/things-you-didnt-know-about-java/
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

{% highlight java %}
package aquarium;
public class Water {
  boolean salty = false;
}

package aquarium.jellies;
public class Water {
  boolea salty = true;
}

package employee;
// INSERT IMPORTS HERE
public class WaterFiller {
  Water water;
}
{% endhighlight %}

1. `import aquarium.*;`
2. `import aquarium.Water; import aquarium.jellies.*;`
3. `import aquarium.*; import aquarium.jellies.Water;`
4. `import aquarium.*; import aquarium.jellies.*;`
5. `import aquarium.Water; import aquarium.jellies.Water;`
6. None of these imports can make the code compile.

The answer is 123. Option 1 is correct because it imports all the classes in the
`aquarium` package including `aquarium.Water`. Option 2 and 3 are correct
because they import `Water` by classname. Since __importing by classname takes
precedence over wildcards__, these compile.
