---
layout:      post
title:       "OCP Java 8 Review Notes"
date:        "2018-01-03 19:37:53 +0100"
categories:  [java, java8, ocp, notes]
comments:    true
---

Here're some review notes before my Oracle Certified Professional Java SE 8
exam. They're highly inspired by the following books:

- [OCP Java SE 7 Certification Guide][ocp]
- [Java 8 in Action][java8]

They are excellent resources for learning Java, which I highly recommend!

## Java Class Design

**Java access modifiers:**

- Access modifiers defined by Java are `public`, `protected`, and `private`.
  In the absence of an explicit access modifier, a member is defined with the
  _default_ access level.
- The members of a class defined using the `protected` access modifier are
  accessible to classes and interfaces defined in the same package and to all
  derived classes, even if they're defined in separate packages.
- A top-level class, interface, or enum can only be defined using the `public`
  or default access. They cannot be defined using `protected` or `private`
  access.

**Overloaded methods and constructors:**

- Overloaded methods are methods with the same name but different method
  parameter lists.
- Overloaded methods are bound at compile time. Unlike overridden methods
  they're not bound at runtime.
- A call to correctly overloaded methods can also fail compilation if the
  compiler is unable to resolve the call to an overloaded method.
- Overloaded methods might define a different return type or access or
  non-access modifier, but they cannot be defined with **only** a change in
  their return types or access or non-access modifiers.
- Overloaded constructors must be defined using different argument lists.
- Overloaded constructors cannot be defined by **just** a change in the access
  modifiers.
- A constructor can call another overloaded constructor by using the keyword
  `this`.
- A constructor cannot invoke another constructor by using its class's name.
- If present, the call to another constructor must be **the first statement**
  in a constructor.

**Method overriding and virtual method invocation:**

- Whenever you intend to override methods in a derived class, use the
  annotation `@Override`. It will warn you if a method cannot be overridden or
  if you're actually overloading a method rather than overriding it.
- Overridden methods can define the same or covariant return types.
  <sup>[1]</sup>
- A derived class cannot override a base class method to make it **less
  accessible**.
- Static methods cannot be overridden. They're not polymorphic and they are
  bound at compile time.
- The `instanceof` operator must be followed by the name of an interface,
  class, or enum.
- In a derived class, a static method with the same signature as that of a
  static method in its base class hides the base class method.
- **Constructor cannot be overridden** because a base class constructor is not
  inherited by a derived class.
- A method that can be overridden by a derived class is call a _virtua method_.

<sup>[1]</sup> Example: Dog extends animal, and the return type of method
`getChild()` is covariant.

{% highlight java %}
public abstract class Animal {
  protected abstract Animal getChild();
}
{% endhighlight %}

{% highlight java %}
public class Dog extends Animal {
  @Override
  public Dog getChild() {
    return new Dog();
  }
}
{% endhighlight %}

Compilation is successful:

{% highlight bash %}
~ $ javac Animal.java Dog.java -verbose
...
[wrote RegularFileObject[Animal.class]]
[checking Dog]
[wrote RegularFileObject[Dog.class]]
[total 282ms]
{% endhighlight %}

**Java packages:**

- The package and subpackages names are separated using a period.
- You cannot import classes from a subpackage by using the wildcard character,
  an asterisk (`*`), in the `import` statement.
- A class from the default package cannot be used in any named package,
  regardless of whether it's defined within the same directory or not.
- An `import` statement cannot be placed before a package statement in a class.
  Any attempt to do so will cause the compilation of the class to fail.

**Sample questions correction:**

Question 1-4: Given that classes `Class1` and `Class2` exist in separate
packages and source code files, examine the code and select the correct options.

{% highlight java %}
package pack1;

public class Class1 {
  protected String name = "Base";
}
{% endhighlight %}

{% highlight java %}
package pack2;

import pack1.*;

class Class2 extends Class1 {
  Class2() {
    Class1 cls1 = new Class1();    // line 1
    name = "Derived";              // line 2
    System.out.println(cls1.name); // line 3
  }
}
{% endhighlight %}

Class 2 won't compile because it cannot access the `name` variable on line 3.
The base class `Class1` and derived class `Class2` are in separate packages, so
you cannot access protected members of the base class by using reference
variables.

[ocp]: https://www.manning.com/books/ocp-java-se-7-programmer-ii-certification-guide
[java8]: https://www.manning.com/books/java-8-in-action
