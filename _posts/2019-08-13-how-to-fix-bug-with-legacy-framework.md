---
layout:            post
title:             6 Tips for Fixing Bugs with Legacy Frameworks
date:              2019-08-13 20:34:58 +0200
categories:        [java-core, java-testing]
tags:              [java, rest, gwt, git, javascript]
comments:          true
excerpt:           >
    In my daily work, I have to deal with legacy frameworks. Here are 6 tips
    that I summarized for bug-fixing, including documentation, searching,
    testing, patching library and more.
cover:             /assets/bg-boy-666803_1280.jpg
ads:               Book - Working Effectively with Legacy Code
---

## Overview

Bug-fixing is one of the most common things to do in software development.
Any experienced developer has already done this before: somewhere in the
codebase is broken, and you need to fix it. Regardless you know the framework or
you don't, you have to fix it. Whoever wrote the code, it is now on your duty...
This does not sound fun, especially come to legacy frameworks.

I have been in this situation for three years. Today, I would like to share my
tips about learning and fixing bugs with legacy framework. After reading this
article, you will understand how to search, read, learn, test, patch legacy
code. In the following paragraphs, I will use Jersey 1.x, Google Web Kit (GWT),
and jsPlumb as examples.

## Read and Search Documentation

Understanding different APIs is the first step before fixing anything. In our
codebase, we use Jersey 1.x as Java RESTful APIs framework. Actually, Jersey
2.0+ have been available since
[2013](https://github.com/jersey/jersey/releases/tag/2.0), but we are still
using Jersey 1.x because of Nuxeo Server: we develop on top of it. So as far as
Nuxeo doesn't upgrade to Jersey 2.x, we cannot upgrade.

**Read Javadoc**. Reading Javadoc is a good way to understand the code. For
Jersey 1.x, I found Javadoc in
<https://jersey.github.io/apidocs/1.19.1/jersey/index.html>, it helps a lot to
understand different configuration in Jersey.

**Search in Javadoc.** Once you find the website for Javadoc, you might want to
search exclusively in this website, or even a subset of the website starting
with the given URL. Therefore, all results are bound to this context. You can do
this by including the Javadoc URL in your search query. For example, searching
_"Resource Config"_ in <https://jersey.github.io/apidocs/1.19.1/>, you can use
query:

    site:jersey.github.io/apidocs/1.19.1/ Resource Config

As you can in the screenshot below, only one result is displayed in my search
engine DuckDuckGo:

![Search Query](/assets/20190813-search-query.png)

Obviously, similar techniques can be used for search on other websites, such as
Stack Overflow.

## Read Specification

In Java Enterprise Edition (Java EE), a lot of frameworks respect
specifications. Java specifications are developed as JSRs: Java Specification
Requests (<https://jcp.org/en/jsr/overview>). Understanding a JSR before fixing
legacy bugs can help you get the architecture overview, terminology, and the key
terms of the spec. For example, "Java API for RESTful Web Services" are
developed under 3 JSRs:

- [JSR 311: JAX-RS: The Java API for RESTful Web Services](https://jcp.org/en/jsr/detail?id=311)
- [JSR 339: JAX-RS 2.0: The Java API for RESTful Web Services](https://jcp.org/en/jsr/detail?id=339)
- [JSR 370: Java API for RESTful Web Services (JAX-RS 2.1) Specification](https://jcp.org/en/jsr/detail?id=370)

I downloaded the spec as PDF, and read it locally. It can be time-consuming, but
also very useful for mastering some parts of it.

## Search in the Codebase

Searching and reading the source code is another efficient way for understanding how
legacy framework works. Here I want to introduce 3 different tools:

1. git
2. rg (ripgrep)
3. fd (alternative to find)

I did it when trying to understand the JavaScript library
[jsPlumb](https://github.com/jsplumb/jsplumb/). We used a legacy version of it,
released in 2013.

### Git

Use Git to search the commit message. For example, search all commits
containing keyword _"connector"_:

```
$ git log --grep="connector"
```

Use Git to search the changes of a file, such as `connectors.js`:

```
$ git log --full-history --oneline  -- **/connectors.js
e407c3c6 add docs about flowchart midpoint
a753cfb2 document getLength function
aa5e09a8 small apidoc fix
69ce0cee update apidocs to yuidoc, build file changes to come
5d89f49a Merge branch 'master' of github.com:sporritt/jsPlumb
688e45d4 apidoc updates
d2e1030c switch docs to jsdoc format
f9c753fc more doc updates for transition to docular
```

### fd

> When using macOS, tool [fd](https://github.com/sharkdp/fd) can be installed
> using brew. Other installations are documented [here](https://github.com/sharkdp/fd#installation):
> ```
> $ brew install fd
> ```

Find all files containing keyword _"connector"_ in the filename:

```
jsplumb (master u=) $ fd connectors
demo/draggableConnectors
doc/api/connectors.js
doc/wiki/connectors.md
docs/connectors.html
src/connectors-bezier.js
src/connectors-flowchart.js
src/connectors-statemachine.js
src/connectors-straight.js
tests/miscellaneous/chartDemoConnectors.html
tests/miscellaneous/draggableConnectorsWithArrows.html
```

### rg

> When using macOS, tool [rg](https://github.com/BurntSushi/ripgrep) can be
> installed using brew. Other installations are documented
> [here](https://github.com/BurntSushi/ripgrep#installation).
>
> ```
> $ brew install ripgrep
> ```

Find all files containing keyword _"connector"_ in their content:

    $ rg connector

Find JS files containing keyword _"connector"_ in their content using glob
expression /\*\*/\*.js:

    $ rg connector -g /**/*.js

## Write Tests

Testing the framework is a good way to learn and ensure the legacy framework
works as expected. From my experience, it works best if you divide testing into
two parts:

- Learning the framework
- Fixing the bug

**At learning phrase**, you can write tests in your own pace. They can be
hosted in your personal repository. You are free to modify the code without
colleagues permissions and review. It's a very efficient way to learn.
Personally, I did it for some frameworks / technologies:
[Jersey 1.x](https://github.com/mincong-h/java-examples/tree/master/jersey-1.x),
[Polymer 2](https://github.com/mincong-h/learning-polymer),
[Google Web Kit (GWT)](https://github.com/mincong-h/learning-gwt),
[Batch](https://github.com/mincong-h/learning-batch) etc.

**At bug-fixing phrase**, the tests will be completely focus on the bug.
Usually, it will be much more difficult! It might mean that:

1. Set up testing if not exist, using external library
2. Avoid dependency conflicts
3. Ensure CI environment is able to execute the tests
4. Mock some parameters
5. Prepare dataset for testing
6. Write the tests
7. Ensure no regression on production

But it is worth the price! Because it ensures that there is no regression, and
the acceptance criteria is well respected. At the beginning, it might be very
time consuming, but more you practice, easier you will find it to be.

## Patch the Library

You can create a patched version of the library to include your own fix.
Patching the library can be more or less complex.

Patching a library can be very simple, such as copy-pasting of a JavaScript
file into your codebase. In that way, you can modify it freely. You might want
to do that because the library cannot be upgraded due to some constraints: time
constraint, dependency constraint, etc. Once you fixed the problem, I suggest
you to rename the file, e.g. put a suffix after the original filename. It helps
to distinguish the patched version with a normal one.

```sh
jquery.jsPlumb-1.5.5.js          # don't
jquery.jsPlumb-1.5.5-patched.js  # ok
```

Patching a library can be much more difficult, such as forking the repository
and create your own release. It requires you to have a good knowledge on the
build tools. Also, it requires you to have your own package repository for
storing the patched version. I did it once, for patching a [serialization
workaround](https://github.com/nuxeo/gwt/commit/84d351dfa0f3932e9e2dfad2cfaadb766730e8b9)
on Google Web Kit (GWT). The patched version is found here as
[nuxeo/gwt:2.8.2-NX1](https://github.com/nuxeo/gwt/releases/tag/2.8.2-NX1), and
artifacts are uploaded to Nuxeo's package repository.

## Mental Preparation

Don't expect that the bug can be fixed right away. Lower your expectation
(and your co-workers). Fixing it might take longer than expected. Generally
because:

- Lack of knowledge
- Lack of documentation
- Lack of test
- Lack of acceptance criteria
- Low popularity of the framework
- The complexity of the existing code
- Production regression (incomplete or side effect)
- Data migration
- Dependency conflicts
- Lack of build time check (compiler, lint tool, IDE inspection etc)
- Manual testing is much longer than automatic testing

## Conclusion

In this article, I shared some tips about doing bug-fixing on legacy framework
in my own experience. Reading spec and documentation, customize search query,
tools for searching efficiently in the source code, writing tests, patching
library and mental preparation. Hope you enjoy this article, see you the next
time!

## References

- Jersey, "jersey/jersey", _GitHub_, 2018.
  <https://github.com/jersey/jersey>
- JsPlumb, "jsplumb/jsplumb", _GitHub_, 2019.
  <https://github.com/jsplumb/jsplumb>
- GWT, "gwtproject/gwt", _GitHub_, 2019.
  <https://github.com/gwtproject/gwt>
- fd, "sharkdp/df", _GitHub_, 2019.
  <https://github.com/sharkdp/fd>
- rg, "BurntSushi/ripgrep", _GitHub_, 2019.
  <https://github.com/BurntSushi/ripgrep>
- Java Community Process, "JSRs: Java Specification Requests", _JCP_, 2019. <https://jcp.org/en/jsr/overview>
