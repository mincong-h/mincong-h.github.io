---
layout:            post
title:             JAX-RS Param Annotations
date:              2018-11-27 22:22:23 +0100
categories:        [tech]
tags:              [http, java, jax-rs, rest]
comments:          true
excerpt:           >
    This post explains different param annotations in JAX-RS 2.1 and their
    use-cases, including @QueryParam, @MatrixParam, @PathParam, @HeaderParam,
    @CookieParam, @FormParam and @BeanParam.
image:             /assets/bg-coffee-2306471_1280.jpg
series:            JAX-RS Basics
---

## Overview

In this article, we are going to explore the different parameter annotations in
JAX-RS. The goal is to understand what are they, where are their related
locations in HTTP protocol, and how to use them in Java. The following
parameter annotations will be discussed:

- `@QueryParam`
- `@MatrixParam`
- `@PathParam`
- `@HeaderParam`
- `@CookieParam`
- `@FormParam`
- `@BeanParam`

If you want to reproduce the demo, please visit my GitHub project
[mincong-h/jaxrs-2.x-demo][github]. Follow the installation guide below to
download, build, and start the server in your machine:

```
$ git clone https://github.com/mincong-h/jaxrs-2.x-demo.git
$ cd jaxrs-2.x-demo/jaxrs-params
$ mvn clean install
$ java -jar ./target/jaxrs-params-1.0-SNAPSHOT-jar-with-dependencies.jar
```

## QueryParam

`@QueryParam` extracts value from a URI query parameter. It can be used in
parameter, field or method. The value of the annotation
identifies the name of a URI template parameter.

Let's see a demo. Given the following request URI:

    http://localhost:8080/queryParam?s=Hi&i=123

and Java implementation:

{% highlight java %}
@GET
@Path("queryParam")
public Response getParams(
    @QueryParam("s") @DefaultValue("") String myStr,
    @QueryParam("i") @DefaultValue("-1") int myInt) {
  String s = "s=" + myStr + ", i=" + myInt;
  return Response.ok(s).build();
}
{% endhighlight %}

We can see that parameter `s` and parameter `i` are extracted from the query
using parameter annotation `@QueryParam`. These parameters bind to
string variable `myStr` and integer variable `myInt` respectively. If not value
provided by the request, a default value is provided by annotation
`@DefaultValue` on each parameter.

Now, test it using cUrl. We can see that JAX-RS understands the
query parameters correctly.

```
$ curl 'http://localhost:8080/queryParam?s=Hi&i=123'
s=Hi, i=123
```

## MatrixParam

`@MatrixParam` extracts value from a URI matrix parameter. It can be used in
parameter, field, or method. Matrix parameters are alternative to query
parameters. Both can insert optional parameters in a URL. Note that Matrix
parameter is still in [proposal state][1] and is not a Web standard.

Let's see a demo. Given the following request URI:

    http://localhost:8080/matrixParam;height=1;width=2

and Java implementation:

{% highlight java %}
@GET
@Path("matrixParam")
public Response getMatrixParam(
    @MatrixParam("height") int height,
    @MatrixParam("width") int width) {
  return Response.ok("height=" + height + ", width=" + width).build();
}
{% endhighlight java %}

We can see that `height` and `width` are extracted from the request
URI matrix parameters separated by semi-colon `;`.

Now, test it using cUrl. We can see that JAX-RS understands the query parameters
correctly.

```
$ curl 'http://localhost:8080/matrixParam;height=1;width=2'
height=1, width=2
```

## PathParam

`@PathParam` extracts value from a URI template parameter. It can be used by
parameter, field, or method in Java. A URI path template is a string with zero or more
embedded parameters. For example, the following Java code defines a valid URI
path template where the segments after "pathParam" are assigned as parameter `p`.

{% highlight java %}
@Path("pathParam/{p}")
{% endhighlight %}

Let's see a demo. Given the following request URI:

    http://localhost:8080/pathParam/foo

and Java implementation:

{% highlight java %}
@GET
@Path("pathParam/{p}")
public Response getParams(@PathParam("p") String v) {
  return Response.ok(v).build();
}
{% endhighlight %}

Parameter `p` is extracted from request URI, thanks to the mapping `p` between
the URI path template `paramParam/{p}` and path param annotation
`@PathParam("p")`. Its value is `foo` which is now assigned to variable `v`.
This can be verified by using cUrl command:

```
$ curl -s http://localhost:8080/pathParam/foo
foo
```

## HeaderParam

`@HeaderParam` extracts value from a HTTP header. It can be used by parameter,
field, or method in Java.

Let's see a demo. Given the following HTTP request, the value of HTTP header "p"
will be matched to header param annotation `p`.

