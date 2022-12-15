---
article_num: 28
layout:      post
title:       "OCA Review 7 - Online Test Chapter 5"
lang:                en
date:        "2017-03-21 22:34:47 +0100"
categories:  [java-core]
tags:        [java, oca]
permalink:         /2017/03/21/oca-review-7-online-test-chapter-5/
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, I'm going to review my online test, chapter 5 of Oracle Certified
Associate (OCA), provided by SYBEX. If you need to access to this online
resources, you need to buy their book first. See
<https://sybextestbanks.wiley.com/>.

<!--more-->

<style type="text/css">
  ol { list-style-type: upper-alpha; }
</style>

<p align="center">
  <img
    src="{{ site.url }}/assets/20170321-oca-oneline-test-chapter-5.png"
    alt="Result of OCA Online Test Chapter 5">
</p>

## Question 2

What is the output of the following code?

{% highlight java linenos %}
class Mammal {
  public Mammal(int age) {
    System.out.println("Mammal");
  }
}
public class Platypus extends Mammal {
  public Platypus() {
    System.out.println("Platypus");
  }
  public static void main(String[] args) {
    new Mammal(5);
  }
}
{% endhighlight %}

1. `Platypus`
2. `Mammal`
3. `PlatypusMammal`
4. `MammalPlatypus`
5. The code will not compile because of line 8.
6. The code will not compile because of line 11.

**The answer is E.** The code will not compile because the parent class
`Mammal` does not define no-argument constructor, so the first line of a
`Playtypus` constructor should make an explicit call to `super(int)`. If this
were the case, then the output would be D, because the parent is called first,
then the child constructor is called.

## Question 4

Which statement(s) are correct about the following code? (Choose all that
apply)

{% highlight java %}
public class Rodent {
  protected static Integer chew() throws Exception {
    System.out.println("Rodent is chewing");
    return 1;
  }
  public class Beaver extends Rodent {
    public Number chew() throws RuntimeException {
      System.out.println("Beaver is chewing on wood");
      return 2;
    }
  }
}
{% endhighlight %}

1. It will compile without issue.
2. It fails to compile because the type of the exception the method throws is a
subclass of the type in the parent method throws.
3. It fails to compile because the return types are not covariant.
4. It fails to compile because the method is `protected` in the parent class
and `public` in the subclass.
5. It fails to compile because of a `static` modifier mismatch between the two
methods.

**The answers is CE.** The code does not compile so answer A is wrong. Option B
is wrong because a subclass can throw an exception which is a subclass of the
exception in the parent class. However, a subclass cannot declare an overridden
method **with a new or border exception than in the super class**, since the
method may be accessed using a reference to the superclass. Option C is
correct. The return types are not covariant, in particular, `Number` is not a
subclass of `Integer`. Option D is wrong. A subclass can have a higher
visibility than its parent. Option E is correct. For non-private methods in the
parent class, both methods must use `static` (hide) or neither should use
`static` (override).

## Question 10

Which modifiers are assumed for all interface variables? (Choose all that
apply)

1. All methods within them are assumed to be abstract.
2. Both can contain `public static final` variables.
3. Both can be extended using the `extends` keyword.
4. Both can contain `default` methods.
5. Both can contain `static` methods.
6. Neither can be instantiated directly.
7. Both inherit `java.lang.Object`.

**The answer is BCEF.** Option A is wrong, because an abstract class may
contain concrete method. Since Java 8, interfaces can also contain methods in
form of static of default methods. Option B is true, interface can contain
variables in form of public static final, abstract class can contain variables
too. Option C is correct because interface can be extended by another
interface, and abstract class can be extended by another concrete or abstract
class.Option D is wrong, abstract class cannot contain default modifier. Option
E is correct. Both interface and abstract class require a subclass to be
instantiated, so option F is correct. Java does not support multiple
inheritance for objects, and interface itself does not inherit
`java.lang.Object`.

## Question 14

Which statements are true about the following code? (Choose all that apply)

{% highlight java %}
interface HasVocalCords {
  public abstract void makeSound();
}
public interface CanBark extends HasVocalCords {
  public void bark();
}
{% endhighlight %}

1. The `CanBark` interface does not compile.
2. A class that implements `HasVocalCords` must override the `makeSound()`
method.
3. A class that implements `CanBark` inherits both the `makeSound()` and
`bark()` methods.
4. A class that implements `CanBark` only inherits the `bark()` method.
5. An interface cannot extend another interface.

**The answer is C.** Option A is wrong because when a method is extended from
its parent interface, the methods of the parent interface are inherited
automatically. Option B is wrong because an abstract class which implements
the interface `CanBark` does not need to override its method. This is different
from concrete class. Option C is correct. Option D is wrong. An interface can
extend another interface, so option E is wrong.

## Question 17

What is the output of the following code?

{% highlight java linenos %}
public abstract class Whale {
  public abstract void dive() {};
  public static void main(String[] args) {
    Whale whale = new Orca();
    whale.dive();
  }
}

class Orca extends Whale {
  public void dive(int depth) {
    System.out.println("Orca diving");
  }
}
{% endhighlight %}

1. `Orca diving`
2. The code will not compile because of line 2.
3. The code will not compile because of line 8.
4. The code will not compile because of line 9.
5. The output cannot be determined from the code provided.

**The answer is B.** An abstract method does not have body.

## Question 20

What is the result of the following code?

{% highlight java linenos %}
public abstract class Bird {
  private void fly() { System.out.println("Bird is flying"); }
  public static void main(String[] args) {
    Bird bird = new Pelican();
    bird.fly();
  }
}
class Pelican extends Bird {
  protected void fly() { System.out.println("Pelican is flying"); }
}
{% endhighlight %}

1. `Bird is flying.`
2. `Pelican is flying`
3. The code will not compile because of line 4.
4. The code will not compile because of line 5.
5. The code will not compile because of line 9.

**The answer is A.** The code compiles here, so options CDE are wrong. The
tricky thing is that when `Pelican` extends `Bird`, bird's method `fly` is
hidden, not overridden since it is private. With a hidden method, the
location of the caller determines which method will be used. Since it is
located in the class of `Bird`, the method of bird is used. So A is correct.
