---
layout:      post
title:       "HTTP: The Web's Foundation"
date:        "2017-06-05 09:09:01 +0200"
categories:  [weekly, http, web]
tags:        [weekly, http, web]
comments:    true
---

It's been some days that I read the book [HTTP - The Definite Guide][book].
Today, I want to share with you what I've learn from **Part I. The Web's
Foundation**. After reading this blog, you'll understand:

- The Definition of HTTP
- URL and Resources
- The Flow of Messages
- Different Status Codes HTTP

<!--more-->

## Definition of HTTP

HTTP, the Hypertext Transfer Protocol, is the common language of the modern
global internet. It transports the Web's traffic between server and clients.
When using HTTP, you don't have to worry about the destroyed, duplicated,
distorted in transit. A common client of HTTP is browser. When browsing a web
page, the browser sends a HTTP request to the server, and server gives a HTTP
response, along with the type of the object (MIME type<sup>[1]</sup>), the
length of the object, and other information.

## URL and Resources

URL, the uniform resource locator, provides a means of locating any resource on
the Internet, but these resources can be accessed by different schemes (e.g.,
HTTP, FTP, SMTP), and URL syntax varies from scheme to scheme. Here's an
example:

    https://www.google.com/maps

1. The 1st part of the URL is **scheme**, which describes the protocol to use to
   access the resource. This is usually `http` or `https`.
2. The 2nd part is the server address, which can be a host name or an IP
   address. If the port number is not defined, the default port is 80.
3. The 3rd part is the resource of the web server.

Schemes describe what protocol to use. The scheme `http` and `https` are twins:
the only difference is that the `https` scheme uses Netscape's Secure Sockets
Layer (SSL), which provides end-to-end encryption of HTTP connections. Its
syntax is identical to that of HTTP.

## The Flow of Messages

HTTP messages are the blocks of data sent between HTTP applications. These
blocks of data begin with some text _meta-information_ describing the message
contents and meaning, followed by optional data. These messages flow between
clients, servers, and proxies. The terms "inbound", "outbound", "upstream", and
"downstream" describe message direction.

HTTP uses the terms _inbound_ and _outbound_ to describe _transactional_
direction. Messages travel inbound to the origin server, and when their work is
done, they travel outbound back to the user agent (see the figure below).

<p align="center">
  <img
    src="{{ site.url }}/assets/20170605-http-figure-3.1.gif"
    alt="Figure 3-1. Messages travel inbound to the orgin server and outbound back to the client"
    width="300" />
</p>

All HTTP messages fall into two types: _request messages_ and _response
messages_. Request messages request an action from a web server. Response
messages carry results of a request back to a client. Both request and response
messages have the same basic structure.

Here's the format for a request message:

    <method> <request-URL> <version>
    <headers>

    <entity-body>

Here's the format fot a response message:

    <version> <status> <reason-phrase>
    <headers>

    <entity-body>

Note that the only difference is in the start line.

## Status Codes

HTTP status codes are classified into five broad categories.

- **1xx Informational responses** An informational response indicates that the
  request was received and understood.
- **2xx Success** This class of status codes indicates the action requested by
  the client was received, understood, accepted, and processed successfully.
- **3xx Redirection** This class of status code indicates the client must take
  additional action to complete the request. Many of these status codes are used
  in URL redirection.
- **4xx Client errors** The 4xx class of status codes is intended for situations
  in which the client seems to have erred.
- **5xx Server error** The server failed to fulfil an apparently valid request.
  It indicate cases in which the server is aware that it has encountered an
  error or is otherwise incapable of performing the request.

If you think they're too complex, then please see this excellent Tweet:

<blockquote class="twitter-tweet" data-lang="en">
  <p lang="en" dir="ltr">HTTP status ranges in a nutshell:<br><br>1xx: hold on<br>2xx: here you go<br>3xx: go away<br>4xx: you fucked up<br>5xx: I fucked up</p>&mdash; Steve Losh (@stevelosh) <a href="https://twitter.com/stevelosh/status/372740571749572610">August 28, 2013</a>
</blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## References

- [HTTP - The Definite Guide][book]
- [List of HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)

<hr>

<sup>[1]</sup> **MIME type**: type of Multipurpose Internet Mail Extensions.
Media types were originally defined in Request in November 1996 as a part of
MIME specification, for denoting type of email message content and attachments.

[book]: https://www.amazon.com/HTTP-Definitive-Guide-Guides/dp/1565925092
