---
article_num: 43
layout:      post
title:       "Learning GWT with Maven"
lang:                en
date:        "2018-01-29 21:23:26 +0100"
categories:  [build]
tags:        [java, gwt, maven, javascript]
excerpt:     >
  Today, I want to share how to learn GWT 2.8 with Maven GWT Plugin. I wrote
  this post because the official GWT tutorial has some inconvenience: source code
  and resources are stored as GWT standard structure, commands must be launched
  from Apache Ant, JARs and classpath must be handled explicitly etc. I found
  it more comfortable to start with Maven, the tool which many Java developers
  are familiar with.
permalink:         /2018/01/29/learning-gwt-with-maven/
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, I want to share how to learn GWT 2.8 with [Maven GWT Plugin][1]. I wrote
this post because the official GWT tutorial has some inconvenience: source code
and resources are stored as GWT standard structure, commands must be launched
from [Apache Ant][2], JARs and classpath must be handled explicitly etc. I found
it more comfortable to start with Maven, the tool which many Java developers
are familiar with. Before getting started, please be sure that the following
tools are installed in your computer:

- JDK 8
- Maven 3

## Create a Project

Build a sample GWT application with Maven is easy. You can use the archetype
provided by GWT Maven plugin. An archetype is defined as an original pattern or
model from which all other things of the same kind are made. Suppose that you
want to create a GWT application for group `com.mycompany`, artifact
`my-app`, version `1.0-SNAPSHOT`, and GWT module called `MyModule`. Then you can
create your project in the following batch mode:

{% highlight shell %}
$ mvn -B archetype:generate \
    -DarchetypeGroupId=org.codehaus.mojo \
    -DarchetypeArtifactId=gwt-maven-plugin \
    -DarchetypeVersion=2.8.1 \
    -DgroupId=com.mycompany \
    -DartifactId=my-app \
    -Dversion=1.0-SNAPSHOT \
    -Dmodule=MyModule
{% endhighlight %}

Otherwise, you can create your project in interactive mode. And fill all the
required parameters in your terminal:

{% highlight shell %}
$ mvn archetype:generate \
    -DarchetypeGroupId=org.codehaus.mojo \
    -DarchetypeArtifactId=gwt-maven-plugin \
    -DarchetypeVersion=2.8.1
{% endhighlight %}

No matter which mode you used, the result should be successful:

```
...
[INFO] ----------------------------------------------------------------------------
[INFO] Using following parameters for creating project from Archetype: gwt-maven-plugin:2.8.1
[INFO] ----------------------------------------------------------------------------
[INFO] Parameter: groupId, Value: com.mycompany
[INFO] Parameter: artifactId, Value: my-app
[INFO] Parameter: version, Value: 1.0-SNAPSHOT
[INFO] Parameter: package, Value: com.mycompany
[INFO] Parameter: packageInPathFormat, Value: com/mycompany
[INFO] Parameter: package, Value: com.mycompany
[INFO] Parameter: version, Value: 1.0-SNAPSHOT
[INFO] Parameter: groupId, Value: com.mycompany
[INFO] Parameter: module, Value: MyModule
[INFO] Parameter: artifactId, Value: my-app
[INFO] Project created from Archetype in dir: /Users/mincong/Desktop/my-app
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 7.858 s
[INFO] Finished at: 2018-01-29T21:51:53+01:00
[INFO] Final Memory: 22M/1039M
[INFO] ------------------------------------------------------------------------
```

## Understand GWT Project Structure

In the next step, we'll explore the project structure created by Maven GWT
plugin.

