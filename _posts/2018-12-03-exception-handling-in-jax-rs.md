---
layout:            post
title:             Exception Handling in JAX-RS
date:              2018-12-03 07:15:28 +0100
categories:        [tech]
tags:              [http, java, jax-rs, rest]
comments:          true
excerpt:           >
    This post explains exception mapper, how to register it in JAX-RS
    application programmatically or via annotation, the exception
    matching mechanism (nearest-superclass), and more.
image:             /assets/bg-coffee-983955_1280.jpg
img_width:         1280
img_height:        810
series:            JAX-RS Basics
---

## Overview

A RESTful API service may throw exception in many cases. It's important to
handle them properly, so that we can provide a right HTTP response to the
client, in particular a right status code (4xx or 5xx errors) and a correct
entity. In this article, we will focus on « Exception Mapper », understand it's
mechanism in regards to exceptions.

After reading this article, you will understand:

- What is an exception mapper?
- How to declare an exception mapper in JAX-RS application?
- Exceptions matching mechanism
- When exception mapper throws an exception...

As usual, the source code is available for free on GitHub as
[mincong-h/jaxrs-2.x-demo][1]. You can install and run the demo as following:

```
~ $ git clone https://github.com/mincong-h/jaxrs-2.x-demo.git
~ $ cd jaxrs-2.x-demo/exception
exception $ mvn clean install
exception $ java -jar target/exception-1.0-SNAPSHOT-jar-with-dependencies.jar
```

## Exception Mapper

Before talking about exception mapper, we first need to understand the concept
of provider. Providers in JAX-RS are responsible for various cross-cutting
concerns such as filtering requests, converting representations into Java
objects, mapping exceptions to responses, etc. By default, a single instance of
each provider class is instantiated for each JAX-RS application, aka singletons.

Interface `ExceptionMapper<E extends Throwable>` defines a contract for a
provider that maps Java exceptions `E` to `Response`. Same as other providers,
exception mappers can be either pre-packaged in the JAX-RS runtime or supplied
by an application. In order to create your own exception mapper, you need to
create a class which implements interface `ExceptionMapper`. Here's an example
for mapping `ExceptionA` in your application:

{% highlight java %}
package io.mincong.demo;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

public class MapperA implements ExceptionMapper<ExceptionA> {

  @Override
  public Response toResponse(ExceptionA ex) {
    return Response.status(400)
        .entity("Mapper A: " + ex.getMessage())
        .build();
  }
}
{% endhighlight %}

When an exception of type `ExceptionA` thrown by a JAX-RS resource, this
exception mapper can catch the exception and transform it into a HTTP 400
response, with the origin exception message as entity.

**Exercise time:** given the following JAX-RS resource method
`newExceptionA1()`, use command line tool cUrl to observe the HTTP response and
verify the exception mapping.

{% highlight java %}
@GET
@Path("a")
public Response newExceptionA() {
  throw new ExceptionA("Exception A");
}
{% endhighlight %}

Command cUrl in terminal:

```
$ curl -i http://localhost:8080/a
HTTP/1.1 400 Bad Request
Content-Type: text/plain
Connection: close
Content-Length: 21

Mapper A: Exception A
```

So we successfully verified that `MapperA` is used for handling `ExceptionA`
coming from resource method.

## Declare Exception Mapper in JAX-RS Application

Providers implementing `ExceptionMapper` contract must be either
programmatically registered in a JAX-RS runtime or must be annotated with
`@Provider` annotation to be automatically discovered by the JAX-RS runtime
during a provider scanning phase.

**Programmatically registered example**. In JAX-RS application "MyApplication",
add exception mapper "MapperA" as a singleton. Now, Mapper A is
programmatically registered in a JAX-RS runtime.

{% highlight java %}
package io.mincong.demo;

import java.util.HashSet;
import java.util.Set;
import javax.ws.rs.core.Application;

public class MyApplication extends Application {

