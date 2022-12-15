---
article_num: 98
layout:            post
title:             "TDD: After 3 Months' Practice"
lang:                en
date:              2019-02-05 20:57:42 +0800
categories:        [java-testing]
tags:              [testing, java, maven]
permalink:         /2019/02/05/tdd-after-3-months-practice/
comments:          true
excerpt:           >
   I started TDD in all my personal projects 3 months ago. Here're some
   thoughts about it, including architecture, IDE, methodology, execution speed
   up, legacy code, and limits.
image:             /assets/bg-dog-2785074_1280.jpg
cover:             /assets/bg-dog-2785074_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In my daily work, I heard many discussions about Test Driven Development (TDD).
Different people have different opinions about it. Some believe that testing is
a must-have for development, any piece of code should be tested before
delivery. Some believe that testing slows down the development progress, it
hurts the system (re-)design and the randomly failing tests makes the situation
even worst. Some simply disabled the tests when developing...

Face to the confusion about TDD: the theoretical version on the internet and the
practical version in real life, I decided to experience TDD in my personal
projects and see how it goes. Today, 3 months after, here's a resume of what I
learnt and what works best. In this article, we will talk about:

- Why using TDD?
- The importance of clean architecture
- Using IDE to help you
- Iteration and regular reviews
- Write tests during development (not after)
- Understand the goals of your tests
- Prefer unit test over other tests
- Speed up execution
- Legacy code
- Limits of TDD and reconsideration

## Why Using TDD?

Here're some of the benefits of using TDD:

- TDD brings confidence and assurance of the code.
- TDD reduces bugs in production.
- TDD avoids manual testing.
- TDD proves your design

## Clean Architecture

TDD approach works best if your application has a clean architecture. In other
words, if everything is well designed. It makes your tests easier to write,
easier to read, and easier to refactor. 

- **Pure functions.** Pure functions always run the same output, and have no
  side effects. Testing pure functions reduces dependencies on I/O, network,
  logs etc.
- **Design pattern.** Using design pattern correctly, can reduce the cost of
  set-up and tear-down in tests. For example, using the Factory Method pattern
  makes the set-up easier, because it encapsulates the knowledge of
  implementation and moves this knowledge out of the framework.
- **Immutable objects.** Using immutable objects avoid testing different states
  of an object. The object itself contains the same values throughout its life.
- **Single responsibility.** If the production code has single responsibility,
  testing it will be easy. The scenario is simple and straightforward. The test
  will be self explanatory and no needs for comments.
- **Loose coupling.** In a loosely coupled system, each of its components has
  little or no knowledge of the definitions of other separate components.
  Therefore, mocking or complex test set-up (integration tests or functional
  tests) can be avoided.

There're more examples to list, but I think you get my points: having a clean
architecture makes the tests minimalist.

## Using IDE

Use your IDE to improve your tests. It can:

- Create tests more easily
- Perform the tests
- Measure the test coverage
- Debug the tests