```
GET /params/headerParam HTTP/1.1
p: foo
```

Java implementation:

{% highlight java %}
@GET
@Path("headerParam")
public Response getHeaderParam(@HeaderParam("p") String v) {
  return Response.ok(v).build();
}
{% endhighlight %}

This can be tested using cUrl. A header `p: foo` had been provided by the HTTP
request. It was processed then returned by the HTTP response.

```
$ curl -v -H 'p: foo' http://localhost:8080/headerParam
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 8080 (#0)
> GET /params/headerParam HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.54.0
> Accept: */*
> p: foo
>
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Content-Length: 3
<
* Connection #0 to host localhost left intact
foo
```

## CookieParam

`@CookieParam` extracts value from a HTTP cookie. It can be used by parameter,
field, or method in Java. Cookie param annotation is similar to `@HeaderParam`,
but it applies only to cookie header `Cookie: ...`.

Given request URI

```
GET /cookieParam
Cookie: p=foo
```

and Java implementation

{% highlight java %}
@GET
@Path("cookieParam")
public Response getCookieParam(@CookieParam("p") String v) {
  return Response.ok(v).build();
}
{% endhighlight %}

You can see that the Cookie parameter `p` is captured and the value "foo" is
stored as string variable v in Java. This can be verified using command cUrl:

```
$ curl -v -H 'Cookie: p=foo' http://localhost:8080/cookieParam
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 8080 (#0)
> GET /params/cookieParam HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.54.0
> Accept: */*
> Cookie: p=foo
>
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Content-Length: 3
<
* Connection #0 to host localhost left intact
foo
```

## FormParam

`@FormParam` can be used in parameter, field, or method. It specifies that the
value is to be extracted from a form parameter in a request entity body. The
value of the annotation identifies the name of a form parameter. Note that
whilst the annotation target allows use on fields and methods, the specification
only requires support for use on resource method parameters. (Spec 2.1, page 76)

For example, given the following request URI:

    http://localhost:8080/postParam

and Java implementation:

{% highlight java %}
@POST
@Path("formParam")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response postFormParam(@FormParam("p") String v) {
  return Response.ok(v).build();
}
{% endhighlight %}

```
$ curl -v -d 'p=foo' http://localhost:8080/formParam
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 8080 (#0)
> POST /params/formParam HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.54.0
> Accept: */*
> Content-Length: 5
> Content-Type: application/x-www-form-urlencoded
>
* upload completely sent off: 5 out of 5 bytes
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Content-Length: 3
<
* Connection #0 to host localhost left intact
foo
```

## BeanParam

`@BeanParam` can be used to inject a user-defined bean whose fields and
properties may be annotated with JAX-RS param annotations. It can be used by
parameter, field, or method.

For example, given the following URI

    http://localhost:8080/beanParam

and Java implementation for resource:

{% highlight java %}
@POST
@Path("beanParam")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response postBeanParam(@BeanParam Image image) {
  String s = "height=" + image.getHeight();
  s += ", width=" + image.getWidth();
  return Response.ok(s).build();
}
{% endhighlight %}

and Java bean `Image`:

{% highlight java %}
package io.mincong.demo;

import javax.ws.rs.FormParam;

public class Image {

  @FormParam("height")
  private int height;

  @FormParam("width")
  private int width;

  public int getHeight() {
    return height;
  }

  public int getWidth() {
    return width;
  }
}
{% endhighlight %}

Then form parameters height / width, submitted by the HTTP request, are
encapsulated in a bean parameter. The JAX-RS runtime introspect the `@BeanParam`
parameters's type for injection annotations and then set them as appropriate.
Test it with cUrl:

```
$ curl -d 'height=1' \
       -d 'width=2' \
  http://localhost:8080/beanParam
height=1, width=2
```

## Conclusion

Thank you for reading the entire article! In this post, we have seen
different JAX-RS parameter annotations: `@QueryParam`, `@MatrixParam`,
`@PathParam`, `@HeaderParam`, `@CookieParam`, `@FormParam`, and `@BeanParam`. We
analysed the HTTP request URI syntax to see the relationship between HTTP and
these annotations. For each method, we also verified the result using a
simple cUrl command.

If you want to see more detail, check my GitHub project
[mincong-h/jaxrs-2.x-demo][github], directory `jaxrs-params`. Hope you enjoy
this article, see you the next time!

## References

- [JSR-370: Java™ API for RESTful Web Services (JAX-RS 2.1) Specification][3]

[github]: https://github.com/mincong-h/jaxrs-2.x-demo
[1]: https://www.w3.org/DesignIssues/MatrixURIs.html
[3]: https://jcp.org/en/jsr/detail?id=370
