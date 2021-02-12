---
layout:            post
title:             "Maven: Deploy Artifacts to Nexus"
date:              2018-08-04 15:02:00 +0200
last_modified_at:  2018-08-11 23:36:28 +0200
categories:        [build]
tags:              [java, maven]
comments:          true
excerpt:           >
    Declare Maven deploy plugin in the parent POM. It's the same no matter
    your project is a single module project or a multi-modules project. Then,
    define the Nexus repository id and url in distributionManagement. After
    that, add your credentials in ~/.m2/settings.xml. Finally, execute
    command `mvn deploy` to deploy your artifacts.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
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

**One-step deploy** runs tests, installation, and deploy in a single command:

    $ mvn clean deploy

**Multi-steps deploy** runs different commands in different steps. Firstly, run
install command (which implies comile, test, and install). Once done
sucessfully, deploy the results:

    $ mvn clean install
    $ mvn deploy -DskipTests -Dmaven.install.skip=true

Here's the comparison of these two solutions:

Item | One-Step Deploy | Multi-Steps Deploy
:--- | :------- | :---------
Maven commands | 1 commands | ≥ 2 commands
If no test failures, then… | All artifacts deployed | All artifacts deployed
If test failures, then… | Some artifacts deployed ⚠️  | No artifacts deployed

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
