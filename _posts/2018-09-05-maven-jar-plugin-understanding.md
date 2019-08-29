---
layout:            post
title:             Maven JAR Plugin Understanding
date:              2018-09-05 20:04:39 +0200
categories:        [tech, series]
tags:              [maven, java]
comments:          true
excerpt:           >
    A step-by-step guide for understanding Maven JAR Plugin in Java 8 and Java
    11.
image:             /assets/bg-tools-1209764_1280.jpg
img_width:         1280
img_height:        853
series:            Maven Plugins
---

[Maven JAR Plugin][maven] is one of the core plugins of the Maven build
tool. It is used to build JARs. After reading this post, you'll understand:

- What is JAR?
- What is Maven JAR Plugin?
- How to invoke Maven JAR Plugin?
- How to create an executable JAR?
- Java 11 support

Now, let's get started!

## What is JAR?

Before going further, we must first understand what is JAR.

A **JAR** (**J**ava **AR**chive) is a package file format typically used to
aggregate many Java class files and associated metadata and resources (text,
images, etc.) into one file for distribution. JAR files are archive files that
include a Java-specific manifest file. They are built on the ZIP format and
typically have a `.jar` file extension.
For more detail, see wikipedia: [JAR (file format)][wiki]

Item | Description
:--- | :---
Filename extension | `.jar`
Internet media type | `application/java-archive`
Uniform Type Identifier (UTI) | com.sun.java-archive
Developed by | Netscape, Sun Microsystems, Oracle Corporation
Type of format | File archive, data compression
Extended from | ZIP

If you have a Java application packaged as a standalone JAR file, you can run it
as:

{% highlight bash %}
java -jar /path/to/app.jar
{% endhighlight %}

## What is Maven JAR Plugin?

[Maven JAR Plugin][maven] is used to build JARs. It contains two goals:

- `jar:jar` create a jar file for your project classes inclusive resources.
- `jar:test-jar` create a jar file for your project test classes.

When you want to create a JAR with Maven, you need to create a POM file
`pom.xml` with the following content. Note that `<packaging>` default to
_"jar"_, so you can omit this field:

{% highlight xml %}
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>shop</groupId>
  <artifactId>shop-core</artifactId>
  <version>1.0-SNAPSHOT</version>
  <!-- <packaging>jar</packaging>  -->
</project>
{% endhighlight %}

## How to Invoke JAR Plugin?

Maven JAR Plugin is bound to [Maven Build Life Cycle][mvn-lifecycle]. Both goals
`jar:jar` and `jar:test-jar` are bound to lifecycle phase: `package`. Therefore,
using any other commands which invode phase `package`, Maven JAR Plugin will be
executed. For example, the following commands can invoke Maven JAR Plugin:

- `mvn clean install`
- `mvn clean package`
- `mvn clean verify`
- ...

Of course, there're more than that, but I'm not going to list all of them.
You can see the plugin's goal invoked in the logs of Maven's execution:

{% highlight bash %}
maven-jar-plugin-demo-java8 $ mvn package
[INFO] Scanning for projects...
[INFO]
[INFO] --------------------------< shop:shop-parent >--------------------------
[INFO] Building Shop Parent 1.0-SNAPSHOT                                  [1/3]
[INFO] --------------------------------[ pom ]---------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ shop-parent ---
[INFO]
[INFO] ---------------------------< shop:shop-api >----------------------------
[INFO] Building Shop API 1.0-SNAPSHOT                                     [2/3]
[INFO] --------------------------------[ jar ]---------------------------------
...
[INFO] --- maven-jar-plugin:3.1.0:jar (default-jar) @ shop-api ---
[INFO] Building jar: /Users/mincong/github/maven-jar-plugin-demo-java8/shop-api/target/shop-api-1.0-SNAPSHOT.jar
[INFO]
[INFO] ---------------------------< shop:shop-core >---------------------------
[INFO] Building Shop Core 1.0-SNAPSHOT                                    [3/3]
[INFO] --------------------------------[ jar ]---------------------------------
...
[INFO] --- maven-jar-plugin:3.1.0:jar (default-jar) @ shop-core ---
[INFO] Building jar: /Users/mincong/github/maven-jar-plugin-demo-java8/shop-core/target/shop-core-1.0-SNAPSHOT.jar
{% endhighlight %}

