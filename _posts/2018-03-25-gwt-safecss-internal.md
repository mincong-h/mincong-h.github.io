---
layout:      post
title:       "GWT SafeCSS Internal"
date:        "2018-03-25 09:13:01 +0200"
categories:  [tech]
tags:        [java, gwt, study-note]
excerpt:     >
  Recently, I helped the GWT community for porting module gwt-safecss to
  GitHub. I think it’s also a good opportunity to learn more about GWT SafeCss.
  That’s why I’m writing this study note.
comments:    true
---

Recently, I helped the GWT community for porting module [`gwt-safecss`][1] to
GitHub. I think it's also a good opportunity to learn more about GWT SafeCss.
That's why I'm writing this study note.

## Overview

Module `gwt-safecss` contains shared classes for creating safe CSS style
content. In other words, it contains facilities for avoiding XSS attacks. Using
safe CSS is very simple, it can be created from a trusted string:

{% highlight java %}
SafeStylesUtils.fromTrustedString("foo:bar;");
{% endhighlight %}

It can also be created via builder:

{% highlight java %}
SafeStylesBuilder sb = new SafeStylesBuilder();
sb.appendTrustedString("foo:bar;");
sb.append(mySafeStyles);
SafeStyles result = sb.toSafeStyles();
{% endhighlight %}

## Module Architecture

The architecture of this module is very simple. It contains one package, in
which there're 5 classes:

Class | Description
:--- | :---
`SafeStyles` | An interface that encapsulates zero or more CSS properties that are guaranteed to be safe to use in a CSS attribute context.
`SafeStylesBuilder` | A builder that facilitates the building up of XSS-safe CSS attribute strings from `SafeStyles`
`SafeStylesHostedModeUtils` | An internal utility class.
`SafeStylesString` | A string wrapped as an object of type `SafeStyles`.
`SafeStylesUtils` | A utility class for `SafeStyles` creation.

Now, I'm going dig into the implementation detail, to study how GWT do for safe
styles building in different situations.

## Browser Compatibility

In this section, I want to describe how GWT handle the browser compatibility.
Let's take opacity as an example. The `opacity` CSS property specifies the level
of transparency of an element, that is, the degree to which the content behind
the element is visible. This property is fully supported by most of the
browsers. However, for Internet Explorer, it's only supported for IE 9+. So how
does GWT support opacity for IE 8 in `SafeStylesUtils`? Let's take a look on 3
classes:

- `SafeStylesUtils.Impl`
- `SafeStylesUtils.ImplIE8`
- `SafeStylesUtils.ImplServer`

GWT use an inner class `SafeStylesUtils.Impl` to contain the standard
implementation of this class, using property `opacity`.

{% highlight java %}
static class Impl {
  public SafeStyles forOpacity(double value) {
    return new SafeStylesString("opacity: " + value + ";");
  }
}
{% endhighlight %}

For IE 8, there's another implementation `ImplIE8`, which extends the
standard implementation `Impl`.

{% highlight java %}
static class ImplIE8 extends Impl {
  @Override
  public SafeStyles forOpacity(double value) {
    // IE8 uses an alpha filter instead of opacity.
    return new SafeStylesString("filter: alpha(opacity=" + (value * 100) + ");");
  }
}
{% endhighlight %}

For server side, it doesn't necessarily know the user agent of the client, so we
combine the results of all other implementations:

{% highlight java %}
static class ImplServer extends Impl {

  private ImplIE8 implIE = new ImplIE8();

  @Override
  public SafeStyles forOpacity(double value) {
    SafeStylesBuilder sb = new SafeStylesBuilder();
    sb.append(super.forOpacity(value));
    sb.append(implIE.forOpacity(value));
    return sb.toSafeStyles();
  }
}
{% endhighlight %} 

Once the implementations are defined, GWT has all the necessary information to
provide a correct solution. When building safe styles for opacity via method
`forOpacity(double)`, GWT retrieves its implementation via method `impl()`.
Depending on context, the default logic, the overridden logic (IE8), or both will be used.
Method `impl()` use lazy-loading design pattern, so instance `impl` will only be
initialized during the first call. If GWT is on the client side, then GWT
creates an instance in either standard or IE implementation; if GWT is on the
server side, then GWT creates a server implementation mixing both:

{% highlight java %}
private static Impl impl;

/**
 * Set the opacity css property.
 */
public static SafeStyles forOpacity(double value) {
  return impl().forOpacity(value);
}

private static Impl impl() {
  if (impl == null) {
    if (GWT.isClient()) {
      impl = GWT.create(Impl.class);
    } else {
      impl = new ImplServer();
    }
  }
  return impl;
}
{% endhighlight %}

## Utility for CSS property

`SafeStylesUtils` is a Java class for creating `SafeStyles` easily. It is served
as an utility class, by providing method for different property. The pattern is
as follows:

    forXxx

where `Xxx` is the name of the property in camel-case. For example:

- `forBackgroundImage(SafeUri)`
- `forBorderStyle(BorderStyle)`
- `forBorderWidth(double, Unit)`

## Wrapper SafeStylesString

`SafeStylesString` is a wrapper class containing a string value for CSS. It
implements the `SafeStyles` interface:

- It has only one attribute, the string value `css`.
- It contains a _private_ no-arg constructor for compatibility with GWT
  serialization.
- A constructor for wrapping a _non-null_ CSS value into `SafeStylesString`
  object.
- Implementation of `hashCode()` and `equals()` relies on the non-null string
  value.

The safe-check is done during the construction of the safe-styles-string.
Utility method `SafeStylesUtils#verifySafeStylesConstraints(String)` checks 3
cases: 1. the input string is not null; 2. the trimmed string is not empty
and is finished by semi-colon ';', thus a valid CSS property; 3. the style does
not contains brackets '<' or '>'.

[1]: https://github.com/mincong-h/gwt-safecss
