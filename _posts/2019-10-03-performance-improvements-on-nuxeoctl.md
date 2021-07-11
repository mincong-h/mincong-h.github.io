---
layout:            post
title:             Performance Improvements on Nuxeoctl
lang:                en
date:              2019-10-03 21:43:23 +0200
categories:        [tech]
tags:              [java, performance, cli, jgit, rest, jersey]
permalink:         /2019/10/03/performance-improvements-on-nuxeoctl/
comments:          true
excerpt:           >
    How NOS team improves the performance of Nuxeoctl, Nuxeo Server's command
    line, recently.
image:             /assets/bg-veri-ivanova-p3Pj7jOYvnM-unsplash.jpg
cover:             /assets/bg-veri-ivanova-p3Pj7jOYvnM-unsplash.jpg
ads:               Ads idea
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

[Nuxeoctl](https://doc.nuxeo.com/nxdoc/nuxeoctl-and-control-panel-usage/) is a
controlling interface and inspection tool for Nuxeo Server. It allows you to
register your instance, start and stop it, interact with Nuxeo Online
Services to list and install your marketplace packages. However, it is slow in
regards to Marketplace commands: install, listall, ... 
In this article, I will explain what [Arnaud Kervern](https://github.com/akervern)
and I did recently to improve the performance of Nuxeoctl.
For the command line examples, I will assume that we
are located at `$NUXEO_HOME`, the home path of a Nuxeo Server 10.10 instance.
Let's get started :)

## Enable Log Timestamp

On the client-side (`nuxeoctl`), there is no improvement done. But what we did
is to observe: we prove that the majority of the problem comes from Nuxeo Online Services and
not the client itself.

The first attempt was to prove the slowness of the commands. This is done by
using `time` command, followed by the actual command. Here is the pattern for
measuring the execution time of command "mp-update":

```
time bin/nuxeoctl mp-update
```

The second attempt was to prove that the slowness comes from Nuxeo Online
Services. By default, Nuxeoctl does not contain timestamp when logging execution
output. Timestamp is essential for time measurement. The timestamp can be added by
modifying the default Log4J 2 configuration shipped by Nuxeo Launcher JAR
(`bin/nuxeo-launcher.jar:log4j2.xml`). This action can be done via
VIM, where you open the JAR, enter into the Log4J 2 zip entry, modify the
pattern layout from simple to ISO-8601, and save the changes by closing VIM.

```diff
 <Console name="CONSOLE" target="SYSTEM_OUT">
   <ThresholdFilter level="DEBUG" onMatch="ACCEPT" />
-  <PatternLayout pattern="%m%n" />
+  <PatternLayout pattern="%d{ISO8601} %-5p [%t] [%c] %m%n />
 </Console>
```

Once done, relaunch the nuxeoctl command with `time` and debug mode enabled for
Java packages starting with namespace `org.nuxeo`. In this case, we can see all the
HTTP requests sent to Nuxeo Online Services:

```
time bin/nuxeoctl -d org.nuxeo -- mp-update
```

## Java Flight Recorder

Now we understand that the problem comes from our RESTful APIs, the next step
is to measure the actual pain points in Java code. We used logger at the
beginning: we created an INFO level log wherever we think the call is long. Then
observe the log entries on Datadog, our monitoring tool. However, this is not
efficient:

- Hard to understand logs as stack-trace, where one method can call another
- Difficult to read (need to search in Datadog)
- Impossible to handle multi-thread situation (our timer is not thread-safe)

Then, we switched to [Java Flight Recorder (JFR)](https://docs.oracle.com/javacomponents/jmc-5-4/jfr-runtime-guide/about.htm#JFRUH172). Java Flight Recorder is a tool
for collecting diagnostic and profiling data about a running Java application.
It is integrated into the JVM and causes almost no performance overhead. Using
it in production requires a commercial license, but we only used it for the dev
environments, which is ok. Enable JFR via Java option by restarting the JVM:

```sh
java -XX:+UnlockCommercialFeatures -XX:+FlightRecorder MyApp
```

Once enabled, the following commands can be used for JFR:

```sh
# List and find Java PID
jps

# Start recording
jcmd $pid JFR.start \
    name=MyRecording \
    settings=profile \
    delay=5s \
    dumponexit=true \
    filename=/path/to/file

# Stop recording
jcmd $pid JFR.stop \
    name=MyRecoring
```

The JFR file (`*.jfr`) can be opened via Java Mission Control (JMC).
Due to confidentiality, I cannot share the screenshots with you. But we gathered
important information about the application and successfully identified some
problems. The record contains: threads, the stack trace of hot methods, the call
trees, the file read/write, the socket read/write, etc.

## Optimize JGit Operation

From the JFR record, we can see that 58.3% of the time is spent on thread HTTP
(`http-bio-0.0.0.0-exec-1`) for reading file content from a local Git repository
of the web server. It consists of the following steps:

1. Clone a Git repository from remote if not exist locally
2. Perform `git-fetch` command to update the repository
3. Perform `git-checkout` command to switch branch
4. Read the file content from the target branch
5. Repeat on all related projects sequentially

But actually what we need is just an XML file from a given project. So I
proposed to create a new RESTful API endpoint for reading files in our Git
server. In this way, the read operation will no longer rely on the local Git
repository. The file reading can also be done concurrently for multiple
projects. The new endpoint looks like:

    /site/gitty/blob/{projectId}/{rev:.+}?path={path}

Why using Git server will be better? Because we don't have to clone the
repository, fetch the delta changes between local and remote, and checkout
the Git repository. Reading a given path will be as simple as the following
native Git command. Also, this solution is not tight to JGit. It can be applied
to any modern Git server.

```sh
git show REVISION:path/to/file
```

By doing so, the time spent decreased from 300 seconds (timeout) to 104 seconds.
So the performance increased about 65%.

## Avoid Amazon S3

Then, we continued to measure the performance using Java Flight Recorder. We
figured out that 78% of the time spent is now focused on retrieving file metadata
from Amazon S3. This is mainly for constructing "PackageDocument" object in
Java. However, in our case, creating a virtual object does not require an
actual file downloaded from Amazon S3, since most of the metadata are also stored
locally on the web server. So the method can be refactored.
Combined with the first fix on file content API, the execution now finished
around 70 seconds.

## Optimize Jersey Client

According to Jersey Client documentation: [3.5.1 Configuring a Client and
WebResource](https://eclipse-ee4j.github.io/jersey.github.io/documentation/1.19.1/client-api.html#d4e621),
`Client` instances are expensive resources. It is recommended a configured
instance is reused for the creation of Web resources. The creation of Web
resources, the building of requests and the receiving of responses are guaranteed
to be thread-safe. Thus a Client instance and WebResource instances may be
shared between multiple threads. This was not yet our case. Therefore, Arnaud
changed the logic and reused the same instance as a singleton.
Combined with the fixes above, the execution now finished less than 60 seconds
(missing more accurate data).

## Cache User Rights

In Git server, we retrieved user rights via API to determine if the user has
permission to visit and modify certain resources. Since user rights are not
frequently changed but frequently read, we decided to add a cache
for the given user. In this case, we avoid extra network exchange whenever
possible. We built the cache using Guava.

```java
USER_RIGHTS_CACHE =
    CacheBuilder.newBuilder()
        .expireAfterAccess(5, TimeUnit.SECONDS)
        .build();
```

On the other hand, the performance will depend on if the cache is hot or cold.
In other words, filled or empty. The first time an HTTP request is performed,
the execution will still be long because the cache is not yet filled. However,
the following calls within 5 seconds will be much faster, because the cache is
filled. Combined with the fixes above, the execution now finished less than 60
seconds (missing more accurate data).

## Rejected Proposals

We also discussed other proposals. However, they are rejected due to different
reasons. Let's take a quick look:

Java Parallel Stream:

- Description: Use parallel stream instead of stream
- Category: Java Core
- Difficulty: ~~Easy~~ Hard
- Rejected Reason: Most of the calls in our source code are related to the database.
  Using parallel stream increases significantly the number of simultaneous
  connections to the database. We must review the connection pool configuration
  and other related configuration (connection blocking timeout, HTTP threads, ...) before
  using this approach. Also, we should have a way to control the max level of
  parallelism and avoid relying on the default JVM settings.

File Content Cache:

- Description: Use cache on web server for repetitive deserialization from file
  `application.xml`. Cache result per branch per project (key: project-branch,
  value: the content of application.xml) 
- Category: Java Core
- Difficulty: Hard
- Rejected Reason: branch (Git reference) can be changed by pointing to another
  object id; projects combined with branches, the cache will consume a lot of
  memory; improvement will only be beneficial starting from the second call
  (warm cache). In short, the concerns are: write strategy, memory usage, and
  cache eviction.

Improve RESTful APIs for Nuxeoctl:

- Description: Nuxeoctl relies on [Nuxeo Connect
  Client](https://github.com/nuxeo/nuxeo-connect). Nuxeo Connect Client should
  separate package listing API into "listing packages" and "fetching detail of
  specific package". It will reduce the size of HTTP response and make
  complex calculations (package detail) done on demand.
- Category: Nuxeoctl, API
- Difficulty: Hard
- Rejected Reason: Changing Nuxeo Connect Client requires import effort. Nuxeo
  Connect Client is shipped into each Nuxeo Server. Currently, we support Nuxeo
  Server 8.10, 9.10, 10.10. We cannot change those versions. It means that the
  new design must be backward compatible.

Add Skip-Options for Nuxeoctl:

- Description: Nuxeoctl should have skip options `--skip-*` to skip different
  unnecessary logic, such as skipping Studio project listing, add-on listing,
  hot-fix listing, etc.
- Category: Nuxeoctl
- Difficulty: Medium
- Rejected Reason: Similar to the reasons above, this change needs to be adapted to
  Nuxeo 8.10, 9.10, and 10.10. Also, it requires a deep understanding of Nuxeoctl
  in the first place. From the DEBUG level logs of Nuxeoctl, we can see that
  most of the time are spent waiting for HTTP responses from the server. We think
  the effort should be put on server-side first, which maximizes the benefits
  for our users without changes on their side.

## Enforce Observability

At Nuxeo, we use Datadog for monitoring our SaaS application: Nuxeo Online
Services. Apache Access Log is sent as JSON to Datadog so that we can have an
overview of the performance of each API endpoint. There was a bug in our Apache
configuration, which makes the JSON invalid thus impossible to unparse. I fixed
it so that we can resume the monitoring from Datadog.

Also, I created project [NOS Checker](/2019/09/15/project-nos-test/) (formerly
NOS Test), an acceptance testing tool that checks the HTTP status code and the
time spent on existing API endpoints. This tool allows you the substitute as
another user: normal user, presales, support, professional services, ... after
execution, an execution report is generated. So it's easy to compare the
performance of each type of profile in one single command.

## Improvement Strategy

Here is the strategy of performance improvement I summarize from this change:

- Understand the app architecture: client, server, database, ...
- Measure and observe time spent: command line, logs, monitoring, Java
  profiling
- Identify the performance bottlenecks
- Propose solutions based on effort, complexity, gain, potential risk, and
  maintenance cost
- Implement and measure again
- Set up or update tools (performance tests, acceptance tests, monitoring, ...)
  to ensure the result is as expected for different factors: projects, user
  profile, environment.

## Next Steps

The performance changes are not yet in production the time I wrote this article.
From the feedback of our engineering manager, the result on preprod is 89%
faster than the one from production (12m00 -> 1m19). But this still needs to be
confirmed by our actual users once the changes are publicly available. We also
planned to add more optimization in NXQL queries based on [NXQL | Nuxeo
Documentation](https://doc.nuxeo.com/nxdoc/nxql/).

## Conclusion

In this article, I shared how Arnaud and I improved the performance by
measuring and implementing different solutions, I discussed some rejected
proposals, observability improvement and performance improvement strategy in
general.

Interested to know more? You can subscribe to [my feed](/feed.xml), follow
me on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you
the next time!

## References

- Nuxeo, "nuxeoctl and Control Panel Usage", _Nuxeo_, 2019.
  <https://doc.nuxeo.com/nxdoc/nuxeoctl-and-control-panel-usage/>
- Nuxeo, "NXQL | Nuxeo Documentation", _Nuxeo_, 2019.
  <https://doc.nuxeo.com/nxdoc/nxql/>
- Oracle, "Java Platform, Standard Edition Java Flight Recorder Runtime Guide",
  _Oracle Help Center_, 2019.
  <https://docs.oracle.com/javacomponents/jmc-5-4/jfr-runtime-guide/about.htm#JFRUH170>
- Oracle, "Command Reference", _Oracle Help Center_, 2019.
  <https://docs.oracle.com/javacomponents/jmc-5-4/jfr-runtime-guide/comline.htm#JFRUH193>
- Andrew Shcherbakov, "Monitoring Java Applications with Flight Recorder",
  _Baeldung_, 2019. <https://www.baeldung.com/java-flight-recorder-monitoring>
- mike, "Is there a quick Git command to see an old version of a file?",
  _Stack Overflow_, 2008.
  <https://stackoverflow.com/questions/338436/>
- Amir, "What does it mean by cold cache and warm cache concept?", _Stack
  Overflow_, 2014.
  <https://stackoverflow.com/questions/22756092/>
- Jersey, "Jersey 1.19.1 - 3.5.1 Configuring a Client and WebResource", _Eclipse
  EE4J_, 2019.
  <https://eclipse-ee4j.github.io/jersey.github.io/documentation/1.19.1/client-api.html#d4e621>
