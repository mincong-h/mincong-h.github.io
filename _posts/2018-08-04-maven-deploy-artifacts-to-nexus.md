---
layout:            post
title:             "Maven: Deploy Artifacts to Nexus"
date:              2018-08-04 15:02:00 +0200
categories:        [tech]
tags:              [maven]
comments:          true
excerpt:           >
    Declare Maven deploy plugin in the parent POM. It's the same no matter
    your project is a single module project or a multi-modules project. Then,
    define the Nexus repository id and url in distributionManagement. After
    that, add your credentials in ~/.m2/settings.xml. Finally, execute
    command `mvn deploy` to deploy your artifacts.
---

Today I'll talk about how to deploy artifacts to Sonatype Nexus repository using
Maven deploy plugin.

## Prerequisite

Prepare Nexus server in local:

1. Download [Nexus Repository OSS](https://www.sonatype.com/download-oss-sonatype)
2. Unzip the downloaded file
3. Start the server

   ```
   $ bin/nexus start
   ```

4. Visit <http://localhost:8081/>
5. Sign in with username `admin` and password `admin123`

Create a Maven project for demo propose:

{% highlight sh %}
$ mvn archetype:generate \
  -DgroupId=com.mycompany \
  -DartifactId=demo \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
{% endhighlight %}

## Declare Maven Deploy Plugin

Declare Maven deploy plugin in the parent POM. It's the same no matter
your project is a single module project or a multi-modules project. The parent
`pom.xml` file is located in project's root directory.

Define the version of Maven deploy plugin:

{% highlight xml %}
<!-- file: /Users/mincong/demo/pom.xml -->
<project>
  ...
  <build>
    ...
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-deploy-plugin</artifactId>
          <version>2.8.2</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
{% endhighlight %}

Use the plugin for deployment:

{% highlight xml %}
<!-- file: /Users/mincong/demo/pom.xml -->
<project>
  ...
  <build>
    ...
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-deploy-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
{% endhighlight %}

## Configure Nexus

Define the ID and URL of your Nexus repository in the project's parent
`pom.xml`:

{% highlight xml %}
<!-- file: /Users/mincong/demo/pom.xml -->
<project>
  ...
  <distributionManagement>
    <snapshotRepository>
      <id>nexus-snapshots</id>
      <url>http://localhost:8081/repository/maven-snapshots/</url>
    </snapshotRepository>
  </distributionManagement>
</project>
{% endhighlight %}

Add username and password in Maven global settings (`~/.m2/settings.xml`):

{% highlight xml %}
<!-- file: /Users/mincong/.m2/settings.xml -->
<settings>
  <servers>
    <server>
      <id>nexus-snapshots</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
  </servers>
</settings>
{% endhighlight %}

**IMPORTANT**: You should NOT keep your password in plain text in settings.xml.
See Maven official page [Password
Encryption](https://maven.apache.org/guides/mini/guide-encryption.html) for the
encryption guideline.

## Build and Deploy Artifacts

There're 2 possible solutions: one-step deploy or multi-steps deploy.

**One step deploy** runs tests, installation, and deploy in a single command:

    $ mvn clean deploy

**Multi-steps deploy** runs different commands in different steps. First,
compile and test. Once verified, install and deploy:

    $ mvn clean verify
    $ mvn deploy -DskipTests

Here's the comparison of these two solutions:

Item | One-Step Deploy | Multi-Steps Deploy
:--- | :------- | :---------
Maven commands | 1 commands | ≥ 2 commands
If no test failures, then… | All artifacts deployed | All artifacts deployed
If test failures, then… | Some artifacts deployed ⚠️  | No artifacts deployed

The execution outputs look like:

```
demo $ mvn deploy -DskipTests
[INFO] Scanning for projects...
[INFO]
[INFO] -------------------------< com.mycompany:demo >-------------------------
[INFO] Building demo 1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- maven-resources-plugin:2.6:resources (default-resources) @ demo ---
[WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] skip non existing resourceDirectory /Users/mincong/demo/src/main/resources
[INFO]
[INFO] --- maven-compiler-plugin:3.1:compile (default-compile) @ demo ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-resources-plugin:2.6:testResources (default-testResources) @ demo ---
[WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] skip non existing resourceDirectory /Users/mincong/demo/src/test/resources
[INFO]
[INFO] --- maven-compiler-plugin:3.1:testCompile (default-testCompile) @ demo ---
[INFO] Nothing to compile - all classes are up to date
[INFO]
[INFO] --- maven-surefire-plugin:2.12.4:test (default-test) @ demo ---
[INFO] Tests are skipped.
[INFO]
[INFO] --- maven-jar-plugin:2.4:jar (default-jar) @ demo ---
[INFO]
[INFO] --- maven-install-plugin:2.4:install (default-install) @ demo ---
[INFO] Installing /Users/mincong/demo/target/demo-1.0-SNAPSHOT.jar to /Users/mincong/.m2/repository/com/mycompany/demo/1.0-SNAPSHOT/demo-1.0-SNAPSHOT.jar
[INFO] Installing /Users/mincong/demo/pom.xml to /Users/mincong/.m2/repository/com/mycompany/demo/1.0-SNAPSHOT/demo-1.0-SNAPSHOT.pom
[INFO]
[INFO] --- maven-deploy-plugin:2.8.2:deploy (default-deploy) @ demo ---
Downloading from nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/maven-metadata.xml
Uploading to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/demo-1.0-20180804.135929-1.jar
Uploaded to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/demo-1.0-20180804.135929-1.jar (2.3 kB at 8.3 kB/s)
Uploading to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/demo-1.0-20180804.135929-1.pom
Uploaded to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/demo-1.0-20180804.135929-1.pom (1.2 kB at 7.5 kB/s)
Downloading from nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/maven-metadata.xml
Uploading to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/maven-metadata.xml
Uploaded to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/1.0-SNAPSHOT/maven-metadata.xml (761 B at 7.9 kB/s)
Uploading to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/maven-metadata.xml
Uploaded to nexus-snapshots: http://localhost:8081/repository/maven-snapshots/com/mycompany/demo/maven-metadata.xml (275 B at 3.2 kB/s)
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 2.803 s
[INFO] Finished at: 2018-08-04T15:59:30+02:00
[INFO] ------------------------------------------------------------------------
```

## Check Deployed Artifacts

Now, go to <http://localhost:8081> and check the uploaded results. You can see
that the project `demo` is available:

<p text-align="center">
  <img src="/assets/20180804-nexus-demo-search.png"
       style="border-radius: 0"
       alt="Nexus search page demo">
</p>

More detail when you click the page:

<p text-align="center">
  <img src="/assets/20180804-nexus-demo-detail.png"
       style="border-radius: 0"
       alt="Nexus detail page demo">
</p>

## References

- [Baeldung: Maven Deploy to Nexus](http://www.baeldung.com/maven-deploy-nexus)