  @Override
  public Set<Object> getSingletons() {
    Set<Object> set = new HashSet<>();
    set.add(new MapperA());
    return set;
  }

  ...
}
{% endhighlight %}

**Automatic discovery example.** Add `@Provider` annotation to Mapper A, so that it can
be automatically discovered by the JAX-RS runtime during a provider scanning
phase:

{% highlight java %}
import javax.ws.rs.ext.Provider;

@Provider
public class MapperA implements ExceptionMapper<ExceptionA> {
  ...
}
{% endhighlight %}

## Exception Mapping Mechanism

Exception mapping providers map a checked or runtime exception to an instance of
`Response`. When choosing an exception mapping provider to map an exception,
JAX-RS implementation (e.g. Jersey) use the provider whose generic type is the
nearest superclass of the exception. If two or more exception providers are
applicable, the one with the highest priority will be chosen. (Spec §4.4)

**Mapping = nearest superclass + highest priority**

For example, in our demo, 2 exception mappers are available:

- `MapperA` for mapping all exceptions of class `ExceptionA` or its sub-classes
- `MapperA1` for mapping all exceptions of class `ExceptionA1` or its
  sub-classes, where `ExceptionA1` is a child class of `ExceptionA`

and the following exceptions:

```
java.lang.Exception
└── java.lang.RuntimeException
    └── io.mincong.demo.ExceptionA
        ├── io.mincong.demo.ExceptionA1
        └── io.mincong.demo.ExceptionA2
```

The mapping will behave as the table below:

Exception          | Mapper A1 | Mapper A | General Mapper
:----------------- | :-------: | :------: | :------------:
`ExceptionA1`      |    x      |          |
`ExceptionA2`      |           |     x    |
`ExceptionA`       |           |     x    |
`RuntimeException` |           |          |        x
`Exception`        |           |          |        x

> Is is possible to have infinite loop when handling exception?

According to Spec §4.4 Exception Mapping Providers, JAX-RS implementations use
a single exception mapper during the processing of a request and its
corresponding response. So this should never happen.

## A Failing Exception Mapper

What will happen if exception mapper throws an exception?

If an exception mapping provider throws an exception while creating a `Response`
then, then a server error (status code 500) response is returned to the client
(Spec §3.3.4 Exceptions).

We can verify it using the following resource method and exception mapper:

{% highlight java %}
@GET
@Path("failing")
public Response newFooException() {
  throw new FooException();
}
{% endhighlight %}

{% highlight java %}
public class FailingExceptionMapper
    implements ExceptionMapper<FooException> {

  @Override
  public Response toResponse(FooException exception) {
    throw new IllegalStateException();
  }
}
{% endhighlight %}

Verify using cUrl in terminal:

```
$ curl -i http://localhost:8080/failing
HTTP/1.1 500 Internal Server Error
Connection: close
Content-Length: 0
```

We can see the response is 500. And the following stack trace can be observed
in the server log:

```
Dec 03, 2018 9:46:47 PM org.glassfish.jersey.server.ServerRuntime$Responder mapException
SEVERE: An exception was not mapped due to exception mapper failure. The HTTP 500 response will be returned.
io.mincong.demo.FooException
	at io.mincong.demo.DemoResource.newFooException(DemoResource.java:38)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	...
```

## Conclusion

In this article, we learnt the definition of exception mapper, how to register
it in JAX-RS application (programmatically or via annotation). We've also seen
the matching mechanism (nearest-superclass). At the end, we verified that a
failing provider is handled by JAX-RS implementation.

As usual, the source code is available for free on GitHub as
[mincong-h/jaxrs-2.x-demo][1]. Feel free to download it and give it a try.
Hope you enjoy this article, see you the next time!

## References

- [JSR-370: Java™ API for RESTful Web Services (JAX-RS 2.1) Specification][3]

[3]: https://jcp.org/en/jsr/detail?id=370
[1]: https://github.com/mincong-h/jaxrs-2.x-demo
