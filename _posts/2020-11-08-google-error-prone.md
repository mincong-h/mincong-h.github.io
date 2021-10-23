---
layout:            post
title:             Introduction of Google Error-Prone
lang:                en
date:              2020-11-08 16:16:21 +0100
categories:        [build]
tags:              [java, javac, maven]
permalink:         /2020/11/08/google-error-prone/
comments:          true
excerpt:           >
    Introdution to Google Error-Prone in Maven, which augments the compiler's
    type analysis and catches more mistakes at compile time!
image:             /assets/bg-coffee-983955_1280.jpg
cover:             /assets/bg-coffee-983955_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

In this article, I want to share with you a powerful Java Compiler plugin:
[Error Prone](https://errorprone.info/). Error Prone is an annotation processor
that can be plugged into the Java compiler to augment the compiler's
type analysis. After reading this article, you will understand:

* Why should we use Error Prone?
* How to use it in Maven?
* Some bug patterns in real
* How to suppress warnings?
* Some limits of Error Prone
* How to go further in this topic?
 
Now, let's get started!

## Motivation

_Why should I use Error Prone?_

Error Prone makes the Java compiler more powerful by analyzing the code during
compile time. It has several advantages:

- **Shift-left.** It makes errors discovered early in the software development
  lifecycle. Instead of being identified at build time, during code review, or
  in production, now they are identified at compile time. They are caught before
  they cost your time.
- **Neutral to build system.** Google Error Prone is a Java annotation processor
  that is plugged in the compiler. So it can be used in any build system, e.g.
  Bazel, Maven, Gradle, Ant.
- **Suggestions for fixes.** The fix of the problem is usually suggested at the
  same time when the bug is identified.

If you know others, please let
me know by leaving a comment :)

## Maven

_How to use Error Prone in Maven?_

To use Error Prone in Maven, you need to register the Google Error Prone Core
artifact in the list of annotation processor paths of the Maven Compiler
Plugin. It should look something like this in your POM file (`pom.xml`):

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.8.0</version>
      <configuration>
        <source>8</source>
        <target>8</target>
        <compilerArgs>
          <arg>-XDcompilePolicy=simple</arg>
          <arg>-Xplugin:ErrorProne</arg>
        </compilerArgs>
        <annotationProcessorPaths>
          <path>
            <groupId>com.google.errorprone</groupId>
            <artifactId>error_prone_core</artifactId>
            <version>2.4.0</version>
          </path>
        </annotationProcessorPaths>
      </configuration>
    </plugin>
  </plugins>
