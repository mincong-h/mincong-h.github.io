---
layout:            post
title:             Maven Compiler Plugin Understanding
date:              2018-08-29 19:08:27 +0200
last_modified_at:  2018-08-30 18:23:44 +0200
categories:        [tech, series]
tags:              [maven, java]
comments:          true
excerpt:           >
    A step-by-step guide for understanding Maven Compiler Plugin in Java 11.
img_url:           /assets/bg-coffee-84624_1280.jpg
img_width:         1280
img_height:        960
---

[Maven Compiler Plugin][1] might be the most important plugin in Maven. It is
used to compile the sources of your project, which transform Java files
(\*.java) into class files (\*.class).  This plugin has two goals:
**compile** and **testCompile**. Both are bound to the Maven Lifecycle and are
automatically executed: during `compile` phrase and `test-compile` phrase
respectively.

## How to Use Maven Compiler Plugin?

Since Maven Compiler Plugin is bound automatically to Maven phrases, you don't
need to declare anything. The only thing you need to override might be the target
version and the source version of the class files: Option `source` indicates
which Java programming language version is used to compile the source code, and
option `target` indicates which JVM version will the generated class files be
targeted. You can declare them as Maven properties:

{% highlight xml %}
<properties>
  <maven.compiler.source>11</maven.compiler.source>
  <maven.compiler.target>11</maven.compiler.target>
</properties>
{% endhighlight %}

Another way is to configure the plugin directly:

{% highlight xml %}
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
{% endhighlight %}

In most cases, the values of both options are the same. Here, we're using Java
11 to compile our source code (`-source 11`) and we're targeting to JVM 11
(`-target 11`).
Now, if you do `mvn compile`, `mvn install` or any other command which invokes
the phrase _compile_, the Maven Compiler Plugin will be triggered correctly.

## Java 11 Support

Java 11 is supported by Maven Compiler Plugin 3.8.0+. If you're using a version
prior to 3.8.0, you might have the following error:

> ```
> Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.7.0:compile (default-compile) on project java-examples-dev-core: Execution default-compile of goal org.apache.maven.plugins:maven-compiler-plugin:3.7.0:compile failed: Unsupported class file major version 55 -> [Help 1]
> ```

Changing the existing version to 3.8.0 should work.

{% highlight xml %}
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.0</version>
</plugin>
{% endhighlight %}

A full demo written in Java 11 is available in my GitHub:
[mincong-h/maven-compiler-plugin-demo][3].

## PluginManagement

If you're using multiple Maven modules in your Maven project, you might want to
manage your plugin differently—split the plugin version and plugin
configuration. Plugin version can be declared in `PluginManagement` section of
the parent POM
<sup>(1)</sup>, and the configuration can be defined into other locations,
such as `properties` section <sup>(2.1)</sup> or `plugins` section
<sup>(2.2)</sup>:

{% highlight xml %}
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
{% endhighlight %}

Now, let's talk about some advanced features.

## Advanced: Use 2 Java Versions on Maven Modules

You can target two different versions of Java in Maven modules, just by changing
the Maven properties:

pom.xml (Java 11):

{% highlight xml %}
<properties>
  <maven.compiler.source>11</maven.compiler.source>
  <maven.compiler.target>11</maven.compiler.target>
</properties>
{% endhighlight %}

shop-api/pom.xml (Java 11):

{% highlight xml %}
<properties>
  <!-- no changes -->
</properties>
{% endhighlight %}

shop-core/pom.xml (Java 11):

{% highlight xml %}
<properties>
  <!-- no changes -->
</properties>
{% endhighlight %}

shop-legacy/pom.xml (Java 8):

{% highlight xml %}
<properties>
  <maven.compiler.source>8</maven.compiler.source>
  <maven.compiler.target>8</maven.compiler.target>
</properties>
{% endhighlight %}

## Conclusion

In this post, we've learnt how to use Maven Compiler plugin: declaration in Maven
POM, the _source_ and _target_ options, Java 11 support, and locations for
configuration. We've also seen some advanced configuration for this plugins.
Hope you enjoy this one, see you next time!

The source code is available on GitHub:
[mincong-h/maven-compiler-plugin-demo][3].

## References

- [Apache: Maven Compiler Plugin][1]
- [Stack Overflow: What version of javac built my jar?][2]
- [Oracle Doc: javac][4]
- [MCOMPILER-342: Unsupported class file major version 55][4]

[5]: https://issues.apache.org/jira/browse/MCOMPILER-342
[1]: https://maven.apache.org/plugins/maven-compiler-plugin/
[2]: https://stackoverflow.com/questions/3313532/what-version-of-javac-built-my-jar
[3]: https://github.com/mincong-h/maven-compiler-plugin-demo
[4]: https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javac.html
