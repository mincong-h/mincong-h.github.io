---
article_num: 84
layout:            post
title:             Simple REST Demo With JAX-RS
lang:                en
date:              2018-11-13 21:08:54 +0100
categories:        [java-rest]
tags:              [jax-rs, java, rest]
permalink:         /2018/11/13/simple-rest-demo-with-jax-rs/
comments:          true
excerpt:           >
    A quickstart demo for creating REST service in Java using JAX-RS 2.0. The
    sample is implemented by Jersey, the reference implementation of JAX-RS.
image:             /assets/bg-cup-of-coffee-1280537_1280.jpg
cover:             /assets/bg-cup-of-coffee-1280537_1280.jpg
series:            [jax-rs-basics]
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Nowadays, REST API plays a more and more important role in software
development. Being able to create REST API is a must for Java developer. Today,
we will learn how to create REST APIs using JAX-RS 2.0, and how easy it is :)
After reading this post, you will understand:

- What is JAX-RS?
- Basic annotations
- Create a method "ping"
- Create a JAX-RS application
- Running JAX-RS application in Jersey

Before getting started, just want to let you know: the source code of this
article on GitHub as [mincong-h/jaxrs-2.x-demo][github]. You can also clone it
using the following command:

    git clone https://github.com/mincong-h/jaxrs-2.x-demo.git

## What is JAX-RS

According to [Wikipedia][wiki], JAX-RS: Java API for RESTful Web Services
(JAX-RS) is a Java programming language API spec that provides support in
creating web services according to the Representational State Transfer (REST)
architectural pattern. JAX-RS uses annotations, introduced in Java SE 5, to
simplify the development and deployment of web service clients and endpoints.
All versions of JAX-RS are part of the Java Specification Requests (JSRs):

- [JSR 311][jsr311]: JAX-RS 1.0
- [JSR 339][jsr339]: JAX-RS 2.0
- [JSR 370][jsr370]: JAX-RS 2.1

Some of the popular JAX-RS implementations available today are:

- Jersey
- RESTEasy
- Apache CXF
- Restlet

In this article, I'm using the [Jersey][jersey], the reference implementation
of JAX-RS.

## Annotations

JAX-RS annotations allow to identify what a resource class or class method will
serve requests for. JAX-RS ensures portability of REST API code across all Java
EE-compliant application servers. The most common annotations are described in
the table below.

Annotation | Package Detail
:--- | :---
`@GET` | `import javax.ws.rs.GET;`
`@Produces` | `import javax.ws.rs.Produces;`
`@Path` | `import javax.ws.rs.Path;`
`@PathParam` | `import javax.ws.rs.PathParam;`
`@QueryParam` | `import javax.ws.rs.QueryParam;`
`@POST` | `import javax.ws.rs.POST;`
`@Consumes` | `import javax.ws.rs.Consumes;`
`@FormParam` | `import javax.ws.rs.FormParam;`
`@PUT` | `import javax.ws.rs.PUT;`
`@DELETE` | `import javax.ws.rs.DELETE;`

Since this post is just a quickstart, I'm not going to go further into these
annotations. They will be talked in the next articles of the series.

## Create Sample Resource: Ping

Now, let's write some code. In this paragraph, we will try to create the first
JAX-RS resource for ping the REST app:

    http://localhost:8080/ping

which allows to ensure if the server is running. In our case, we'll create 3
classes: `PingResource` for the JAX-RS resource `/ping`, `ShopApplication`
for the JAX-RS application, and a Jersey server for hosting the application.

    REST Server
    - REST Application A
      - REST Resource a1
      - REST REsource a2
    - REST Application B
      - REST Resource b1
      - REST Resource b2
    - ...

You might wonder what is a "resource" class? According to JSR-311,
a resource class is a Java class that uses JAX-RS annotations to
implement a corresponding Web resource. Resource classes are POJOs that have
at least one method annotated with `@Path` or a request method designator
(_JSR-311, §3.1 Resource Classes_).

The ping resource class:

{% highlight java %}
package io.mincong.shop.rest;

import javax.ws.rs.HEAD;
import javax.ws.rs.Path;

@Path("ping")
public class PingResource {

  @HEAD
  public void ping() {
    // do nothing
  }
}
{% endhighlight %}

## Create a JAX-RS Application

