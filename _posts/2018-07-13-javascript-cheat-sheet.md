---
layout:      post
title:       "JavaScript Cheat Sheet"
date:        "2018-07-13 21:17:11 +0200"
categories:  [javascript, study-note]
comments:    true
---

I started writing JavaScript this week. There're many funny points during the
implementation. I decide to write them down and share with you. For the
demonstration purpose, the Chrome DevTool is used.

<!--more-->

## Variable Declaration

Normal variable:

{% highlight javascript %}
var a = 1;             // typeof(a): "number"
var b = Number(1);     // typeof(b): "number"
var c = new Number(1); // typeof(c): "object"
{% endhighlight %}

Constant variable:

{% highlight javascript %}
const SECRET = 'whatever';
SECRET = 'hacked?';
// Uncaught TypeError: Assignment to constant variable.
{% endhighlight %}

## Class

**Define a new class.** You can define input parameters for constructor (1);
define a computed variable in constructor (2). An instance method such as
`toEmail()` (3). In an instance method, when referencing an instance
variable, you must use the keyword `this` — it cannot be omitted.

{% highlight javascript %}
class User {
  constructor(firstName, lastName) { // 1
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = firstName + ' ' + lastName; // 2
  }

  toEmail() { // 3
    var s = this.firstName + '.' + this.lastName; // 4
    return s.toLowerCase() + '@example.com';
  }
}
{% endhighlight %}

**Instantiate an class object.**

{% highlight javascript %}
var u = new User('Foo', 'BAR');
{% endhighlight %}

**Query instance members.** Instance variable are accessible using the following
syntax. Method can be called in similar way, however, don't forget the
parentheses "`()`":

<pre>
instance.<i>variable</i>
instance.<i>method()</i>
</pre>

{% highlight javascript %}
console.log(u.firstName); // "Foo"
console.log(u.lastName);  // "BAR"
console.log(u.fullName);  // "Foo BAR"
console.log(u.toEmail()); // "foo.bar@example.com"
console.log(u.toEmail));
// f toEmail() {
//     var s = this.firstName + '.' + this.lastName;
//     return s.toLowerCase() + '@example.com';
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

## References

- [MDN: Comparison operators][1]
- [MDN: Array.prototype.forEach()][2]
- [MDN: for...of][3]
- [MDN: Classes][4]

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
[3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
