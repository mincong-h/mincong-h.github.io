---
layout:      post
title:       "Maven Plugins Understanding"
date:        "2017-11-07 20:43:06 +0100"
categories:  [maven]
tags:        [maven]
excerpt:     >
  Some interesting facts that I discovered about Maven plugins.
comments:    true
---

I created this blog post to share some interesting facts that I discovered about
Maven plugins with you, written in form of FAQ. After reading this post, you'll
understand:

1. How to create a new Maven project from command line?
2. How does Maven add default plugins to my project?
3. What happens if declaring plugin in plugins?
4. What happens if declaring plugin in pluginManagement?
5. Different configuration in each sub-module

## 1. How to create a new Maven project from command line?

Create a Maven project `my-app`:

{% highlight shell %}
$ mvn archetype:generate \
    -DgroupId=com.mycompany.app \
    -DartifactId=my-app \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DinteractiveMode=false
{% endhighlight %}

Let's see the content of the generated `pom.xml` file:

{% highlight xml %}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.mycompany.app</groupId>
  <artifactId>my-app</artifactId>
  <packaging>jar</packaging>
  <version>1.0-SNAPSHOT</version>
  <name>my-app</name>
  <url>http://maven.apache.org</url>
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>3.8.1</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
{% endhighlight %}

## 2. How does Maven add default plugins to my project?

You might already notice that there's no plugin declared in this XML file.
However, is there any plugin enabled when running any Maven command? In order to
check this, we need to check the effective POM. This can be achieved by using
`mvn help:effective-pom`:

```
$ mvn help:effective-pom | grep -n '<plugin' -A 2
49:  <pluginRepositories>
50:    <pluginRepository>
51-      <releases>
52-        <updatePolicy>never</updatePolicy>
--
80:    <pluginManagement>
81:      <plugins>
82:        <plugin>
83-          <artifactId>maven-antrun-plugin</artifactId>
84-          <version>1.3</version>
--
86:        <plugin>
87-          <artifactId>maven-assembly-plugin</artifactId>
88-          <version>2.2-beta-5</version>
--
90:        <plugin>
91-          <artifactId>maven-dependency-plugin</artifactId>
92-          <version>2.8</version>
--
94:        <plugin>
95-          <artifactId>maven-release-plugin</artifactId>
96-          <version>2.3.2</version>
--
100:    <plugins>
101:      <plugin>
102-        <artifactId>maven-clean-plugin</artifactId>
103-        <version>2.5</version>
--
114:      <plugin>
115-        <artifactId>maven-resources-plugin</artifactId>
116-        <version>2.6</version>
--
...
```

Actually, all the effective plugins are generated based on
[Plugin Bindings for default Lifecycle Reference][1].
For example, our project `my-app` is a project with **jar** packaging. So the
plugin bindings are the following as described in the page above:

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

That's why you don't see them in the project's POM, but only in the effective
POM. To prove the matching of plugin `maven-jar-plugin` between the
effective POM and the XML description from the Maven documentation, grep it:

```
$ mvn help:effective-pom | grep -n -B 1 -A 11 maven-jar-plugin
134-      <plugin>
135:        <artifactId>maven-jar-plugin</artifactId>
136-        <version>2.4</version>
137-        <executions>
138-          <execution>
139-            <id>default-jar</id>
140-            <phase>package</phase>
141-            <goals>
142-              <goal>jar</goal>
143-            </goals>
144-          </execution>
145-        </executions>
146-      </plugin>
```

Which is equivalent to `org.apache.maven.plugins:maven-jar-plugin:2.4:jar`.

## 3. What happens if declaring plugin in plugins?

For example, I can use another version of JAR plugin in my `pom.xml`. For
example, version **3.0.2**:

{% highlight xml %}
<project>
  <!-- ... -->
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <version>3.0.2</version>
      </plugin>
    </plugins>
  </build>
</project>
{% endhighlight %}

Well, in this case, the JAR plugin has been updated in the effective POM:

```
$ mvn help:effective-pom | grep -n -B 1 -A 11 maven-jar-plugin
101-      <plugin>
102:        <artifactId>maven-jar-plugin</artifactId>
103-        <version>3.0.2</version>
104-        <executions>
105-          <execution>
106-            <id>default-jar</id>
107-            <phase>package</phase>
108-            <goals>
109-              <goal>jar</goal>
110-            </goals>
111-          </execution>
112-        </executions>
113-      </plugin>
```

