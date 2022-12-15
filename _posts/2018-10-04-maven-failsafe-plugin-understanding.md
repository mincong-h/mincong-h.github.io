---
article_num: 78
layout:            post
title:             Maven Failsafe Plugin Understanding
lang:                en
date:              2018-10-04 19:50:05 +0200
categories:        [build]
tags:              [java, maven]
permalink:         /2018/10/04/maven-failsafe-plugin-understanding/
comments:          true
excerpt:           >
    Maven Failsafe Plugin runs integration tests for your Maven project. In this
    article, we will see what is Failsafe plugin and its common use cases.
image:             /assets/bg-tools-1209764_1280.jpg
cover:             /assets/bg-tools-1209764_1280.jpg
series:            [maven-plugins]
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

[Maven Failsafe Plugin][plugin] is part of the core Maven plugins, which runs
integration tests for your Maven project. It is similar to Maven Surefire
Plugin, which runs unit tests. In this article, we will see what is Failsafe
Plugin and its common use cases.

The Failsafe Plugin has 2 goals:

- `failsafe:integration-test` runs the integration tests of an application.
- `failsafe:verify` verifies that the integration tests of an application
  passed.

## Lifecycle And Goal Execution

Maven has 4 phases for running integration tests:

- `pre-integration-test` for setting up the integration test environment.
- `integration-test` for running the integration tests.
- `post-integration` for tearing down the integration test environment.
- `verify` for checking the results of the integration tests.

In order to have Failsafe plugin works properly for your integration tests
(ITs), you need the declare explicitly the plugin in your POM:

{% highlight xml %}
<!-- Failsafe plugin needs to be declared explicitly -->
<plugin>
  <artifactId>maven-failsafe-plugin</artifactId>
  <version>2.22.0</version>
  <executions>
    <execution>
      <goals>
        <goal>integration-test</goal>
        <goal>verify</goal>
      </goals>
    </execution>
  </executions>
</plugin>
{% endhighlight %}

The first goal, `integration-test`, runs the tests; and the second goal,
`verify`, verifies the test results. Why we need such mechanism? Because it
avoids failing the build straight away, and allows a correct tear down on the
test environment via phase `post-integration`. In other words, cleanup is done
properly.

By default, the Failsafe Plugin will automatically include all test classes with
the following wildcard patterns, and execute them as integration tests:

Pattern | Description
:------ | :----------
`**/IT*.java` | Includes all of its subdirectories and all Java filenames that start with "IT" (Integration Test).
`**/*IT.java` | Includes all of its subdirectories and all Java filenames that end with "IT" (Integration Test).
`**/*ITCase.java` | Includes all of its subdirectories and all Java filenames that end with "ITCase" (Integration Test Case).

## Using JUnit 4

In this section, we will talk about how to write and run integration tests in
JUnit 4. The first step is to add JUnit as Maven dependency:

{% highlight xml %}
<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
  <scope>test</scope>
</dependency>
{% endhighlight %}

Then, write your tests as follows in test source directory (`src/test/java`).
For class name, make sure it matches the testing patterns mentioned before, so
starts with _IT_, ends with _IT_ or ends with _ITCase_. As for the assertion
methods, use those in class `org.junit.Assert`. IDEs might propose methods in
class `junit.framework.Assert`, please don’t use them, they are deprecated.

{% highlight java %}
package demo;

import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class Junit4IT {

  @Test
  public void testProperty() {
    assertTrue(true);
  }

}
{% endhighlight %}

Finally, trigger the Maven build. Any command which invokes phase `verify` should work, for example:

```
mvn clean verify
mvn clean install
```

> **WARNING**
>
> Do not invoke phase `integration-test` directly, which prevents a
> properly tear down—phase `post-integration-test` will not be executed.
> You should invoke `verify` instead.

## Using JUnit 5

Now, let’s take a look how to write and run integration tests in JUnit 5. As
before, the first step is to add JUnit 5 as Maven dependency. This will pull all
required dependencies:

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

public class Junit5IT {

  @Test
  public void testProperty() {
    assertTrue(true);
  }
}
{% endhighlight %}

Compared to JUnit 4, JUnit 5 provides more ways to write assertions. They are
not covered in this article. For more information about JUnit 5 in Maven
Failsafe Plugin, please visit the official documentation page: [Maven - Using
JUnit 5 Platform][junit5].

## Testing Reports

After test execution, Maven Failsafe Plugin generates reports in two different file formats:

- Plain text files (`*.txt`)
- XML files (`*.xml`)

By default, these files are generated in `target/failsafe-reports` directory.
These files are useful for tracking the execution logs, having exception stack
trace, execution statistics and more. Some CI platforms, like Jenkins, might
read Failsafe reports to provide information in their UI.

## Useful Commands

Here're some useful commands for your daily job.

Skip all the tests (unit tests and integration tests):

    mvn clean install -DskipTests

Skip all the integration tests (only run unit tests):

    mvn clean install -DskipITs

Run a single integration test:

    mvn -Dit.test=Junit4IT verify

## Conclusion

In this post, we learnt Maven Failsafe Plugin, a plugin for integration tests
execution in Maven. We saw the lifecycle & goal execution, JUnit 4 & JUnit 5
integration, test reports generation, and some useful commands. As usual, the
source code is available on GitHub: [mincong-h/maven-failsafe-plugin-demo][demo].

Hope you enjoy this article, see you the next time!

## References

- [Maven: Failsafe Plugin][plugin]
- [Maven: Using JUnit 5 Platform][junit5]

[plugin]: https://maven.apache.org/surefire/maven-failsafe-plugin/
[junit5]: https://maven.apache.org/surefire/maven-failsafe-plugin/examples/junit-platform.html
[demo]: https://github.com/mincong-h/maven-failsafe-plugin-demo
