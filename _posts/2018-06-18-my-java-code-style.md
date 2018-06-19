---
layout:      post
title:       "My Java Code Style"
date:        "2018-06-18 09:14:50 +0200"
categories:  [java]
comments:    true
---

Today I want to talk about my own Java code style. It's been 2 years that I
coded professionally, since my intern at Google Summer of Code. Most of the
time, I write Java. So I want to do a summery on this field. This blog post will
keep update on the next months.

## Class

- Marks utility class as `final`. All methods in a utility class are static,
  extending such class does not make sense: static methods cannot be overridden.
- Use `private` constructor for utility class.

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

## Nullability

- Never use `null` for variable assignment.
- Use no-op pattern if there's nothing to do.
- Use `Optional<T>` as result type, if the result is nullable.

## Exception

- Don't throw exception if possible. Consider failures as a possible result—use
  something like `Try<T>` instead of only returning the correct result.
- Use only one exception type for one module. It helps to handle unexpected
  cases.

## References

1. [Scala - `scala.util.Try[+T]`][1]
2. [EGit/Contributor Guide - Coding Standards][2]
3. [Google Gerrit Code Review - Contributing, Style][3]

---

Updates:

1. 2018-06-19: Add EGit and Google style

[1]: https://www.scala-lang.org/api/2.12.3/scala/util/Try.html
[2]: https://wiki.eclipse.org/EGit/Contributor_Guide#Coding_standards
[3]: https://gerrit-review.googlesource.com/Documentation/dev-contributing.html#style
