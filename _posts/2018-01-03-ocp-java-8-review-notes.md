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
  non-access modifier, but they cannot be defined with _only_ a change in
  their return types or access or non-access modifiers.
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
  <sup>[1]</sup>
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
  interface.<sup>[2]</sup>
- You cannot define an enum local to a method.<sup>[3]</sup>

<sup>[2],[3]</sup> Example:

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
~ $ javac Outer.java App.java
~ $ java App
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

## Generics and Collections

**Creating generic entities:**

- Java's naming conventions limit the use of _single uppercase_ letters for type
  parameters. Though not recommended, using any valid identifier name for type
  parameters is acceptable code.
- When a non-generic class extends a generic class, the derived class doesn't
  define any type parameters but passes arguments to all type parameters of its
  generic base class.

// TODO...

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

[ocp]: https://www.manning.com/books/ocp-java-se-7-programmer-ii-certification-guide
[java8]: https://www.manning.com/books/java-8-in-action
[jls-4.12.4]: https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.12.4
