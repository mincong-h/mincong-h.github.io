---
layout:            post
title:             My Java Code Style
date:              2018-06-18 09:14:50 +0200
date_modified:     2018-07-29 22:36:01 +0200
categories:        [tech]
tags:              [java]
comments:          true
excerpt:           >
    My Java code style: a collection of Java good practices.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today I want to talk about my own Java code style. It's been 2 years that I
coded professionally, since my intern at Google Summer of Code. Most of the
time, I write Java. So I want to do a summery on this field. This blog post will
keep update on the next months.

## Class

- Marks utility class as `final`. All methods in a utility class are static,
  extending such class does not make sense: static methods cannot be overridden.
- Use `private` constructor for utility class.
- Data class should be immutable. The less mutable state, the easier it is to
  ensure thread safe. (Immutable objects are automatically thread-safe)

## Variable

- Mark class variable as `final`. It ensures the variable is initialized and is
  initialized only once, either in constructor or at declaration. Its reference
  is never changed during object's lifecycle.
- Never use `null` for variable assignment.
- Never use `final` for method parameter.
- Never use `final` for local variable. This increases the readability.

## Method

- Don't restrict method input to `List<T>` if possible, use `Iterable<T>`.
- Provide 2 choices for iterable method input: `Iterable<T>` and `T...`.
- Always use `@Override`.
- Name method as <code>get<i>XXX</i></code> when it's a getter method.
- Name method as <code>has<i>XXX</i></code> or <code>is<i>XXX</i></code> if a
  boolean is returned.

## Enum

- Use camel-case for enum class name.
- Use upper-case for enum members.
- Marks a enum variable as `public` if it is immutable and needs to be
  referenced from outside. This avoids unnecessary getter method.
- Avoid using `switch` to implement logic. It can cause errors when new
  member(s) added into the enum. Attach the logic directly into the enum.

## Nullability

- Never use `null` for variable assignment.
- Use no-op pattern if there's nothing to do.
- Use `Optional<T>` as result type, if the result is nullable.

## Exception

- Don't throw exception if possible. Consider failures as a possible result—use
  something like `Try<T>` instead of only returning the correct result.
- Use only one exception type for one module. It helps to handle unexpected
  cases.

## Lambda

- Use one-line lambda
- Use method reference for lambda whenever possible

## References

1. [Scala - `scala.util.Try[+T]`][1]
2. [EGit/Contributor Guide - Coding Standards][2]
3. [Google Gerrit Code Review - Contributing, Style][3]
4. [Devoxx FR 2018: Clean Code with Java8 4 years later (V. Rentea)][4]
5. Java Concurrency in Priactice, chapter 5 summary (page 110)

[1]: https://www.scala-lang.org/api/2.12.3/scala/util/Try.html
[2]: https://wiki.eclipse.org/EGit/Contributor_Guide#Coding_standards
[3]: https://gerrit-review.googlesource.com/Documentation/dev-contributing.html#style
[4]: https://youtu.be/-WInMyeAqTE
