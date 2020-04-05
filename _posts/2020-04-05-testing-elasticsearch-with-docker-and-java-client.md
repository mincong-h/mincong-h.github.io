---
layout:            post
title:             Testing Elasticsearch With Docker And Java High Level REST Client
date:              2020-04-05 11:22:57 +0200
categories:        [tech]
tags:              [java, elasticsearch, testing, docker]
comments:          true
excerpt:           >
    Testing Elasticsearch with docker and Java High Level REST Client
image:             /assets/bg-erwan-hesry-RJjY5Hpnifk-unsplash.jpg
ads:               none
---

## Overview

Today I want to share with you how to test Elasticsearch with Docker image and
Java High Level REST Client. I use this approach to write demos for
the Java High Level REST Client and answer questions on Stack Overflow. But it
can also be useful for you to evaluate that Java client, or test the behaviors
of that Java client in your real project. This article is written with
Elasticearch 7.6 and Maven.

After reading this article, you will understand:

- How to start the Elasticsearch Docker image using Docker Maven Plugin
- How to initialize Java High Level REST Client
- How to ensure test set-up and tear-down using Elasticsearch Testing framework
- How to go further on this topic

## Start Elasticsearch Docker Image

In Maven, you can use [Docker Maven Plugin](https://github.com/fabric8io/docker-maven-plugin)
to start the Elasticsearch Docker image. There are several things that you need to
take care of:

1. Connect the goals of this plugin to the Maven lifecycle around
   your preferred phase, such as "integration-test", so that the plugin can build,
   start and stop Docker images correctly.
2. Configure the Docker image for Elasticsearch, including the image version,
   published ports, environment variable, etc.
3. How Maven Docker plugin interacts with the Elasticsearch Docker image,
   including the watching interval, logging, verbosity, max time waiting for the
   image to be started, etc.

Here is the code excerpt for `pom.xml`:

```xml
<plugin>
  <groupId>io.fabric8</groupId>
  <artifactId>docker-maven-plugin</artifactId>
  <version>0.26.0</version>
  <!--
    Connect this plugin to the maven lifecycle around the integration-test phase:
    start the container in pre-integration-test and stop it in post-integration-test.
   -->
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
  <configuration>
    <watchInterval>500</watchInterval>
    <logDate>default</logDate>
    <verbose>true</verbose>
    <images>
      <image>
        <name>docker.elastic.co/elasticsearch/elasticsearch:${elasticsearch.version}</name>
        <run>
          <ports>
            <port>9200:9200</port>
            <port>9300:9300</port>
          </ports>
          <env>
            <!-- specify single-node discovery to bypass the bootstrap checks -->
            <discovery.type>single-node</discovery.type>
          </env>
          <log>
            <prefix>Elasticsearch:</prefix>
            <enabled>true</enabled>
            <color>yellow</color>
          </log>
          <wait>
            <time>60000</time><!-- 60 seconds max -->
            <log>.*"message": "started".*</log>
          </wait>
        </run>
      </image>
    </images>
  </configuration>
</plugin>
```

Once done, you can start or stop Elasticsearch as Docker image using the
following commands:

```sh
# start docker image
mvn docker:start

# stop docker image
mvn docker:stop
```

Or running tests and see that the Elasticsearch Docker image is started before
integration tests and stopped after.

```
mvn verify
```

Here are two screenshots demonstrating how the output looks like using Travis
CI. Building Docker images (empty here because we don't have own image to build) and
pulling Docker image of Elasticsearch before starting it:

![Pull Docker image](/assets/20200405-docker.png)

Once done, Maven Docker plugin waits until Elasticsearch to be started and let
Maven continue on other goals -- this is where integration tests stared with
Failsafe Plugin:

![Docker image started before integration tests](/assets/20200405-test.png)

Docker Maven Plugin is not the only choice to operate Elasticsearch
in your build. You may consider using other solutions, such as
[testcontainers](https://github.com/testcontainers/testcontainers-java) or
managing containers in your CI scripts.

## Initialize Java High Level REST Client

The next step is to initialize Java High Level REST Client of Elasticsearch.
First of all, declare the following Maven dependency in your project:

```xml
<dependency>
  <groupId>org.elasticsearch.client</groupId>
  <artifactId>elasticsearch-rest-high-level-client</artifactId>
  <version>7.6.2</version>
</dependency>
```

Then, initialize the client in your code:

```java
var client = new RestHighLevelClient(
    RestClient.builder(
        new HttpHost("localhost", 9200, "http"),
        new HttpHost("localhost", 9201, "http")));
```

Don't forget to close you client when you finish using it:

```java
client.close();
```

Or do it with try-with-resources statement:

```java
try (var client = new RestHighLevelClient(builder)) {
  ...
}
```

## Set Up and Tear Down

When writing tests, it is important to ensure that we start with a clean server
(cluster) and don't leave undesired states when the test is finished. This is
difficult to achieve when one single Elasticsearck Docker image... But luckily
we can get some help from Elasticsearch Testing framework: it has an abstract
class `ESRestTestCase`, where it handles to clean up for you. It wipes the
cluster by wiping the rollup jobs, snapshots, indices, index templates, cluster
settings, etc. 

Import the Elasticsearch Testing framework:

```xml
<dependency>
  <groupId>org.elasticsearch.test</groupId>
  <artifactId>framework</artifactId>
  <scope>test</scope>
</dependency>
```

And write integration test (IT) using `ESRestTestCase`. Assume that you are
using JUnit 4, you need to set up a system property "tests.rest.cluster" before
the test suite started and clear it after. ESRestTestCase relies on this
property to establish the connection with Elasticsearch. Without it, you will
see error:

> Must specify [tests.rest.cluster] system property with a comma delimited list
> of \[host:port\] to which to send REST requests

Here is how to structure looks like:

```java
public class MyRestIT extends ESRestTestCase {

  @BeforeClass
  public static void setUpBeforeClass() {
    System.setProperty("tests.rest.cluster", "localhost:9200");
  }

  @AfterClass
  public static void tearDownAfterClass() {
    System.clearProperty("tests.rest.cluster");
  }

  // TODO your tests go here
}
```

Note that Elasticsearch Testing Framework has a lot of dependencies and strong
restrictions. Choosing it to write your tests may require extra works on aligning
dependencies versions (JUnit, logging, ...), configure logging framework,
handle classpath issue to avoid JAR hell, configure security manager, etc.

## Going Further

How to go further from here?

- To discover more about Java High Level REST client, visit:
  <https://www.elastic.co/guide/en/elasticsearch/client/java-rest/current/java-rest-high.html>
- Install Elasticsearch with Docker, visit:
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html>
- Use Elasticsearch as part of your testing infrastructure, visit:
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/testing.html>
- See the specification of REST APIs, visit:
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html>
- Learn more about Docker Maven Plugin, visit:
  <https://dmp.fabric8.io/>
- Check out the source code of this article, visit my GitHub project:
  [mincong-h/learning-elasticsearch](https://github.com/mincong-h/learning-elasticsearch)

## Conclusion

In this article, we see how to use Docker and Elasticsearch Java High Level REST
client to write tests for your Maven project. This is done in three steps:
starting Elasticsearch Docker image using Docker Maven Plugin; initialize Java
High Level REST Client for your tests; use Elasticsearch Testing Framework to
handle set up and tear down.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- fabric8, "Docker Maven Plugin", _GitHub_, 2020.
  <https://github.com/fabric8io/docker-maven-plugin>
- Elastic, "Elasticsearch Reference (7.6)", _Elastic_, 2020.
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html>
