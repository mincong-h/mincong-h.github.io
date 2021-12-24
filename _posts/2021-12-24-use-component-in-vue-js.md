---
layout:              post
type:                Q&A
title:               Using Component in Vue.js
subtitle:            >
    Avoid having thousands of lines of code in a single file.

lang:                en
date:                2021-12-24 08:05:27 +0100
categories:          [frontend]
tags:                [javascript, vuejs, vuejs2]
ads_tags:            []
comments:            true
excerpt:             >
    Your vue file is getting big? This Q&A explains how to use component in
    Vue.js by extracting logic from your existing page.

image:               /assets/vuebigwhite.png
cover:               /assets/vuebigwhite.png
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Question

My `*.vue` files are getting bigger and bigger. It's hard to maintain. I would
like to split the file and move part of the structure (HTML) and the logic
(JS) to another location. Is it possible?

## Answer

You can do that by using components. You can extract part of the structure from
the original vue file to a new file and then import the component again into
the original one. Let's say we have two files:

* `my-page.vue` -- the main page that contains most of the logic and
  it's getting big, probably 1000+ lines of code.
* `my-component.vue` -- the new component that you are creating

First of all, you need to declare the structure in the component file. The
component should contain the HTML structure in the `template` section and the
logic in the `script` section. The logic usually contains the properties
(`props`), which are the fields passed from the main page when creating the
component; the `data` fields that are present during the lifecycle of the
component; the methods that are used for operating the template, such as loading
resources from the backend via RESTful APIs, methods for displaying or hiding
certain blocks, etc.

```html
<template>
  <!-- TODO Add content for your resource (component) here -->
</template>

<script>
export default {
  props: {
    resourceId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      resource: null
    }
  },
  methods: {
    loadResource() {
       // TODO Implement async HTTP call here
    }
  }
}
</script>

<style>
// CSS goes here
</style>
```

Then you need to import and use the new component in your main page.

```html
<template>
  <div>
    <!--
      Use the component here.

      The property "resourceId" becomes kebab case: "resource-id"
    -->
    <my-component resource-id="foo">

    <!-- ... -->
  </div>
</template>
<script>
import MyComponent from "@/path/to/my-component.vue"

export default {
  components: { MyComponent },
  props: { ... },
  methods: { ... },
}
</script>

<style>
// CSS goes here
</style>
```

Using components has many benefits. Some of them are:

* Having clear input parameters for an element
* Making logic easy to understand, i.e. avoid having huge files
* Making tests easy
* Re-use the same component in multiple pages

## Going Further

How to go further from here?

- Read the official [Style Guide](https://vuejs.org/v2/style-guide/) provided by
  Vue.js to learn the best practices about this framework.

Hope you enjoy this article, see you the next time!
