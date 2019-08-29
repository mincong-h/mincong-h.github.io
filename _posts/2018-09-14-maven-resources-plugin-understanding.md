---
layout:            post
title:             Maven Resources Plugin Understanding
date:              2018-09-14 05:51:48 +0200
categories:        [tech, series]
tags:              [java, maven]
comments:          true
excerpt:           >
  Maven Resources Plugin is part of the core Maven plugins, which handles
  resources copying to the output directory. It has 3 goals: "resources",
  "testResources", and "copy-resources". In this post, I'll show you some
  common use-cases of this plugin.
image:             /assets/bg-tools-1209764_1280.jpg
img_width:         1280
img_height:        853
series:            Maven Plugins
---

## Overview

Maven Resources Plugin is part of the core Maven plugins, which handles
resources copying to the output directory. It has 3 goals: `resources`,
`testResources` and `copy-resources`. The 3 variations only differ in how the
resource and output directory elements are specified or defaulted. In this post,
I'll show you these goals and some common use-cases of this plugin.

The source code is available on GitHub: [mincong-h/maven-resources-pluin-demo][git].

## Resource Directories

According to Maven [Standard Directory Layout][layout], resources and resource
filters should be defined in the following locations of the project:

Path | Description
:--- | :---
`src/main/resources` | Application/Library resources
`src/main/filters` | Resource filter files
`src/test/resources` | Test resources

These are default values. In lack of _"project.build.resources"_ element in your POM
file, the default value for application resources will be applied
(`src/main/resources`). Same for test resources. It is not a MUST to follow Maven's
recommendation in your project, I'll explain the customization later on in this
article. The notion of _resources filter_ will be explained later, too.

## Goal resources:resources

Goal `resources:resources` copies the resources for the main source code to the
main output directory. This goal is bound by default to the `process-resources`
lifecycle phase. It uses _project.build.resources_ element to specify the
resources, and uses _project.build.outputDirectory_ to specify the destination.

- `project.build.resources`: resources directories
- `project.build.outputDirectory`: destination

For example, after invoking this goal in my Maven module `standard`:

    $ mvn resources:resources

The resources files are copied from `src/main/resources` to `target/classes`:

```
$ tree src/main/resources/ target/classes/
src/main/resources/
└── foo.properties
target/classes/
└── foo.properties

0 directories, 2 files
```

## Goal resources:testResources

Goal `resources:testResources` is almost the same as `resources:resources`. The
only difference between them is their output directory. The former one 
points to _target/classes_, while the later one points to _target/test-classes_.
It means that test resources will not be packaged as part of artifact. It is
only present for testing propose.

- `resources:resources`: _target/classes_
- `resources:testResources`: _target/test-classes_

## Variable Injection (Filtering)

Maven Resources Plugin allows you to inject variables into resources
files. These variables are denoted by expression `${...}`. They can
come from system properties, project properties, filter resources and the
command line. The filtering is achieved by activating the `filtering` option.

By doing this, variables will be injected into resource files. For example, if
we have a resource `src/main/resources/foo.properties` containing:

```
myProp=${myProp}
```

The resource output in `target/classes/foo.properties` will be:

```
myProp=Value from POM
```

The related POM file looks like:

{% highlight xml %}
<project>
  ...

  <properties>
    <myProp>Value from POM</myProp>
  </properties>

  <build>
    <resources>
      <resource>
        <directory>src/main/resources</directory>
        <filtering>true</filtering>
      </resource>
    </resources>
  </build>
</project>
{% endhighlight %}

Defining properties from POM is not the only way to provide values. You can also
provide them via system properties, command line option, and resource filter.
Now, let's take a look on resource filters.
Resource filters can be defined in _"project.build.filters"_ element. Each
`filter` is a properties file containing key-value pairs for variables. According
to Maven standard directory layout, it's recommended to store these files
in directory `src/main/filters`.

