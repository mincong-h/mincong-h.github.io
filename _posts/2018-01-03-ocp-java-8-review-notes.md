---
layout:      post
title:       "OCP Java 8 Review Notes"
date:        "2018-01-03 19:37:53 +0100"
categories:  [tech]
tags:        [java, java8, ocp, study-note]
excerpt:     >
  Here're some review notes before my Oracle Certified Professional Java SE 8
  exam. They're highly inspired by the following books: OCP Java SE 7
  Certification Guide and Java 8 in Action. They are excellent resources for
  learning Java, which I highly recommend.
comments:    true
---

Here're some review notes before my Oracle Certified Professional Java SE 8
exam. They're highly inspired by the following books:

- [OCP Java SE 7 Certification Guide][ocp]
- [Java 8 in Action][java8]

They are excellent resources for learning Java, which I highly recommend. In
particular, the OCP Java SE 7 Programmer II Certification Guide is really the
best resource that you can have for learning Java and pass the certification!

<p align="center">
  <img src="{{ site.url }}/assets/20180106-manning.jpg"
       alt="OCP Java SE 7"
       style="max-height:400px; border-radius: 0; box-shadow: 2px 2px 10px #BBB;" />
</p>

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
- There are two kinds of class declarations: normal class declarations and enum
  declarations.
- A class declaration may include class modifiers.

      ClassModifiers:
        ClassModifier
        ClassModifiers ClassModifier

      ClassModifier: one of
        Annotation public protected private
        abstract static final strictfp

  The access modifiers `protected` and `private` (§6.6) pertain only to member
  classes within a directly enclosing class or enum declaration (§8.5). The
  modifier `static` pertains only to member classes (§8.5.1), not to top level
  or local or anonymous classes.
- If two or more (distinct) class modifiers appear in a class declaration, then
  it is customary, though not required, that they appear in the order consistent
  with that shown above in the production for ClassModifier.

**Overloaded methods and constructors:**

- Overloaded methods are methods with the same name but different method
  parameter lists.
- Overloaded methods are bound at compile time. Unlike overridden methods
  they're not bound at runtime.
- A call to correctly overloaded methods can also fail compilation if the
  compiler is unable to resolve the call to an overloaded method.
- Overloaded methods might define a different return type or access or
  non-access modifier, but they cannot be defined with _only_ a change in
  their return types or access or non-access modifiers.<sup>[1.1]</sup>
- Overloaded constructors must be defined using different argument lists.
- Overloaded constructors cannot be defined by _just_ a change in the access
  modifiers.
- A constructor can call another overloaded constructor by using the keyword
  `this`.
- A constructor cannot invoke another constructor by using its class's name.
- If present, the call to another constructor must be _the first statement_
  in a constructor.

**Method overriding and virtual method invocation:**

- Whenever you intend to override methods in a derived class, use the
  annotation `@Override`. It will warn you if a method cannot be overridden or
  if you're actually overloading a method rather than overriding it.
- Overridden methods can define the same or covariant return types.
  <sup>[1.2]</sup>
- A derived class cannot override a base class method to make it _less
  accessible_.
- Static methods cannot be overridden. They're not polymorphic and they are
  bound at compile time.
- The `instanceof` operator must be followed by the name of an interface,
  class, or enum.
- In a derived class, a static method with the same signature as that of a
  static method in its base class hides the base class method.
- _Constructor cannot be overridden_ because a base class constructor is not
  inherited by a derived class.
- A method that can be overridden by a derived class is call a _virtual method_.

<sup>[1.1]</sup> Example:

{% highlight java %}
class A {
  static int age() { return 0; }
}
interface B {
  int age();
}
class C extends A implements B {
  // ...
}
{% endhighlight %}

Compile failure:

```
$ javac A.java
A.java:7: error: age() in A cannot implement age() in B
class C extends A implements B {
^
  overriding method is static
1 error
```

<sup>[1.2]</sup> Example: Dog extends animal, and the return type of method
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
$ javac Animal.java Dog.java -verbose
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

Question ME-75: What is the result of the following code? (Choose the best
option.)

{% highlight java %}
class Metal {
  {
    try {
      throw new RuntimeException();
    } finally {
      System.out.println("finally-");
    }
  }
  Metal() {
    System.out.println("Metal-");
  }
}
{% endhighlight %}

