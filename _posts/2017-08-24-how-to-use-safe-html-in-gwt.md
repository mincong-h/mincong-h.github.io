---
layout:      post
title:       "How to Use Safe HTML in GWT"
lang:                en
date:        "2017-08-24 15:34:05 +0200"
categories:  [tech]
tags:        [security, gwt, web, java]
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, I would like to share with you about how to secure your GWT application
by using package `com.google.gwt.safehtml`. After reading this post, you'll
understand how to:

- Secure HTML using `SafeHtml`
- Secure URI using `SafeUri`
- Secure CSS using `SafeStyles`

<!--more-->

## Why SafeHtml in GWT?

Considering your existing application has methods of the following style:

{% highlight java %}
String text = "Hello world!";
HTML widget = new HTML(text);
{% endhighlight %}

It might result to XSS attacks if your text comes from a untrusted-source. You
might say that this variable is a trusted plain-text string, but it's not always
true. When a variable comes from the method arguments, you have no guarantee
about the safety of the input value. Here's an example:

{% highlight java %}
public void caller() {
  setWidgetHtml("!@#$%^&");
}

public void setWidgetHtml(String html) {
  this.widget.setHtml(html);
}
{% endhighlight %}

So, a better idea is to replace `String` by `SafeHtml`. It ensures that the
input values are always XSS-safe.

## Secure HTML Using SafeHtml

### Build SafeHtml Using SafeHtmlUtils

{% highlight java %}
SafeHtml s = SafeHtmlUtils.fromString("<svg onload=alert(1)>");
SafeHtml t = SafeHtmlUtils.fromTrustedString("Hello world!");
SafeHtml c = SafeHtmlUtils.fromSafeConstant("<br>");
{% endhighlight %}

**Use `SafeHtmlUtils#fromString(String)` if your input value is untrusted.** You
should escape it using this method so that it will be safe to be injected into
any HTML template. For example, after the escaping, the JavaScript code
`<svg onload=alert(1)>` will not be a popup anymore. Instead, it will be escaped
and become a safe value `&lt;svg onload=alert(1)&gt;`. Any value coming from
users, or coming from HTTP responses should be escaped.

**Use `SafeHtmlUtils#fromTrustedString(String)` if your input can be trusted**.
Sometimes, it's practical to trust some values, and do not escape against them.
Trusted values are those which are litteral string created in your GWT code, in
other words, constant values created by ourselves.

**Use `SafeHtmlUtils#fromSafeConstant(String)` if your input should be safe and
it's a HTML constant.** This method looks very similar to the previous one, but
they're not the same. From the [Javadoc][fromSafeConstant], we can see that all
uses of this method must satisfy the following constrants:

1. The argument expression must be fully determined at compile time.
2. The value of the argument must end in "inner HTML" context and **not contain
incomplete HTML tags.** I.e. the following is not a correct use of this method,
because the `<a>` tag is incomplete:

       shb.appendHtmlConstant("<a href='").append(url);

The first constraint provides a sufficient condition that the arugment (and any
HTML markup contained in it) orginates form a trusted source. The second
constraint ensures the composability of SafeHtml values.

### Build SafeHtml Using SafeHtmlBuilder

Building a SafeHtml using a builder is a good idea too. You can use it to append
different values into your target SafeHtml, for example, a HTML constant,
another inner-HTML, a character or any primitive types, string value(s) to
escape etc.

{% highlight java %}
SafeHtmlBuilder b = new SafeHtmlBuilder();
b.appendHtmlConstant("<br>");   // Must be a complet HTML tag
b.append(mySafeHtml);           // You Safe HTML
b.append(' ');                  // Primitives are XSS-safe
b.appendEscaped(oneLine);       // Single line escaping
b.appendEscapedLines(multiple); // Multiple lines escaping

SafeHtml result = b.toSafeHtml();
{% endhighlight %}

### Build SafeHtml Using SafeHtmlTemplates

You can use the templating system to build a `SafeHtml` instance:

{% highlight java %}
import com.google.gwt.core.client.GWT;
import com.google.gwt.safehtml.shared.*;

public class UsingTemplates {

  private static final MyTemplates templates
      = GWT.create(MyTemplates.class);

  public interface MyTemplates extends SafeHtmlTemplates {
    @Template("<p>{0}</p>"}
    SafeHtml buildP(String text);

    @Template("<div>{0}</div>")
    SafeHtml buildDiv(SafeHtml html);
  }

  public void injectString(String text) {
    SafeHtml p = templates.buildP(text);
    // ...
  }

  public void injectSafeHtml(SafeHtml html) {
    SafeHtml div = templates.buildDiv(html);
    // ...
  }
}
{% endhighlight %}

## Secure URI Using SafeUri

`SafeUri` is an interface which encapsulates a URI that is guaranteed to be safe
to use in a URL context, for example in a URL-typed attribute in an HTML
document.

{% highlight java %}
SafeUri uri = UriUtils.fromString("https://example.com");
{% endhighlight %}

It's also a good practice to use `SafeUri` to inject uri into a HTML template.

{% highlight java %}
@Template("<img src=\"{0}\" alt=\"{1}\">");
SafeHtml img(SafeUri src, SafeHtml alt);
{% endhighlight %}

Append more values into an existing URL is considered as unsafe, so there's no
builder class as in HTML and CSS.

## Secure CSS Using SafeStyles

### Build SafeStyles Using SafeStyleBuilder

{% highlight java %}
SafeStylesBuilder b = new SafeStylesBuilder();
b.trustedBackgroundColor("#727d88");
b.appendTrustedString("filter: alpha(opacity=20);");
b.opacity(0.2);
b.height(20, Style.Unit.PX);
b.width(20, Style.Unit.PX);
b.position(Style.Position.ABSOLUTE);
b.top(0, Style.Unit.PX);
b.left(0, Style.Unit.PX);

SafeStyles css = b.toSafeStyles();
{% endhighlight %}

Now, you can use such styles in a HTML template:

{% highlight java %}
@Template("<div style=\"{0}\">...</div>")
SafeHtml div(SafeStyles s);
{% endhighlight %}

## Conclusion

From this post, you've seen how to use the GWT prockage
`com.google.gwt.safehtml.shared` to secure your GWT application, so that it is
XSS-safe. Please note that although the escaping prevents XSS in client's
browser, it should NOT be considered as a security measure for the server side:
you still need to enforce the input validation on the server-side to prevent
malicious input values. I hope you enjoy this post, see you next time!

## Reference

- [GWT Documentation - Security Safe HTML](http://www.gwtproject.org/doc/latest/DevGuideSecuritySafeHtml.html)
- [Javadoc - com.google.gwt.safehtml.shared.SafeHtml](http://www.gwtproject.org/javadoc/latest/com/google/gwt/safehtml/shared/SafeHtml.html)
- [Javadoc - com.google.gwt.safehtml.shared.SafeUri](http://www.gwtproject.org/javadoc/latest/com/google/gwt/safehtml/shared/SafeUri.html)
- [Javadoc - com.google.gwt.safehtml.shared.SafeStyles](http://www.gwtproject.org/javadoc/latest/com/google/gwt/safecss/shared/SafeStyles.html)

[fromSafeConstant]: http://www.gwtproject.org/javadoc/latest/com/google/gwt/safehtml/shared/SafeHtmlUtils.html#fromSafeConstant-java.lang.String-
