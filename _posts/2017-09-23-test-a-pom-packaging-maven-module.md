---
layout:      post
title:       "Test a POM-Packaging Maven Module"
lang:                en
date:        "2017-09-23 08:59:24 +0200"
categories:  [build]
tags:        [maven, java]
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Recently, I need to write tests for resources inside a Maven module and I met
some technical issues. The context of the situation is that I need to test some
resources located in a Maven module, where its packaging value is `pom`. I
think it's worth to take some notes, so I wrote them down and share with you.

<!--more-->

## Maven Surefire Understanding

In most of the time, you can write unit-tests in Maven by following the naming
convention `*Test` or `Test*`. Then Maven knows how to run them correctly using
the `surefire` plugin. These tests can be triggered by command:

    mvn test

Behind the screen, Surefire plugin uses the goal `surefire:test` to run tests.
From its [documentation page][surefire-test], we can see that the plugin is
_"Binds by default to the lifecycle phase: `test`"_. So it will be triggered by
command `mvn test`, or any other Maven commands binding to phase `test`.

## Packaging Value And Plugin Bindings

When no packaging is declared, Maven assumes the artifact is the default: `jar`.
However, you can define your own packaging goal for this Maven module. The
current core packaging values are: `pom`, `jar`, `maven-plugin`, `ejb`, `war`,
`ear`, `rar`, `par`. According to how you define the packaging value, different
plugins will be binded to your Module. Documentation page [plugin
bindings][plugin-bindings] provides defails about such behaviors.

In our case, the packaging value has impacts on whether plugin goal
`surefire:test` will be triggered. Let's take a look for `jar` packaging and
`pom` packaging.

**For `jar` packaging, the plugin bindings are:**

{% highlight xml %}
<phases>
  <process-resources>
    org.apache.maven.plugins:maven-resources-plugin:2.6:resources
  </process-resources>
  <compile>
    org.apache.maven.plugins:maven-compiler-plugin:3.1:compile
  </compile>
  <process-test-resources>
    org.apache.maven.plugins:maven-resources-plugin:2.6:testResources
  </process-test-resources>
  <test-compile>
    org.apache.maven.plugins:maven-compiler-plugin:3.1:testCompile
  </test-compile>
  <test>
    org.apache.maven.plugins:maven-surefire-plugin:2.12.4:test
  </test>
  <package>
    org.apache.maven.plugins:maven-jar-plugin:2.4:jar
  </package>
  <install>
    org.apache.maven.plugins:maven-install-plugin:2.4:install
  </install>
  <deploy>
    org.apache.maven.plugins:maven-deploy-plugin:2.7:deploy
  </deploy>
</phases>
{% endhighlight %}

So the `test` phrase is included, where the plugin `surefire:test` will be
executed.

**For `pom` packaging, the plugin bindings are:**

{% highlight xml %}
<phases>
  <install>
    org.apache.maven.plugins:maven-install-plugin:2.4:install
  </install>
  <deploy>
    org.apache.maven.plugins:maven-deploy-plugin:2.7:deploy
  </deploy>
</phases>
{% endhighlight %}

So the `test` phrase is not included, and only the `install` phrase and
`deploy` phrase are included. It also explains why no test will be executed if
you use command `mvn test` in such module.

## Adding Surefire Plugin Into Module

But what if you really need to run unit-tests inside a Maven module having
`<packaging>pom</packaging>`? Well, in this case, you need to declare the plugin
explicitly in the module `pom.xml` saying that you want to run that:

{% highlight xml %}
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <execution>
        <id>testCompile</id>
        <goals>
          <goal>testCompile</goal>
        </goals>
      </execution>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
      <execution>
        <id>test</id>
        <goals>
          <goal>test</goal>
        </goals>
      </execution>
    </plugin>
  </plugins>
</build>
{% endhighlight %}

## Adding Resources Plugin Into Module

You might be interested by adding the Maven resources plugin too, so that Maven
can copy the resources from `src/main/resources` to the test folder
`target/test-classes`. The plugin will be executed in the `testResources`
phrase.

{% highlight xml %}
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-resources-plugin</artifactId>
      <execution>
        <id>testResources</id>
        <goals>
          <goal>testResources</goal>
        </goals>
      </execution>
    </plugin>
  </plugins>
  <testResources>
    <testResource>
      <directory>${project.basedir}/src/main/resources</directory>
    </testResource>
  </testResources>
</build>
{% endhighlight %}

Now, you can write your tests and run them using:

    mvn test

So everything is done: you can run the tests in your `pom` packaging module now.

## Rethinking About the Design

I spent the whole day to understand the above topics, and I'm quite satisfied
about the knowledge that I learned. However, is it really a good idea to add
tests in a pom-packaging module?

**It's a bad idea to do so—it goes against the modularization.** The `pom`
packaging assembles modules and resources coming from different location. Its
role is not to test any resources or module. It has its own job and does it
well. If we want to do some tests, depending on the context, we might have
several choices:

1. For unit test, embed the tests into another module, where the source classes
or source resources come from. These tests should be done before generating the
artifact.
2. For integration test, we might want to wait until the packaging is finished
before testing it. And this can be moved to a new Maven module, like
`xxx-tests`. 

In any case, doing tests in a `<packaging>pom</packaging>` module sounds to be a
bad idea.

[surefire-test]: http://maven.apache.org/surefire/maven-surefire-plugin/test-mojo.html
[plugin-bindings]: http://maven.apache.org/ref/3.5.0/maven-core/default-bindings.html
