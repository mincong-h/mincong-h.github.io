---
layout:            post
title:             "Create Element with Polymer 2"
lang:                en
date:              2018-07-16 21:31:12 +0200
date_modified:     2018-07-27 12:30:34 +0200
categories:        [tech]
tags:              [javascript, polymer, dom]
permalink:         /2018/07/16/first-element-with-polymer-2/
comments:          true
excerpt:           >
    Want to create your first web element with Polymer 2? This post provides
    a step-by-step tutorial for you: Polymer CLI, useful websites, Polymer
    element's structure, dependency management, AJAX request and more.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

<p align="center">
  <img src="{{ site.url }}/assets/logo-polymer.png"
       style="max-width:100px; width:100%; margin-top: 30px;"
       alt="Polymer Logo">
</p>

Today I'd like to share how I created my first element with Polymer 2. This post
covers the following topics:

- [Create a new element using Polymer CLI](#init-polymer-element)
- [Useful resources for development](#useful-resources)
- [Understand Polymer element](#understand-polymer-element)
- [Handle and fire events](#events)
- [Dependency management](#dependency-management)
- [AJAX request](#ajax-request) <small style="color: #AAA">(advanced)</small>

Before getting started, you need to ensure you've npm, bower and Polymer CLI
installed in your machine. For example, in Mac OS:

```
brew install node
npm install -g polymer-cli@1.6.0
npm install -g bower@1.8.4
```

I fixed the version of Polymer and bower to adapt Nuxeo's requirement. However,
you might want to adjust them, or simply take the latest version.

## Init Polymer Element

Initialize a Polymer element using Polymer CLI:

```
$ polymer init
```

It will ask you _"Which starter template would you like to use?"_, you can
choose:

- polymer-2-element - A simple Polymer 2.0 element template
- polymer-2-application - A simple Polymer 2.0 application
- polymer-2-starter-kit - A Polymer 2.x starter application template, with
  navigation and "PRPL pattern" loading
- shop - The "Shop" Progressive Web App demo

I chose _polymer-2-element_. Once chosen, Polymer CLI will run `bower install`
for you to install the required dependencies. Now, you can start the development
using polymer-serve:

```
polymer-demo $ polymer serve
info:    Files in this directory are available under the following URLs
      applications: http://127.0.0.1:8081
      reusable components: http://127.0.0.1:8081/components/polymer-demo/
```

## Useful Resources

**Web components** (<https://www.webcomponents.org/>) are a set of web platform
APIs that allow you to create new custom, reusable, encapsulated HTML tags to
use in web pages and web apps. Custom components and widgets build on the Web
Component standards, will work across modern browsers, and can be used with any
JavaScript library or framework that works with HTML. You can find the elements
you want on this website, see its documentation, demos, dependencies, and its
popularity. It helps you to measure how close a component fits your requirement.

- documentation
- demos
- dependencies
- popularity

**MDN Web APIs** (<https://developer.mozilla.org/en-US/docs/Web/API>). When writing
code for the Web with JavaScript, there are a great many APIs available. MDN
provides a list of all the interfaces (that is, types of objects) that you may
be able to use while developing your Web app or site.

- documentation
- demos
- browser supports

## Understand Polymer Element

Once you've create the structure of a Polymer Element, you will want to
understand how it works. This sections describes how to do it using your browser
console (I'm taking Chrome as example).

### Inspect Elements

You can inspect the elements inside the shadow DOM. The
source code is available in browser console:

{% highlight html %}
<polymer-demo>
  #shadow-root (open)
  <style>
    :host {
      display: block;
    }
  </style>
  <h2>Hello polymer-demo!</h2>
</polymer-demo>
{% endhighlight %}

### Query Shadow DOM

You can test you element by querying its shadow DOM.
This is also done in the browser console:

{% highlight javascript %}
$('polymer-demo').shadowRoot
{% endhighlight %}

Query host property `prop1`:

{% highlight javascript %}
$('polymer-demo').shadowRoot.root.prop1
// polymer-demo
{% endhighlight %}

Query local DOM style sheets:

{% highlight javascript %}
$('polymer-demo').shadowRoot.styleSheets
// StyleSheetList {0: CSSStyleSheet, length: 1}
{% endhighlight %}

More information can be found on [MDN: ShadowRoot - Web APIs][1].

### Automatic Node Binding

Polymer automatically builds a map of statically created instance nodes in its
local DOM, to provide convenient access to frequently used nodes without the
need to query for them manually. Any node specified in the element's template
with an id is stored on the `this.$` hash by `id`.

For example, given the following template:

{% highlight html %}
<template>
  <p id="description">Hello Polymer.</p>
</template>
{% endhighlight %}

You can find the description inside the local DOM:

{% highlight javascript %}
this.$.description.textContent;
{% endhighlight %}

Or outside the local DOM, such as in browser console:

{% highlight javascript %}
$('polymer-demo').$.description.textContent;
// "Hello Polymer."
{% endhighlight %}

## Events

Elements use events to communicate state changes up the DOM tree to parent
elements. Polymer elements can use the standard DOM APIs for creating,
dispatching, and listening for events. Polymer also provides annotated event
listeners, which allow you to specify even listeners declaratively as part of
the element's DOM template.

To add even listener to local DOM children, user `on-<event>` annotatons in your
template:

<pre class="highlight">
<span class="nt">&lt;myElement <span class="na">on-<b>myEvent</b>=</span><span class="s">"myFunc"</span>&gt;</span>
<span>  ...</span>
<span class="nt">&lt;/myElement&gt;</span>
</pre>

Then write a function the handle such event in your element:

{% highlight javascript %}
class MyElement extends Polymer.Element {
  myFunc(myEvent) { ... }
}
{% endhighlight %}

_But, which events can I use?_

There're several resources that can help you. Firstly, [MDN: Event
reference][8]. This article offers a list of events that can be sent; some are
standard events defined in official specifications, while others are events used
internally by specific browsers. Secondly, check the JSDoc of the target element
(or its parent element), all the events are document as `@event`. For example,
the
[iron-overlay-behavior](https://www.webcomponents.org/element/PolymerElements/iron-overlay-behavior),
it has events `iron-overlay-opened`, `iron-overlay-canceled`, and
`iron-overlay-closed`:

{% highlight javascript %}
/**
 * Fired after the overlay opens.
 * @event iron-overlay-opened
 */

/**
 * Fired when the overlay is canceled, but before it is closed.
 * @event iron-overlay-canceled
 * ...
 */

/**
 * Fired after the overlay closes.
 * @event iron-overlay-closed
 * ...
 */
{% endhighlight %}

For more detail, see [Polymer 2.0 - Handle and fire events][7].

## Dependency Management

Polymer CLI 1.6 uses Bower for dependency management. You need to declare your
dependencies in `bower.json`. There're two kinds of dependencies: `dependencies`
and `devDependencies`.

- `devDependencies` are for the development-related scripts, e.g. unit testing,
  packaging scripts, documentation generation, etc.
- `dependencies` are required for production use, and assumed required for dev
  as well.

The structure of `bower.json` file, generated by Polymer CLI, is as follows. You
can add new dependency to either dependencies or devDependencies based on your
need.

{% highlight json %}
{
  "name": "polymer-demo",
  "main": "polymer-demo.html",
  "dependencies": {
    "polymer": "Polymer/polymer#^2.0.0"
  },
  "devDependencies": {
    "iron-demo-helpers": "PolymerElements/iron-demo-helpers#^2.0.0",
    "web-component-tester": "Polymer/web-component-tester#^6.0.0",
    "webcomponentsjs": "webcomponents/webcomponentsjs#^1.0.0"
  },
  "resolutions": {
    "polymer": "^2.0.0"
  }
}
{% endhighlight %}

New developers (like me) might feel difficult to understand the semantic
versioning of npm — for example `^2.0.0`, or `~2.2`. The best way to start is to
use npm semver calculator (<https://semver.npmjs.com/>), which provides concrete
examples for you.

---

The following sections are advanced configurations.

## AJAX Request

**Proxy in Polymer CLI.** When developing AJAX in element with Polymer CLI, you
need to provide a proxy to redirect all requests. Use `--proxy-path` to define
the top-level path that should be redirected to the proxy-target. e.g.
`api/v1` when you want to redirect all requests of <https://localhost/api/v1/>;
use `--proxy-target` to define host URL to proxy to:

```
$ polymer serve \
  --proxy-path='api/v1' \
  --proxy-target='https://localhost:8080/api/v1/'
```

## References

- [MDN: ShadowRoot - Web APIs][1]
- [MDN: Node.textContent][6]
- [MDN: Event reference][8]
- [Polymer 2.x Cheat Sheet][2]
- [Polymer 1.0: Local DOM » Automatic node finding][5]
- [Polymer 2.0: Handle and fire events][7]
- [Stack Overflow: Bower and devDependencies vs dependencies][3]
- [npm semver calculator][4]

[2]: https://meowni.ca/posts/polymer-2-cheatsheet/
[1]: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
[3]: https://stackoverflow.com/questions/19339227/
[4]: https://semver.npmjs.com/
[5]: https://www.polymer-project.org/1.0/docs/devguide/local-dom#node-finding
[6]: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
[7]: https://www.polymer-project.org/2.0/docs/devguide/events
[8]: https://developer.mozilla.org/en-US/docs/Web/Events
