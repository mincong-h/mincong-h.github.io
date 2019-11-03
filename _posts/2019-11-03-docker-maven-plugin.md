---
layout:            post
title:             Docker Maven Plugin
date:              2019-11-03 17:31:28 +0100
categories:        [tech]
tags:              [java, docker, maven]
comments:          true
excerpt:           >
    Introduction to Docker Maven Plugin: how to build and run
    Docker images in Maven via samples from Debezium and Docker Maven
    Plugin itself.
image:             /assets/bg-erwan-hesry-RJjY5Hpnifk-unsplash.jpg
ads:               Ads idea
---

## Overview

Recently I contributed to project [Debezium](https://debezium.io/), an
open-source distributed platform for change data capture (CDC). That's how I
discovered Maven Docker Plugin, an amazing tool to make Docker part of your
build pipeline. In this article, I will share some basic knowledge I learned from
Debezium and samples of Docker Maven Plugin. More precisely, I will talk about:

- Why using Docker Maven Plugin?
- Structure of Docker Maven Plugin
- How to build Docker image?
- How to run Docker image?
- Maven goal binding

This article uses Debezium v1.0.0.Beta2 and Docker Maven Plugin version v0.26.0.
Now, let's get started :)

## Motivation

The typical artifacts created by Maven are JAR, WAR, and EAR. Thanks to Maven
Docker Plugin, we can also deliver Docker images from Maven build. It means that
we can run the build in one line even with Docker included. Without Docker Maven
Plugin, meeting this requirement wouldn't be easy, it would require us to
configure the build pipeline in CI, such as Travis, Jenkins, or GitLab.
This will be less user-friendly for localhost development and more CI-dependent. Also,
using Docker Maven Plugin makes the build benefit from maven properties or the
Maven system in general.

Being able to run Docker containers during Maven build is another advantage. It
enables many possibilities for testing: you can test apps running on different
versions of Java, different programming languages, different operation systems,
and more. It also helps to avoid classpath conflicts in your dependencies.
Thanks to Docker Maven Plugin, Debezium can test different databases, such as
MySQL, PostgreSQL, and SQL Server effortlessly.

- Test Docker containers
  - Cross Java version support
  - Cross programming language support
  - Cross OS support
  - Avoid Java classpath conflicts
- Create Docker image using Maven
  - Package the software in one line
  - Benefit from Maven properties or the Maven system in general

## Structure

You can declare Docker Maven Plugin as other Maven plugins in your POM file.
Here is an example from "Debezium Connector for PostgreSQL". In this excerpt, we
can see that the configuration is grouped by image: each image has
its configuration sections for building (`<build>`) and running (`<run>`).
The structure of both
sections is very similar to their original Docker commands: [docker-build
command (Dockerfile reference)](https://docs.docker.com/engine/reference/builder/) and
[docker-run command](https://docs.docker.com/engine/reference/commandline/run/).
Let's get into these commands in the next paragraphs.

```xml
<plugin>
  <groupId>io.fabric8</groupId>
  <artifactId>docker-maven-plugin</artifactId>
  <configuration>
    <images>
      <image>
        <name>debezium/postgres-server-test-database</name>
        <run>...</run>
        <build>...</build>
      </image>
    </images>
  </configuration>
  ...
</plugin>
```

## Build

There are two modes to build a Docker image using Docker Maven Plugin: inline plugin
configuration or external Dockerfile/Docker archive. Regardless which mode
chosen, the images will be built via Maven goal:

    mvn docker:build

Note that if you just want to run tests against an existing image, you don't
need build your own image: pulling that image from Docker registry is enough.

### Build: Inline Plugin Configuration

Debezium uses inline plugin configuration. In Maven module "Debezium Connector for
PostgreSQL", the build for image "debezium/postgres-server-test-database" is
declared as follows (I replaced the Maven variables by their actual value to
make the content easier to understand):

```xml
<build>
  <from>debezium/postgres:9.6</from>
  <runCmds>
    <run>ln -fs /usr/share/zoneinfo/US/Samoa /etc/localtime &amp;&amp; echo timezone=US/Samoa &gt;&gt; /usr/share/postgresql/postgresql.conf.sample</run>
  </runCmds>
</build>
```

As you can see, the base image got slightly modified by setting the timezone to
US/Samoa. When executing the goal `docker:build`, you can see the
effective Docker commands used to assemble the image. In other words, the
Dockerfile is created on the fly with all instructions extracted from the
given configuration.

```
[INFO] --- docker-maven-plugin:0.26.0:build (default-cli) @ debezium-connector-postgres ---
...
[INFO] DOCKER> Pulled debezium/postgres:9.6 in 25 seconds
[INFO] Building tar: /Users/mincong/github/debezium/debezium-connector-postgres/target/docker/debezium/postgres-server-test-database/tmp/docker-build.tar
[INFO] DOCKER> [debezium/postgres-server-test-database:latest]: Created docker-build.tar in 106 milliseconds
[INFO] DOCKER> Step 1/2 : FROM debezium/postgres:9.6
[INFO] DOCKER>
[INFO] DOCKER> ---> 8bf61215f1ee
[INFO] DOCKER> Step 2/2 : RUN ln -fs /usr/share/zoneinfo/US/Samoa /etc/localtime && echo timezone=US/Samoa >> /usr/share/postgresql/postgresql.conf.sample
[INFO] DOCKER>
[INFO] DOCKER> ---> Running in 5173c22471c7
[INFO] DOCKER> Removing intermediate container 5173c22471c7
[INFO] DOCKER> ---> 6e02abb2dd21
[INFO] DOCKER> Successfully built 6e02abb2dd21
```

The effective Dockerfile created on the fly:

```dockerfile
FROM debezium/postgres:9.6
RUN ln -fs /usr/share/zoneinfo/US/Samoa /etc/localtime && echo timezone=US/Samoa >> /usr/share/postgresql/postgresql.conf.sample
```

### Build: External Dockerfile

Alternatively an external Dockerfile template or Docker archive can be used to
build the Docker image.
This mode is switched on by specifying the Docker build context
(`<contextDir>`) in which `Dockerfile` is located. For example, we can do the
following (see [source
code](https://github.com/fabric8io/docker-maven-plugin/blob/v0.31.0/samples/dockerfile/pom.xml#L59-L65)):

```xml
<build>
  <contextDir>${project.basedir}/src/main/docker</contextDir>
  ...
</build>
```

In that "src/main/docker" folder under that sample module, you can
see the following Dockerfile. Expressions like `${base}` are placeholders and
their actual values are injected by Maven using the filtering mechanism:

```dockerfile
# Sample Dockerfile for use with the Docker file mode
FROM ${base}

ENV SAMPLE_BUILD_MODE=dockerfile
...
```

Other configuration options exist for building Docker image,
they are: "contextDir" (what I mentioned), "dockerFile", and "dockerArchive".
For more detail, see the documentation of Docker Maven Plugin, [chapter 5.1
docker:build](https://dmp.fabric8.io/#docker:build).

## Run

Creating and running Docker containers is done using Maven goal "docker:start".
This goal evaluates the configuration of `<run>` section of each image.

    mvn docker:start

We are going to explore some detail using the source code of "Debezium
Connector for PostgreSQL". We will see the configuration for naming strategy,
environment variables, port mapping, logging, and wait for startup completion.

```xml
<!-- A Docker image using the Postgres Server with the DBZ decoderbufs plugin -->
<name>debezium/postgres-server-test-database</name>
<run>
  <namingStrategy>none</namingStrategy>
  <env>
    <POSTGRES_USER>${postgres.user}</POSTGRES_USER>
    <POSTGRES_PASSWORD>${postgres.password}</POSTGRES_PASSWORD>
    <POSTGRES_DB>${postgres.db.name}</POSTGRES_DB>
    <POSTGRES_INITDB_ARGS>-E ${postgres.encoding}</POSTGRES_INITDB_ARGS>
    <LANG>${postgres.system.lang}</LANG>
  </env>
  <ports>
    <port>${postgres.port}:5432</port>
  </ports>
  <log>
    <prefix>postgres</prefix>
    <enabled>true</enabled>
    <color>yellow</color>
  </log>
  <wait>
    <time>30000</time> <!-- 30 seconds max -->
    <log>(?s)PostgreSQL init process complete.*database system is ready to accept connections</log>
  </wait>
</run>
```

Naming stategy (`<namingStrategy>`). After having created a Docker image called
"debezium/postgres-server-test-database" via goal "docker:build", a
Docker container can be created from this image. Naming strategy
defines the name of the container. Here, Debezium uses the
default mechanism: "none", which uses a randamly assigned names from Docker.
Note that this option is decprecated, you should use option "containerNamePattern"
instead.

Environment variables (`<env>`). Set environment variables in the container you
are running, or overwrite variables that are defined in the Dockerfile of the
image you are running. Docker Maven Plugin makes it possible to define them via
`env` parameter. For example, Debezium uses it to define the configuration of
PostgreSQL, including username, password, database, arguments of database
initialization, and language.

Port mapping (`<ports>`). The "ports" configuration contains a list of port
mappings. Each of them binds a port of the container to a port of the host
machine. This is equivalent to the port mapping when using the Docker CLI with
option `-p`. In Debezium, the container port defined by Maven property
`postgres.port` (value: 5432) is bound to port 5432 of the host machine.

Logging (`<log>`). Use "log" configuration to redirect the standard output
and standard error of the container and print them as Maven logs. The "prefix"
element defines the prefix to use for the logs of the target container. In
Debezium's example, the value is "postgres" and the text color is yellow. Docker
Maven Plugin also allows you to use placeholders for more complex use-cases. See
[Chapter 5.2.10 Logging](https://dmp.fabric8.io/#start-logging).

<img src="/assets/20191104-docker-start-debezium.png"
     alt="mvn docker:start example output" />

Wait (`<wait>`). The "wait" configuration blocks the execution until some
conditions are met. It can be: wait until HTTP to be ready, wait until a log
pattern is matched, wait until a certain time, etc. In Debezium's example, we wait
until a log message is shown, where its message should match expression
_"(?s)PostgreSQL init process complete.\*database system is ready to accept
connections"_ (Expression `(?s)` means this is a multi-line matching). The
maximum wait time is 30 seconds.

## Goal Binding

You can define when the Docker plugin goals should be executed. One possible
binding is to bind goals `docker:build` and `docker:start` to phase
`pre-integration-test` so that Docker containers are built and ready for
testing. Also, binding goal `docker:stop` to phase `post-integration-test` so
those containers can be trashed after integration tests. It is recommended to
use the maven-failsafe-plugin for integration testing to stop the docker container even when the tests fail.
Here is the configuration of Debezium (PostgreSQL connector):

```xml
<executions>
  <execution>
    <id>start</id>
    <phase>pre-integration-test</phase>
    <goals>
      <goal>build</goal>
      <goal>start</goal>
    </goals>
  </execution>
  <execution>
    <id>stop</id>
    <phase>post-integration-test</phase>
    <goals>
      <goal>stop</goal>
    </goals>
  </execution>
</executions>
```

Another possible binding I can think about is to bind `docker:build` to phase
"package" to package and deliver the Docker image(s) as the built artifact(s).

## Conclusion

Today we took a quick look on [Docker Maven Plugin](https://dmp.fabric8.io/)
based on concrete open-source project usage in
[Debezium](https://github.com/debezium/debezium). We learned how to configure
Docker image via this plugin, including `build` and `run`. We also see the goal
binding to Maven phase.
Interested to know more about Maven or Docker? You can subscribe to [my feed](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Fabric8, "Docker Maven Plugin", _Fabric8 Documentation_, 2019.
  <https://dmp.fabric8.io/>
- Debezium, "Debezium Home Page", _Debezium_, 2019.
  <https://debezium.io/>
- Docker, "Dockerfile reference", _Docker Documentation_, 2019.
  <https://docs.docker.com/engine/reference/builder/>
- Docker, "docker run", _Docker Documentation_, 2019.
  <https://docs.docker.com/engine/reference/commandline/run/>
