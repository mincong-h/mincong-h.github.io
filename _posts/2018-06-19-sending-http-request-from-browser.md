---
layout:            post
title:             Create a HTTP Request in JS
date:              2018-06-19 15:07:31 +0200
date_modified:     2018-07-22 16:55:24 +0200
categories:        [tech]
tags:              [javascript, http, jquery]
comments:          true
excerpt:           >
    Today, I'll explain how to send HTTP request from your browser. You can
    achieve that by using builtin JavaScript (XML HTTP Request, or "XHR") or
    jQuery (1.4, 1.5+).
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, I want to share how to send HTTP request from browser using builtin
JavaScript and jQuery.

## XML HTTP Request (XHR)

{% highlight javascript %}
var xhr = new XMLHttpRequest();
xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:8080/users/');
xhr.onreadystatechange = function() {
  var users = JSON.parse(xhr.responseText);
  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
    for (var i = 0; i < users.length; ++i) {
      console.table(users[i]);
    }
  } else {
    console.error('There was a problem with the request. ' + users);
  }
}
xhr.send();
{% endhighlight %}

The `XMLHttpRequest.onreadystatechange` property contains the event handler to
be called when the `readystatechange` event is fired, that is every time the
`readyState` property of the `XMLHttpRequest` changes.

{% highlight javascript %}
XMLHttpRequest.onreadystatechange = /* callback */;
{% endhighlight %}

Property `onreadystatechange` is supported in all browsers. Since then, a
number of additional event handlers have been implemented in various browsers
(`onload`, `onerror`, `onprogress`, etc.).

Ready State        | Num   | Description
:----------------- | :---: | :----------
`UNSENT`           | 0     | XHR constructed.
`OPENED`           | 1     | Method `open()` successfully invoked.
`HEADERS_RECEIVED` | 2     | Redirection finished, all headers received.
`LOADING`          | 3     | The response's body is being received.
`DONE`             | 4     | The data transfer has been completed, or error.

## jQuery 1.4

Load data from the server using a HTTP GET request.

{% highlight javascript %}
$.ajax({
  url: url,
  data: data,
  success: success,
  dataType: dataType
});
{% endhighlight %}

with the following type table:

Key | Value
:--- | :---
url | String
data | PlainObject or String
success | Function( PlainObject data, String textStatus, jqXHR jqXHR )
dataType | String

For example:

{% highlight javascript %}
$.ajax({
  url: 'http://localhost:8080/users',
  type: 'GET',
  data: data,
  success: function(users) {
    for (var i = 0; i < users.length; ++i) {
      console.table(users[i]);
    }
  },
  error: function(xhr) {
    var resp = JSON.parse(xhr.responseText);
    console.table(resp);
  }
});
{% endhighlight %}

## jQuery 1.5+

As of jQuery 1.5, all of jQuery's Ajax methods return a superset of the
`XMLHTTPRequest` object. This jQuery XHR object, or "jqXHR", returned by
`$.get()` implements the `Promise` interface, giving it all the properties,
methods, and behavior of a `Promise`.

> MDN:
>
> The `Promise` object represents the eventual completion (or failure) of an
> asynchronous operation, and its resulting value.

{% highlight javascript %}
// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
var jqxhr = $.get( "example.php", function() {
  alert( "success" );
})
  .done(function() {
    alert( "second success" );
  })
  .fail(function() {
    alert( "error" );
  })
  .always(function() {
    alert( "finished" );
  });
 
// Perform other work here ...
 
// Set another completion function for the request above
jqxhr.always(function() {
  alert( "second finished" );
});
{% endhighlight %}

## References

- [MDN - Promise][5]
- [MDN - XMLHttpRequest][1]
- [MDN - XMLHttpRequest.onreadystatechange][2]
- [XMLHttpRequest Standard][3]
- [jQuery - jQuery.get()][4]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
[2]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange
[3]: https://xhr.spec.whatwg.org/
[4]: https://api.jquery.com/jquery.get/
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
