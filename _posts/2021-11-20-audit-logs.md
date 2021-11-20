---
layout:              post
title:               Audit Logs
subtitle:            >
    Implementing a simple audit logs solution with Java JAX-RS.

lang:                en
date:                2021-11-20 08:40:44 +0100
categories:          [java-core]
tags:                [java, jetty, jersey, api, jax-rs]
ads_tags:            []
comments:            true
excerpt:             >
    This article discusses how to implement a simple audit logs solution with
    Java JAX-RS, including requirements, considerations for the implementation,
    and 3 different solutions based on Java Servlet, Jetty, and JAX-RS filter.

image:               /assets/bg-markus-spiske-gnhxvdGmGG8-unsplash.jpg
cover:               /assets/bg-markus-spiske-gnhxvdGmGG8-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

Today I would like to discuss audit logs with you. Audit logs are logs for
auditing. They are events that keep track of creation, modification, deletion,
or any other operation that mutates the state of a given resource. This resource
can be a database, a pipeline, or anything valuable for the company. You may
want to keep track of these events since they can be useful for security
analysis, troubleshooting, compliance, auditing, keeping track of the lifecycle
of a data store, etc, depending on your role. During
my work at Datadog, I had the chance to implement a simple audit solution for an
internal tool. That's why I want to write down some thoughts and hopefully, they
will be useful for you as well.

After reading this article, you will understand:

* Requirements for audit logs
* Principles when implementing audit logs
* Focus deeper on Java solution using JAX-RS
* How to go further from this article

Now, let's get started!

## Requirements For Audit Logs

Generally speaking, there is some information that we care about:

- **Resource.** We want to know what is being accessed or modified. Therefore,
  we may want to record the resource ID, resource name, resource type, resource
  group, or any other information related to this resource. Regarding RESTful
  API, the resource ID can be the path, which is usually the representation of
  the resource.
- **Time.** We want to know when does this happen precisely. This is important
  to construct a timeline for a bigger event, like an incident, an attack, or
  the lifecycle of a resource.
- **Action.** We want to know what is being done on that resource. It provides
  an accurate description of the type of operation. Some typical examples are
  "create", "read", "delete", "update", etc.
- **User.** We want to know "who did that?" so that we can find out more
  information based on that user or better understand the motivation of this
  operation. The user information may contain the first name, last name, email,
  department, organization unit, employee ID, etc.

We can eventually go further by adding more metadata to facilitate the search,
making the description more human-readable, etc. But I believe that these are not
requirements, but enhancements to make the feature more usable.

Then on the business side, there are other also some requirements:

- **Retention.** The retention of the audit logs. We want them to store longer
  than normal logs because they are specific logs for investigation. These are
  precious events helping us to redraw the big picture.
- **Access**. Perhaps not everyone should be accessed to audit logs. Taking
  Datadog's product ["Audit
  Logs"](https://docs.datadoghq.com/fr/account_management/audit_logs/) as an
  example, only administrator or security team members can access Audit Logs. As
  an individual, you can only see a stream of your own actions.

I probably didn't cover everything in the section. If you have other ideas,
please let me know what you think in the comment section below.

## Principles When Implementing Audit Logs

When implementing audit logs, I believe here are the principles to follow and I
will try to explain why.

**Hooking into the lifecycle.** When implementing audit logging, we need to
decide where should we put the code. I believe that the best option is to hook
your logic into the lifecycle of the framework that you use. Then, you will be
able to log before or after an event. For example, if you use Java
Persistence API (JPA), you can implement your logic using `@PrePersist`,
`@PreUpdate`, `@PreRemove` callbacks. Or if you use Java RESTful API
(JAX-RS), you can implement interfaces `ContainerRequestFilter` or
`ContainerResponseFilter` to handle the audit logging, respectively before the
request is handled or after the response is created. By hooking into the
lifecycle, we ensure that the audit logging is decoupled from the actual
business logic. We avoid spamming the codebase by avoiding adding the audit logs
into every method. It also makes it clear when does the audit actually happen.

**Avoid blocking the actual event.** When adding audit logs, we should also
avoid blocking actual events so that the user's action won't be blocked or delayed.
This is because sometimes the audit logging requires API calls, which means that
they may be slow or suffer from network issues. So my suggestion is to use
asynchronous implementation so that the actual event will be handled correctly.
As for network issues or other types of error, we can make it fault-tolerant by
adding a retry mechanism. We can also consider using a batch API call to group
multiple events.

## Java Solutions

In this section, I would like to go further into Java to discuss how to
implement a simple audit logging solution for Java RESTful APIs. Here I am going
to list 3 solutions based on Java Servlet, Jetty, and JAX-RS (Jersey).

### Java Servlet