{% highlight shell %}
$ tree my-app/
my-app/
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── mycompany
│   │   │           ├── client
│   │   │           │   ├── GreetingService.java
│   │   │           │   ├── Messages.java
│   │   │           │   └── MyModule.java
│   │   │           ├── server
│   │   │           │   └── GreetingServiceImpl.java
│   │   │           └── shared
│   │   │               └── FieldVerifier.java
│   │   ├── resources
│   │   │   └── com
│   │   │       └── mycompany
│   │   │           ├── MyModule.gwt.xml
│   │   │           └── client
│   │   │               └── Messages_fr.properties
│   │   └── webapp
│   │       ├── MyModule.css
│   │       ├── MyModule.html
│   │       └── WEB-INF
│   │           └── web.xml
│   └── test
│       ├── java
│       │   └── com
│       │       └── mycompany
│       │           └── client
│       │               └── GwtTestMyModule.java
│       └── resources
│           └── com
│               └── mycompany
│                   └── MyModuleJUnit.gwt.xml
└── target
    └── generated-sources
        └── gwt
            └── com
                └── mycompany

27 directories, 13 files
{% endhighlight %}

As you can see, 27 directories and 13 files have been created.

### Application Source Folder

`src/main/java`, the application source folder, it contains only Java files.
Such files are separated in 3 categories: client, server, and shared. Client
files will be transpiled from Java to JavaScript, and be executed in user's
browser. Server files will be compiled into bytecode, and be executed on the
server as normal Java files. Shared files are different. They will be shared
between client side and server side, via RPC—Remove Procedure Call.

### Application Resources Folder

`src/main/resources`, the application resources folder, it contains the GWT
module definition, written in XML file. Module XML files is resided in project’s
root package. Its related path to resources folder is:

    ./com/mycompany/MyModule.gwt.xml

Such naming convention helps GWT to define the logical name of the module:

    com.mycompany.MyModule

### Web Application Sources Folder

`src/main/webapp`, the web application sources, it contains static resources
used by the web application, and the deployment descriptor file `web.xml`.
Notice that when using the DevMode, the resources in this folder are not
refreshable.

### Test Sources Folder

`src/test/java`, the test sources, it contains GWT tests. GWT tests are
different from classical unit tests. They are transpiled from Java to JavaScript
before being executed. GWT includes a special `GWTTestCase` base class that
provides JUnit integration. Running a compiled `GWTTestCase` subclass under
JUnit launches the HtmlUnit browser which serves to emulate your application
behavior during test execution. Since these tests are launched in browser, they
are actually integration tests. Naming test as `GwtTest` means:

- They won't be executed at `test` phrase (avoid matching `*Test` and `Test*`).
- They will be executed at `verify` phrase by Maven GWT Plugin.
- They won't be executed as normal integration tests by Maven Failsafe Plugin.

### Test Resources Folder

`src/test/resources`, the test resources, is very similar to application
resources.

## Run DevMode

The standard `src/main/webapp` webapp folder is used by Maven GWT Plugin to run
the dev mode server (Jetty).

    mvn gwt:run

And you can now see the GWT Development Mode. When clicking the button _"Launch
Default Browser"_, you can see the result in your browser:

<p align="center">
  <img src="{{ site.url }}/assets/20180129-dev-mode.png"
       alt="Dev Mode in localhost">
</p>

## Testing

The Maven GWT Plugin testing support is not intended to be run standalone,
rather it is bound to the Maven `integration-test` phase. To get `gwt:test` to
run, you should include the `test` goal in your plugin configuration executions,
and you should invoke `mvn verify` (or `mvn install`).

    mvn verify

## Conclusion

Today we learnt how to use GWT Maven Plugin to create a quick start project by
following the standard Maven layouts. Some basic thinking about the different
folders. We also use the 2 basics Maven commands for running application in
development mode, and running GWT tests. Hope you enjoy this post, see you the
next time.

## References

- [Mojo's Maven Plugin for GWT][1]
- [GWT Developer’s Guide][3]

[3]: http://www.gwtproject.org/doc/latest/DevGuide.html
[1]: https://gwt-maven-plugin.github.io/gwt-maven-plugin/
[2]: http://ant.apache.org/
