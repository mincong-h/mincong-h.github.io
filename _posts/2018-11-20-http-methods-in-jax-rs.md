---
layout:            post
title:             HTTP Methods in JAX-RS
date:              2018-11-20 21:04:14 +0100
categories:        [java-rest]
tags:              [http, java, jax-rs, rest]
comments:          true
excerpt:           >
    This article explains the common HTTP methods in JAX-RS: annotation @GET,
    @POST, @PUT, and @DELETE.
cover:             /assets/bg-coffee-1030971_1280.jpg
series:            JAX-RS Basics
---

## Overview

HTTP defines a set of request methods to indicate the desired action to be
performed for a given resource. Today, we are going to learn 4 of them in
JAX-RS: `GET`, `POST`, `PUT`, `DELETE`. After reading this article, you
will understand:

- What are these methods
- How to use them in JAX-RS

In the following paragraphs, we will build a Book API, allowing people to
create / read / update / delete books (CRUD). We're going to implement them as
the following syntax:

```
GET     /books/{id}
POST    /books
PUT     /books/{id}
DELETE  /books/{id}
```

As usual, the source code is available for free on GitHub as
[mincong-h/jaxrs-2.x-demo][github]. You can install and run the demo as
following:

```
~ $ git clone https://github.com/mincong-h/jaxrs-2.x-demo.git
~ $ cd jaxrs-2.x-demo/http-methods
http-methods $ mvn clean install
http-methods $ java -jar target/jaxrs-http-methods-1.0-SNAPSHOT-jar-with-dependencies.jar
```

## Resource Methods

Resource methods are methods of a resource class annotated with a request method
designator. They are used to handle requests and MUST conform to certain
restrictions described below. A request method designator is a runtime
annotation that is annotated with the `@HttpMethod` annotation. For common
use-cases, there're `@GET`, `@POST`, `@PUT`, `@DELETE`, and more.

Note that only `public` methods are considered as resource methods.

## GET

The GET method requests a representation of the specified resource. Requests
using GET should only retrieve data. In our example, we use GET method to
retrieve a book. However, other operations such as creating or deleting a book
should not be done using GET. So getting a book by id can be done as:

    GET  /books/{id}

In Java, the resource method can be written as:

{% highlight java %}
@GET
@Path("{id}")
public Response getBook(@PathParam("id") int id) {
  if (books.containsKey(id)) {
    return Response.ok(books.get(id).toJson()).build();
  } else {
    return Response.status(Status.NOT_FOUND).build();
  }
}
{% endhighlight %}

On client side, send a request using cUrl command in your terminal in verbose
mode (`-v`):

    $ curl -v http://localhost:8080/books/1

The pretty-formatted result looks like:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 25
```

{% highlight json %}
{
  "id": 1,
  "name": "Awesome"
}
{% endhighlight %}

## POST

The POST method is used to submit an entity to the specified resource, often
causing a change in state or side effects on the server. In our example, we use
POST method to create a new book. I assume that we don't know the book ID, and
it's up to the backend to decide which id will be assigned to this book. So
creating a new book can be done as following, where a URL encoded form should
be submitted with the POST request using MIME type
_"application/x-www-form-urlencoded"_:

    POST  /books

In Java, the resource method can be written as:

{% highlight java %}
@POST
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response createBook(@FormParam("name") String name) {
  Book book = new Book(id.incrementAndGet(), name);
  books.put(book.id, book);
  return Response.created(Main.BASE_URI.resolve("books").resolve("" + book.id)).build();
}
{% endhighlight %}

On client side, send a request using cUrl command in your terminal in verbose
mode (`-v`) with form parameter `name=JAX-RS` to create a new book called
_"JAX-RS"_:

    $ curl -v -d "name=JAX-RS" http://localhost:8080/books

The pretty-formatted result looks like:

```
HTTP/1.1 201 Created
Location: http://localhost:8080/books/2
Content-Length: 0
```

{% highlight javascript %}
// No Content
{% endhighlight %}

The new book is created but no content is returned in the response. However,
HTTP response header "Location" indicates the new book is available at
<http://localhost:8080/books/2>. You can find it using another GET request `curl
http://localhost:8080/books/2`:

{% highlight json %}
{
  "id": 2,
  "name": "JAX-RS"
}
{% endhighlight %}

## PUT

The PUT method replaces all current representations of the target resource with
the request payload. In our case, we can rename a book using this mechanism.
We need to provide both the book ID and the book name in order to achieve this
goal. If the target book does not exist, it will be created.

    PUT  /books/{id}

In Java, the resource method can be written as:

{% highlight java %}
@PUT
@Path("{id}")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
@Produces(MediaType.APPLICATION_JSON)
public Response updateOrCreateBook(@PathParam("id") int id, @FormParam("name") String name) {
  Book book = new Book(id, name);
  books.put(book.id, book);
  return Response.ok().entity(book.toJson()).build();
}
{% endhighlight %}

On client side, send a request using cUrl command in your terminal in verbose
mode (`-v`) with for parameter `name=AwesomeBook` to update the book 1:

    $ curl -v -X PUT -d "name=AwesomeBook" http://localhost:8080/books/1

The pretty-formatted result looks like:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 29
```

{% highlight json %}
{
  "id":1,
  "name":"AwesomeBook"
}
{% endhighlight %}

So book 1 is now renamed from "Awesome" to "AwesomeBook".

## Difference Between POST and PUT

You might ask: what is the difference between POST and PUT? They look very
similar. The documentation is also confusing. There is a great post in Stack
Overflow talking [PUT vs POST in REST][1]. From what I understand, both methods
can be used for creating resources. However, **PUT is idempotent.** Regardless
how many times an action is repeated, the result remains the same. On the other
side, POST can have side-effects and is not idempotent.

Therefore, PUT is used when the URL belongs only to the target resource. On the
other hand, POST is used when the URL refers to a factory of resources. So

```
POST  /books
PUT   /books/{id}
```

I don't want to go too far in this topic. But if you're interested about this
topic, don't hesitate to leave a comment.

## DELETE

The DELETE method deletes the specified resource. In our case, we use DELETE
method to delete an existing book by book ID. If the book exists, the deletion
will succeed, and the deleted book is returned as an entity in HTTP
response. If the book does not exist, the deletion will fail, and a HTTP error
404 - not found will be returned.

In Java, the resource method can be written as:

{% highlight java %}
@DELETE
@Path("{id}")
@Produces(MediaType.APPLICATION_JSON)
public Response deleteBook(@PathParam("id") int id) {
  if (books.containsKey(id)) {
    Book book = books.remove(id);
    return Response.ok().entity(book.toJson()).build();
  } else {
    return Response.status(Status.NOT_FOUND).build();
  }
}
{% endhighlight %}

On the client side, send a request using cUrl command in your terminal in
verbose mode (`-v`) to delete the book 1:

    $ curl -v -X DELETE http://localhost:8080/books/1

The pretty-formatted result looks like:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 25
```

{% highlight json %}
{
  "id": 1,
  "name": "Awesome"
}
{% endhighlight %}

As you can see, the deletion is successful. Book 1 "Awesome" is gone.

Now, try to delete the same content again using the same command:

    $ curl -v -X DELETE http://localhost:8080/books/1

The pretty-formatted result looks like:

```
HTTP/1.1 404 Not Found
Content-Length: 0
```

{% highlight javascript %}
// No Content
{% endhighlight %}

The target resource is not found (404), book 1 has already been deleted.

## Conclusion

In this article, we talked about 4 basic HTTP methods in JAX-RS: `@GET`, `@PUT`,
`@POST`, and `@DELETE` via 4 concrete implementations. We also learn how to use
command line tool cUrl to verify the result, by checking both the HTTP status
code and the HTTP response body. The source code is available for free on
GitHub: <https://github.com/mincong-h/jaxrs-2.x-demo>. Hope you enjoy this
article, see you the next time!

## References

- [MDN: HTTP request methods][2]
- [Stack Overflow: PUT vs POST in REST][1]
- [JSR-370: Java™ API for RESTful Web Services (JAX-RS 2.1) Specification][3]

[2]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
[github]: https://github.com/mincong-h/jaxrs-2.x-demo
[1]: https://stackoverflow.com/questions/630453/put-vs-post-in-rest
[3]: https://jcp.org/en/jsr/detail?id=370
