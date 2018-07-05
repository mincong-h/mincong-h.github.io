---
layout: post
title:  "Code Quality Improvement For Newbies"
date:   2017-01-26 22:46:00 +0100
categories: [code-quality, weekly]
tags: [code-quality, weekly]
comments:    true
---

This week, let's talk about code quality improvement for newbies. As a junior
developer, I made a lot of mistakes as most of the newbies. But thanks to my
colleagues, I learned many useful skills to improve my code quality. Now, let's
take a look together.

<!--more-->

## Ownership on the existing code

In many cases, the code that you need to hanle is out-of-date due to different
reasons, e.g. the update of the license in the title, the update of the APIs,
the new features of the languages etc. Even though these problems were made by
somebody else, you should do something if you're aware of the problem. If the
problem is small, fix it right now. Else, create a JIRA ticket and let someone
to handle it later.

## Variable Naming and Code Style

The variable naming should be as meaningful as possible. It gives a better
understanding for other developers and therefore, make the code self-explained.
For example, for a string key-value pair, naming the key and value as `key` and
`val` respectively is better than naming them to `foo` and `bar`.

{% highlight java %}
// Good
String key = "my key";
String val = "my value";

// Bad
String foo = "my key";
String bar = "my value";
{% endhighlight %}

As for the code style, it should be aligned with the existing code. If your
mission is to add a new feature or fix a bug, do not try to refactor the code.
Adding another style will probably diversify the existing code and make it hard
to understand. I think this is particularly true for newbies.

## Testing

After finishing the development, we need to test the results. All the behaviours
should be tested. **Not only the expected ones, but also the unexpected.** This
arrived to me when handling the JIRA ticket [NXP-19858 Provide a relax mode for
CMIS connector][NXP-19858]. This ticket aims to provide a relax mode by setting
up a property to the Nuxeo Platform. When I sent the pull request, I only tested
the expected part, which demonstrates that the code works when the property is
set the true. But thanks to [Kevin Leturc][kevin], I noticed that testing the
unexpected cases are important too! It leads the code to another behaviour or
a failure (exception) according to different cases.

{% highlight java %}
@Test
public void queryWorksCorrectly() {
  setRelaxMode(true);
  runQuery();
  assertEquals(...);
}

@Test
public void queryThrowsException() {
  setRelaxMode(false);
  try {
    runQuery();
    fail();
  } catch (MyException e) {
    assertTrue(e.getMessage(), e.getMessage().contains("some keywords"));
  }
}
{% endhighlight %}

## Documentation

Documentation is very important and should be written judiciously. It is useful
for other the understand the code, but can also leads to misunderstanding if it
is not up-to-date or badly explained. Here're some of my roles when writing
documentation:

- Prefer self-explained code over comments
- Prefer simplify code logic over writing long bloc of comment
- Comment all the public API
- DO NOT use annotations in Javadoc without explanation, e.g.

{% highlight java %}
// DO NOT write empty comment.
// It's nothing more than a spam.
/**
 * @param a
 * @param b
 * @return
 */
public int add(int a, int b) {
  return a + b;
}
{% endhighlight %}

## Performance

Sometimes, improving performance is very simple. Using the correct data
structures and avoid brute force solution, changing the order of different `if`
statements conditions are good enough! Let's see the following examples, where
condition A `condA` is 50% true in average and condition B `condB` is 1% true in
average:

{% highlight java %}
// OK
if (condA && condB) {
  doSomething();
}
// Better
if (condB && condA) {
  doSomething();
}
{% endhighlight %}

The second solution is better since condition B has only 1% chance to be true,\
so in 99% of cases, the program does not need to consider condition A but skip
the `if` statement directly.

Yes, that's all for this week. By the way, happy Chinese new year 新年快乐 and
see you next week! :)

[kevin]: https://github.com/kevinleturc
[NXP-19858]: https://jira.nuxeo.com/browse/NXP-19858
