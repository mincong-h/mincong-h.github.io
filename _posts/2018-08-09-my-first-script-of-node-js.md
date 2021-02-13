---
layout:            post
title:             My First Script in Node JS
date:              2018-08-09 20:25:41 +0200
categories:        [tech]
tags:              [javascript, node]
comments:          true
image:             /assets/logo-nodejs.png
cover:             /assets/logo-nodejs.png
excerpt:           >
    The basics of creating a script in Node.JS, including execution syntax,
    dependency declaration, arguments, template literals, iterations and
    promises for asynchronous operations.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

I recently created my first script in Node JS, which automates user creation on
a Nuxeo server. I'd like to share my experience about it. Objective of this blog
is to let you understand what are the basic things we need to know when using
Node JS.

<h2 id="execution-syntax">How execution looks like?</h2>

Before implementing the script, you need to understand how the script will be
executed. A Node JS script can be executed from command line as follows:

{% highlight shell %}
node awesome.js [ args... ]
{% endhighlight %}

## Dependency Declaration

When using a new dependency, you need to declare it in the `package.json` file.
There're several ways to declare it: if it's a normal dependency, declare it
in the _"dependencies"_ node; if it's a development dependency, declare it in
the _"devDependencies"_ node. More explanation about them, see [StackOverflow -
What's the difference between dependencies, devDependencies and peerDependencies
in npm package.json file?][1] For example, using library _"prompt"_ can be
declared as follows:

{% highlight javascript %}
"dependencies": {
  "prompt": "^1.0.0"
}
...
{% endhighlight %}

After having declared your new dependencies, you can do a `npm install` to
install them. The dependencies will then installed into the `node_modules`
directory. If you don't understand expression _"^1.0.0"_, take a look at [Npm
semver calculator][2]: it can do the calculation for you.

<h2 id="arguments">Using Arguments</h2>

Arguments are important because they allow user to provide data dynamically.
Arguments are handled by `process.argv`, which is an array. Use it to check
whether user provides correct number of arguments, and consume arguments. Note
that `node` is the first argument (index=0), your script is the 2nd argument
(index=1), so user arguments start at index 2.

{% highlight javascript %}
// Check arguments length
if (process.argv.length !== 3) {
  console.error(`Invalid number of arguments. Usage:
    node create-users.js <NUM_TESTERS>`);
    return 1;
}
// Retrieve argument
let numTesters = process.argv[2];
{% endhighlight %}

## Template Literals

Template literals are string literals allowing embedded expressions. You can use
multi-line strings and string interpolation features with them. For example,
create a username using variable `i`:

{% highlight javascript %}
let username = `user-${i}`;
{% endhighlight %}

For more detail, see [MDN: Template literals][3].

<h2 id="iteration">Iteration: For-Loop, ForEach, and Map</h2>

When doing automation in script, a collection of elements is often used: a map,
an array, a set, etc. It's important to understand how to iterate over these
objects. There're 3 major ways to do it: using a for-loop statement, the
forEach() method, or the map() method.

For loop:

{% highlight javascript %}
// index
for (var i = 0; i < items.length; i++) { ... }

// no index
for (var item of items) { ... }
{% endhighlight %}

Method forEach():

{% highlight javascript %}
items.forEach(item => {
  // consume each item,
  // no returned value
  console.log(item);
});
{% endhighlight %}

Method map():

{% highlight javascript %}
// transform a given object to another
ids = items.map(item => item.id);
{% endhighlight %}

## Promises

The [Promise][7] object represents the eventual completion (or failure) of an
asynchronous operation, and its resulting value. Since it's asynchronous, we
need to have a clear timeline in our head, and be very careful about the
implementation.

In my script, user creations are HTTP requests, represented as a collection of
promises. I use `Promise.all()` to group all the creation promises together, and
consider them as a single promise. This single promise is resolved when all the
user creations have been resolved. As for failure, Promise.all() fails fast—it
rejects with the reason of the first promise that rejects.

{% highlight javascript %}
let deletions = ids.map(id => {
  return nuxeo.users()
      .delete(id);
      .then(resp => { ... })
      .catch(e => { ... });
});

console.log('Delete existing testers...');
Promise.all(deletions)
   .then(() => { ... })
   .then(() => { ... })
   .catch(e => console.log(`Promise.all failed: ${e}`));
{% endhighlight %}

## Conclusion

In this post, we talked about the basics of creating a simple script in Node.JS,
including execution syntax, dependency declaration, using arguments,
template literals, different iterations and promises for asynchronous
operations. Hope you enjoy this post, see you next time.

## References

- [StackOverflow: What's the difference between dependencies, devDependencies
  and peerDependencies in npm package.json file?][1]
- [Npm semver calculator][2]
- [MDN: Template literals][3]
- [MDN: Map.prototype.forEach()][4]
- [MDN: Set.prototype.forEach()][6]
- [MDN: Array.prototype.forEach()][5]
- [MDN: Promise][7]
- [MDN: Promise.all()][8]

[1]: https://stackoverflow.com/questions/18875674/whats-the-difference-between-dependencies-devdependencies-and-peerdependencies
[2]: https://semver.npmjs.com/
[3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
[6]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach
[7]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[8]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
