---
article_num: 45
layout:      post
title:       "Learning Checkstyle"
lang:                en
date:        "2018-02-06 17:31:07 +0100"
categories:  [build]
tags:        [java, maven, checkstyle, code-quality]
excerpt:     >
  Checkstyle is a development tool to help programmers write Java code that
  adheres to a coding standard. By default it supports the Google Java Style
  Guide and Sun Code Conventions, but is highly configurable. It can be
  invoked with an ANT task and a command line program.
permalink:         /2018/02/06/learning-checkstyle/
comments:    true
image:       /assets/bg-coffee-171653_1280.jpg
cover:       /assets/bg-coffee-171653_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today I'd like to share my experience about Checkstyle setup for a Java/Maven
project of Nuxeo. Checkstyle is a development tool to help programmers write
Java code that adheres to a coding standard. By default it supports the Google
Java Style Guide and Sun Code Conventions, but is highly configurable. It can be
invoked with an ANT task and a command line program.

This task consists several steps:

1. Declare Checkstyle plugin in POM
2. Customize configuration in `checkstyle.xml`
3. Skip checks in Maven sub-modules
4. Suppress checks in Maven sub-modules

Let's begin.

## Declare Checkstyle Plugin in POM

Checkstyle plugin will be executed for each module of the Maven project, so we
need to declare it in the parent POM, section `<plugin>`. And we also need a
customized Checkstyle file, call `checkstyle.xml` in project's root directory.
Naming it `checkstyle.xml` is not mandatory, it just seems easier to search.
Personally, I declare the Checkstyle version in `<pluginManagement>` section
without extra configuration.

In plugin management:

{% highlight xml %}
<pluginManagement>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-checkstyle-plugin</artifactId>
      <version>3.0.0</version>
    </plugin>
  </plugins>
</pluginManagement>
{% endhighlight %}

In plugin:

{% highlight xml %}
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-checkstyle-plugin</artifactId>
  <executions>
    <execution>
      <id>checkstyle</id>
      <phase>validate</phase>
      <goals>
        <goal>check</goal>
      </goals>
    </execution>
  </executions>
  <configuration>
    <!-- Location is relative to the classpath -->
    <configLocation>checkstyle.xml</configLocation>
    <consoleOutput>true</consoleOutput>
    <failsOnError>true</failsOnError>
    <violationSeverity>error</violationSeverity>
    <includeTestResources>true</includeTestResources>
    <includeTestSourceDirectory>true</includeTestSourceDirectory>
    <resourceIncludes>**/*.xml</resourceIncludes>
  </configuration>
</plugin>
{% endhighlight %}

## Customize Configuration in checkstyle.xml

Here's the Checkstyle configuration file that I used for Nuxeo:

{% highlight xml %}
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
  "-//Puppy Crawl//DTD Check Configuration 1.3//EN"
  "http://checkstyle.sourceforge.net/dtds/configuration_1_3.dtd">
<module name="Checker">
  <property name="charset" value="UTF-8"/>

  <!-- Properties Files -->
  <module name="UniqueProperties">
    <property name="fileExtensions" value="properties"/>
  </module>

  <!-- Java Files -->
  <module name="TreeWalker">
    <!-- File Headers -->
    <module name="Regexp">
      <property name="format" value="\/\*\n \* \(C\) Copyright \d{4}(-\d{4})? Nuxeo \(http:\/\/nuxeo\.com\/\)\.\n \* This is unpublished proprietary source code of Nuxeo SA\. All rights reserved\.\n \* Notice of copyright on this source code does not indicate publication\.\n \*\n \* Contributors:\n" />
    </module>

    <!-- Class Design -->
    <module name="OneTopLevelClass"/>

    <!-- Coding -->
    <module name="OneStatementPerLine"/>

    <!-- Imports -->
    <module name="AvoidStarImport"/>
    <module name="RedundantImport"/>
    <module name="UnusedImports"/>

    <!-- Miscellaneous -->
    <module name="ArrayTypeStyle"/>
    <module name="OuterTypeFilename"/>
    <module name="UpperEll"/>

    <!-- Modifiers -->
    <module name="ModifierOrder"/>
    <module name="RedundantModifier"/>
  </module>

</module>
{% endhighlight %}

Now let's take a look into each line.

### Root Module: Checker

[_Checker_][checker] is the root module, which provides the functionality to
check a set of files. Everything being checked here are considered as UTF-8
encoding. In _Checker_ module, it consists two sub-modules, _UniqueProperties_
for unique check in properties files (\*.properties), and _TreeWalker_ module
for Java files (\*.java). Actually, many checks are submodules of the
_TreeWalker_ module. The _TreeWalker_ operates by separately transforming each
of the Java source files into an abstract syntax tree and then handing the
result over to each of its submodules which in turn have a look at certain
aspects of the tree.

### License Check

The Java file header check is handled by a _Regexp_ module. The header file must
be present on top of any Java file as:

{% highlight java %}
/*
 * (C) Copyright ${start.year}-${end.year} Nuxeo (http://nuxeo.com/).
 * This is unpublished proprietary source code of Nuxeo SA. All rights reserved.
 * Notice of copyright on this source code does not indicate publication.
 *
 * Contributors:
 *     ${user.name}
 */
{% endhighlight %}

