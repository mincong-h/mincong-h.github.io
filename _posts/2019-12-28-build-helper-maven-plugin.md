---
layout:            post
title:             Build Helper Maven Plugin
date:              2019-12-28 10:43:03 +0100
categories:        [tech]
tags:              [java, maven]
comments:          true
excerpt:           >
    How to set up additional source directory (src/it/java) and resource
    directory (src/it/resources) for integration tests in Maven project
    using Build Helper Maven Plugin.
image:             /assets/bg-c-dustin-91AQt9p4Mo8-unsplash.jpg
ads:               Ads idea
---

## Overview

In this article, I will explain how to set up additional source directory
(`src/it/java`) and resource directory (`src/it/resources`) for integration
tests in Maven project using Build Helper Maven Plugin.
After reading this article, you will understand:

- Why using Build Helper Maven Plugin?
- How to declare Build Helper Maven Plugin?
- How to observe changes?
- How to go further in this topic?

Let's get started.

## Motivation

Traditionally, source code and resources are stored in
`src/main/{java,resources}`, test sources and resources are stored in
`src/test/{java,resources}`. This is part of the Maven [Standard Directory
Layout](http://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html).
However, in enterprise-level projects, having them might not
be enough anymore: you might want to have a separated layout for unit tests,
integration tests, functional tests, code generation, benchmarks, ... depending
on your requirements. Having a clear separation means:

- Clear separation of responsibility
- Trigger part of the sources in IDE (e.g. only running unit tests)

Here're some directory layouts we can imagine:

Directory | Description
:-------- | :----------
`src/it/{java,resources}` | Integration tests
`src/benchmark/{java,resources}` | Benchmarks

Build Helper Maven Plugin helps you to achieve this with a minimum of
configuration.

## Declaration

To use the Build Helper Maven Plugin, you need to declare it in the
plugin management section of your POM file (`pom.xml`):

```xml
<pluginManagement>
  <plugins>
    <plugin>
      <groupId>org.codehaus.mojo</groupId>
      <artifactId>build-helper-maven-plugin</artifactId>
      <version>3.0.0</version>
    </plugin>
  </plugins>
</pluginManagement>
```

Then configure the executions in the plugin section.

```xml
<plugins>
  <plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>build-helper-maven-plugin</artifactId>
    <executions>
      <!-- see next sections in the blog -->
    </executions>
  </plugin>
</plugins>
```

## Add Test Sources

Adding test sources is done by goal `add-test-source` of the plugin. Declare
execution called "add-it-test-source" which executes this goal to include
directory `src/it/java` as source directory.

```xml
<execution>
  <id>add-it-test-source</id>
  <goals>
    <goal>add-test-source</goal>
  </goals>
  <configuration>
    <sources>
      <source>src/it/java</source>
    </sources>
  </configuration>
</execution>
```

By default, goal
["add-test-source"](https://www.mojohaus.org/build-helper-maven-plugin/add-test-source-mojo.html)
binds to the lifecycle phase:
`generate-test-sources`. Running `mvn verify` or similar commands, you can see
the following output in your console:

```
[INFO] --- build-helper-maven-plugin:3.0.0:add-test-source (add-it-test-source) @ build-helper-maven-plugin-demo ---
[INFO] Test Source directory: /Users/mincong/github/maven-demo/build-helper-maven-plugin/src/it/java added.
```

## Add Test Resources

Adding test resources is done by goal `add-test-resource` of the plugin. Declare
execution called "add-it-test-resource" which executes this goal to include
directory `src/it/resources` as a resource directory. Note that the
`<resource>` element is slightly different from `<source>`, where you need
`<directory>` to include the desired directory.

```xml
<execution>
  <id>add-it-test-resource</id>
  <goals>
    <goal>add-test-resource</goal>
  </goals>
  <configuration>
    <resources>
      <resource>
        <directory>src/it/resources</directory>
      </resource>
    </resources>
  </configuration>
</execution>
```

By default, goal
["add-test-resource"](https://www.mojohaus.org/build-helper-maven-plugin/add-test-resource-mojo.html)
binds by default to the lifecycle phase: generated-test-resources. Running `mvn
verify` or similar commands, you can see the following output in your console: 

```
[INFO] --- build-helper-maven-plugin:3.0.0:add-test-resource (add-it-test-resource) @ build-helper-maven-plugin-demo ---
[INFO]
[INFO] --- maven-resources-plugin:2.6:testResources (default-testResources) @ build-helper-maven-plugin-demo ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] skip non existing resourceDirectory /Users/mincong/github/maven-demo/build-helper-maven-plugin/src/test/resources
[INFO] Copying 1 resource
```

## Further Reading

If you want to know more about this topic, I suggest you to take a look on
code quality tool [Checkstyle](https://github.com/checkstyle/checkstyle): it
uses Build Helper Maven Plugin to set up integration tests. You can see the
[Build Helper Maven Plugin -
Usage](https://www.mojohaus.org/build-helper-maven-plugin/usage.html) page to
see more brief examples, or visit its
[source code](https://github.com/mojohaus/build-helper-maven-plugin) directly,
which contains demonstrations in its tests.

## Conclusion

In this post, we see how to set additional source directory (`src/it/java`) and
resource directory (`src/it/resources`) for integration tests in Maven project
using Build Helper Maven Plugin. The same approach can be used for setting up
benchmarks (`src/benchmark`) or any similar Maven layout. The source code in this
post is available on
[GitHub](https://github.com/mincong-h/maven-demo/tree/blog-2019-build-helper-maven-plugin/build-helper-maven-plugin).
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Maven, "Build Helper Maven Plugin - Usage", _Maven_, 2017.
  <https://www.mojohaus.org/build-helper-maven-plugin/usage.html>
- Maven, "Standard Directory Layout", _Maven_, 2019.
  <http://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html>