## 4. What happens if declaring plugin in pluginManagement?

After adding `maven-jar-plugin` in section pluginManagement in `pom.xml`, it
appears in both pluginManagement and plugins section:

{% highlight xml %}
$ mvn help:effective-pom | grep -n -B 1 -A 4 maven-jar-plugin
98-        <plugin>
99:          <artifactId>maven-jar-plugin</artifactId>
100-          <version>3.0.2</version>
101-        </plugin>
102-      </plugins>
103-    </pluginManagement>
--
--
138-      <plugin>
139:        <artifactId>maven-jar-plugin</artifactId>
140-        <version>3.0.2</version>
141-        <executions>
142-          <execution>
143-            <id>default-jar</id>
{% endhighlight %}

How does it happen?

- **pluginManagement**: The `maven-jar-plugin:3.0.2` is declared in plugin
  management in our POM, so it is naturally declared in the same way in
  effective POM.
- **plugins**: Maven needs to bind the plugin `maven-jar-plugin` to **jar**
  packaging. When no plugin version declared explicitly in the `plugins`
  section, the version defined in `pluginManagement` is applied (inherited).
  Therefore, the version and configurations are managed by plugin management.
  And usage is defined by plugins of each Maven module.

## 5. Different configuration in each sub-module

Create 2 sub-modules from the parent:

```
my-app $ tree .
.
├── partA
│   └── pom.xml
├── partB
│   └── pom.xml
├── pom.xml
└── src
    ├── main
    │   └── java
    │       └── com
    │           └── mycompany
    │               └── app
    │                   └── App.java
    └── test
        └── java
            └── com
                └── mycompany
                    └── app
                        └── AppTest.java

13 directories, 5 files
```

Define define `skipIfTrue` in `partA`, and define nothing in `partB`.

{% highlight xml %}
  <!-- ... -->
  <artifactId>my-app-partA</artifactId>
  <name>My App - Part A</name>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
          <skipIfEmpty>true</skipIfEmpty>
        </configuration>
      </plugin>
    </plugins>
  </build>
{% endhighlight %}

Now run the `jar:jar` goal:

```
my-app $ mvn clean jar:jar
[INFO] Scanning for projects...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Build Order:
[INFO]
[INFO] My App - Parent
[INFO] My App - Part A
[INFO] My App - Part B
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building My App - Parent 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ my-app ---
[INFO]
[INFO] --- maven-jar-plugin:3.0.2:jar (default-cli) @ my-app ---
[WARNING] JAR will be empty - no content was marked for inclusion!
[INFO] Building jar: /Users/mincong/Desktop/myProject/my-app/target/my-app-1.0-SNAPSHOT.jar
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building My App - Part A 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ my-app-partA ---
[INFO]
[INFO] --- maven-jar-plugin:3.0.2:jar (default-cli) @ my-app-partA ---
[INFO] Skipping packaging of the jar
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building My App - Part B 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ my-app-partB ---
[INFO]
[INFO] --- maven-jar-plugin:3.0.2:jar (default-cli) @ my-app-partB ---
[WARNING] JAR will be empty - no content was marked for inclusion!
[INFO] Building jar: /Users/mincong/Desktop/myProject/my-app/partB/target/my-app-partB-1.0-SNAPSHOT.jar
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] My App - Parent .................................... SUCCESS [  0.627 s]
[INFO] My App - Part A .................................... SUCCESS [  0.006 s]
[INFO] My App - Part B .................................... SUCCESS [  0.042 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1.091 s
[INFO] Finished at: 2017-11-07T22:44:17+01:00
[INFO] Final Memory: 22M/981M
[INFO] ------------------------------------------------------------------------
```

You can see that:

- Module "Part A" does not raise warning (`<skipIfTrue>true</skipIfTrue>`)
- Module "Part B" raises a warning (`<skipIfTrue>false</skipIfTrue>`)

This is because Maven JAR plugin has been overridden in part A, but not part B.

## References

- [Maven - Plugin Bindings for default Lifecycle Reference][1]
- [MJAR-139: New option to avoid empty jar creation][2]

[1]: http://maven.apache.org/ref/3.5.2/maven-core/default-bindings.html
[2]: https://issues.apache.org/jira/browse/MJAR-139
