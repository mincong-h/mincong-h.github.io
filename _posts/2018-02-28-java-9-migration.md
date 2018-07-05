---
layout:      post
title:       "Java 9 Migration"
date:        "2018-02-28 20:18:23 +0100"
categories:  [java, java9, maven]
tags:        [java, java9, maven]
comments:    true
---

Today, I'd like to talk about Java 9 migration for Maven project. It consists
Java 9 installation, IDE update, Maven project update, CI
update and fixing tests. I'm using macOS and IntelliJ IDEA. Perhaps some of the
content will not fit your situation. Please be ware of the diffretence. Now,
let's get started.

## Install Java 9

- Download JDK 9 from [Java SE Development Kit 9 Downloads][jdk9-download]
- Install JDK 9
- Ensure that Java verion is 9:

      $ java -version
      java version "9.0.4"
      Java(TM) SE Runtime Environment (build 9.0.4+11)
      Java HotSpot(TM) 64-Bit Server VM (build 9.0.4+11, mixed mode)

- Ensure that Java compiler version is 9:

      $ javac -version
      javac 9.0.4

## Update IDE

Ensure that your IDE is using the correct JDK. If you're using IntelliJ IDEA,
you should change the Project SDK:

- Open _Project Settings_ (<kbd>⌘</kbd> + <kbd>;</kbd>)
- Click button _New..._ in section _Project SDK_, choose _JDK_
- IntelliJ should already point to the new JDK: JDK 9. Click _Open_
- Click _OK_ to save changes.

Now we're done.

## Update Maven Project

### Maven Compiler Plugin

In pom.xml file, change the source and target value from **1.8** to **9** for
Maven compiler plugin:

```xml
<properties>
  <maven.compiler.source>9</maven.compiler.source>
  <maven.compiler.target>9</maven.compiler.target>
</properties>
```

### Maven Dependency Plugin

For Maven dependency plugin, only version 3.1.0+ supports Java 9 bytecode
analysis. See [MDEP-559 Java 9 bytecode cannot be parsed][MDEP-559]. As a
result, you need to upgrade the version to ensure goals `dependency:analyze`
and `dependency:analyze-only` can be executed correctly.

## Update Travis CI

Change the JDK version in Travis CI configuration file `.travis.yml` to use the
JDK 9:

```yml
jdk:
  - oraclejdk9
```

## Fix Dependency Issues

The Java EE APIs are no longer contained on the default class path in Java SE 9.
Some APIs like JAXB, Java Activation must be added as dependencies. Java 9
introduces the concepts of modules, and by default the `java.se` aggregate
module is available on the class path (or rather, module path). As the name
implies, the `java.se` aggregate module does not include the Java EE APIs that
have been traditionally bundled with Java 6/7/8.

Add the following dependencies to Maven to resolve
`java.lang.NoClassDefFoundError`:

```xml
<dependency>
  <groupId>javax.xml.bind</groupId>
  <artifactId>jaxb-api</artifactId>
  <version>2.2.11</version>
</dependency>
<dependency>
  <groupId>com.sun.xml.bind</groupId>
  <artifactId>jaxb-core</artifactId>
  <version>2.2.11</version>
</dependency>
<dependency>
  <groupId>com.sun.xml.bind</groupId>
  <artifactId>jaxb-impl</artifactId>
  <version>2.2.11</version>
</dependency>
<dependency>
  <groupId>javax.activation</groupId>
  <artifactId>activation</artifactId>
  <version>1.1.1</version>
</dependency>
```

## Conclusion

As you can see, updating to Java 9 is not an easy task to do. You need to handle
quite a lot of things to make it works. My post is written based on the
migration on my project "java-examples". See
[mincong-h/java-examples@befc891][befc891]. I ignored some tests too, because
they're failing and there's no quick solution to fix them. These tests are
principally related the mocking frameworks and byte-code manipulation.

## References

- [MDEP-559: Java 9 bytecode cannot be parsed (resolved)][MDEP-559]
- [StackOverflow: How to resolve java.lang.NoClassDefFoundError: javax/xml/bind/JAXBException in Java 9](https://stackoverflow.com/questions/43574426)

---

Update 2018-05-10: Maven Dependency Plugin 3.1.0 supports Java 9.

[befc891]: https://github.com/mincong-h/java-examples/commit/befc8915de7b2fcaef7fba0acb16ef4f4bc558dd
[MDEP-559]: https://issues.apache.org/jira/browse/MDEP-559
[jdk9-download]: http://www.oracle.com/technetwork/java/javase/downloads/jdk9-downloads-3848520.html
