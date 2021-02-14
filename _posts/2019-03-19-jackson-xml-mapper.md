---
layout:            post
title:             Jackson XML Mapper
date:              2019-03-19 20:47:13 +0100
categories:        [java-serialization]
tags:              [java, xml, jackson]
comments:          true
excerpt:           >
    How to do Java / XML mapping using Jackson XML Mapper. This article explains
    the annotations used for root element, property, and collection mapping.
    Also, the basic configuration of Jackson XML Mapper.
image:             /assets/bg-coffee-2242213_1280.jpg
cover:             /assets/bg-coffee-2242213_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Recently, I used Jackson XML Mapper to create a client SDK for a SOAP service
and a mapping for reading Maven test reports (Surefire and Failsafe). I really
like the simplicity of the Jackson XML framework. That's why I would like to
share my experience with you. In this article, I will explain briefly different
annotations and mapping tricks for XML mapper. After reading, you will
understand:

- Different annotations about Jackson XML
- Mapping XML root element
- Mapping XML property (attribute / element)
- Mapping XML collection (with / without wrapping)
- Configuration of XML mapper

Before going further, please ensure you have Java 8+ installed and use the
following Maven dependency:

```xml
<dependency>
  <groupId>com.fasterxml.jackson.dataformat</groupId>
  <artifactId>jackson-dataformat-xml</artifactId>
  <version>2.9.8</version>
</dependency>
```

## Annotations

Annotation | Description
:--------- | :----------
`@JacksonXmlRootElement` | Define root element name in XML.
`@JacksonXmlProperty` | Define XML property, can be attribute or element.
`@JacksonXmlElementWrapper` | Define wrapper to use for collection types.
`@JacksonXmlCData` | Define a CData wrapper.
`@JacksonXmlText` | Render an element as plain text.

## Mapping Root Element

Annotation `@JacksonXmlRootElement` can be used to define name of root element
used for the root-level object when serialized, which normally uses name of the
type (class). It is similar to JAXB `XmlRootElement`.

```xml
<user>
  <name>foo</name>
</user>
```

```java
@JacksonXmlRootElement(localName = "user")
public class User {
  ...
}
```

## Mapping XML Property (Attribute / Element)

Annotation `@JacksonXmlProperty` can be used to provide XML-specific
configuration for properties, above and beyond what `@JsonProperty` contains.
It is an alternative to using JAXB annotations. Using boolean property
`isAttribute` can control if the target property is attribute or XML element. 
By default, the `isAttribute` value is false.

```xml
<user id="1">
  <name>foo</name>
</user>
```

```java
@JacksonXmlRootElement(localName = "user")
public class User {

  @JacksonXmlProperty(isAttribute = true)
  private int id;

  @JacksonXmlProperty
  private String name;

  public User() {}

  // Getters and Setters...
}
```

## Mapping Collection

Annotation `@JacksonXmlElementWrapper` is similar to JAXB
`javax.xml.bind.annotation.XmlElementWrapper`, which indicates wrapper element
to use (if any) for Collection types (arrays, `java.util.Collection`).
If defined, a separate container (wrapper) element is used; if not, entries are
written without wrapping.

Here's an example using a separate container (wrapper) element for cards. In
other words, the container is `cards` and the element property is `card`:

```xml
<user id="1">
  <name>foo</name>
  <cards>
    <card>C1</card>
    <card>C2</card>
  </cards>
</user>
```

```java
@JacksonXmlRootElement(localName = "user")
public class User {

  @JacksonXmlElementWrapper(localName = "cards")
  @JacksonXmlProperty(localName = "card")
  private List<String> cards;

  ...
}
```

Now, let's see another example _without_ using container. In other words,
elements are defined directly without going through the container:

```xml
<user id="1">
  <name>foo</name>
  <card>C1</card>
  <card>C2</card>
</user>
```

```java
@JacksonXmlRootElement(localName = "user")
public class User {

  @JacksonXmlElementWrapper(useWrapping = false)
  @JacksonXmlProperty(localName = "card")
  private List<String> cards;

  ...
}
```

## Configuration of XML Mapper

Object `XmlMapper` extends `ObjectMapper`. Therefore, you can use XML in the
same way that you use `ObjectMapper`. For example, register the Java 8 modules
to enable the feature of parameter names, Java 8 time, and Java 8 data types.
For more information, see <https://github.com/FasterXML/jackson-modules-java8>.

```java
ObjectMapper m = new XmlMapper();
m.registerModule(new ParameterNamesModule());
m.registerModule(new Jdk8Module());
m.registerModule(new JavaTimeModule());
```

You can also use method `ObjectMapper#configure(...)` to disable or enable a
target feature in the mapper.

## Conclusion

In this article, we learnt the annotations in Jackson DataFormat XML
(`jackson-dataformat-xml`), we saw how to map XML root element, XML property
(attribute / element), how to map collection (with / without wrapping), and the
configuration of XML mapper. The source code as available in
[mincong-h/java-examples](https://github.com/mincong-h/java-examples/tree/master/xml).
Hope you enjoy this article, see you the next time!