For those who don't know Java Servlet, here is a quick introduction. Java
Servlet or nowadays Jakarta Servlet, is a Java software component that extends
the capabilities of a server. It's commonly used for implementing web containers
for hosting web applications, similar to PHP and ASP.NET. The evolution of Java
Servlet is part of the Java Specification Requests
([JSRs](https://jcp.org/en/jsr/all)). The latest one is Java Servlet 4.0
(JSR-369) started in 2017.

In our case, we can implement a simple Servlet filter to intercept the HTTP
request or response using the `doFilter()` method. Inside the method, you
must call the filter chain to pass the request and response to the next
filter so that they are handled. Otherwise, the request will be dropped
(filtered), which is not desired. Then, you can implement the actual auditing
logic before or after the chain. I prefer after the chain because in this case,
we will have the information of both the HTTP request and the HTTP response,
which makes the auditing logging more complete.

```java
import javax.servlet.*;
import java.io.IOException;

public class SimpleServletFilter implements Filter {

    public void init(FilterConfig config) throws ServletException {}

    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
        // before the request being handled
        chain.doFilter(request, response);
        // after the response being created
    }

    public void destroy() {}
}
```

### Jetty Server

If you are using Jetty as the solution for your Java server, you can extend
`AbstractNCSARequestLog` to provide a custom access log solution in the
pseudo-standard NCSA commong log format. To do that, you can create a request
log handler which handles the request log, and then use the handler in your
Jetty server:

```java
var logHandler = new RequestLogHandler();
logHandler.setRequestLog(new MyRequestLog());
server.setHandler(logHandler);
```

where the implementation of `MyRequestLog` looks like this:

```java
public class MyRequestLog extends AbstractNCSARequestLog {
    public MyRequestLog() {
        // configure options here: timezone, locale, extended, IP address, ...
    }

    @Override
    public void write(String entry) throws IOException {
        logger.info(entry);
    }
}
```

The problem with this approach is that the final result must be a string and it
must look like an access log. Other output structures are not supported.
So if you need a more custom solution, then you will need to find another way to
handle it. `AbstractNCSARequestLog` may be replaced by another class in the
recent versions of Jetty, but the most important thing here is to understand
that we can delegate the access log creation to a base class.

### JAX-RS Filter

Working with RESTful APIs is a very popular choice these days. Most of the web
services communicate with the frontend or between them using RESTful APIs.
Therefore, it makes sense to adapt the auditing solution to "Java API for
RESTful Web Services" (JAX-RS). By doing so, we assume that we are not serving
HTTP requests without APIs.

Here is a basic structure for auditing filter based on interface
`ContainerResponseFilter`. In the code block, we have access to information
about the HTTP request and the HTTP response, such as request path, request
headers, response status code, size of the response. These data allow us to
provide our custom implementation of audit logging.

```java
public class MyFilter implements ContainerResponseFilter {
    @Override
    public void filter(ContainerRequestContext requestContext,
            ContainerResponseContext responseContext) throws IOException {
        // TODO: implementation goes here
        // read request info, response info, read environment variables, ...
    }
}
```

But this may not satisfy you because compared to the Java Servlet solution,
here we don't have access to servlet anymore. It means some information may be
missing. However, we can use the `@Context` annotation to inject the servlet
request again (or other resources if you need):

```java
public class MyFilter implements ContainerResponseFilter {

    @Context
    private HttpServletRequest request; // HERE

    @Override
    public void filter(ContainerRequestContext requestContext,
            ContainerResponseContext responseContext) throws IOException {
        // ...
    }
}
```

I didn't have a chance to test this solution, but I saw it on [Stack
Overflow](https://stackoverflow.com/questions/13198550/context-returns-proxy-instead-of-httpservletrequest-no-thread-local-value-in-s).
Hopefully, it will work for you.

## Going Further

How to go further from here?

- To learn more about the difference between a Servlet filter and a Jersey
  filter (JAX-RS), you can visit [this answer on Stack
  Overflow](https://stackoverflow.com/a/52210283/4381330) written by Paul
  Samsotha.
- To learn more about Jakarta Servet (formerly Java Servlet), visit this
  [Wikipedia](https://en.wikipedia.org/wiki/Jakarta_Servlet).

## Conclusion

In this article, we discuss how to implement audit logs in Java based on
Java JAX-RS. We discussed some technical and business requirements for the
solution. Some principles for the implementation. And finally, three Java
solutions based on Java Servlet, Jetty, and JAX-RS.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- ["LDAP Data Interchange Format (LDIF)"](https://en.wikipedia.org/wiki/LDAP_Data_Interchange_Format), _Wikipedia_, 2021.
- ["Representational state
  transfer"](https://en.wikipedia.org/wiki/Representational_state_transfer),
  _Wikipedia_, 2021.
- ["Auditing with JPA, Hibernate and Spring Data
  JPA"](https://www.baeldung.com/database-auditing-jpa), _Baeldung_, 2020.
- ["Chapter 10. Filters and
  Interceptors - Jersey"](https://eclipse-ee4j.github.io/jersey.github.io/documentation/latest/filters-and-interceptors.html),
  _Eclipse EE4J_, 2021.
- ["Filter (Java(TM) EE 7 Specification
  APIs)"](https://docs.oracle.com/javaee/7/api/javax/servlet/Filter.html),
  _Oracle_, 2015.
- Jakob Jenkov, ["Servlet
  Filters"](http://tutorials.jenkov.com/java-servlets/servlet-filters.html),
  _jenkov.com_, 2014.
- ["Access, Error, and Audit
  Logs | Sun Java System Directory Server Enterprise Edition 6.0
  Reference"](https://docs.oracle.com/cd/E19693-01/819-0997/6n3cs0bsg/index.html#gbwud),
  _Oracle_, 2010.