The compilation will fail, becuase instance initializer of a class must complete
normally to enable the class to compile. The code in `Metal`'s instance
initializer throws a `RuntimeException`, which is not handled. So compilation of
class `Metal` fails with the follwing message:

    Metal.java:2: error: initializer must be able to complete normally
      {
      ^
    1 error

## Advanced Class Design

**Abstract classes:**

- An abstract class must not necessarily define abstract methods. But if it
  defines even one abstract method, it _must_ be marked as an abstract class.
- An abstract class cannot be instantiated.
- An abstract class forces all its non-abstract derived classes to implement the
  incomplete functionality in their own unique manner.
- If an abstract class is extended by another abstract class, the derived
  abstract class might _not_ implement the abstract methods of its base class.
- If an abstract class is extended by a concrete class, the derived class _must_
  implement all the abstract methods of its base class, or it won't compile.
- A derived class _must_ call its super class's constructor (implictly or
  explicitly), irrespective of whether the super class or derived class is an
  abstract class or concrete class.
- An abstract class cannot define abstract static methods. Because static
  methods belong to a class and not to an object, they aren't inherited. A
  method that cannot be inherited cannot be implemented. Hence this combination
  is invalid.
- A static variable defined in a base class is accessible to its derived class.
  Even though derived class does not define the static variable, it can access
  the static variable _defined in its base class_.

**Non-access modifier—static**:

- Static members are also known as _class fields_ or _class methods_ because
  they are said to belong to their class, and not to any instance of that class.
- A static variable and method cannot access non-static variables and methods of
  a class. But the reverse works: non-static variables and methods can access
  static variables and methods.
- When you instantiate a derived class,  the derived class instantiates its base
  class. The static initializers execute when a class is loaded in _memory_, so
  the order of execution of static and instance initializer blocks is as
  follow: base class static init-block, derived class static init-block, base
  class instance init-block, derived class instance init-block.

**Non-access modifier—final**:

- An instance final variable can be initialized either with its declaration in
  the initilizer block or in the class's constructor.
- A static final variable can be initialized either with its declaration or in
  the class's static initializer block.
- If you don't initialize a final local variable in a method, the compiler won't
  complain, as long as you don't use it.
