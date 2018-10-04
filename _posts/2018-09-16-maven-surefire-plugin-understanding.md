---
layout:            post
title:             Maven Surefire Plugin Understanding
date:              2018-09-16 16:29:22 +0800
categories:        [tech, series]
tags:              [java, maven]
comments:          true
excerpt:           >
    Maven Surefire Plugin is used during the "test" phase of Maven build
    lifecycle to execute unit tests. It can be used with JUnit, TestNG or other
    frameworks. This article explains what is Surefire plugin and its common use
    cases.
img_url:           /assets/bg-tools-1209764_1280.jpg
img_width:         1280
img_height:        853
---

## Overview

[Maven Surefire Plugin][plugin] is used during the `test` phase of the build
lifecycle to execute the unit tests of an application. It can be used with
JUnit, TestNG or other testing frameworks. In this article, I'll explain what is
Surefire plugin and its common use cases.

Without any configuration, Surefire plugin can already be triggered by Maven.
However, if you want to benefit the latest features, you need to update the
plugin in you POM:

{% highlight xml %}
<pluginManagement>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>2.22.0</version>
    </plugin>
    ...
  </plugins>
</pluginManagement>
{% endhighlight %}

By default, the Surefire Plugin will automatically include all test classes
with the following wildcard patterns, and execute them as unit tests:

Pattern | Description
:------ | :---
`**/Test*.java` | Includes all of its subdirectories and all Java filenames that start with _"Test"_.
`**/*Test.java` | Includes all of its subdirectories and all Java filenames that end with _"Test"_.
`**/*Tests.java` | Includes all of its subdirectories and all Java filenames that end with _"Tests"_.
`**/*TestCase.java` | Includes all of its subdirectories and all Java filenames that end with _"TestCase"_.

## Using JUnit 4

In this section, we will talk about how to write and run JUnit 4 tests. The
first step is to add JUnit as Maven dependency:

{% highlight xml %}
<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
  <scope>test</scope>
</dependency>
{% endhighlight %}

Then, write your tests as follows in test source directory (`src/test/java`). For
class name, make sure it matches the testing patterns mentioned before, so
starts with `Test`, ends with `Test` or any other matching pattern. As for the
assertion methods, use those in class `org.junit.Assert`. IDEs might propose
methods in class `junit.framework.Assert`, please don't use them, they are
deprecated.

{% highlight java %}
package demo;

import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class Junit4Test {

  @Test
  public void myTest() {
    assertTrue(doSth());
    // TODO Add assertions...
  }

}
{% endhighlight %}

Finally, trigger the Maven build. Any command which invokes phase `test` should
work, for example:

```
mvn clean install
mvn clean test
```

## Using JUnit 5

Now, let's take a look how to write and run JUnit 5 tests. As before, the
first step is to add JUnit 5 as Maven dependency. This will pull all required
dependencies:

{% highlight xml %}
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter-engine</artifactId>
  <version>5.2.0</version>
  <scope>test</scope>
</dependency>
{% endhighlight %}

Then, write your tests in Java. Note that the import statements have been
changed. Assertion methods are now in class `org.junit.jupiter.api.Assertions`:

{% highlight java %}
package demo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class Junit5Test {

  @Test
  public void myTest() {
    assertTrue(doSth());
    // TODO Add assertions...
  }
}
{% endhighlight %}

Compared to JUnit 4, JUnit 5 provides more ways to write assertions. They are
not covered in this article. For more information about JUnit 5 in Maven
Surefire Plugin, please visit the official documentation page: [Maven - Using
JUnit 5 Platform][mvn-junit5].

## Testing Reports

After test execution, Maven Surefire Plugin generates reports in two different
file formats:

- Plain text files (`*.txt`)
- XML files (`*.xml`)

By default, these files are generated in `target/surefire-reports` directory.
These files are useful for tracking the execution logs, having exception stack
trace, execution statistics and more. Some CI platforms, like Jenkins, might read
Surefire reports to provide information in their UI.

## Skip Tests

Skip tests can be done by providing property `skipTests`. You can do it in
Maven POM, or from command line.

From POM:

{% highlight xml %}
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>2.22.0</version>
  <configuration>
    <skipTests>true</skipTests>
  </configuration>
</plugin>
{% endhighlight %}

From command line:

{% highlight xml %}
mvn install -DskipTests
{% endhighlight %}

When this flag is set, Maven Surefire Plugin will be triggered without running
tests. The output looks like:

```
[INFO] --- maven-surefire-plugin:2.22.0:test (default-test) @ maven-surefire-junit4 ---
[INFO] Tests are skipped.
```

## Running a Single Test

Running a single test case (a single class):

```
mvn -Dtest=MyTest test
```

Running test methods of a single test case:

```
mvn -Dtest=MyTest#testOne test
mvn -Dtest=MyTest#test* test
mvn -Dtest=MyTest#testOne+testTwo test
```

For more information, see official documentation page [Maven - Running a Single
Test][mvn-single].

## Conclusion

In this post, we learnt Maven Surefire Plugin, a plugin for unit tests execution
in Maven. We saw the unit tests discovery mechanism, JUnit 4 integration and
JUnit 5 integration, test reports generation, how to skip tests and how to run a
single test. As usual, the source code is available on GitHub:
[mincong-h/maven-surefire-plugin-demo][github].

Hope you enjoy this article, see you the next time!

## References

- [Maven: Surefire Plugin][plugin]

[github]: https://github.com/mincong-h/maven-surefire-plugin-demo
[mvn-single]: https://maven.apache.org/surefire/maven-surefire-plugin/examples/single-test.html
[mvn-junit5]: https://maven.apache.org/surefire/maven-surefire-plugin/examples/junit-platform.html
[plugin]: https://maven.apache.org/surefire/maven-surefire-plugin/
