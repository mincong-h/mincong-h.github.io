---
layout:            post
title:             Inspect Maven Dependency Tree
date:              2019-11-11 14:13:13 +0100
categories:        [build]
tags:              [java, maven]
comments:          true
excerpt:           >
    Inspecting Maven dependencies via Maven Depenedency Plugin:
    dependency listing, dependency filtering, exporting result to file etc.
cover:             /assets/bg-vitto-sommella-CrDnEQE_9vY-unsplash.jpg
ads:               Ads idea
---

## Overview

If you are an experienced Java developer, you must be familiar with dependencies.
Dependency management is one of the most frequent tasks we handle as a
developer. To avoid reinventing the wheel, we add dependencies into our project
and use the existing solutions. But once a dependency comes in, we need to
maintain it by upgrading the version, updating our usage in the code, avoiding
dependency conflicts, applying security patch, and more.

That's where Maven Dependency Plugin comes in. Thanks to this plugin, we can
analyze dependency usage, detect duplicates, resolve plugin and their
dependencies, etc. Today, I will focus exclusively on its goal
`dependency:tree`, which allows inspecting the dependency tree of a given
project. This article uses the source code of [Apache Commons
CLI](https://github.com/apache/commons-cli) and
[Checkstyle](https://checkstyle.org/) as samples.

After reading this article, you will understand:
- How to display Maven dependency tree?
- How to filter dependencies by scope?
- How to export dependencies to a file?
- How to include/exclude dependencies?

## Dependency Tree

Maven dependency tree can be displayed using goal `dependency:tree` of Maven
Dependency Plugin. For example, here is the dependency tree of project Apache
Commons CLI:

<img style="max-width:450px"
     src="/assets/20191111-maven-dependency-tree.png"
     alt="Maven dependency tree" />

As you can see, this project only has one dependency on JUnit 4.12 for testing.
Since JUnit 4.12 depends on Hamcrest Core 1.3, Apache Commons CLI depends
transitively on Hamcrest as well for testing. However, such a dependency
relationship is only for testing, Apache Commons CLI does not have any
dependencies on compilation or runtime.
As you can see, each dependency is displayed using the following format:

```sh
${group}:${artifact}:${type}:${version}:${scope}
```

And symbol "`\-`" means the node below is a child dependency of the node above.

## Scope

While command `mvn dependency:tree` is easy to use, it also brings all the
dependencies to the result. Meanwhile, you might only interested in some of
them. One possible solution is to filter the result per scope. This can be done
using the command-line option `scope`. For example, displaying only dependencies of
scope "compile" can be done as:

    mvn dependency:tree -Dscope=compile

Here is an example for Apache Commons CLI, the result is empty because it does
not have any dependency for compilation:

<img style="max-width:400px"
     src="/assets/20191111-maven-dependency-tree-commons-cli-scope-compile.png"
     alt="maven dependency tree of scope compile on project Apache Commons CLI" />

Or another example for Checkstyle:

<img style="max-width:562px"
     src="/assets/20191111-maven-dependency-tree-checkstyle-scope-compile.png"
     alt="Maven dependency tree of scope compile on project checkstyle" />

If you want to learn more about the dependency scope of Maven, you can see
["Dependency
Scope"](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Dependency_Scope)
in Maven documentation "Introduction to the Dependency Mechanism".

## Export As File

Sometime, you might want to export the results to a file rather than
printing them in standard output (stdout). For example, when comparing
the difference of dependencies on the same project over time, it is practical to
export the results to files and perform a `diff` between them. In Maven Dependency Plugin, you can do it
using option `outputFile`:

```sh
# single module
mvn dependency:tree \
  -DoutputFile=/path/to/deps.txt
```

When working with a multi-module Maven project, you may also want to use option
`appendOutput` to avoid truncating the output. More preciously, after
module M finished writing dependencies to the output file, module M+1 goes on. By
default, the result of module M will be truncated and be replaced by the result
of module M+1. Using this option avoids such a situation.

```sh
# multi-module
mvn dependency:tree \
  -DappendOutput=true \
  -DoutputFile=/path/to/deps.txt
```

## Include/Exclude

You can use options `include` or `exclude`, respectively for including or
excluding dependencies which match your expressions. Expressions are a
comma-separated list of artifacts to filter from the serialized dependency tree.

```sh
${group}:${artifact}:${type}:${version}
```

where each pattern segment is optional and supports full and partial \*
wildcards. An empty pattern segment is treated as an implicit wildcard. 
For example, `org.apache.*` will match all artifacts whose group id starts
with `org.apache.`, and `:::*-SNAPSHOT` will match all snapshot artifacts.

## Further Reading

For decades, the discussion of software reuse was far more command than actual
software reuse. Today, the situation is reversed: developers reuse software
written by others every day, in the form of software dependencies, and the
situation goes mostly unexamined. Russ Cox, a Google employee, has written a
very article about dependency: [Our Software Dependency
Problem](https://research.swtch.com/deps), where he explained what is a
dependency, what could go wrong, dependency inspection (design, quality,
testing, debugging, maintenance, usage, security), dependency testing,
abstraction, isolation, and much more. I highly recommend this article to you.

## Conclusion

Today, we saw how to display Maven dependency tree via Maven Dependency Plugin.
Also, how to filter dependencies by scope, export results to file, and
include/exclude dependencies using expressions.
If you were interested to know more, you can subscribe to [my blog feed](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Maven, "Apache Maven Dependency Plugin", _Maven Documentation_, 2019.
  <https://maven.apache.org/plugins/maven-dependency-plugin/index.html>
- Maven, "Introduction to the Dependency Mechanism", _Maven Documentation_, 2019.
  <https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html>
