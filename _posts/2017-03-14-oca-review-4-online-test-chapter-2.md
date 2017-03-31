---
layout:      post
title:       'OCA Review 4 - Online Test Chapter 2'
date:        2017-03-14 22:50:00 +0100
categories:  [java, weekly, ocajp]
comments:    true
---

Today, I'm going to review my online test, chapter 2 of Oracle Certified
Associate (OCA), provided by SYBEX. If you need to access to this online
resources, you need to buy their book first. See
<https://sybextestbanks.wiley.com/>.

<!--more-->

<style type="text/css">
  ol { list-style-type: upper-alpha; }
</style>

<p align="center">
  <img
    src="{{ site.url }}/assets/20170314-oca-online-test-chapter-2.png"
    alt="Result of OCA Online Test Chapter 2">
</p>

## Question 3

What is the output of the following application?

{% highlight java linenos %}
public class CompareValues {
  public static void main(String[] args) {
    int x = 0;
    while (x++ < 0) {}
    String message = x > 10 ? "Greater than" : false;
    System.out.println(message + "," + x);
  }
}
{% endhighlight %}

1. `Greater than,10`
2. `false,10`
3. `Greater than,11`
4. `false,11`
5. The code will not compile because of line 4.
6. The code will not compile because of line 5.

**The answer is F.** In this question, the ternary operator has two
expressions, one of them a `String` and the other a `boolean`. The ternary
operator is permitted to have expressions that don't have matching types, but
the key here is the assignment to the `String` reference. The compiler knows
how to assign the first expression value as a `String`, but the second `boolean`
expression cannot be set as a `String`; so this line does not compile.

## Question 9

How many times will the following code print `"Hello World"`?

{% highlight java linenos %}
for (int i = 0; i < 10; ) {
  i = i++;
  System.out.println("Hello World");
}
{% endhighlight %}

1. 9
2. 10
3. 11
4. The code will not compile because of line 1.
5. The code will not compile because of line 3.
6. The code contains an infinite loop and does not terminate.

**The answer is F.** In this example, the update statement of the for loop is
missing, which is fine as the statement is optional, so the option D is
incorrect. **The expression inside the loop increments `i` but then assigns `i`
the old value.** Therefore, `i` ends up with the same value that it starts with:
`0`. The loop will repeat infinitely and outputting always `0`.
