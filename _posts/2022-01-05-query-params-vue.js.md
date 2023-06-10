---
article_num: 197
layout:              post
type:                Q&A
title:               Adding Query Parameters in Vue.js
subtitle:            >
    How to make URL sharing easier?

lang:                en
date:                2022-01-05 21:48:43 +0100
categories:          [frontend]
tags:                [javascript, vuejs, vuejs2]
comments:            true
excerpt:             >
    What to have better URL for sharing? This Q&A shares how to retrieve query
    parameters in Vue.js, how to update component data using it, and vise versa.

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

I have a web page in Vue.js and I would like to expose some of the parameters in
URL as query parameters. How can I do that? The idea is to make URL sharing more
user-friendly, where some states of the page are visible: query string for
search, filters, pagination, etc.

```
http://localhost:8080/#/shop?product=banana
```

## Answer

Let's take "product filter" as an example, where the query parameter is called
`product` and internally, the variable for the filter in the vue component is
called `productFilter`. Let's see how to retrieve the value from query
parameters; how to update the component data
`productFilter` using the query parameter; and how to update the query parameter
using the component data `productFilter`.

### Retrieve Parameter

You can access to a `$route` object from your components, which exposes what you
need:

```js
this.$route.query.product  // "banana"
```

### Update Component Data

When loading the component, user already provided the query parameters. In this
case, we need to update the data (`data`) of the component so that the query
parameters are taken into account in the internal state. This can be done when
the component is mounted (`mounted`).

```html
<script>
export default {
  mounted() {
    // update data when mounting the component
    if ("product" in this.$route.query) {
      this.productFilter = this.$route.query.product
    }
  },
  data() {
    return {
      productFilter: null  // no filter by default
    }
  },
  ...
}
</script>
```

### Update Query Params

When the component is updated after an event (user clicks a button, enters some
characters in the search query...), we need to ensure that our query parameters are
updated as well. This can be done using:

```html
<script>
import _ from "lodash"

export default {
  ...
  methods: {
    updateQueryParams() {
      const query = {}
      if (this.productFilter != null) {
        query.product = this.productFilter
      }
      // handle more query parameters here ...

      // Avoid "Error: Avoided redundant navigation to current location"
      // https://stackoverflow.com/questions/62462276
      if (!_.isEqual(this.$route.query, query)) {
        this.$router.push({ name: "aComponent", query: query })
      }
    }
  }
}
</script>
```

## Going Further

How to go further from here?

- Vue Router is the official router for Vue.js. To better understand Vue Router,
  visit their [official website](https://router.vuejs.org/).
- To better understand the lifecycle of the vue component, visite the "Lifecycle
  Diagram" in [The Vue Instance](https://vuejs.org/v2/guide/instance.html).

Hope you enjoy this article, see you the next time!
