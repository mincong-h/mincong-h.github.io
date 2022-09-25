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

In the following sections, we will go further into some of these components and
tries to understand how it works.

## Protobuf

As most of the gRPC services, Temporal service client in Java uses
[protobuf](https://developers.google.com/protocol-buffers/) (protocol buffers)
to describe RPC actions and messages. The source code is stored under the path:

```
temporal-serviceclient/src/main/proto
```

If you visit the source code on
[Github](https://github.com/temporalio/sdk-java/tree/master/temporal-serviceclient/src/main),
you will probably notice that the `proto` directory is actually a Git submodule,
meaning that the source code is not stored in the same Git repository
(`temporalio/sdk-java`), but in another one called API (`temporalio/api`):

```
➜  sdk-java git:(mincong/notes|u=) cat .gitmodules
[submodule "temporal-serviceclient/src/main/proto"]
	path = temporal-serviceclient/src/main/proto
	url = https://github.com/temporalio/api.git
```

This is smart! By doing so, there is one source of truth for the Temporal gRPC
API and proto files, and all the SDKs can reference it as a Git submodule.
Currently there are 6 SDKs for the Temporal clients:
[Java](https://github.com/temporalio/sdk-java),
[Ruby](https://github.com/temporalio/sdk-ruby),
[Rust](https://github.com/temporalio/sdk-core),
[Typescript](https://github.com/temporalio/sdk-typescript),
[PHP](https://github.com/temporalio/sdk-php),
and [Go](https://github.com/temporalio/sdk-go).

Going inside the `proto` directoy, you can see that the Temporal APIs are stored
in the following structure:

```
temporal/api/{type}/{version}/{name}.proto
```

More precisely:

```
➜  sdk-java git:(mincong/notes|u=) tree temporal-serviceclient/src/main/proto/temporal/api
temporal-serviceclient/src/main/proto/temporal/api
├── command
│   └── v1
│       └── message.proto
├── common
│   └── v1
│       └── message.proto
├── enums
│   └── v1
│       ├── command_type.proto
│       ├── common.proto
│       ├── event_type.proto
│       ├── failed_cause.proto
│       ├── namespace.proto
│       ├── query.proto
│       ├── reset.proto
│       ├── schedule.proto
│       ├── task_queue.proto
│       └── workflow.proto
├── ...
```

For example, you can see the message `StartWorkflowExecutionRequest` in the
`request_response.proto` and the related RPC action in the `service.proto`:

```
➜  sdk-java git:(mincong/notes|u=) rg '[^\w]StartWorkflowExecutionRequest' temporal-serviceclient/src/main/proto/temporal/api/
temporal-serviceclient/src/main/proto/temporal/api/workflowservice/v1/service.proto
90:    rpc StartWorkflowExecution (StartWorkflowExecutionRequest) returns (StartWorkflowExecutionResponse) {

temporal-serviceclient/src/main/proto/temporal/api/workflowservice/v1/request_response.proto
138:message StartWorkflowExecutionRequest {
```

These proto files are used for generating the service stubs. In the next
section, we will see how it works in Java.

## Code Generation

The code generation from protobuf to Java is done by the protocol buffer
compiler. The compiler reads the `.proto` description of the data structure and
creates classes that implements automatic encoding and parsing of the protocol
buffer data with an efficient binary format. In the case of Temporal service
client, this is hooked into the Gradle build system using the protobuf plugin:

```groovy
plugins {
    id 'com.google.protobuf' version '0.8.19'
}
```

and `io.grpc:protoc-gen-grpc-java`:

```groovy
plugins {
    grpc {
        artifact = 'io.grpc:protoc-gen-grpc-java:1.48.1'
    }
}
```

When building in macOS, there are some small differences beteween building the
code in Intel (x86\_64) or in M1 (aarch64). But this is handled internally by
the Gradle build script, so you don't have to know about it.

When running the Gradle build
command (skip tests if you want to be faster), you will have all the messages
generated for you:

```
➜  sdk-java git:(mincong/notes|u=) ./gradlew clean build -x test
```

The key generated classes are the blocking stub and the future stub of the gRPC
service. They are part of the implmenetation of the workflow service stubs
(`WorkflowServiceStubsImpl`) as you can see in the source code below:

```java
package io.temporal.serviceclient;

// ...
import io.temporal.api.workflowservice.v1.GetSystemInfoResponse;
import io.temporal.api.workflowservice.v1.WorkflowServiceGrpc;

final class WorkflowServiceStubsImpl implements WorkflowServiceStubs {

  private final WorkflowServiceGrpc.WorkflowServiceBlockingStub blockingStub;
  private final WorkflowServiceGrpc.WorkflowServiceFutureStub futureStub;

  // ...
}
```

Blocking stub runs the actions in the blocking style (synchronous), i.e. it
waits until the
completion (success or failure) of the execution. On the other side, future stub
runs the actions in asynchronous style. Below, you can see some of the methods
provided by the blocking stub, such as the method for starting a new workflow
execution:

![Block stubs](/assets/20220925-blocking-stub.png)

The source code is located under the generated directory
(`temporal-serviceclient/build/generated/main/java`).

## Data Conversion

Now we know about the data conversion, but we don't know how user's data is
serialized into gRPC 🤔 How do we get the input parameters or the metadata (gRPC
headers) converted correctly? We will discuss that in this section.

This is done using the data converter (`DataConverter`). The data convert
provide a method to convert an input T to a Temporal payload, useful for
converting either the headers or the input message itself:

```java
public interface DataConverter {

  /**
   * This method converts the given value to a payload, either for the headers or the input message.
   *
   * @param value value to convert
   * @return a {@link Payload} which is a protobuf message containing byte-array serialized
   *     representation of {@code value}. Optional here is for legacy and backward compatibility
   *     reasons. This Optional is expected to always be filled.
   * @throws DataConverterException if conversion fails
   */
  <T> Optional<Payload> toPayload(T value) throws DataConverterException;

  // ...
}
```

As you can see, the data converter is an interface, so it does not contain any
actual logic. It's rather a specification to describe the behavior and served as
a boundary betwee the clients (callers) and the implementation providers. There are two
implementations provided by the SDK, the `GlobalDataConverter`
(default) and the new `CodecDataConverter`. We will talk a bit about the
codec data converter later on. For now, let's first focus on the client side,
that is, how to use the converter.

We use the converter to convert headers or user's input. The input parameters
are passed to the method `toPayloads(...)` or `toPayload(...)` of the data
converter, which converts it into `Payloads`. Below, you can see an example coming from the
`WorkflowClientRequestFactory`, part of the Temporal SDK, for starting a new
workflow execution:

```java
  @Nonnull
  StartWorkflowExecutionRequest.Builder newStartWorkflowExecutionRequest(
      WorkflowClientCallsInterceptor.WorkflowStartInput input) {
    WorkflowOptions options = input.getOptions();

    StartWorkflowExecutionRequest.Builder request =
        StartWorkflowExecutionRequest.newBuilder()
            .setNamespace(clientOptions.getNamespace())
            .setRequestId(generateUniqueId())
            .setWorkflowId(input.getWorkflowId())
            .setWorkflowType(WorkflowType.newBuilder().setName(input.getWorkflowType()))
            // ...

    //
    // HERE is the data conversion: input arguments -> Payloads
    //
    Optional<Payloads> inputArgs =
        clientOptions.getDataConverter().toPayloads(input.getArguments());
    inputArgs.ifPresent(request::setInput);
    if (options.getWorkflowIdReusePolicy() != null) {
      request.setWorkflowIdReusePolicy(options.getWorkflowIdReusePolicy());
    }
```

Since the data converter is defined as client options, it also means that we can
set the data converters ourselves depending on the need, e.g. using the new
codec data converter rather than the default global data converter.

But, what are the differences between global data converter and coder data
converter? Global data converter is powered by the default data converter, which
delegates conversion to type specific PayloadConverter instance. It supports 5
encoding types: null, byte-array, protobuf json, protobuf, and jackson json. As
for the codec data converter, it is specific to one codec (Json, Zlib, ...).
For more details, read [What is a Data
Converter?](https://docs.temporal.io/concepts/what-is-a-data-converter/) in the
official documentation.

## Authorization

The authorization of the Temporal service client is customizable. It's up to the
users (us) to implement the logic. But at the end, we will need to provide the
authorization token as a header for each gRPC request.

Temporal service client helps us to do so by providing an interface for
supplying the token:

```java
public interface AuthorizationTokenSupplier {
  /**
   * @return token to be passed in authorization header
   */
  String supply();
}
```

It supplies the tokens that will be sent to the Temporal server to perform authorization.
The default JWT ClaimMapper expects authorization tokens to be in the following format:

```
Bearer {token}
```

where `{token}` must be the Base64 url-encoded value of the token. You can see
more details about the [JWT web token
format](https://docs.temporal.io/clusters/#json-web-token-format) under the
Claim Mapper section of the official documentation.

But how to hook the suppplier into the gRPC request? Well, this is done by using
the `AuthorizationGrpcMetadataProvider`, which should be registered as part of
the options of workflow service stubs (`WorkflowServiceStubsOptions`). Below,
you can see the relationship between the stub options, the metadata provider,
and the authorization token supplier:

```java
WorkflowServiceStubsOptions stubOptions =
    WorkflowServiceStubsOptions.newBuilder()
        .addGrpcClientInterceptor(...)
        .addGrpcMetadataProvider(new AuthorizationGrpcMetadataProvider(supplier))
        .build();
```

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- [Protocol Buffer Basics: Java](https://developers.google.com/protocol-buffers/docs/javatutorial)
- [GitHub: Temporal gRPC API and proto files](https://github.com/temporalio/api)
- [Temporal: What is a Data
  Converter?](https://docs.temporal.io/concepts/what-is-a-data-converter/)
