---
layout:              post
type:                classic
title:               OpenAPI Overview
subtitle:            >
    The key concepts of OpenAPI and how they improve your RESTful APIs.

lang:                en
date:                2022-10-31 14:33:24 +0100
categories:          [java-rest]
tags:                [java, api, doc, build]
ads_tags:            []
comments:            true
excerpt:             >
    The key concepts provided by the OpenAPI Initiative, e.g. OpenAPI spec,
    code generator, schema, build, api-diff, and how they may be useful for
    your project.

image:               /assets/bg-fahmi-fakhrudin-nzyzAUsbV0M-unsplash.jpg
cover:               /assets/bg-fahmi-fakhrudin-nzyzAUsbV0M-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

Rencently I studied OpenAPI and made some notes about how OpenAPI can improve
your RESTful APIs. Today, I want to share them with you and I hope that they can
be useful for you as well. This article is focus on the Java backend service but
most of the concepts should be language agnostic.

After reading this article, you will understand:

* OpenAPI Specification
* Code generator
* Schema
* Build tools
* IDE support
* Testing
* API change detection
* How to go further from this article

Now, let's get started!

## OpenAPI Specification

The OpenAPI specification (OAS) defines a standard, language-agnostic interface
to RESTful APIs to discover and understand the capabilities of the services
wihtout access to source code, documnetation, or through network traffic
inspection.

Below, you can see an example for the demo project "Pet Store", provided by the
official OpenAPI generator ([source
code](https://github.com/OpenAPITools/openapi-generator/blob/v6.2.0/samples/server/petstore/jaxrs-spec-interface/src/main/openapi/openapi.yaml)).
In the specification, it describes all the API endpoints under the `paths`
section, with the path of the resource, the operation, the schema, the response
and many other things. It also includes some metadata of the specification, the
servers using this specification, etc.

```yaml
openapi: 3.0.1
info:
  description: "This spec is mainly for testing Petstore server and contains fake\
    \ endpoints, models. Please do not use this for any other purpose. Special characters:\
    \ \" \\"
  license:
    name: Apache-2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  title: OpenAPI Petstore
  version: 1.0.0
servers:
- url: http://petstore.swagger.io:80/v2
tags:
- description: Everything about your Pets
  name: pet
- description: Access to Petstore orders
  name: store
- description: Operations about user
  name: user
paths:
  /pet:
    post:
      operationId: addPet
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pet'
          application/xml:
            schema:
              $ref: '#/components/schemas/Pet'
        description: Pet object that needs to be added to the store
        required: true
      responses:
        "200":
          content: {}
          description: successful operation
        "405":
          content: {}
          description: Invalid input
      security:
      - petstore_auth:
        - write:pets
        - read:pets
      summary: Add a new pet to the store
      tags:
      - pet
      x-codegen-request-body-name: body
      x-content-type: application/json
      x-accepts: application/json
      x-tags:
      - tag: pet
```

The key value of this concept is to have a contrat which specifies the behavior
of the service. It allows both the client and the server to agree on
the exchange format, the expectation about the successful response and the
error, and so on. It makes it possible to generate documentation, test helpers,
and generate stubs in different frameworks in different languages.

To learn more about the specification, you can visit the web page [OpenAPI Specification, Version 3.0.0 -
Swagger](https://swagger.io/specification/) or see more samples of
`openapi.yaml` on GitHub project `openapi-generator`, under the section
"samples", like [this one for the Java RESTful APIs
(JAX-RS)](https://github.com/OpenAPITools/openapi-generator/blob/v6.2.0/samples/server/petstore/jaxrs-spec-interface/src/main/openapi/openapi.yaml).

## Code Generator

The code generator is the second concept

## Section 3

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
