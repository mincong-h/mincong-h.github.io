---
layout:      post
title:       "Servlet and Filter"
lang:                en
date:        "2018-05-03 21:06:33 +0200"
categories:  [tech]
tags:        [java, java-ee, tomcat]
permalink:         /2018/05/03/servlet-and-filter/
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, I'd like to talk about the famous `HttpServlet` and `Filter`, in
Tomcat 8.5 server.

<!--more-->

## HTTP Servlet

A servlet is a small Java program that runs within a Web server. Servlets
receive and respond to requests from Web clients, usually across HTTP, the
HyperText Transfer Protocol. To implement this interface, you can write a
generic servlet that extends `javax.servlet.GenericServlet` or an HTTP servlet
that extends `javax.servlet.http.HttpServlet`.

In my case, I created a servlet called `MyServlet` by extending HTTP servlet.
And register it using annotation `@WebServlet`:

{% highlight java %}
@WebServlet("/")
public class MyServlet extends HttpServlet {
  ...
}
{% endhighlight %}

If you want your servlet handle a particular HTTP method, you can override the
protected method defined by HTTP servlet. For example, override the GET method:

{% highlight java %}
@WebServlet("/")
public class MyServlet extends HttpServlet {

  @Override
  protected doGet(HttpServletRequest request, HttpServletResponse response) {
    ...
  }
}
{% endhighlight %}

By overriding the target method, you can access to information of HTTP request
and response, also modify them—such as providing a HTTP status code for the
response, or write content to the response.

## Servlet Filter

A filter is an object that performs filtering tasks on either the request to a
resource (a servlet or static content), or on the response from a resource, or
both. Filters perform filtering in the `doFilter` method. Every Filter has
access to a `FilterConfig` object from which it can obtain its initialization
parameters, and a reference to the `ServletContext` which it can use, for
example, to load resources needed for filtering tasks.

A simple implementation of `MyFilter` can be written as follows:

{% highlight java %}
package io.mincong.tomcat;

import java.io.IOException;
import java.util.logging.Logger;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;

@WebFilter("/")
public class MyFilter implements Filter {

  private static final Logger LOGGER = Logger.getLogger(MyFilter.class.getName());

  @Override
  public void init(FilterConfig filterConfig) {
    LOGGER.info("Initialized.");
  }

  @Override
  public void doFilter(
      ServletRequest request,
      ServletResponse response,
      FilterChain chain) throws IOException, ServletException {
    LOGGER.info("Before...");
    chain.doFilter(request, response);
    LOGGER.info("After...");
  }

  @Override
  public void destroy() {
    LOGGER.info("Destroyed.");
  }
}
{% endhighlight %}

As stated before, filters perform filtering in the `doFilter` method. Here,
`MyFilter` is implementation of the [chain of responsibility pattern][1]. The
point is that each filter stays "in front" and "behind" each servlet it is
mapped to. So if you have a filter around a servlet, you'll have:

{% highlight java %}
public void doFilter(...) {
  // before
  chain.doFilter(request, response);
  // after
}
{% endhighlight %}

## Demo

If I deploy both classes into a Tomcat server, I'll obtain something like:

```
[INFO] May 03, 2018 9:25:00 PM io.mincong.tomcat.MyFilter doFilter
[INFO] INFO: Before...
[INFO] May 03, 2018 9:25:00 PM io.mincong.tomcat.MyServlet doGet
[INFO] INFO: http://localhost:8080/filter/
[INFO] May 03, 2018 9:25:00 PM io.mincong.tomcat.MyFilter doFilter
[INFO] INFO: After...
```

It proves that the chaining responsability is respected. The chain is:

1. MyFilter init()
2. MyFilter doFilter()
3. MyServlet doGet()
4. MyFilter doFilter()
5. MyFilter destroy()

If you want to try it yourself, you can do the following using 2 terminals. One
terminal for the server side:

```
$ git clone git@github.com:mincong-h/tomcat-demo.git
$ mvn clean install
$ cd filter
$ mvn cargo:run
```

Another terminal for the client side:

```
$ curl -s http://localhost:8080/filter/ | jq
{
  "status": 200
}
```

And then, observe the log output of terminal 1 (server) to understand the filter
and servlet logic.

## References

- [Wikipedia: Chain-of-responsibility pattern][1]
- [Stack Overflow: What is the use of filter and chain in servlet?][2]

[2]: https://stackoverflow.com/questions/4122870/what-is-the-use-of-filter-and-chain-in-servlet
[1]: https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern
