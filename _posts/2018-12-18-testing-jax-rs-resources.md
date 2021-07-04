---
layout:            post
title:             Testing JAX-RS Resources
lang:                en
date:              2018-12-18 20:49:46 +0100
categories:        [java-rest, java-testing]
tags:              [http, java, jax-rs, rest, testing]
comments:          true
excerpt:           >
    This article explains how to set up and tear down a Grizzly Server for
    testing JAX-RS resources, how to create a HTTP request and assert the
    response using JUnit 4. And finally, the limits of testing API in reality.
image:             /assets/bg-coffee-171653_1280.jpg
cover:             /assets/bg-coffee-171653_1280.jpg
series:            [jax-rs-basics]
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In the previous articles, we learnt different concepts about JAX-RS. It's
interesting see how many things we can actually do with this spec. However,
it's also important to prove that our code actually works. Today, we are going
to take a look on testing: How to test the JAX-RS resources in Java?

I'm using JUnit 4, Jersey, and Grizzly Server. More detail will be explained
later on. After reading this article, you will understand:

- How to set up a Grizzly Server for tests
- How to create a HTTP request
- How to assert response
- Limits of API testing

## Set Up Grizzly Server for Tests

Before creating any tests, we need to set up a server for hosting the JAX-RS
resources. In my example, I use Grizzly server. In order to configure it, you
need to define which JAX-RS `Application` you want to deploy; the URI where the
server will be running; and actually start the server with these configuration
properties. As for tear down, use `shutdownNow()` method to immediately shut
down the `HttpServer` instance.

{% highlight java %}
public class BookResourceIT {

  private HttpServer server;

  @Before
  public void setUp() {
    ResourceConfig rc = ResourceConfig.forApplication(new ShopApplication());
    URI uri = UriBuilder.fromUri("http://localhost/").port(8080).build();
    server = GrizzlyHttpServerFactory.createHttpServer(uri, rc);
  }

  @After
  public void tearDown() {
    server.shutdownNow();
  }

  ...
}
{% endhighlight %}

Why Grizzly Server? I choose Grizzly because it's a lightweight server, and is
actually being used by the Jersey Team for their tests. In reality, you might
need to deploy other Java server: Jetty, Tomcat, WildFly, ... It depends really
on the context. In my daily work, we use Nuxeo Server (built on top of Tomcat).
In my side projects, I use Jetty.

## Create a HTTP request

Now the server is ready, we can write test. The first step is to create a HTTP
request. The creation can be done using methods in Client API:
`Client#target(...)`. These methods accept String, URI, URI Builder, and Link
as input parameter type. For example, create web target using a String:

{% highlight java %}
WebTarget books = client.target("http://localhost:8080/books");
{% endhighlight %}

Once created, you can use `path` to define the path to a specific resource. For
example, if you need to request book 1 defined by the following URL:

    http://localhost:8080/books/1

You can do:

{% highlight java %}
public class BookResourceIT {

  private WebTarget books;

  @Before
  public void setUp() {
    ...
    books = ClientBuilder.newClient().target("http://localhost:8080/books");
  }

  @Test
  public void testGet() {
    Response response = books.path("1").request().get();
    ...
  }
}
{% endhighlight %}

For more information about using JAX-RS Client API, see my other post: [JAX-RS
Client API][1].

## Assert Response

Once the response is returned, you can assert it using JUnit. I think the most
common use cases are assertions on the status code and the entity
(response body).

**Assert HTTP status:**

{% highlight java %}
Response r1 = books.path("1").request().get();
assertEquals(Status.OK.getStatusCode(), r1.getStatus());

Response r2 = books.path("2").request().get();
assertEquals(Status.NOT_FOUND.getStatusCode(), r2.getStatus());
{% endhighlight %}

Note that class `javax.ws.rs.core.Response` actually provides 2 similar methods
for getting status: `int getStatus()` and `StatusType getStatusInfo()`.
Personally, I prefer using `getStatus()` for assertion, because comparing
numbers is easier than compare enum, thus less chance to fail.

**Assert HTTP body:**

{% highlight java %}
Response r1 = books.path("1").request().get();
assertEquals("{\"id\":1,\"name\":\"Awesome\"}", r1.readEntity(String.class));

Response r2 = books.path("2").request().get();
assertEquals("", r2.readEntity(String.class));
{% endhighlight %}

Asserting other information are similar.

## Limits of Testing API

While testing API looks really simple on this article, it is not in reality.
Here're some factors that you might consider:

- **The number input params of a resource method.** A method might use form
  params, query params, path params, entity, header params,
  cookie params, etc for its logic. The number of parameters can change
  dramatically the complexity of preparation and the possible scenario to test.
- **The complexity of server setup.** The complexity depends on number of layers
  on the backend, the business logic, the persistence, the frameworks used etc.
  The more complex it is, the harder to maintain and the slower to start.
- **REST layer is supposed to be simple.** In theory, the REST layer
  is supposed to be simple. It should avoid having any complex logic and
  pass input values to business layer right after reception. Therefore, the test
  effort should be focus on business layer, where unit tests are easier
  to write and maintain.
- **Possible errors.** When testing APIs, we often use a partial deployment of
  the server and it may not reflect to the real setup of the production
  environment. Firewall, proxy, authentication services, ... many factors are
  not taken into account when testing APIs. Thus, possible errors might not be
  discovered by these tests.
- **Maintainability.** The slowness of execution and the complexity of setup the
  server will introduce a big effort for maintaining these tests in the long
  term.

## Conclusion

In this article, we've seen how to set up and tear down a Grizzly Server for
testing JAX-RS resources. We learnt how to create a HTTP request and assert the
response using JUnit 4. At the end, I also share some thoughts about the limits
of testing API in reality.

The entire JAX-RS series is written in TDD (Test Driven Development) way, you
can visit my GitHub repository [jaxrs-2.x-demo][2] and search `*IT.java` to see
how those integration tests are written. Hope you enjoy this article, see you
the next time!

## References

[1]: /2018/12/11/jax-rs-client-api/
[2]: https://github.com/mincong-h/jaxrs-2.x-demo
