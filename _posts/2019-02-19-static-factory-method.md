---
layout:            post
title:             "Design Pattern: Static Factory Method"
date:              2019-02-19 20:25:15 +0100
categories:        [java-core]
tags:              [java, design-pattern, selenium, json, jackson, xml, testing]
comments:          true
excerpt:           >
    Understand static factory method pattern in Java with concrete examples
    from Selenium WebDriver, Jackson JSON object mapper, and SAX reader for XML.
cover:             /assets/bg-coffee-2306471_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In Java, a class can provide a public static factory method, which is simply a
static method that returns an instance of a class. In this article, I want to
share my own experience about this pattern: what it is, how it work, why using
it through examples in Selenium WebDriver, Jackson JSON object mapper
and SAX Reader for XML.

```java
public static T newObjectT() {
  ...
}
```

Note that the pattern discussed here is different from [Factory
Method](https://en.wikipedia.org/wiki/Factory_method_pattern) pattern of Gang
of Four. It is also different from "Factory Static Method" defined in "Effective
Java - Item 1: Consider static factory methods instead of constructors". You will
understand better when reading the code :)

## Selenium WebDriver

[Selenium WebDriver](https://www.seleniumhq.org/projects/webdriver/) is one of
the most powerful tool for functional testing on browsers. Using creational
pattern - static factory method to create a `WebDriver` can be done as follows:

```java
public class WebDriverFactory {

  public static WebDriver newFirefoxDriver() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("p1", 2);
    profile.setPreference("p2", 2);
    profile.setPreference("p3", true);
    ...
    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);
    return new FirefoxDriver(options);
  }
}
```

In this case, the factory method use `FirefoxDriver` as the implementation of
web driver and encapsulate the configuration logic inside the factory method.
The main benefits are:

- Encapsulate the configuration
- Single truth (\*)
- Easy for maintenance
- Simple for testing

(\*) It is still possible to change the web driver out side of the method, since
web driver is mutable. However, using this design pattern avoids having multiple
locations of truth, where each place instantiates its own driver and add
similar configurations. It avoids duplicates and make the code less error prone.

## Jackson JSON Object Mapper

[Jackson](https://github.com/FasterXML/jackson) is one of the best JSON parsers
for Java. If you have pre-defined configuration for all the object mappers used
in Jackson, you can use the static method factory pattern:

```java
public class ObjectMapperFactory {

  public static ObjectMapper newObjectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new Jdk8Module());
    mapper.registerModule(new ParameterNamesModule());
    mapper.registerModule(new JavaTimeModule());

    // ISO-8601 datetime
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    mapper.setDateFormat(new StdDateFormat());
    ...
    return mapper;
  }
}
```

Same as Selenium WebDriver, here the benefits are similar:

- Encapsulate the configuration
- Single truth
- Easy for maintenance
- Simple for testing

In my personal experience, it is very helpful for keeping the object mapper
consistent everywhere. I always need to ensure the date format is ISO-8601.
Putting the configuration inside the method ensures that by default, all mappers
created is configured correctly. The unit test is also easy to write in this
case. We can test:

- The support of `Optional<T>` in Java 8
- The serialization of `ZonedDateTime`
- ...

However, sometimes I still need to adjust the object mapper for different cases.
For example, if the JSON is produced for HTTP response, the JSON content does
not need to be pretty-formatted. If the JSON is produced for humans, it's
better to pretty-format it.

## SAX Reader for XML

Dom4J is an XML parser in Java. Configuring the `org.dom4j.io.SAXReader` as
follows can avoid XML External Entity Processing (XXE) vulnerability,
recommended by OWASP.

```java
public class SAXReaderFactory {

  public static SAXReader newSAXReader() {
    SAXReader reader = new SAXReader();
    try {
      reader.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
      reader.setFeature("http://xml.org/sax/features/external-general-entities", false);
      reader.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
      return reader;
    } catch (SAXException e) {
       // This should never happen
       throw new IllegalStateException("Cannot set feature to SAX reader", e);
    }
  }
}
```

Using this factory method ensures the SAX reader is configured at the very
beginning. It can be tested very easily by providing XML with vulnerable system
entity, which raises an exception because DOCTYPE is disallowed.

## Conclusion

In this article, we discussed the creational pattern "static factory method".
And we saw the concrete examples in Selenium WebDriver, Jackson JSON mapper, and
Dom4J. Hope you enjoy this article, see you the next time!

## References

- Joshua Bloch, _Effective Java_,  2008.
- Wikipedia, "Factory method pattern", _en.wikipedia.org_, 2019. [Online].
  Available: <https://en.wikipedia.org/wiki/Factory_method_pattern>
- OWASP, "XML External Entity Prevention Cheat Sheet", _github.com_, 2019.
  [Online]. Available: <https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.md> 