- The Java compiler considers initialization of a final variable complete _only_
  if the initialization code will execute in _all_ conditions. If the Java
  compiler cannot be sure of execution of code that assigns a value to your
  final variabl, it will complain (code won't compile) that you haven't
  initialized a final variable. If an `if` construct uses constant values, the
  Java compiler can predetermine whether the `then` or `else` blocks will
  execute. In this case, it can predetermine whether these blocks of code will
  execute to initialize a final variable.
- The initialization of a final veriable defined in an abstract base class must
  complete in the class itself. It _connot_ be deferred to its derived class.

**Enumerated types:**

- All enums extend the abstract class `java.lang.Enum`, defined in Java API.
- Because a class can extend from only base class, an attempt to make your enum
  extend any other class will fail its compilation.
- The enum constants are _implicit_ static members.
- The creation of enum constants happens in a static initializer block, before
  the execution of the rest of the code defined in the `static` block.
- You can define multiple constructors in your enums.
- Enum constants can define new methods, but these methods cannot be called on
  the enum constant.
- All the constants of an enum type can be obtained by calling the _implicit_
  `public static T[] values()` method of that type. This array contains the
  enumerated types in natural order. (Probably defined by the private member
  `ordinal` of `java.lang.Enum`)
- You can define an enum as a top-level enum or within another class or
  interface.<sup>[2.1]</sup>
- You cannot define an enum local to a method.<sup>[2.2]</sup>

<sup>[2.1],[2.2]</sup> Example:

{% highlight java %}
// Top-level
enum Size { S, M, L }

// Member of a class
class MyClass {
  enum Size { S, M, L }
}

// Member of an interface
interface MyInterface {
  enum Size { S, M, L }
}

// WON'T compile: inside a method
class MyClass {
  void aMethod() {
    enum Size { S, M, L }
  }
}
{% endhighlight java %}

**Static nested class:**

- This class is not associated with any object of its outer class. Nested within
  its outer class, it's accessed like any other static member of a class—by
  using the class name of the outer class.
- The accessibility of the nested static class depends on its access modifier.
  For example, a private static nested class cannot be accessed outside its
  class.

**Inner class:**

- An object of an _inner_ class shares a special bound with its _outer class_
  and cannot exist without its instance.
- An inner class cannot define _static methods_ and non-final static variables.
- You can create an object of an inner class within an outer class<sup>[4]</sup>
  or outside an outer class<sup>[5]</sup>.

<sup>[4]</sup> Inside the outer class, an inner class is instantiated like:

{% highlight java %}
Inner inner = new Inner();
{% endhighlight java %}

<sup>[5]</sup> Outside the outer class, an inner class is instantiated like:

{% highlight java %}
Outer.Inner inner = new Outer().new Inner();
{% endhighlight java %}

Here's a complete example:

{% highlight java %}
public class Outer {

  public void print() {
    System.out.println("Outer: " + new Inner());
  }

  public class Inner {
    @Override
    public String toString() {
      return "Inner";
    }
  }
}
{% endhighlight java %}

{% highlight java %}
public class App {

  public static void main(String... args) {
    Outer.Inner inner = new Outer().new Inner();
    System.out.println("Outside: " + inner);
    Outer outer = new Outer();
    outer.print();
  }
}
{% endhighlight java %}

Compile and execute:

```
$ javac Outer.java App.java
$ java App
Outside: Inner
Outer: Inner
```

**Anonymous inner classes:**

- An anonymous inner class is created when you combine object instance creation
  with inheriting a class or implementing an interface.
- The following line creates an anonymous inner class that extends `Object` and
  assigns it to a reference variable of type `Object`:

      Object o = new Object(){};

- When an anonymous inner class is defined within a method, it can access only
  the final variables of the method in which it's defined. This is to prevent
  reassignment of the variable values by the inner class.
- Since Java 8, certain variables that are not declared `final` are instead
  considered _effectively_ final. See [JLS 4.12.4. final Variables][jls-4.12.4]
  for more detail.

**Method local inner classes:**

- Method local inner classes are defined within a static or instance method of a
  class.
- A method local inner class can define its own constructors, variables, and
  methods by using any of the four access levels—`public`, `protected`, default,
  and `private`.
- A method local inner class can access all variables and methods of its _outer_
  class, including its private members and the ones that it inherits from its
  base classes. It can only access the _final_ local variables of the method in
  which it's defined.

**Sample questions correction:**

Question 2-13: What is the output of the following code?

{% highlight java %}
enum BasicColor {
  RED;
  static {
    System.out.println("Static init");
  }
  {
    System.out.println("Init block");
  }
  BasicColor() {
    System.out.println("Constructor");
  }
  public static void main(String... args) {
    BasicColor red = BasicColor.RED;
  }
}
{% endhighlight %}

Here's part of the decompiled code. Note that the contents of the default
constructor and instance initializer blocks are added to the new constructor,
implicitly defined during the compilation process.

```
final class BasicColor extends Enum
{
  private BasicColor(String s, int i)
  {
    super(s, i);
    System.out.println("Init block");
    System.out.println("Constructor");
  }

  ...

  static
  {
    RED = new BasicColor("RED", 0);
    $VALUES = (new BasicColor[] {
      RED
    });
    System.out.println("Static init");
  }
}
```

Thus the answer is:

```
Init block
Constructor
Static init
```

## Object-Oriented Design Principles

**Interfaces**

- The methods of an interface are implicitly abstract and public.
- The vairables of an interface are implicitly public, static, and final.
- Because the methods in an interface are implicitly public, if you try to
  assign a weaker access to the implemented method in a class, it won't compile.

## Generics and Collections

**Creating generic entities:**

- Java's naming conventions limit the use of _single uppercase_ letters for type
  parameters. Though not recommended, using any valid identifier name for type
  parameters is acceptable code.
- When a non-generic class extends a generic class, the derived class doesn't
  define any type parameters but passes arguments to all type parameters of its
  generic base class.
- A method's type parameter list is placed just after its access and non-access
  modifiers and before its return type. Because a type parameter could be used
  to define the return type, it should be known before the return type is used.
- For a bounded type parameter, the bound can be a class, an interface, or an
  enum.
- For a bounded type parameter, the bound cannot be primitive types or array.
- All cases use the keyword `extends` to specify the bound, even if the bound is
  an interface.
- Use method `Class#newInstance()` can create a new instance of the class
  represented by this `Class` object.<sup>[4.1]</sup>

<sup>[4.1]</sup> Example:

{% highlight java %}
public class App {

  public static void main(String... args) throws Exception {
    User u = create(User.class);
    u.name = "Tom";
    System.out.println("Hi, " + u.name);
  }

  static <T> T create(Class<T> cls) throws Exception {
    return cls.newInstance();
  }

  static class User {
    String name;
  }

}
{% endhighlight %}

Compile and execution:

```
$ javac App.java
$ java App
Hi, Tom
```

## String Processing

**Regular expressions:**

- Regular expressions, or regex, are used to define patterns of datat to be
  found in a stream.
- Character classes aren't classes defined in the Java API. The term refers to
  _a set of characters_ that you can enclose within square brackets `[]`.
- You can create a custom character class by enclosing a set of characters
  within square brackets `[]`.
  - `[fdn]` can be used to find an exact match of f, d, or n.
  - `[^fdn]` can be used to find a character that does not match either f, d, or
    n.
  - `[a-cA-C]` can be used to find a exact match of either a, b, c, A, B, or C.
- Use predefined character classes:
  - A dot `.` matches any character
  - `\d` matches any digit: `[0-9]`
  - `\D` matches any non-digit: `[^0-9]`
  - `\s` matches a whitespace character: spaces, `\t` tab, `\n` new line, `\x0B`
    end of line, `\f` form feed, `\r` carriage.
  - `\S` matches a non-whitespace character: `[^\s]`
  - `\w` matches a word character: `[a-zA-Z_0-9]`
  - `\W` matches a non-word character: `[^\w]`
- Boundary metchers:
  - `\b` indicates a word boundary
  - `\B` indicates a non-word boundary
  - `^` indicates the beginning of a line
  - `$` indicates the end of a line
- Specify the number of occurrences of a pattern to match in a target value by
  using quantifiers:
  - `X?` matches X, once or not at all
  - `X*` matches X, zero or more times
  - `X+` matches X, one or more times
  - `X{min,max}` matches X, which the specified range
- Regex in Java supports Unicode, as it matches against the `CharSequence`
  objects.
- Class `Pattern` is a compiled representation of a regular expression.
  Instantiate a `Pattern` by using its factory method `compile()`.
  <sup>[5.1]</sup>
- Class `Matcher` is referred to as an engine that scans a target `CharSequence`
  for a metching regex pattern. You can create a `Matcher` object by calling the
  instance method `Pattern#matcher(CharSequence)`.<sup>[5.2]</sup>

<sup>[5.1],[5.2]</sup> Example:

{% highlight java %}
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Regex {
  public static void main(String... args) {
    Pattern p = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
    Matcher m = p.matcher("2018-01-06");
    System.out.println("2018-01-06: " + m.matches());
  }
}
{% endhighlight %}

Then compile and execute:

```
$ javac Regex.java
$ java Regex
2018-01-06: true
```

**Search, parse, and build strings:**

You can search strings for exact matches of characters or string, at the
beginning of a string, or starting at a specified position, using `String`
class's overloaded methods `indexOf`.

- `indexOf` increases position numbers
- `lastIndexOf` decreases position numbers
- `indexOf` and `lastIndexOf` _don't_ throw a compilation error or runtime
  exception if the search position is negative or greater than the length of
  this string. If no match is found, they return -1.
- `contains` searches for an exact match in this string. Becuase `contains`
  accepts a method parameter of interface `CharSequence`, you can pass to it
  _both_ `String` and `StringBuilder` object.
- `substring` defines 2 overloaded versions, which accept one or two parameters
  for the start and end positions.<sup>[5.3]</sup> While `subSequence()` defines
  only one variant, the one that accepts two int method parameters for the start
  and end positions.<sup>[5.4]</sup>
- `subSequence` is defined in interface `CharSequence`, it returns an object of
  type `CharSequence`.
- `subSequence` and `substring` do not include the character at the _end_
  position in the result `String`.
- The combination of the `replace`, `replaceAll`, and `replaceFirst` overloaded
  methods can be confusing on the exam. Be aware of `StringBuilder`, which
  implements `CharSequence`:
  - `replace(char oldChar, char newChar)`
  - `replace(CharSequence oldVal, CharSequence newVal)`
  - `replaceAll(String regex, String replacement)`
  - `replaceFirst(String regex, String replacement)`
- `Scanner` can be used to parse and tokenize strings.
- If no delimiter specified, a pattern that matches _whitespace_ is used by
  default.
- Use customized pattern by calling `userDelimiter` with a _regex_.
- `next()` returns a string.
- `nextXXX()` returns a primitive type `XXX`.

<sup>[5.3],[5.4]</sup> Example:

{% highlight java %}
import static java.lang.System.out;

public class Process {
  public static void main(String... args) {
    String s = args[0];
    out.println("s:      " + s);
    out.println("s[1:]:  " + s.substring(1));
    out.println("s[1:2]: " + s.substring(1, 2));
    out.println("s[1:2]: " + s.subSequence(1, 2));
  }
}
{% endhighlight %}

Compile and execute:

```
$ javac Process.java
$ java Process xPath
s:      xPath
s[1:]:  Path
s[1:2]: P
s[1:2]: P
```

**Formatting strings:**

- The format specifier takes the following form:

      %[argument_index$][flags][width][.precision]conversion

  Width specifier indicates the _minimum_ number of characters to be written to
  the output.
- A format specification must start with a `%` sign and end with a conversion
  character:
  - `b` for boolean
  - `c` for char
  - `d` for int, byte, short, and long
  - `f` for float, and double
  - `s` for string
- If the number of arguments _exceeds_ the required count, the extra variables
  are quietly _ignored_ by the compiler and JVM.
- If the number of arguments falls short, the JVM throws a runtime exception.
- The `-` indicates to left-justify this arguments; you must specify width as
  well. Number flags<sup>[5.5]</sup> (only applicable for numbers, conversion
  chars `d` and `f`) are as follows:
  - The `+` indicates to include a sign (`+`, `-`) with this argument.
  - `0` indicates to pad this arguments with zeros. Must pecify width as well.
  - `,` indicates to use local-specific grouping separators, e.g. the comma in
    123,456.
  - `(` is used to enclose negative numbers in parentheses.
- The floags `+`, `0`, `(`, and `,` can be specified only with the numeric
  specifiers `%d` and `%f`. Using it with other specifier will raise a runtime
  exception.
- Format specifier `%b`
  - `null` -> false
  - Boolean, boolean -> itself
  - Else -> true
- Format specifier `%c`
  - Accepted inputs: char, byte, short, int, and their related non-primitive
    types. The result is a unicode character.
  - Refused inputs: boolean, _long_, float, and their related non-primitive
    types. An `IllegalFormatConversionException` will be thrown.
- Format specifier `%f`
  - Accepted inputs: float, double, and their related non-primitive types.
  - By default, `%f` prints six digits after the decimal.
- Format specifier `%d`
  - Accepted inputs: byte, short, int, long and their related non-primitive
    types.
  - Refused inputs: float, double and their related non-primitive types.
- Format specifier `%s`
  - `%s` outputs the value for a primitvie variable. It calles `toString` behind
    the screen, and outputs "null" for null values.
  - It accepts all types.

<sup>[5.5]</sup> Example:

{% highlight java %}
import static java.lang.System.out;

public class NumberFlags {
  public static void main(String... args) {
    out.printf("%+d%n", 1000);
    out.printf("%05d%n", 1000);
    out.printf("%,d%n", 1000);
    out.printf("%(d%n", -1000);
  }
}
{% endhighlight %}

Compile and execute:

```
$ javac NumberFlags.java
$ java NumberFlags
+1000
01000
1,000
(1000)
```

## Exceptions and Assertions

**Using the throw statement and the throws clause:**

- When you use a method that throws a _checked_ exception, you must either
  enclose the code within a `try` block or declare it to be rethrown in the
  calling method's declaration. This is also known as the _handle-or-declare_
  rule.
- A method can throw a runtime exception or error irrespective of whether its
  name is included in the `throws` clause.
- A method can throw a _subclass_ of the exception mentioned in its `throws`
  clause but not a superclass.
- A method can declare to throw any type of exception, checked or unchecked,
  even if it doesn't.
- But a `try` block _cannot_ define a `catch` block for a checked exception
  (other than `Exception`) if the `try` block doesn't throw that checked
  exception or use a method that declares to throw that checked exception.

**Custom exceptions:**

- Custom exceptions help you restrict the escalation of implementation-specific
  exceptions to higher layers. For example, `SQLException` thrown by data access
  code can be wrapped within a custom exception and rethrown.

**Overriding methods that throw exceptions:**

- If a method in the base class doesn't declare to throw any checked exception,
  the overriding method in the derived class _cannot_ throw any checked
  exception.
- If a method in the base class declares to throw a checked exception, the
  overriding method in the derived class can choose _not to_ declare to throw
  any checked exception.
- Subclass _cannot_ override a method in the base class, if it declares to throw
  a more generic checked exception.
- Moethod overriding rules apply only to checked exceptions. They don't apply to
  runtime exceptions or errors.

**try statement with multi-catch and finally clauses:**

- The exceptions that you catch in a multi-`catch` block cannot share an
  _inheritance_ relationship. If you try to do so, your code won't compile.
- Declare more specific exceptions at the top, more general ones at the bottom.

**Auto-close resources with try-with-resources statement:**

- A try-with-resources block might not be followed by a `catch` or a `finally`
  block. This is unlike a regular `try` block, which must be followed by either
  a `catch` or a `finally` block.
- The variables used to refer to resources are implicitly final variables. You
  must _declare_ and _initialize_ resources in the try-with-resources statement.
- Resources are closed in the reverse order from that in which they were
  initialized. A resource is closed only if it initialized to a non-null value.
  An exception from the closing of one resource does not prevent the closing of
  other resources. Such an exception is _suppressed_ if an exception was thrown
  previously by an initializer, the try block, or the closing of a resource.

**Assertions:**

An _assertion_ is an assert statement containing a boolean expression. An
assertion is either _enabled_ or _disabled_. If the assertion is enabled,
execution of the assertion causes evaluation of the boolean expression and an
error is reported if the expression evaluates to `false`. If the assertion is
disabled, execution of the assertion has no effect whatsoever.

    AssertStatement:
      assert Expression1 ;
      assert Expression1 : Expression2 ;

It is a compile-time error if _Expression1_ does not have type `boolean` or
`Boolean`. In the second form of the `assert` statement, it is a compile-time
error if _Expression2_ is `void`.

- The second form, when the boolean expression evaluates to `false`, the JRE
  creates an object of `AssertError` by passing the value of the second
  expression to `AssertionError`'s constructor.
- From the Javadoc of [`AssertionError`][assertion-error]: the seven
  one-argument public constructors provided by this class ensure that the
  assertion error returned by the invoation:

      new AssertionError(expression)

  has as its detail message the _string conversion_ of _expression_, regardless
  of the type of _expression_. (JLS §15.18.1.1)
- Assertions can be enabled or disabled at the launche of a
  program.<sup>[6.1]</sup>
- Use the command-line option `-ea` or `-enableassertions` to enable assertions
- Use the command-line option `-da` or `-disableassertions` to disable
  assertions
- A generalized `-da` switch (no assertions enabled) corresponds to the default
  JRE behavior.

<sup>[6.1]</sup> Example:

{% highlight java %}
public class App {
  private static boolean isHappy;

  public static void main(String... args) {
    assert isHappy : "You should be happy :)";
    System.out.println("Finished.");
  }
}
{% endhighlight %}

Compile and execute:

```
$ javac App.java
$ java App
Finished.
$ java -da App
Finished.
$ java -ea App
Exception in thread "main" java.lang.AssertionError: You should be happy :)
	at App.main(App.java:5)
```

## Java File IO

- `RandomAccessFile#readLine()` successively reads bytes from the file, starting
  at the current file pointer, until it reaches a line terminator or the end of
  the file.
- `FileInputStream` accepts `File` as constructor input parameter.
- `FileInputStream` accepts `String` as constructor input parameter.
- `BufferedInputStream` accepts `InputStream` as constructor input parameter.
- Concatenating int and `StringBuilder` _fails_ to compile. E.g.
  `String s = 1 + sb;`. Although using the additive operator for concatenation
  is implemented by invoking the append method on the `StringBuilder` or
  `StringBuffer` class, this operator is not supported for the `StringBuilder`
  or `StringBuffer` operands.
- `InputStream#read()` returns the next byte of data, or `-1` if the end of the
  stream is reached. 
- `InputStream#skip()` skips over and discards _n_ bytes of data from this input
  stream.

## Building Database Applications with JDBC

JDBC 4.0 and its later version support automatic loading and registration of all
JDBC drivers accessible via an application's classpath. For all earlier versions
of JDBC, you must manually load the JDBC drivers using `Class.forName()`, before
you can access the driver.

{% highlight java %}
// JDBC 4.0+
DriverManager.getConnection("jdbc:h2:mem:test");
{% endhighlight %}

**JDBC transactions:**

- When connection's auto-commit mode is changed _during_ a transaction, the
  transaction is committed. So when auto-commit is enabled, all the "pending"
  changes in the current transaction are commited.

## Threads

**Create and use threads:**

- Implementation of Java threads is JVM-specific.
- To create your own thread objects using class `Thread`, you must extend it and
  override its method `run()`.
- When you call `start()` on a `Thread` instance, it creates a new thread of
  execution. When a new thread of execution starts, it will execute the code
  defined in the thread instance's method `run()`. Method `start()` will trigger
  the creation of a new thread of execution, allocating resources to it.
- When you create a thread class by extending class `Thread`, you _lose_ the
  fexibility of inheriting any other class.
- When you implement the `Runnable` interface, you must implement its method
  `run()`.
- The `Thread` constructor accepts a `Runnable` object. A `Thread` instance
  stores a reference to a `Runnable` object and uses it when you start its
  execution (by calling `start()`).
- You _cannot_ guarantee that a thread with a higher priority will always
  execute before a thread with a lower priority.

**Thread lifecycle:**

<p align="center">
  <img src="{{ site.url }}/assets/20180106-thread-states.png"
       alt="Thread states in Java"
       style="max-height: 310px" />
</p>

- Thread states: new, runnable, wait, timed, timed-waiting, blocked, or
  terminated.
- Calling `start()` on a new thread instance implicitly calls its method
  `run()`, which transitions its state from "new" to "ready".
- A running thread might enter the blocked state when it's waiting for other
  system resources like network connections or to acquire an object lock to
  execute a synchronized method or code block. Depending on whether the thread
  is able to acquire the monitor lock or resources, it returns back to the ready
  state.

**Methods of class Thread:**

- Calling `run()` on a `Thread` instance doesn't start a new thread of
  execution. The `run()` continues to execute in the same thread.
- Method `yield()` makes the currently executing thread pause its execution and
  give up its current use of the processor. But it only acts as a hint to the
  scheduler. The scheduler might also ignore it.
- A thread that's suspended due to a call to `sleep()` doesn't lose ownership of
  any monitors.

**Protect shared data:**

- A simple statement like incrementing a variable value might involve multiple
  steps like loading of the variable value from memory to registers (working
  space), incrementing the value, and reloading the new value in memory.
- When multiple threads execute this seemingly atomic statement, they might
  interleave, resulting in incorrect variable values.
- Thread safety is about safe-guarding your shared data that might be accessible
  to multiple threads.
- To execute synchronized statements, a thread must acquire a lock on an object
  monitor. For instance methods an implicit lock is acquired on the object on
  which it's called. For synchronized statements, you can specify an object to
  acquire a lock on.
- For instance synchronized methods, a thread locks the instance's monitor
- For static synchronized methods, a thread locks the `Class` object's
  monitor.<sup>[10.1]</sup>
- A thread releases the lock on the object monitor once it exits the
  synchronized statement block due to successful completion or an exception.
- Immutable objects are thread-safe, because they cannot be modified.
- Using `valatile` ensures objects are accessed from the main memory, as opposed
  to storing its copy in the thread's cache memory. It prevents data consistency
  problem caused by local copy.

<sup>[10.1]</sup> Example:

{% highlight java %}
public class MultithreadClass {
  public static synchronized void foo(byte[] data) {
    // ...
  }
  public void bar(byte[] data) {
    synchronized(MultithreadClass.class) {
    // ...
  }
}
{% endhighlight %}

**Identify and fix code in a multi-threaded environment:**

- Local variables, method params, and exception handler params are always safe.
- Class and instance variables might not always be safe.
- Use `wait()`, `notify()`, and `notifyAll()` for inter-thread notification.
- To call `wait()` or `notify()` a thread _must_ own the object's monitor lock.
  So calls to these methods should be placed within _synchronized_ methods or
  blocks or else an `IllegalMonitorStateException` will be thrown by the JVM.

  <img src="{{ site.url }}/assets/20180106-java-monitor.gif"
       alt="Java Thread Monitor"
       style="max-height: 300px" />

- A thread can starve to be scheduled when it's waiting to acquire a lock on an
  object monitor that has been acquired by another thread that usually takes
  long to execute and is invoked frequently.
- Java language uses _"happens-before"_ relationship, which is when one task is
  guaranteed to happen before another.
- The execution of `start()` happens-before any action in a thread is started.
- When code is defined in a sequence, step 1 happens-before step 2.
- Unlocking of an object monitor heppens-before any other thread acquires a
  lock on it.
- A write to a volatile field happens-before every subsequent read of that
  field.
- All actions in a thread happens-before any other thread returns from a join on
  that thread.

**Miscellaneous:**

- Livelock occurs when two or more threads are so busy responding to each other
  that they are unable to complete their tasks. Technically, these threads are
  _running_ and not _waiting_, but the locking mechanism consumes their
  execution.
- Starvation occurs when one or more threads access a shared resource so
  frequently that other threads are unable to gain needed access. Those threads
  with access to the shared resource are not waiting.
- 3 methods affect the frequency and/or duration of a running thread. They're
  `setDaemon`, `setPriority`, and `yield`.
- The `setPriority` method indicates the relative likelihood and frequency that
  a thread will be given a time slice to execute. Possible values: max, norm, or
  min.
- The `yield` method will cause the current thread to give up its time slice, so
  that another thread can execute. 
- If true is specified for `setDaemon`, then the JVM may exit before the thread
  terminates. The JVM exits only when all non-daemon threads terminate.
- `java.util.ConcurrentModificationException` can be thrown by threads when
  modifying `ArrayList` which is not thread-safe. Use the thread-safe variant of
  `ArrayList`: `CopyOnWriteArrayList` is a good alternative.
- `ThreadLocalRandom` can be used to create random numbers in a multi-threaded
  application with the least amount of contention and best performance

## Concurrency

**Locks:**

- `Lock` and `ReadWriteLock` are interface.
- `ReentrantLock` and `ReentrantReadWriteLock` are concrete classes.
- `Lock` objects offer multiple advantages over the implicit locking of an
  object's monitor. Unlike an implicit lock, a thread can use explicit lock
  objects to wait to acquire a lock until a time duration elapses.
- Method `lock()` acquires a lock on a `Lock` object. If the lock is not
  available, it waits until the lock can be acquired.
- Call `unlock` on a `Lock` object to release its lock when you no longer need
  it.
- The `ReadWriteLock` interface doesn't extend `Lock` or any other interface.

**Parallel fork/join framework:**

- Method `compute()` determines whether the task is small enough to be executed
  or if it needs to be divided into multiple tasks.
- If the task needs to be split, a new `RecursiveAction` or `RecursiveTask`
  object is created, calling `fork` on it.
- Calling `join` on these tasks returns their result.

## Localization

**Internationalization and localization:**

- Class `Locale` does not itself provide any moethod to format the numbers,
  dates or currencies. You use `Locale` objects to pass locale-specific
  information to other classes like `NumberFormat` or `DateFormat` to format
  data.
- You can create and access objects of class `Locale` by using constructors,
  methods, constants, and builder.
- Overloaded constructors of `Locale`

      Locale(String language)
      Locale(String language, String country)
      Locale(String language, String country, String variant)

- Variant is a vendor- or browser-specific code, such as WIN for Windows and MAC
  for Macintosh.
- Language is the most important parameter that you pass to a `Locale` object.
- You can access the current value of a JVM's default locale by using method
  `Locale#getDefault`.

**Resource bundles:**

- An abstract class `ResourceBundle` represents locale-specific resources.

      ResourceBundle r = ResourceBundle.getBundle("i18n.foo", Locale.FRANCE);

- You can call methods `getString()`, `getObject()`, `keySet()`, `getKeys()`,
  and `getStringArray()` from class `ResourceBundle` to access its keys and
  values.
- The order in which Java searches for a matching:

      bundle_localeLang_localeCountry_localeVariant
      bundle_localeLang_localeCountry
      bundle_localeLang
      bundle_defaultLang_defaultCountry_defaultVariant
      bundle_defaultLang_defaultCountry
      bundle_defaultLang
      bundle

- If there's no matching resource bundle for the target language, neither a
  default resource bundle, then the application throws a
  `MissingResourceException` at runtime.

**Formatting dates, numbers, and currencies for locales:**

- Format currency

      NumberFormat numberFormat = NumberFormat.getCurrencyInstance(Locale.FRANCE);
      assertThat(numberFormat.format(10000L)).isEqualTo("10 000,00 €");

- Format date using `DateFormat`

      DateFormat dateFormat = DateFormat.getDateInstance(DateFormat.MEDIUM, Locale.US);
      assertThat(dateFormat.format(date)).isEqualTo("Nov 26, 2017");

- Format date using `SimpleDateFormat`

      SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss.SSSZ");
      assertThat(iso.format(date)).isEqualTo("2017-11-26T10:15:49.000+0000");

- Create a `Calendar`:

      private static Calendar newCalendar() {
        Calendar calendar = Calendar.getInstance(Locale.US);
        calendar.set(2017, Calendar.NOVEMBER, 26, 10, 15, 49);
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.setTimeZone(TimeZone.getTimeZone("UTC"));
        return calendar;
      }

## Frequently Asked Java API

Method | Return Type | Checked Exception
:----- | :---------: | :----------------
`Thread#sleep()` | void | `InterruptedException`
`Runnable#run()` | void | -
`Callable#call()` | V | `Exception`
`RecursiveAction#compute()` | void | -
`RecursiveTask#compute()` | V | -
`Predicate#test(T)` | boolean | -
`Consumer#accept(T)` | void | -
`Supplier#get()` | T | -
`Function#apply(T)` | R | -

## Tricky points

Some tricky points that can happen in OCP exam.

- The method name can be mis-spelled. For example, `hashcode()` is _not_ the
  correct method for providing a hash-code in Java. The correct one is
  camel-case: `hashCode()`.
- The default locale defined in JVM might not be `Locale.US`.
- Be careful whether the method output is assigned to a variable, e.g.
  `String#replaceAll(String, String)` returns another string.

## References

- [CodeRanch - The new state][coderanch]
- [artima - Thread synchronization][artima]

[assertion-error]: https://docs.oracle.com/javase/8/docs/api/java/lang/AssertionError.html
[artima]: https://www.artima.com/insidejvm/ed2/threadsynch.html
[coderanch]: https://coderanch.com/t/616837/certification/state
[ocp]: https://www.manning.com/books/ocp-java-se-7-programmer-ii-certification-guide
[java8]: https://www.manning.com/books/java-8-in-action
[jls-4.12.4]: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.12.4
