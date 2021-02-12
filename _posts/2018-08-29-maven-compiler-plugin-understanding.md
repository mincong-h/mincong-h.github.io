---
layout:            post
title:             Maven Compiler Plugin Understanding
date:              2018-08-29 19:08:27 +0200
last_modified_at:  2020-11-01 16:45:48 +0100
categories:        [build]
tags:              [maven, java]
comments:          true
excerpt:           >
    A step-by-step guide for understanding Maven Compiler Plugin in Java 11.
cover:             /assets/bg-tools-1209764_1280.jpg
series:            Maven Plugins
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

This article shows you how to use Maven Compiler Plugin for your Maven project.
[Maven Compiler Plugin][1] might be the most important plugin in Maven. It is
used to compile the sources of your project, which transform Java files
(`*.java`) into class files (`*.class`).  This plugin has two goals:
"compile" and "testCompile". Both are bound to the Maven Lifecycle and are
automatically executed: during `compile` phrase and `test-compile` phrase
respectively.

After reading this article, you will understand:

* How to configure Maven Compiler Plugin in POM?
* How to choose the right Java version?
* The Java 11 support in Maven Compiler Plugin
* How to configure Maven Compiler Plugin for a multi-module project?
* How to add annotation processor to the compiler?

## How to Use Maven Compiler Plugin?

Since Maven Compiler Plugin is bound automatically to Maven phrases, you don't
need to declare anything. The only thing you need to override might be the target
version and the source version of the class files: Option `source` indicates
which Java programming language version is used to compile the source code, and
option `target` indicates which JVM version will the generated class files be
targeted. You can declare them as Maven properties:

```xml
<properties>
  <maven.compiler.source>11</maven.compiler.source>
  <maven.compiler.target>11</maven.compiler.target>
</properties>
```

Another way is to configure the plugin directly:

```xml
<plugins>
  <plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.0</version>
    <configuration>
      <source>11</source>
      <target>11</target>
    </configuration>
  </plugin>
</plugins>
```

In most cases, the values of both options are the same. Here, we're using Java
11 to compile our source code (`-source 11`) and we're targeting to JVM 11
(`-target 11`).
Now, if you do `mvn compile`, `mvn install` or any other command which invokes
the phrase _compile_, the Maven Compiler Plugin will be triggered correctly.

If you are using IntelliJ IDEA, the first approach
`maven.compiler.{source,target}` should be a better idea. It makes IntelliJ
understand that we really want this Java version everywhere. Without it,
IntelliJ uses Java 5 for some modules after Maven re-import.

## Choose Java Version

Here's a table for valid release versions for Java Compiler (`javac`):

Java Version | Release
:----------: | :---:
Java SE 6    | 1.6
Java SE 6    | 6
Java SE 7    | 1.7
Java SE 7    | 7
Java SE 8    | 1.8
Java SE 8    | 8
Java SE 9    | 9
Java SE 10   | 10
Java SE 11   | 11
Java SE 12   | 12
Java SE 13   | 13
Java SE 14   | 14

You can find them in the help of the command line `javac` under the description
of option `--source`:

```
$ javac --help | grep '\-\-source' -A 2
  --source <release>, -source <release>
        Provide source compatibility with the specified Java SE release. Supported releases: 7, 8, 9, 10, 11, 12, 13, 14
  --source-path <path>, -sourcepath <path>
        Specify where to find input source files
  --system <jdk>|none          Override location of system modules
```

## Java 11 Support

Java 11 is supported by Maven Compiler Plugin 3.8.0+. If you're using a version
prior to 3.8.0, you might have the following error:

> ```
> Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.7.0:compile (default-compile) on project java-examples-dev-core: Execution default-compile of goal org.apache.maven.plugins:maven-compiler-plugin:3.7.0:compile failed: Unsupported class file major version 55 -> [Help 1]
> ```

Changing the existing version to 3.8.0 should work.

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.0</version>
</plugin>
```

A full demo written in Java 11 is available in my GitHub:
[mincong-h/maven-compiler-plugin-demo][3].

## Plugin Management

If you're using multiple Maven modules in your Maven project, you might want to
manage your plugin differently—split the plugin version and plugin
configuration. Plugin version can be declared in `PluginManagement` section of
the parent POM
<sup>(1)</sup>, and the configuration can be defined into other locations,
such as `properties` section <sup>(2.1)</sup> or `plugins` section
<sup>(2.2)</sup>:

```xml
<properties>
  <!-- 2.1 configure plugin -->
</properties>

<build>
  <plugins>
    <plugin>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <!-- 2.2 configure plugin -->
      </configure>
    </plugin>
  </plugins>

  <pluginManagement>
    <plugins>
      <!-- 1. manage plugin -->
      <plugin>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.8.0</version>
      </plugin>
    </plugins>
  </pluginManagement>
</build>
```

Now, let's talk about some advanced features.

## Advanced: Use Annotation Processor

If your Maven project contains code generation using annotation processor, Maven
compiler plugin has a configuration for you, called `annotationProcessorPath`.
It defines classpath elements to supply as annotation processor path. If
specified, the compiler will detect annotation processors only in those
classpath elements.

```xml
<plugin>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.0</version>
  <configuration>
    <annotationProcessorPaths>
      <annotationProcessorPath>
        <groupId>com.google.auto.value</groupId>
        <artifactId>auto-value</artifactId>
        <version>1.6.2</version>
      </annotationProcessorPath>
    </annotationProcessorPaths>
  </configuration>
</plugin>
```

The main benefit of using `annotationProcessorPath` is that the dependencies
declared here is _not_ included in your dependency tree. Therefore, it won't be
used by your clients transitively by mistake. A typical usage is when you use
Google's AutoValue Processor. If you don't want Google AutoValue is, check my
blog: [Why You Should Use Auto Value in Java?][7]

## Going Further

How to go further from here?

- To learn more about Maven Compiler Plugin, visit official documentation page
  <https://maven.apache.org/plugins/maven-compiler-plugin/>
- To toubleshoot Maven issues in IntelliJ, take a look at IntelliJ IDEA support
  page "Troubleshooting common Maven issue". <https://www.jetbrains.com/help/idea/troubleshooting-common-maven-issues.html>

The source code of this article is available on GitHub in project
`mincong-h/maven-demo`
([link](https://github.com/mincong-h/maven-demo/tree/blog-maven-compiler-plugin/maven-compiler-plugin)).

## Conclusion

In this post, we've learnt how to use Maven Compiler plugin: declaration in Maven
POM, the _source_ and _target_ options, valid Java versions, Java 11 support, and locations for
configuration. We've also seen some advanced configuration for this plugins.
Hope you enjoy this one, see you next time!

## References

- [Apache: Maven Compiler Plugin][1]
- [Stack Overflow: What version of javac built my jar?][2]
- [Oracle Doc: javac (Java 8)][4]
- [Oracle Doc: javac (Java 10)][6]
- [MCOMPILER-342: Unsupported class file major version 55][4]

[1]: https://maven.apache.org/plugins/maven-compiler-plugin/
[2]: https://stackoverflow.com/questions/3313532/what-version-of-javac-built-my-jar
[3]: https://github.com/mincong-h/maven-compiler-plugin-demo
[4]: https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javac.html
[5]: https://issues.apache.org/jira/browse/MCOMPILER-342
[6]: https://docs.oracle.com/javase/10/tools/javac.htm#JSWOR627
[7]: /2018/08/21/why-you-should-use-auto-value-in-java/
