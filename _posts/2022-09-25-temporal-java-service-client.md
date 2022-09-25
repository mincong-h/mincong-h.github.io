---
layout:              post
type:                classic
title:               Internal Working of Temporal Java Service Client
subtitle:            >
    The module structure, APIs in protobuf, code generation, data conversion,
    authorization, and more.

lang:                en
date:                2022-09-25 08:38:43 +0200
categories:          [temporal]
tags:                [temporal, java, grpc]
ads_tags:            [api]
comments:            true
excerpt:             >
    TODO
image:               /assets/bg-1920px-Messier51_sRGB.jpeg
cover:               /assets/bg-1920px-Messier51_sRGB.jpeg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

The service client of Temporal is the key component for talking to the Temporal
server, it's built on top of gPRC. Today, I want to discuss the
internal working of Temporal service client with you so that we can better
understand how does it work, help us for troubleshooting, and get some
inspiration for similar implementations.

In this article, we will talk about:

* the module structure of the service client
* the API contracts in protobuf
* the code generation
* the data conversion
* the authorization
* and how to go further from this article

This article is written based on Temporal Java SDK v1.16. Now, let's get started!

## Module Structure

The Temporal service client is located under the path `temporal-serviceclient`
of the Java SDK, which is split into the source code (main) and the test code.
The source code is then split into Java source code and the protobuf messages
for code generation.

```
➜  sdk-java git:(mincong/notes|u=) tree temporal-serviceclient/src -L 2
temporal-serviceclient/src
├── main
│   ├── java
│   └── proto
└── test
    ├── java
    └── resources

6 directories, 0 files
```

Going further into the Java source code, it contains 4 Java packages:
authorization, configuration, internal, and service-client. The `authorization`
package contains classes to supply the authorization info as the metadata (gRPC
headers) for each gRPC request; the `config` package contains classes for
storing keys for different configuration settings; the `internal` package
is a catch-all package, it contains different utility classes for different
proposes: options, retry mechanism, testing, throttling, etc; and the
`serviceclient` package contains classes for handling communication in gRPC:
channel management, exception handling, interceptions (header, metrics,
deadline, ...), stubs, and more.

```
➜  sdk-java git:(mincong/notes|u=) tree temporal-serviceclient/src/main/java -L 3
temporal-serviceclient/src/main/java
└── io
    └── temporal
        ├── authorization
        ├── conf
        ├── internal
        └── serviceclient

6 directories, 0 files
```

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
