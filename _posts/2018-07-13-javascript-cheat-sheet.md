---
layout:             post
title:              JavaScript Cheat Sheet
lang:                en
date:               2018-07-13 21:17:11 +0200
date_modified:      2018-07-24 17:17:38 +0200
categories:         [tech]
tags:               [javascript, study-note]
permalink:         /2018/07/13/javascript-cheat-sheet/
comments:           true
excerpt:            >
    A simple JS cheat sheet for newbies, containing the basic syntax of commonly
    used statements: variable, class, array, JSON, ...
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

In this post, I'll share the basic syntax that I used during the my work. For
the demonstration purpose, the Chrome DevTool (v67.0) is used.

## Variable Declaration

**Variable.** The `var` statement declares a variable, optionally initializing
it to a value:

{% highlight javascript %}
var a = 1;             // typeof(a): "number"
var b = Number(1);     // typeof(b): "number"
var c = new Number(1); // typeof(c): "object"
{% endhighlight %}

**Constant.** The `const` declaration creates a _read-only_ reference to a
value. The value of a constant cannot change through re-assignment, and it
cannot be redeclared:

{% highlight javascript %}
const SECRET = 'whatever';
SECRET = 'hacked?';
// Uncaught TypeError: Assignment to constant variable.
{% endhighlight %}

## Class

**Define a new class.** You can 1) define input parameters for constructor;
2) define a computed variable in constructor; 3) define an instance method such
as `toEmail()`;  In an instance method, when referencing an instance
variable, you must use the keyword `this` — it cannot be omitted.

{% highlight javascript %}
class User {
  constructor(name, age) { // 1
    this.name = name;
    this.age = age;
    this.username = name + '_' + age; // 2
  }

  getLabel() { // 3
    return this.name + ' (' + this.age + ')';
  }
}
{% endhighlight %}

There can be **only one** method called `constructor` in a class. Having more
than one occurence will throw a `SyntaxError` error.

**Instantiate a class instance.**

{% highlight javascript %}
var u = new User('Foo', 10);
{% endhighlight %}

**Query instance members.** Instance variables are accessible using the following
syntax. Method can be called in similar way, however, don't forget the
parentheses "`()`":

<pre>
instance.<i>variable</i>
instance.<i>method()</i>
</pre>

{% highlight javascript %}
console.log(u.name); // "Foo"
console.log(u.age);  // 10
console.log(u.getLabel());  // "Foo (10)"
console.log(u.getLabel));
// f getLabel() {
//     return this.name + '( ' + this.age + ')';
//   }
{% endhighlight %}

## Comparison Operators

**Equality (`==`).** The equality operator converts the operands if they are not
of the same type, then applies strict comparison. If both operands are objects,
then JavaScript compares internal references which are equal when operands
refer to the same object in memory.

**Identity / strict equality (`===`).** The identity operator returns true if
the operands are strictly equal _with no type conversion_.

{% highlight javascript %}
1 == 1    // true
1 == '1'  // true
1 === '1' // false
1 === 1   // true
{% endhighlight %}

## Array

**Create an array.**

{% highlight javascript %}
var arr = [1, 2];
{% endhighlight %}

**Iterate an array.** There're many ways to achieve this:

1. A simple loop
2. A _for...of_ loop
3. _Array.prototype.forEach()_

{% highlight javascript %}
var arr = [1, 2];

// A simple loop
for (var i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// for...of (ECMAScript 6)
for (i of arr) {
  console.log(i);
}

// Array.prototype.forEach() (ECMAScript 5)
arr.forEach(i => console.log(i));
{% endhighlight %}

**Add an element to array.**

{% highlight javascript %}
var arr = [1, 2];
arr.push(3);
// (3) [1, 2, 3]
{% endhighlight %}

**Remove an element from array.** Note that we can only remove the last one:

{% highlight javascript %}
var arr = [1, 2];
arr.pop(); // 2
// [1]
{% endhighlight %}

**Function map().** Use `map()` to create a new array from the
existing one:

{% highlight javascript %}
var users = [{id: 1}, {id: 2}];
var ids = users.map(u => u.id);
// (2) [1, 2]
{% endhighlight javascript %}

**Sorting.** Sort by natural order, by numeric value, by string:

{% highlight javascript %}
// natural order
[1, 3, 2].sort();
// (3) [1, 2, 3]

// numeric order
[{v:1},{v:3},{v:2}].sort((a, b) => a.v - b.v);
// (3)
// 0: {v: 1}
// 1: {v: 2}
// 2: {v: 3}

// alphabetical order
[{v:'b'},{v:'a'}].sort((a, b) => a.v.localeCompare(b.v));
// (2)
// 0: {v: "a"}
// 1: {v: "b"}
{% endhighlight %}

## Serialization

`JSON.stringify()` allows you to serialize an instance to string.

{% highlight javascript %}
JSON.stringify({ id: 1, v: "2" });
// "{"id":1,"v":"2"}"
{% endhighlight %}

`JSON.parse()` allows you to deserialize a string into an instance.


{% highlight javascript %}
JSON.parse('{"id":1,"v":"2"}');
// {id: 1, v: "2"}
{% endhighlight %}

## References

- [MDN: Comparison operators][1]
- [MDN: Array.prototype.forEach()][2]
- [MDN: for...of][3]
- [MDN: Classes][4]
- [MDN: JSON][5]

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
[3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
