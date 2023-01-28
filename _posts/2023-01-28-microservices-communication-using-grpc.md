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

* **One-to-one** -- Each request is processed by exactly one service.
* **One-to-many** -- Each request is procssed by multipl services.

And the message can be handled differently:

* **Synchronous** -- The sender expects a timely response from the receiver and might event block while it waits.
* **Asynchronous** -- The sender does not block and the response is optional. If it is present, it does not need to be sent immediately.

In the book "Microservices Patterns" of Chris Richardson, he made an excellent table about these two dimensions:

Synchronization | one-to-one | one-to-many
------------ | ---------- | -----------
Synchronous  | Request/esponse | -
Asynchronous | Asyncrhounous request/response<br>One-way notifications | Publish/subscribe<br>Publish/async response

For gRPC, it's typically useful for one-to-one communication. It supports both synchronous or asynchronous style. But it does not fit the one-to-many needs, which requires a message queue and a subscription mechanism to concume the message sent.

## gRPC

gRPC is a modern open source high performance Remote Procedure Call (RPC) framework that can run in any environment. It can efficiently connect services in and across data centers with pluggable support for load balancing, tracing, health checking and authentication. It is also applicable in last mile of distributed computing to connect devices, mobile applications and browsers to backend services.

Below is a diagram provided by the [official website of gRPC](https://grpc.io/docs/what-is-grpc/introduction/), which demonstrates how the gRPC server interacts with other clients. On the server side, the service implements the service methods and runs a gRPC server to handle the requests coming from different clients; on the client side, the client has a stub, which provides the same methods as the server. Note that gRPC is language agnostic: you can implement the server and clients in different languages and it can still work fine. gRPC contains plugins to generate the related stub or base implementations for different languages. In the example below, the server is implemented in C++ while the clients are implemented in Ruby and Android-Java.

<p align="center">
  <img src="/assets/grpc-overview.svg"
       alt="gRPC overview from https://grpc.io/docs/what-is-grpc/introduction/">
</p>

## Service Definition in Proto Buffers

Proto Buffers (protobuf) is a mature mechanism for serializing structured data, developed by Google. In the context of gRPC, it is used to define the API contracts shared between the server and the clients. It defines the structure of the messages, the RPC methods, and some information around the package. This information is described inside a proto file: an ordinary text file with a `.proto` extension. Here is an example:

```proto
message Person {
  string name = 1;
  int32 id = 2;
  bool has_ponycopter = 3;
}
```

## Section 3

## Going Further

How to go further from here?

* Protobuf formatting using Buf, visit blog post ["Introducing buf format"](https://buf.build/blog/introducing-buf-format)

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Chris Richardson, _"Microservices Patterns"_, ISBN: 9781617294549, Manning Publications Co.
- gRPC authors, ["Introduction to gRPC"](https://grpc.io/docs/what-is-grpc/introduction/), gRPC, 2023.