If you want to run the code yourself, check my GitHub
[mincong-h/maven-jar-plugin-demo-java8][demo-java8].

## Create an Executable JAR

Create an executable JAR, requires some customization in Maven. You need to
configure Maven Archieve accordinly—you need to tell it which main class to
user. This is done via the `<mainClass>` configuration element. Here's a sample
`pom.xml` configured to add the classpath and use the class `shop.core.Main` as
the main class:

{% highlight xml %}
<project>
  ...
  <build>
    <plugins>
      <plugin>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
          <archive>
            <manifest>
              <addClasspath>true</addClasspath>
              <mainClass>shop.core.Main</mainClass>
            </manifest>
          </archive>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
{% endhighlight %}

And you can package the application and execute it like:

{% highlight bash %}
$ mvn clean package
$ java -classpath shop-api/target/shop-api-1.0-SNAPSHOT.jar:shop-core/target/shop-core-1.0-SNAPSHOT.jar shop.core.Main
Welcome to Java 8
{% endhighlight %}

> Note:
> - use semi-colon (`;`) as module path separator on Windows
> - use colon (`:`) as module path separator on macOS/Linux

## Java 11 Support

**Maven JAR plugin works for Java 11 _without_ additional configuration, but be
careful about Modules.**
You can package the application as usual using:

```
$ mvn package
```

In regard to execution, you need to care about Java Platform Module System
(JPMS): provide the module path (`--module-path`) and the module (`-m`, `--module`) to
execute. No classpath is required. In our case, we have 2 modules in the module
paths:

Java Module | File Path
:---------- | :---
`shop-api`  | `shop-api/target/shop-api-1.0-SNAPSHOT.jar`
`shop-core` | `shop-core/target/shop-core-1.0-SNAPSHOT.jar`

Here're the commands for packaging the app and printing _"Welcome to Java 11"_:

{% highlight bash %}
$ mvn clean package
$ java --module-path shop-api/target/shop-api-1.0-SNAPSHOT.jar:shop-core/target/shop-core-1.0-SNAPSHOT.jar --module shop-core/shop.core.Main
Welcome to Java 11 
{% endhighlight %}

> Note:
> - use semi-colon (`;`) as module path separator on Windows
> - use colon (`:`) as module path separator on macOS/Linux

If you want to run the code yourself, check my GitHub
[mincong-h/maven-jar-plugin-demo-java11][demo-java11].

## Conclusion

In this post, we learnt what is JAR, what is Maven JAR Plugin, how to invoke it,
and how to create an executable JAR. We also learnt how to use Maven JAR Plugin
in Java 11 for Java Platform Module System (JPMS). If you need more information,
the full source code are available on GitHub:

- [mincong-h/maven-jar-plugin-demo-java8][demo-java8]
- [mincong-h/maven-jar-plugin-demo-java11][demo-java11]

Hope you enjoy this post, see you the next time!

## References

- [Wikipedia: JAR (file format)][wiki]
- [Maven Archiver: Make the JAR executable][1]
- [DZone: Java 9 Modules (Part 2): IntelliJ and Maven][2]
- [GitHub: mincong-h/maven-jar-plugin-demo-java8][demo-java8]
- [GitHub: mincong-h/maven-jar-plugin-demo-java11][demo-java11]

[demo-java11]: https://github.com/mincong-h/maven-jar-plugin-demo-java11
[demo-java8]: https://github.com/mincong-h/maven-jar-plugin-demo-java8
[2]: https://dzone.com/articles/java-9-modules-part-2-intellij-and-maven
[1]: http://maven.apache.org/shared/maven-archiver/examples/classpath.html#Make
[mvn-lifecycle]: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
[maven]: http://maven.apache.org/plugins/maven-jar-plugin/
[wiki]: https://en.wikipedia.org/wiki/JAR_(file_format)
[so]: https://stackoverflow.com/questions/574594/how-can-i-create-an-executable-jar-with-dependencies-using-maven