</build>
```

If you are running on JDK 8, you need to use `error-prone-javac` instead of the
standard `javac`. More detail can be reached in the official installation guide
here: <https://errorprone.info/docs/installation>. In that page, you can also
find the solutions for other build systems, such as Bazel, Gradle, Ant.

## Bug Patterns

_How does the error look like when a bug is discovered?_

In this section, let's take a look at some demos extracted from my pull-request
https://github.com/mincong-h/java-examples/pull/155 to see how the source code
looks like and how the error message and suggestion looks like.

### ReturnValueIgnored

Code:

```java
LocalDateTime d = LocalDateTime.parse("2009-06-15T13:45:30");
d.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME); // ERROR
assertEquals("2009-06-15T13:45:30", d.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
```

Error:

lang:                en
> Error:  Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.8.1:testCompile (default-testCompile) on project java-examples-date: Compilation failure
> Error:  /home/runner/work/java-examples/java-examples/date/src/test/java/io/mincongh/date/so42364818/DateTest.java:[23,13] [ReturnValueIgnored] Return value of this method must be used
> Error:      (see https://errorprone.info/bugpattern/ReturnValueIgnored)
> Error:    Did you mean to remove this line?

From the error message provided by Error Prone, you can see the explanation of
the failure and a link for the official website for more detail. Now, focusing
on this error, it is triggered because the return value of the method
`LocalDateTime.format(String)` is not used. Local date-time in Java Time is an
immutable class, so it means that I wrote one line of dead code and simply need
to remove it:

```diff
  LocalDateTime d = LocalDateTime.parse("2009-06-15T13:45:30");
- d.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
  assertEquals("2009-06-15T13:45:30", d.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
```

### EqualsHashCode

Code:

```java
public class PhoneNumberNoHash {

  ...

  @Override
  public boolean equals(Object o) {
    if (o == this) return true;
    if (!(o instanceof PhoneNumberNoHash)) return false;
    PhoneNumberNoHash pn = (PhoneNumberNoHash) o;
    return pn.lineNumber == lineNumber && pn.prefix == prefix && pn.areaCode == areaCode;
  }

  // Broken - no hashCode method!
}
```

Error:

> Error:  Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.8.1:compile (default-compile) on project java-examples-hashcode: Compilation failure: Compilation failure: 
> Error:  /home/runner/work/java-examples/java-examples/hashcode/src/main/java/io/mincongh/hashcode/bad/PhoneNumberNoHash.java:[26,18] [EqualsHashCode] Classes that override equals should also override hashCode.
> Error:      (see https://errorprone.info/bugpattern/EqualsHashCode)
> Error:  /home/runner/work/java-examples/java-examples/hashcode/src/main/java/io/mincongh/hashcode/bad/AthleteOnlyOverrideEquals.java:[24,18] [EqualsHashCode] Classes that override equals should also override hashCode.
> Error:      (see https://errorprone.info/bugpattern/EqualsHashCode)

As you can see, this is triggered because the class only overrides the `equals`
and does not override the `hashCode`. By doing so, it causes broken behavior
when trying to store the object in a collection.


### More Bug Patterns

Now we understand how the bug patterns look like, I'm not going to go further in
this section. If you want to know the complete list of patterns, you can visit
the "Bug patterns" page of the official website:
<https://errorprone.info/bugpatterns> to find the complete list.

## Suppress Warnings

Sometimes, you may want to suppress warnings because you find those bugs
identified by Error Prone unsuitable in your situation. Here are some ways to
suppress warnings.

**Use `@SuppressWarnings`.** You can suppress false positives by adding the
suppression annotation `@SuppressWarnings("MyBugPattern")` to the enclosing
element. In other words, you can add this annotation to the variable
declaration, method block, class block, etc. The value to use inside the
annotation is the exact name of the bug-pattern defined by Error Prone. You can
also suppress multiple warnings by providing a string array instead of a single
value.

```java
@SuppressWarnings("FormatString")
public class FormattingTest { ... }
```

```java
@SuppressWarnings({"FormatString", "ArrayToString"})
public class FormattingTest { ... }
```

**Disable one check.** If you want to disable one check completely, you can
turn off the check as a compiler option. Each check has a severity, it is one of
the values of "OFF", "WARN", and "ERROR". For example, to turn off the check
`ReferenceEquality`, you can do:

```sh
# A valid Error Prone command-line option looks like:
#
#     -Xep:<checkName>[:severity]
#
# To turn off ReferenceEquality check:
-Xep:ReferenceEquality:OFF
```

**Disable all checks.** You may also want to disable all checks. This can be
useful when you have a big codebase with a large number of existing bug patterns
identified. These bugs are low-priority and cannot be fixed immediately.
Therefore, you need to adapt Error Prone progressively by enabling patterns
explicitly one after another. To disable all the checks, you need to pass the
following option to the compiler:

```sh
#
# Disable all checks
#
-XepDisableAllChecks
#
# Then enable some of them
#
-Xep:UnusedMethod:ERROR
-Xep:RemoveUnusedImports:ERROR
```

**Exclude some paths.** You can also define paths to exclude as a regular
expression. It allows matching against a source file's path to determine
whether it should be excluded.

```sh
# Exclude generated files
-XepExcludedPaths:.*/build/generated/.*
```

You can see more information from the command-line flags page of the official
website: <https://errorprone.info/docs/flags> 

## Limitation

_What are the limits of Error Prone?_

Error Prone cannot be the only code analysis tool. It's great to have a code
analysis tool running at compile-time, but I think other code analysis tools
still have their place. Some tools, such as Sonar, can be executed at build time and generate
report which can be stored in a server. It aggregates historical data, attaches code
coverage report, assigns to people, evaluates the quality score, etc. These cannot
be handled by Error Prone.

Error Prone is limited to Java. We cannot use it for other languages.

Error Prone command-line options cannot be defined at a module level in Maven.
At least I don't know how to do... Centralizing everything inside the parent
POM is not a very flexible solution. Sometimes I would like to custom the checks
by modules, but I cannot do that.

Error Prone is sometimes annoying. Whenever you have an error, it fails at
compile time. Some other errors may not be displayed until the current one
is fixed. This fail-fast strategy makes it a bit annoying when you are actively
writing code. Maybe Google developers are so good that they only write bug-free
software :p

## Going Further

How to go further from here?

- To know more about the Error Prone, visit their official website
  <https://errorprone.info/>. Some additional topics that are not
  covered by this blog, such as writing a custom check, automatic refactoring using
  `Refaster`, but they can be found from the official website.
- To see the source code of Error Prone, visit GitHub project:
  <https://github.com/google/error-prone>
- Annotation processor is a powerful tool to bring additional capacity to Java
  compiler, such as code generation, compile-time type checks. To learn more
  about annotation processing, visit Gunnar Morling's GitHub page "Awesome Java
  Annotation Processing" <https://github.com/gunnarmorling/awesome-annotation-processing/>
- Want to eliminate `NullPointerException`s (NPEs)? Uber has developed
  "NullAway", an Error Prone plugin to check the null-ability in your code. Visit
  this project on GitHub: <https://github.com/uber/NullAway>

## Conclusion

In this article, we discovered Google Error-Prone, a Java annotation processing
tool to detect code errors at compile-time. We saw the advantages of using Error
Prone, the usage in Maven, some bug patterns, the ways to suppress warnings, the
limitation, and finally, how to go further from here.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Error Prone developers, "Error Prone", 2020. <https://errorprone.info/>
- Wikipedia, "Shift-left testing", _Wikipedia_, 2020.
  <https://en.wikipedia.org/wiki/Shift-left_testing>
