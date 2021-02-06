---
layout:            post
title:             "Why You Should Use Auto Value in Java?"
date:              2018-08-21 09:22:49 +0200
categories:        [java-core]
tags:              [java, javac, auto-value]
comments:          true
excerpt:           >
    Auto Value generates immutable value classes during Java compilation,
    including equals(), hashCode(), toString(). It lighten your load from
    writing these boilerplate source code.
image:             /assets/bg-coffee-84624_1280.jpg
---

Auto Value is a Java library which helps you to generate value types
correctly. A value type is class without identity: two instances are considered
interchangeable as long as they have _equal field values_. Examples: `DateTime`,
`Money`, `Uri`... but you also tend to create a great many of these yourself.
You know the kind: they're the ones where you have to implement `equals()`,
`hashCode()`, and usually `toString()`.

## Before Auto Value

Before Auto Value, creating a value type is not easy. In order to implement it
correctly, you need to declare all the fields manually, mark them as `private`,
and only expose the getters; you need to implement `hashCode()` and `equals()`
(often handled by IDE), and keep them up to date when attributes
changed; you also need to mark the class as `final` to prevent subclassing,
which guarantees the equality.

A classical value type looks like:

{% highlight java %}
public final class Transaction {

  private long id;

  private String user;

  public Transaction(long id, String user) {
    this.id = id;
    this.user = user;
  }

  public long getId() {
    return id;
  }

  public String getUser() {
    return user;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof Transaction))
      return false;
    Transaction that = (Transaction) o;
    return id == that.id && Objects.equals(user, that.user);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, user);
    }

  @Override
  public String toString() {
    return "Transaction{" + "id=" + id + ", user='" + user + '\'' + '}';
  }
}
{% endhighlight %}

## Overview

When using Auto Value, everything is easier. You just need to write the
following code, and Google Auto Value takes care the rest:

{% highlight java %}
package auto.demo1;

import com.google.auto.value.AutoValue;

@AutoValue
public abstract class Transaction {

  public static Transaction of(long id, String user) {
    return new AutoValue_Transaction(id, user);
  }

  public abstract long id();

  public abstract String user();
}
{% endhighlight %}

Behind the scenes, Auto Value generates all the private fields, the constructor,
`hashCode()`, `equals()`, and `toString()` for you. The generated class always
starts with _"AutoValue\_"_, more explicitly, it naming convention is
<code>AutoValue_<i>&lt;MyClass&gt;</i></code>.

Pretty cool. But what is the real benefit of using Auto Value?

Here's the [explanation][4] from Auto Value: Auto Value is the only solution to
the value class problem in Java having all of the following characteristics:

- API-invisible (callers cannot become dependent on your choice to use it)
- No runtime dependencies
- Negligible cost to performance
- Very few limitations on what your class can do
- Extralinguistic "magic" kept to an absolute minimum (uses only standard Java
  platform technologies, in the manner they were intended)

I would also summary it as a comparison table:

Item | Without AutoValue | AutoValue
:--- | :--: | :---:
Auto attr declaration | N | Y
Auto getters | N | N
Auto toString() | N | Y
Auto hashCode() | N | Y
Auto equals() | N | Y
Immutable | &nbsp;&nbsp;&nbsp;&nbsp;Y (\*) | Y
Auto update toString() | N | Y
Auto update hashCode() | N | Y
Auto update equals() | N | Y

(\*) If you implement it correctly.

## Maven Dependency

**Solution 1.** In Maven dependencies, you need to declare 2 dependencies for
AutoValue: _auto-value-annotations_ and _auto-value_. The first one,
_auto-value-annotations_ is used for the AutoValue annotations; and the
second one, _auto-value_ is used for annotation processing (code generation).

{% highlight xml %}
<dependency>
  <groupId>com.google.auto.value</groupId>
  <artifactId>auto-value-annotations</artifactId>
  <version>1.6.2</version>
</dependency>
<dependency>
  <groupId>com.google.auto.value</groupId>
  <artifactId>auto-value</artifactId>
  <version>1.6.2</version>
  <scope>provided</scope>
</dependency>
{% endhighlight %}

The second dependency is declared as [_provided_][2] because the AutoValue
processor is only used during compilation, and not used at runtime.

**Solution 2.** Use annoation processor path from the Maven compiler plugin.
In this way the processor is separated from the actual project dependencies.

{% highlight xml %}
<dependencies>
  <dependency>
    <groupId>com.google.auto.value</groupId>
    <artifactId>auto-value-annotations</artifactId>
    <version>1.6.2</version>
  </dependency>
</dependencies>
<build>
  <pluginManagement>
    <plugins>
      <plugin>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.8.0</version>
        <configuration>
          <annotationProcessorPaths>
            <annotationProcessorPath>
              <groupId>com.google.auto.value</groupId>
              <artifactId>auto-value</artifactId>
              <version>1.6.2</version>
            </annotationProcessorPath>
          </annotationProcessorPaths>
        </configuration>
      </plugin>
    </plugins>
  </pluginManagement>
</build>
{% endhighlight %}

More information can be seen here: [Stack Overflow: Maven 3 - How to add
annotation processor dependency?][5]

## Builder Pattern

{% highlight java %}
package auto.demo2;

import com.google.auto.value.AutoValue;

@AutoValue
public abstract class Transaction {

  public static Builder builder() {
    return new AutoValue_Transaction.Builder();
  }

  public abstract long id();

  public abstract String user();

  @AutoValue.Builder
  public abstract static class Builder {
    abstract Builder id(long id);

    abstract Builder user(String user);

    abstract Transaction build();
  }
}
{% endhighlight %}

When using it, you can do:

{% highlight java %}
Transaction t = Transaction.builder().id(1).user("foo").build();
{% endhighlight %}

## Conclusion

In this post, we've seen the basics of Google Auto Value library. How to use it
to create value class with little effort. It generates the `hashCode()`,
`equals()`, `toString()` for you. We also checked the Maven setup. And finally,
we learnt a builder pattern for creating complex value class. Hope you enjoy
this one, see you next time!

The source code is available on GitHub:
<https://github.com/mincong-h/auto-value-demo>

## References

- [GitHub: Google AutoValue][1]
- [GoogleDoc: AutoValue: what, why and how?][3]

[1]: https://github.com/google/auto/tree/master/value
[2]: https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Dependency_Scope
[3]: https://docs.google.com/presentation/d/14u_h-lMn7f1rXE1nDiLX0azS3IkgjGl5uxp5jGJ75RE/edit
[4]: https://github.com/google/auto/blob/master/value/userguide/why.md
[5]: https://stackoverflow.com/questions/14322904/maven-3-how-to-add-annotation-processor-dependency/
