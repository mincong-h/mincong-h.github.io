---
article_num: 37
layout:      post
title:       "Cookie Understanding"
lang:                en
date:        "2017-10-18 22:04:16 +0200"
categories:  [tech]
tags:        [cookie, http]
excerpt:     >
  The 8 different fields in an HTTP cookie.
permalink:         /2017/10/18/cookie-understanding/
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Fields

Cookie stored in the browser (Chrome) contains 8 fields:

- **Name**: The cookie's name.
- **Value**: The cookie's value.
- **Domain**: The cookie's domain.
- **Path**: The cookie's path.
- **Expires / Maximum Age**: The cookie's expiration time, or maximum age. For
  session cookies, this field is always "Session".
- **Size**: The cookie's size in bytes.
- **HTTP**: If present, indicates that cookies should be used only over HTTP,
  and JavaScript modifications is not allowed.
- **Secure**: If present, indicates that communication for this cookie must be
  over an encrypted transmission.

## Cookie Creation

When reveiving an HTTP request, a server can send a `Set-Cookie` header with the
response. The cookie is usually stored by the browser, and then the cookie is
sent with requests made to the same server inside a `Cookie` HTTP header. An
expiration date or duration can be specified, after which the cookie is no
longer sent. Additionally, restrictions to a specific domain and path can be
set, limiting where the cookie is sent.

The `Set-Cookie` HTTP response header sends cookies from the server to the user
agent. A simple cookie is set like this:

    Set-Cookie: <cookie-name>=<cookie-name>

The header from the server tells the client to store a cookie.

    HTTP/1.0 200 OK
    Content-type: text/html
    Set-Cookie: k1=v1
    Set-Cookie: k2=v2

Now, with every new request to the server, the browser will send back all
previouly stored cookies to the server using `Cookie` header.

    GET /my_page.html HTTP/1.1
    Host: www.example.org
    Cookie: k1=v1; k2=v2

The cookie created above is a session cookie: it didn't specify an `Expires` or
`Max-Age` directive. However, web browsers may use session restoring, which
makes most session cookies permanent, as if the browser was never closed.

Permanent cookies is different from session cookies. They expire at a specific
date `Expires` or after a specific length of time `Max-Age`. Note that when an
expiry date is set, the time and date set is relative to the client where the
cookie is being set on, not the server.

    Set-Cookie: id=123; Expires=Fri, 20 Oct 2017 09:00:00 GMT;

## Domain-Match

According to [IETF RFC 2109][rfc2109],
Hosts names can be specified either as an IP address or a FQHN
string.  Sometimes we compare one host name with another.  Host A's
name domain-matches host B's if

* both host names are IP addresses and their host name strings match
  exactly; or
* both host names are FQDN strings and their host name strings match
  exactly; or
* A is a FQDN string and has the form NB, where N is a non-empty name
  string, B has the form .B', and B' is a FQDN string.  (So, `x.y.com`
  domain-matches `.y.com` but not `y.com`.)

Note that domain-match is not a commutative operation: `a.b.c.com`
domain-matches `.c.com`, but not the reverse.

## Secure

A secure cookie is only sent to the server with a encrypted request over the
HTTPs protocol. Even with `Secure`, sensitive information should never be stored
in cookies, as they are inherently insecure and this flag cannot offer real
protection.

## HttpOnly

To prevent cross-site scripting (XSS) attacks, `HttpOnly` cookies are
inaccessible to JavaScript's `Document.cookie` API; they are only sent to the
server. For example, cookies that persist server-side sessions don't need to be
available to JavaScript, and the `HttpOnly` flag should be set.

    Set-Cookie: id=123; Expires=Fri, 20 Oct 2017 09:00:00 GMT; Secure; HttpOnly

## Print Cookies from JS

Open the console of Chrome, then past the following command:

{% highlight JavaScript %}
document.cookie
{% endhighlight %}

Or pretty print using

{% highlight JavaScript %}
var cookies = document.cookie.split(';');
cookies.forEach(function(c) {
    console.log(c.trim());
});
{% endhighlight %}

Note that `HttpOnly` cookies are not available from JavaScript.

## Set-Cookie

After reading a lot of stuff from the internet, now let's create a cookie
ourselves. Here, I'm using 3 software:

- Server: Jekyll, a static blog generator running on `localhost:4000`
- Proxy: ZAP proxy listening and intercepting the traffic on `localhost:18080`
- Client: Firefox, in non-private mode, receiving traffic from `:18080`

I set a breakpoint to the proxy, so that I can add a `Set-Cookie` header to the
HTTP response:

    HTTP/1.1 200 OK
    Content-Type: text/html; charset=utf-8
    Set-Cookie: proxy=ZAP; Expires=Fri, 20 Oct 2017 09:00:00 GMT; HttpOnly

All the information can be seen from the browser cookie inspector:

    proxy: "ZAP"
      CreationTime: "Thu, 19 Oct 2017 20:17:58 GMT"
      Domain: "localhost"
      Expires: "Fri, 20 Oct 2017 09:00:00 GMT"
      HostOnly: true
      HttpOnly: true
      LastAccessed: "Thu, 19 Oct 2017 20:17:58 GMT"
      Path: "/"
      Secure: false

However, it doesn't not shown from the console using `document.cookie` because
of its `HttpOnly` header:

{% highlight JavaScript %}
document.cookie.indexOf('proxy')
-1
{% endhighlight %}

## References

- [HTTP Cookie - MDN][mdn]
- [HTTP Cookie - Wikipedia][wiki]
- [IETF RFC 2019][rfc2019]

[rfc2019]: https://www.ietf.org/rfc/rfc2109.txt
[wiki]: https://en.wikipedia.org/wiki/HTTP_cookie
[mdn]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
