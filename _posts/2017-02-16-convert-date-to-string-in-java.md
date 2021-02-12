---
layout:            post
title:             Convert Date to ISO 8601 String in Java
date:              2017-02-16 20:00:00 +0100
last_modified_at:  2018-07-22 13:45:28 +0200
categories:        [java-core]
tags:              [java, date, iso-8601]
comments:          true
excerpt:           >
    Convert Java dates to ISO-8601 string: this post explains how to convert
    java.util.Date, java.util.Calendar, java.time.ZonedDateTime to string.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

In Java, converting date objects to string is difficult, because the built-in
APIs are similar and confusing. However, as a developer, we cannot avoid
this topic — manipulating date objects is essential in our daily mission.
Let's see how to convert different dates to string correctly.

<!--more-->

In the following paragraphs, I'll use [ISO 8601][8601], an international
standard covering the exchange of date and time-related data, as the string
format. Date and time expressed according to ISO 8601 is:

    2017-02-16T20:22:28+00:00
    2017-02-16T20:22:28.000+00:00

## java.util.Date

Here's an example to demonstrate how to convert a `java.util.Date` to ISO 8601
date string. This is a little bit tricky because we're using the current time,
which is the easiest use-case. For other cases, I believe using
`java.util.Calendar`, `java.util.GregorianCalendar` would be a better solution.
You can see the difference in the following paragraphs.

{% highlight java %}
// Input
Date date = new Date(System.currentTimeMillis());

// Conversion
SimpleDateFormat sdf;
sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
sdf.setTimeZone(TimeZone.getTimeZone("CET"));
String text = sdf.format(date);

// Output
// "2017-02-16T21:00:00.000+01:00"
{% endhighlight %}

## java.util.Calendar

When using `Calendar`, we need to get an instance, then build a date object with
it. Please be aware that setting the field of millisecond is necessary: lack of
such line will lead to an erroneous value for millisecond. A non-zero value will
be filled.

{% highlight java %}
// Input
Calendar calendar = Calendar.getInstance();
calendar.set(2017, Calendar.FEBRUARY, 16, 20, 22, 28);
calendar.set(Calendar.MILLISECOND, 0);
Date date = calendar.getTime();

// Conversion
SimpleDateFormat sdf;
sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
sdf.setTimeZone(TimeZone.getTimeZone("CET"));
String text = sdf.format(date);

// Output
// "2017-02-16T20:22:28.000+01:00"
{% endhighlight %}

## java.util.GregorianCalendar

For gregorian calendar, we don't need to set explicitly the millisecond datepart
to 0, which is better than calendar. However, we still need to use
`java.util.Date` as an intermediate to format the date.

{% highlight java %}
// Input
GregorianCalendar calendar;
calendar = new GregorianCalendar(2017, Calendar.FEBRUARY, 16, 20, 22, 28);
Date date = calendar.getTime();

// Conversion
SimpleDateFormat sdf;
sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
sdf.setTimeZone(TimeZone.getTimeZone("CET"));
String text = sdf.format(date);

// Output
// "2017-02-16T20:22:28.000+01:00"
{% endhighlight %}

## java.time.ZonedDateTime

The package `java.time`, formerly [Joda-Time][joda], provides the most elegant
solution among all the possibiliites here. It uses a builder to construct the
date time with time zone step-by-step. Then this object accepts a formatter to
format the date representation in string. Its month is a base-1 number, which
means that _January_ is equal to 1 instead of 0, so you can use the digit
instead of the static Java field. Let's see the code:

{% highlight java %}
// Input
ZonedDateTime d = LocalDate
    .of(2017, 2, 16)
    .atTime(20, 22, 28)
    .atZone(ZoneId.of("CET"));

// Conversion
String text = DateTimeFormatter.ISO_DATE_TIME.format(d);

// Output
// "2017-02-16T20:22:28+01:00[CET]"
{% endhighlight %}

Use customized date-time pattern:

{% highlight java %}
// Conversion
DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(d);

// Output
// "2017-02-16T20:22:28.000+01:00"
{% endhighlight %}

Patterns for formatting and parsing are available in the Javadoc of
[DateTimeFormatter (Java 8)][1].

## Conclusion

In this blog, we have seen different methods to create a date object and the
associated way to cast that object into an ISO 8601 date representation. I
demonstrated that common date object types can be used to convert into string,
but most of them are hard to understand, and time-zone is not well supported.
However, thanks to the implementation of JSR 310, [Joda-Time][joda] is now
migrated into Java SE 8 as package `java.time`.

By the way, if you need to use any of the code shown in this blog, feel free to
use them and adapt into your own code. Happy coding and have a nive weekend!

[8601]: https://en.wikipedia.org/wiki/ISO_8601
[joda]: http://www.joda.org/joda-time/
[1]: https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html#patterns
