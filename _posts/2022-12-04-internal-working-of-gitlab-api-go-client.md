---
layout:              post
type:                classic
title:               Internal Working of GitLab API Go Client
subtitle:            >
    How does this SDK work and what can we learn from it?

lang:                en
date:                2022-12-04 10:23:14 +0100
categories:          [java-rest]
tags:                [go, api, system-design]
ads_tags:            [ci, test]
comments:            true
excerpt:             >
    The internal working of the GitLab API Go Client (xanzy/go-gitlab),
    including domain sub-clients, serialization, error mapping, testing, CI,
    advanced features, and more.

image:               /assets/bg-drmakete-lab-hsg538WrP0Y-unsplash.jpg
cover:               /assets/bg-drmakete-lab-hsg538WrP0Y-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

During my daily work at Datadog, I had the chance to use the GitLab Go API
client ([xanzy/go-gitlab](https://github.com/xanzy/go-gitlab)) to interact with
our GitLab server. I feel like that the library is well written and I want to learn
how to write a library in the same way. That's why I spent some time to study
its source code and I would like to share with you today. After reading this
article, you will understand:

- The structure of the Go package
- The HTTP request and response
- Its dependencies
- The CI pipeline
- Its advanced features
- Publishing the documentation

Now, let's get started!

## Section 1

## Section 2

## Section 3

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
