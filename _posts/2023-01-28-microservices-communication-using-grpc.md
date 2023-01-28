---
article_num:         209
layout:              post
type:                classic
title:               Microservices Communication using gRPC
subtitle:            >
    gRPC, a high performance, open source universal RPC framework.

lang:                en
date:                2023-01-28 10:38:40 +0100
categories:          [microservices]
tags:                [microservices, system-design, grpc]
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

Inter-process communication (IPC) refers to the mechanisms an operating system provides to allow processes to communicate with each other. Different forms of IPC include pipes, message queues, semaphores, and shared memory. These mechanisms enable processes to share data, synchronize their actions, and communicate with each other in a coordinated manner. Inside a microservices architecture, diffrent service instances are typically running on different machines, which requires remote communication. That's why it's important to understand different types of interaction styles in such this scenario. In this article, we are going to explore gRPC, one of the commonly used framework for such communication.

After reading this article, you will understand:

- What are the different communication styles
- What is gRPC
- Service definition using Protocol Bufferes (protobuf)
- gRPC compiler for code generation
- gRPC lifecycle
- gRPC tools to help troubleshooting
- Real-world scenarios using gRPC in microservices architecture
- Comparison to RESTful API
- How to go further from here

Now, let's get started!

## Communication Styles

Before talking about gRPC, we need to see the big picture of microservices communication, to better understand in which cases can gRPC fit. The communication styles can mainly grouped into two dimensions: the service relationship and the synchronization.

When a service sends a message, the message can be either received by one or multiple services.

* One-to-one -- Each request is processed by exactly one service.
* One-to-many -- Each request is procssed by multipl services.

And the message can be handled differently:

* Synchronous -- The sender expects a timely response from the receiver and might event block while it waits.
* Asynchronous -- The sender does not block and the response is optional. If it is present, it does not need to be sent immediately.

In the book "Microservices Patterns" of Chris Richardson, he made an excellent table about these two dimensions:

Synchronization | one-to-one | one-to-many
------------ | ---------- | -----------
Synchronous  | Request/esponse | -
Asynchronous | Asyncrhounous request/response<br>One-way notifications | Publish/subscribe<br>Publish/async response

For gRPC, it's typically useful for one-to-one communication. It supports both synchronous or asynchronous style. But it does not fit the one-to-many needs, which requires a message queue and a subscription mechanism to concume the message sent.

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

- Chris Richardson, _"Microservices Patterns"_, ISBN: 9781617294549, Manning Publications Co.