Once we created the "ping" resource, we need a JAX-RS application to host it.
A JAX-RS application consists of one or more resources, and zero or more
provider. All REST applications need to extends `Application`.
An application contains two methods: `getClasses()` and `getSingletons()`. Both
can be used to get a set of root resource, provider and feature classes.

However, these objects have different life-cycles. The default life-cycle for
resource class instances is per-request. The default life-cycle for providers
(registered directly or via a feature) is singleton.
In our case, I choose the per-request for the "ping" resource, which means that
it goes to `getClasses()`. We will talk about singletons in the next articles.
So, here's the related Java code:

{% highlight java %}
package io.mincong.shop.rest;

import java.util.*;
import javax.ws.rs.core.Application;

public class ShopApplication extends Application {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> set = new HashSet<>();
    set.add(PingResource.class);
    return set;
  }

  @Override
  public Set<Object> getSingletons() {
    return Collections.emptySet();
  }
}
{% endhighlight %}

## Running JAX-RS Application in Server

The next step is to create a Jersey server, which hosts the « Shop »
application. The configuration for a Jersey server is really simple, you only
need to give two things:

- The URI of the server
- The JAX-RS applications to be deployed

Here's the code:

{% highlight java %}
package io.mincong.shop.rest;

import java.io.IOException;
import java.net.URI;
import javax.ws.rs.core.UriBuilder;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

public class Main {

  private static URI getBaseURI() {
    return UriBuilder.fromUri("http://localhost/").port(8080).build();
  }

  static final URI BASE_URI = getBaseURI();

  static HttpServer startServer() {
    ResourceConfig rc = ResourceConfig.forApplication(new ShopApplication());
    return GrizzlyHttpServerFactory.createHttpServer(BASE_URI, rc);
  }

  public static void main(String[] args) throws IOException {
    System.out.println("Starting grizzly...");
    HttpServer httpServer = startServer();
    System.in.read();
    httpServer.shutdownNow();
  }
}
{% endhighlight %}

Once created, we can start the server as a JAR:

```
$ mvn clean install
$ java -jar ./shop-server/target/shop-server-1.0-SNAPSHOT-jar-with-dependencies.jar
Starting grizzly...
```

Now, you can test the result in your terminal by pinging the resource via
`curl`:

```
$ curl -I http://localhost:8080/ping
HTTP/1.1 204 No Content
```

Our resource method "ping" does not return anything, that's why did not receive
any content. However, 204 means the ping is successful. :) Congratulations, you
just created the first resource method!

## Reproduction

If you want to reproduce the demo of this article, follow the instructions
below.

Open one terminal:

```
~ $ git clone https://github.com/mincong-h/jaxrs-2.x-demo.git
~ $ cd jaxrs-2.x-demo/quickstart
quickstart $ mvn clean install
quickstart $ java -jar target/jaxrs-quickstart-1.0-SNAPSHOT-jar-with-dependencies.jar
```

Open another terminal:

```
~ $ curl -I http://localhost:8080/ping
HTTP/1.1 204 No Content
```

## Conclusion

In this article, we learnt the history of JAX-RS and different basic
annotations. We also created a simple resource class "ping", a JAX-RS
application "shop", and a Jersey server for hosting this app. The project
hierarchy is:

```
- JAX-RS Server (Jersey)
  - Application "shop"
    - Resource "ping"
```

At the end, we use command line tool `curl` to verify that every works. The
entire source code is available on GitHub [mincong-h/jaxrs-2.x-demo][1]. Feel
free to download it and run the demo on your machine. More articles about
JAX-RS are coming in the next weeks. Hope you enjoy this article, see you the
next time!

## References

- [Wikipedia: Java API for RESTful Web Services][wiki]
- [JSR 311: JAX-RS: The JavaTM API for RESTful Web Services][jsr311]
- [JSR 339: JAX-RS: The JavaTM API for RESTful Web Services (JAX-RS 2.0)][jsr311]
- [JSR 370: JAX-RS: The JavaTM API for RESTful Web Services (JAX-RS 2.1)][jsr311]

[jsr311]: https://jcp.org/en/jsr/detail?id=311
[jsr339]: https://jcp.org/en/jsr/detail?id=339
[jsr370]: https://jcp.org/en/jsr/detail?id=370
[jersey]: https://jersey.github.io/
[wiki]: https://en.wikipedia.org/wiki/Java_API_for_RESTful_Web_Services
[1]: https://github.com/mincong-h/jaxrs-2.x-demo
[github]: https://github.com/mincong-h/jaxrs-2.x-demo
