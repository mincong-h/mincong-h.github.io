---
layout:      post
title:       'OCA Review 5 - Online Test Chapter 3'
date:        2017-03-15 22:00:00 +0100
categories:  [java, weekly, ocajp]
---

Today, I'm going to review my online test, chapter 3 of Oracle Certified
Associate (OCA), provided by SYBEX. If you need to access to this online
resources, you need to buy their book first. See
<http://www.sybex.com/go/ocajavase8>.

<!--more-->

<style type="text/css">
  ol { list-style-type: upper-alpha; }
</style>

<p align="center">
  <img
    src="{{ site.url }}/assets/20170315-oca-online-test-chapter-3.png"
    alt="Result of OCA Online Test Chapter 3">
</p>

## Question 4

What is the result of the following code?

{% highlight java %}
StringBuilder sb = new StringBuilder();
sb.append("aaa").insert(1, "bb").insert(4, "ccc");
System.out.println(sb);
{% endhighlight %}

1. `abbaaccc`
2. `abbaccca`
3. `bbaaaccc`
4. `bbaaccca`
5. An exception is thrown.
6. The code does not compile.

**The answer is B.** At the beginning, the string is empty. Then, threes
characters had been appended into the char array, so the array contained three
`a` characters. After that, two `b` had been added into the char array at index
1, and the remaining characters were shifted. Same idea for adding `ccc`.

{% highlight java %}
['a', 'a', 'a']
['a', 'b', 'b', 'a', 'a']
['a', 'b', 'b', 'a', 'c', 'c', 'c', 'a']
{% endhighlight %}

## Question 14

Which of the following can replace the comment to print `"avaJ"`? (Choose all
that apply)

{% highlight java %}
StringBuilder puzzle = new StringBuilder("Java");
// INSERT CODE HERE
System.out.println(puzzle);
{% endhighlight %}

1. `puzzle.reverse();`
2. `puzzle.append("vaJ$").substring(0, 4);`
3. `puzzle.append("vaJ$").delete(0, 3).deleteCharAt(puzzle.length - 1);`
4. `puzzle.append("vaJ$").delete(0, 3).deleteCharAt(puzzle.length);`
5. None of the above.

**The answer is AC.** In this example, the choice A is correct because the
method `reverse` reverses the characters sequence stored inside the string
builder. The answer B is wrong because of 2 points: the returned substring is
wrong, and `StringBuilder#substring` returns a string but not a string builder,
so even if the result is right, it must be retrieved immediately from return
statement. Answer C is correct since `JavavaJ$` can be transformed into `avaJ`
by removing the first three characters and the last character.

## Question 27

What is the result of the following?

{% highlight java %}
List<String> one = new ArrayList<String>();
one.add("abc");
List<String> two = new ArrayList<>();
two.add("abc");
if (one == two)
  System.out.println("A");
else if (one.equals(two))
  System.out.println("B");
else
  System.out.println("C");
{% endhighlight %}

1. `A`
2. `B`
3. `C`
4. An exception is thrown.
5. The code does not compile.

**The answer is B.** Because list one and list two are equal by value, but they
are not equal by reference.

## Question 31

What is the output of the following code?

{% highlight java %}
LocalDate date = LocalDate.of(2018, Month.APRIL, 30);
date.plusDays(2);
date.plusYears(3);
System.out.println(date.getYear()
    + " " + date.getMonth()
    + " " + date.getDateOfMonth());
{% endhighlight %}

1. `2018 APRIL 2`
2. `2018 APRIL 30`
3. `2018 MAY 2`
4. `2021 APRIL 2`
5. `2021 APRIL 30`
6. `2021 MAY 2`
7. A runtime exception is thrown.

**The answer is B.** Local date is an immutable object, so any modification of
such object creates a new date object. Since there's no code retrieving the
returned value, the returned value is ignored. Therefore, option B is correct.

## Question 32

What is the output of the following code?

{% highlight java %}
LocalDateTime d = LocalDateTime.of(2015, 5, 10, 11, 22, 33);
Period p = Period.of(1, 2, 3);
d = d.minus(p);
DateTimeFormatter f = DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT);
System.out.println(d.format(f));
{% endhighlight %}

1. `3/7/14 11:22 AM`
2. `5/10/15 11:22 AM`
3. `3/7/14`
4. `5/10/15`
5. `11:22 AM`
6. The code does not compile.
7. A runtime exception is thrown.

**The answer is E.** Even though `d` has both date and time. the formatter only
outputs time.

## Question 33

What is the output of the following code?

{% highlight java %}
LocalDateTime d = LocalDateTime.of(2015, 5, 10, 11, 22, 33);
Period p = Period.ofDays(1).ofYears(2);
d = d.minus(p);
DateTimeFormatter f = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.SHORT);
System.out.println(d.format(f));
{% endhighlight %}

1. `5/9/13 11:22 AM`
2. `5/10/13 11:22 AM`
3. `5/9/14`
4. `5/10/14`
5. `11:22 AM`
6. The code does not compile.
7. A runtime exception is thrown.

**The answer is B.** Period does not allow chaining. Only the last `Period`
method called counts, so only the two years are subtracted.