where `${start.year}` is a 4-digits match `\d{4}`, and `${end.year}` is also a
4-digits match. However, the end year might not exist, when the Java is created
this year. Thus the date combination in regular expression become:
`\d{4}(-\d{4})?`. Here's the complete expression with XML escaping:

{% highlight xml %}
<module name="Regexp">
  <property name="format" value="\/\*\n \* \(C\) Copyright \d{4}(-\d{4})? Nuxeo \(http:\/\/nuxeo\.com\/\)\.\n \* This is unpublished proprietary source code of Nuxeo SA\. All rights reserved\.\n \* Notice of copyright on this source code does not indicate publication\.\n \*\n \* Contributors:\n" />
</module>
{% endhighlight %}

### Java Modifiers Check

The modifiers are checked by modules _ModifierOrder_ and _RedundantModifier_.
_ModifierOrder_ forces Java code to use the modifier order recommended by Java
Language Specification (JLS):

```
public
protected
private
abstract
default
static
final
transient
volatile
synchronized
native
strictfp
```

And _RedundantModifier_ will fail the build if any redundant modifiers found.

### Other Java Checks

The module _OneTopLevelClass_ detects whether there's only one top level class
declared as `public` or package-private (no modifier). If there're more than
one, then the build will fail. Indeed, you should use a separated Java file in
this case. The module _OneStatementPerLine_ checks whether there's only one
statement per line. Other checks are very easy to understand, so I won't
continue here.

## Skip checks in Maven sub-modules

In a multi-modules Maven project, it is important to be able to skip the module.
For example, you might want to skip when module contains only static resources,
the module is written in another language like JavaScript, or it contains only
third-party resources, that you don't want to modify. In this case, skip the
check with one Maven property:

{% highlight xml %}
<properties>
  <checkstyle.skip>true</checkstyle.skip>
</properties>
{% endhighlight %}

or configure in the Checkstyle plugin:

{% highlight xml %}
<plugin>
  <artifactId>maven-checkstyle-plugin</artifactId>
  <configuration>
    <skip>true</skip>
  </configuration>
</plugin>
{% endhighlight %}

## Suppress Checks in Maven sub-modules

In my case, I don't want to skip the Checkstyle entirely, but suppress warnings
conditionally. So I need to configure Checkstyle plugin to do it:

{% highlight xml %}
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-checkstyle-plugin</artifactId>
  <executions>
    <execution>
      <id>checkstyle</id>
    </execution>
  </executions>
  <configuration>
    <suppressionsLocation>checkstyle-suppressions.xml</suppressionsLocation>
    <suppressionsFileExpression>checkstyle.suppressions.file</suppressionsFileExpression>
  </configuration>
</plugin>
{% endhighlight %}

So the location of suppressions is defined as `checkstyle-suppressions.xml`.
Inside this file, we have the expressions for suppression. For example, I want
to suppress all the _Regexp_ check for XXX module, because they don't use the
same license as other modules:

{% highlight xml %}
<?xml version="1.0"?>
<!DOCTYPE suppressions PUBLIC
  "-//Puppy Crawl//DTD Suppressions 1.2//EN"
  "http://checkstyle.sourceforge.net/dtds/suppressions_1_2.dtd">
<suppressions>
  <!--
    Skip license check for Java files:
    XXX module does not use the same license.
   -->
  <suppress checks="Regexp" files=".+\.(?:java)$"/>
</suppressions>
{% endhighlight %}

Another example:

{% highlight xml %}
<?xml version="1.0"?>
<!DOCTYPE suppressions PUBLIC
  "-//Puppy Crawl//DTD Suppressions 1.2//EN"
  "http://checkstyle.sourceforge.net/dtds/suppressions_1_2.dtd">
<suppressions>
  <!--
    Skip all checks on files in package 'foo' in folder 'src/main/java',
    and ensure the regex is compatible to different OS.
   -->
  <suppress checks=".*" files="src[/\\]main[/\\]java[/\\]foo[/\\].*"/>
</suppressions>
{% endhighlight %}

## References

- [Checkstyle official website][checkstyle]
- [Preventing checkstyle from running in a specific maven submodule][1]

[checkstyle]: http://checkstyle.sourceforge.net/
[1]: https://stackoverflow.com/questions/13430161/preventing-checkstyle-from-running-in-a-specific-maven-submodule
[checker]: http://checkstyle.sourceforge.net/apidocs/com/puppycrawl/tools/checkstyle/Checker.html