If you're using Eclipse IDE, you can see their documentation about
[Eclipse/Testing](https://wiki.eclipse.org/Eclipse/Testing). Please let me know
if you find a better page.

If you're using IntelliJ IDEA, you can see their documentation about
[Testing](https://www.jetbrains.com/help/idea/configuring-testing-libraries.html).
Or check their official YouTube video for [Unit Testing and Coverage in IntelliJ
IDEA](https://youtu.be/QDFI19lj4OM).

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/QDFI19lj4OM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Iteration and Regular Reviews

My personal experience shows that TDD works best when you do it in
iteration.

At the first place, the application is not yet well designed and
is not yet be heavily used. At that moment, having tests everywhere slows down
the development cycle and requires test re-write when code is being changed.
Therefore, it would be good to a basic test suite, where you feel confident
about the expected behavior.

Then, the application grows. You're adding more functionality. New
functionality is not yet mature, but the base of your application
starts to be stable. You know how to plug a new component into your app without
changing existing ones. This is a good opportunity to test more about the base!

Later, application is deployed to a test environment and be used against a small
data-set. You have some feedback about application against different scenario.
Some bugs are discovered or some functionality need to be changed. This is
another good opportunity to add more tests: fix the bugs and shorten the
verification cycle via tests.

Application is now running in production. Some components are more frequently
used than others. Yet another opportunity to have more tests, and increase the
test coverage.

Interaction ensures that the test effort is prioritized and applied to the most
important part of the codebase.

## Write Tests During Development

... and not after. Some developers think testing is a "constraint" and not a
tool to help them. This is completely wrong. Test describes a minimal scenario
to assert the behavior of a piece of code. It should help you to develop your
application faster. If it's not the case, maybe the architecture of the
application needs to be reviewed, or the test itself is not well written.

Writing tests after the development leads to frustration, and doubt about the
necessity of having these tests.

## Understand the Goals

Writing tests are not the ultimate goal of testing. In my understanding,
testing is a "low-cost" way to assure the application behavior. If we take a
deeper look, we can split the goal into smaller ones:

1. Component Behavior: how the component work itself
2. Application Acceptance: interactions between components
3. Security Flaws: prevent security flaws in your application

There're surely other ways to define goals. But the importance of having goals
won't change: it helps prioritization. It makes the test effort spent on the
most mission-critical place.

## Prefer Unit Test Over Other Tests

It's important to distinguish the different types of test: unit test,
integration test, functional test, performance test, ... Some of them are more
difficult to write and maintain than others.

Among all types of test, unit test is by far the closest one to the source
code. In a few lines, you can prove the behavior of your source code by giving a
simple input, executing the code, and asserting the output. The entire process
is simple so that it's easy to write, easy to understand, and easy to maintain.

## Speed Up Execution

When you have many tests, it's important to ensure the tests run quickly so that
it will not slow down the development process. Nobody want to wait for hours
for the test results.

When using Maven, you can use option `-T <nThreads>` to configure the level of
parallelism. A typical configuration is to use one thread per logical core
(`1C`), to run the multi-thread build:

    mvn <goal> -T 1C

In all my personal projects, build is multi-threaded by default. This is done
using Maven configuration file `maven.config` in folder `.mvn`. It works great
and it forces me to consider thread safety problem at the very first place of
development:

```
cat .mvn/maven.config
-T 1C
```

However, please notice that some Maven plugins or your source code, might not
work properly in a multi-thread build.

## Legacy Code

While TDD works with well-designed codebase. It's much more difficult to start
with something existing.

**Prefer refactoring over testing.** I think it's more interesting to make the
architecture cleaner, easier to understand and easier to change (loose coupling)
before adding more tests. Otherwise, the tests will require many factors to
setup and will certainly slow down the development process.

**Add tests when fixing bugs.** It prevents the same case to happen again. Do
not force yourself to achieve metric, like 100% coverage.

**Add tests when adding new features.**

**Use continuous code analysis.** In Java project, you
can use continuous code analysis tool, such as SonarQube, to inspect the code
quality and test coverage. You can also see test coverage on the new code,
committed recently.

**Human factors.** Hiring great people can resolve many problems at the first
day. Legacy code does not become legacy in one day, many factors can lead to
such situation: project prioritization, lack of skills, lack of quality awareness,
lack of time, lack of tooling, incorrect road-map, business model changes... It's
very important to consider the human factors, because if you are alone to
change the situation, and other factors remain the same, then you will have
few chance to success.

## Limits and Reconsideration

Each coin has two sides. Here're some limits and reconsideration about TDD:

- Writing tests takes time
- When source code changes, you need to change the tests
- Maintaining tests is a cost (and they might need refactoring, too)
- Bad written tests are worse than no tests
- The test execution time might be significant
- 100% test coverage != 100% bug free
- Low test coverage is probably error prone codebase. It's preferable to
  rethink about the code inspection than other fields first.
- Test is not the ultimate goal, it aims to help the development process and the
  maintainability of your application.
- Test coverage is not a good metric to measure the quality
- Different constraint when working with legacy code
- Testing is a team effort

Human factors:

- Some people hate tests
- Some people write verbose tests

In this case, clearly, TDD is not on your side. What you can do is to: setup
automatic code quality inspection, testing framework so that testing is at least
possible. Try your best to add new tests. Each step forward is a new gain.

## Conclusion

In this article, we saw the motivation of doing TDD and different ways to do
well in different aspects: architecture, IDE, methodology, type of tests,
execution timing, legacy code, and limits of TDD. Hope you enjoy this article,
see you the next time!

## References

- Robert C. Martin, "Chapter 9: Unit Tests" in _Clean Code_, Prentice Hall,
  2008.
- E. Gamma, R. Helm, R. Johnson, and J. Vlissides, "Chapter 3 Creational
  Patterns - Factory Method" in _Design Patterns_, Addison Wesley, 1995.
- Eric Elliot, "5 Common Misconceptions About TDD & Unit Tests", _medium.com_, 2016.
  [Online]. Available:
  <https://medium.com/javascript-scene/5-common-misconceptions-about-tdd-unit-tests-863d5beb3ce9>
- Jason McCreary, "100 days practicing TDD", _dev.io_, 2018. [Online].
  Available:
  <https://dev.to/gonedark/100-days-practicing-tdd-4d5m>
- K. Beck, D.H. Hansson, M. Fowler, "Is TDD Dead?", _martinfowler.com_, 2014.
  [Online]. Available: <https://martinfowler.com/articles/is-tdd-dead/>
- Marc Roussy, "Testing Serverless Functions in .NET", _marcroussy.com_, 2019.
  [Online]. Available:
  <https://marcroussy.com/2019/01/20/testing-serverless-functions-in-dotnet/>
- Jon Limjap, "What is a reasonable code coverage % for unit tests (and why)?",
  _stackoverflow.com_, 2008. [Online]. Available:
  <https://stackoverflow.com/q/90002>
- Wikipedia, "Loose coupling", _en.wikipedia.org_, 2019. [Online]. Available:
  <https://en.wikipedia.org/wiki/Loose_coupling>
- Eclipse, "Eclipse/Testing", _wiki.eclipse.org_, 2017. [Online]. Available:
  <https://wiki.eclipse.org/Eclipse/Testing>
- IntelliJ IDEA, "Testing", _www.jetbrains.com_, 2019. [Online]. Available:
  <https://www.jetbrains.com/help/idea/configuring-testing-libraries.html>
- IntelliJ IDEA, "Unit Testing and Coverage in IntelliJ IDEA",
  _www.youtube.com_, 2017. [Online]. Available: <https://youtu.be/QDFI19lj4OM>
