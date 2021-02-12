---
layout:            post
title:             Specifying Maven Local Repository From CLI
date:              2019-07-16 20:46:48 +0200
categories:        [build]
tags:              [java, maven]
comments:          true
excerpt:           >
    Use option "maven.repo.local" to specify the Maven local repository path.
cover:             /assets/bg-old-books-436498_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

By default, Maven uses `~/.m2/repository` as the default local repository. In
some cases, you might want to specify the path from Maven property
`maven.repo.local` as an alternative location.

    $ mvn -Dmaven.repo.local=/path/to/repo clean install

This option is specified via command line. In other words, no modification to
settings.xml is necessary. **Note: the local repository must be an absolute
path**, according to the guide of [Configuring
Maven](https://maven.apache.org/guides/mini/guide-configuring-maven.html).

## Demonstration

Here's a demo using my personal project
[mincong-h/java-examples](https://github.com/mincong-h/java-examples) as a
example:

```
java-examples $ pwd
/Users/mincong/github/java-examples

java-examples $ mkdir /tmp/mvn-repo

java-examples $ mvn clean install \
  -Dmaven.repo.local=/tmp/mvn-repo \
  -DskipTests
...
```

After the Maven build, all artifacts are stored in the new local repository.

```
java-examples $ tree /tmp/mvn-repo -L 2
/tmp/mvn-repo/
├── antlr
│   └── antlr
├── avalon-framework
│   └── avalon-framework
├── backport-util-concurrent
│   └── backport-util-concurrent
├── bouncycastle
│   └── bcprov-jdk15
├── cglib
│   └── cglib-nodep
├── classworlds
│   └── classworlds
├── com
│   ├── fasterxml
│   ├── google
│   ├── googlecode
│   ├── h2database
│   ├── jcraft
│   ├── sun
│   └── thoughtworks
├── commons-beanutils
│   └── commons-beanutils
├── commons-chain
│   └── commons-chain
...
├── commons-vfs
│   └── commons-vfs
├── dom4j
│   └── dom4j
├── io
│   ├── mincongh
│   └── vavr
├── javax
...
├── xmlunit
│   └── xmlunit
└── xpp3
    └── xpp3_min

126 directories, 0 files
```

## Why Using Alternative Local Repository?

In my own case, it's for [source code
escrow](https://en.wikipedia.org/wiki/Source_code_escrow). Source code escrow
is the deposit of the source code of software with a third-party escrow agent.
Escrow is typically requested by a party licensing software (the licensee), to
ensure maintenance of the software instead of abandonment or orphaning. The
software's source code is released to the licensee if the licensor files for
bankruptcy or otherwise fails to maintain and update the software as promised
in the software license agreement.

In this case, we need to have the source code
and all dependencies provided to the third-party escrow agent. Using a separated
local Maven repository allows to provide all dependencies of the project, while
keeping all existing ones unchanged in `~/.m2`.

## References

- Wikipedia, "Source code escrow", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/Source_code_escrow>
- Liska, "Specifying Maven's local repository location as a CLI parameter",
  _Stack Overflow_, 2011.
  <https://stackoverflow.com/q/6823462>
- Anthony Kong, "maven: Is it possible to override location of local repository
  via the use of command line option or env variable?", _Stack Overflow_, 2012.
  <https://stackoverflow.com/q/9123004>
- Maven, "Configuring Maven", _Apache Maven Project_, 2019.
  <https://maven.apache.org/guides/mini/guide-configuring-maven.html>