{% highlight xml %}
<build>
  <resources>
    <resource>
      <directory>src/main/resources</directory>
      <filtering>true</filtering>
    </resource>
  </resources>
  <filters>
    <filter>src/main/filters/filter.properties</filter>
  </filters>
</build>
{% endhighlight %}

Compared to other solutions, using resource filters simplifies the POM file. It
makes the POM file purely declarative, and delegates
the resource filtering to resource filters. It's useful when you have many
resource variables in your project.

## Multiple Resources Directories

By default, Maven use `src/main/resources` as resources directory. However, you
might want to define your own resources directories. This can be done by
specifying them into your POM in section `project/build/resources`.

For example, using `resources1` and `resources2` as resources directories:

{% highlight xml %}
<build>
  <resources>
    <resource>
      <directory>src/main/resources1</directory>
    </resource>
    <resource>
      <directory>src/main/resources2</directory>
    </resource>
    <resource>
      <directory>src/main/resources3</directory>
    </resource>
  </resources>
</build>
{% endhighlight %}

All the files of these resources directories will be included into target folder
`target/classes`:

```
directories $ mvn resources:resources
directories $ tree target/classes/
target/classes/
├── file1
├── file2
├── file3
└── foo.properties

0 directories, 4 files
```

> _WARNING:_ do not use file having the same name in different resources
> directories. Since all files will be copied to the same output directory.
> There's no guarantee which version will be used. For example, you've 3
> resources files:
>
> - `src/main/resources1/foo.properties`
> - `src/main/resources2/foo.properties`
> - `src/main/resources3/foo.properties`
>
> Which one will be available in `target/classes`? Maven Resources Plugin
> cannot handle this properly.

## Including and Excluding

Sometimes, you don't want to include all files as resources. You only want to
include some of them, or exclude some of them. These can be done using
`<include>` and `<exclude>` directives respectively.

Inclusion:

{% highlight xml %}
<resources>
  <resource>
    <directory>src/main/resources</directory>
    <includes>
      <include>**/*.txt</include>
    </includes>
  </resource>
</resources>
{% endhighlight %}

Exclusion:

{% highlight xml %}
<resources>
  <resource>
    <directory>src/main/resources</directory>
    <excludes>
      <exclude>**/*.txt</exclude>
    </excludes>
  </resource>
</resources>
{% endhighlight %}

You can also combine both. For example, only include TXT files as resources, but
exclude the internal ones (containing keyword `internal`):

{% highlight xml %}
<resources>
  <resource>
    <directory>src/main/resources</directory>
    <includes>
      <include>**/*.txt</include>
    </includes>
    <excludes>
      <exclude>**/*internal*.*</exclude>
    </excludes>
  </resource>
</resources>
{% endhighlight %}

The include and exclude directives support glob expressions.

## Copy Resources

You can use mojo `copy-resources` to copy resources which are not in the
default Maven layout or not declared in the `build/resources` element and attach
it to a phase. Since this is not a common use-case, I won't detail more in this
article. For more information, see Maven official guide about this goal.

I used it once in a GWT project: GWT transpiles Java source code (`*.java`) into
JavaScript. However, not all the source code are written by ourselves—some are
generated by Java annotation processor during compilation. Therefore, mojo
`copy-resources` can be used, to copy generated Java files into target
directory for GWT transpilation.

## Conclusion

In this post, we learnt what is Maven Resources Plugin, how to inject variables
using filtering mechanism, define customized resources directories, include or
exclude directories/files, and copying resources. As usual, the source code is
available on GitHub: [mhuang/maven-resources-plugin-demo][git]. Hope your enjoy
this one, see you the next time!

## References

- [Maven: Standard Directory Layout][layout]
- [Maven: Resources Plugin][plugin]

[git]: https://github.com/mincong-h/maven-resources-plugin-demo/
[plugin]: https://maven.apache.org/plugins/maven-resources-plugin/
[layout]: https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html
