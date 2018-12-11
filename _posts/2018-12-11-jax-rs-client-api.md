---
layout:            post
title:             JAX-RS Client API
date:              2018-12-11 20:11:39 +0100
categories:        [tech]
tags:              [http, java, jax-rs, rest]
comments:          true
excerpt:           >
    This post explains what is JAX-RS Client API and how to use it via Jersey
    Client API. We will talk about the Maven dependencies, Client, WebTarget,
    and HTTP response.
img_url:           /assets/bg-notebook-1280538_1280.jpg
img_width:         1280
img_height:        850
series:            JAX-RS Basics
---

## Overview

Java™ API for RESTful Web Services (JAX-RS) provides Client API for accessing
web resources. In this article, we will talk about the basic concepts of the
Client API. After reading, you will understand:

- Maven dependencies when using Jersey as JAX-RS client
- Create a Client instance
- Create a WebTarget instance
- Consume a HTTP response

The Java classes introduced in this article are principally defined
in package `javax.ws.rs.client`. I'm using Jersey, the reference implementation
of JAX-RS for the examples.

## Maven Dependencies

In order to use Jersey as JAX-RS client, you need to add the following
dependency in your POM (`pom.xml`):

{% highlight xml %}
<dependency>
  <groupId>org.glassfish.jersey.core</groupId>
  <artifactId>jersey-client</artifactId>
  <version>2.27</version>
</dependency>
{% endhighlight %}

## Create Client Instance

An instance of `Client` is required to access a Web resource using the Client
API. The default instance of `Client` can be obtained by calling `newClient` on
`ClientBuilder`. `Client` instances can be configured using methods inherited
from `Configurable` as follows:

{% highlight java %}
// Create instance
Client client = ClientBuilder.newClient();

// Configure instance
client.property("MyKey", "MyValue")
      .register(MyProvider.class);
{% endhighlight %}

## Create WebTarget Instance

Using any `Client#target(...)` method can create a `WebTarget` from `Client`.
They accept String, URI, URI Builder, and Link as input parameter type. For
example, create web target using a String:

{% highlight java %}
WebTarget books = client.target("http://localhost:8080/books");
{% endhighlight %}

Once created, you can use `path` to define the path to a specific resource. For
example, if you need to request book 1 defined by the following URL:

    http://localhost:8080/books/1

You can do:

{% highlight java %}
books.path("1");
{% endhighlight %}

Conceptually, the steps required to submit a request are the following: 1.
obtain an instance of `Client`; 2. create a `WebTarget`; 3. create a request
from the `WebTarget`; 4. submit a request or get a prepared `Invocation` for
later submission. JAX-RS uses method chaining to support different
configurations, such as setting headers, cookies, query parameters, etc.

{% highlight java %}
Response r = client.target("http://example.org/api")
  .queryParam("myParam", "v")
  .request("text/plain")
  .header("myHeader", "v")
  .get();
{% endhighlight %}

## Consume HTTP Response

Once the HTTP response is obtained as class `javax.ws.rs.core.Response`, you can
get the HTTP status, read the entity, get the MIME type, cookie, etc.

{% highlight java %}
Response response = target.path("1").request().get();

response.getStatus();
// out: 200

response.readEntity(String.class);
// out: {"id":1,"name":"Awesome"}
{% endhighlight %}

## Conclusion

In this article, we've seen how to create a Client and WebTarget using Jersey
Client API, in particular the method chaining techniques for setting different
parts of a HTTP request. We've also seen how to get information from the HTTP
response. Hope you enjoy this article, see you the next time!

## References

- [JSR-370: Java™ API for RESTful Web Services (JAX-RS 2.1) Specification][3]
- [Baeldung: Jersey JAX-RS Client][2]

[2]: https://www.baeldung.com/jersey-jax-rs-client
[3]: https://jcp.org/en/jsr/detail?id=370
