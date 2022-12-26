---
article_num:         209
layout:              post
type:                classic
title:               Go Http Server Example
subtitle:            >
    How to create a simple HTTP server in Go?

lang:                en
date:                2022-12-26 15:42:24 +0100
categories:          [java-rest, microservices]
tags:                [go, microservices]
ads_tags:            []
comments:            true
excerpt:             >
    TODO

image:               /assets/mountain/krzysztof-kowalik-_HLLHiD9Ik4-unsplash.jpg
cover:               /assets/mountain/krzysztof-kowalik-_HLLHiD9Ik4-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

Choosing Go as the programming language for your backend service is a common choice.
In this article, we will see how to implement an HTTP server for RESTful API in Go.
Today, we will visit some simple Go HTTP servers and see how are they implemented.

After reading this article, you will understand:

* The 3-tier architecture (presentation, application, data tier)
* How to build the RESTful tier
* How to build the application (business) tier
* How to build the data tier
* How to package everything as a Go application

Now, let's get started!

## Three-Tier Architecture

A three-tier architecture is commonly used by web application. As the name indicates, there are three tiers
in this architecture: the presentation tier, the application (business) tier, and the data tier.

* **The presentation tier** displays information to the client. In the case of a web application, this can
  be the HTTP requests and the responses provided by the web application.
* **The application (business) tier** implements the logic related to the application, it processes commands,
  queries data models, performs calculations, assembles results and return to the presentation layer. It interacts
  with both the presetnation tier and the data tier.
* **The data tier** connects to a data storage, usually a database, a file system, or a cloud storage. In any
  case, the information retrieved is passed back to the logic tier for processing.

Wikipedia has an excellent diagram to discribe their relationship in the page [Multitier Architecture](https://en.wikipedia.org/wiki/Multitier_architecture):

<img
  src="https://upload.wikimedia.org/wikipedia/commons/5/51/Overview_of_a_three-tier_application_vectorVersion.svg"
  alt="Overview of a three-tier application"
  style="width: 100%"
/>

Now we understand the 3-tier architecture, we can bring these concepts to Go and see how are they applied in the code.

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

* <https://en.wikipedia.org/wiki/Multitier_architecture>
* <https://en.wikipedia.org/wiki/Microservices>
* <https://yourbasic.org/golang/http-server-example/>
* <https://gobyexample.com/http-servers>
* <https://stackoverflow.com/questions/12429729/controller-belongs-to-the-presentation-layer>
