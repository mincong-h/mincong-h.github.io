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

The code generator is the second key concept of the OpenAPI project. It allows
you to generate things based on the specification. The code generation can be
used for many cases:

* For generating the specification of the backend service as a collection of
  interfaces
* For generating the client code for different programming languages, like Go or
  Java.
* For generating the documentation for your project
* For generating the schema for your project

There are different ways to use OpenAPI generator. You can use it via the CLI tools
(available under all major operating systems), via plugins (hooked into your
build system, such as Maven or gradle) or use it from websites. You can see more
details in the official website: <https://openapi-generator.tech>.

Having those choices means that you have the possibility to trigger the code
generation in different parts of the development: either on-demand, before
commit to Git (pre-commit hook via CLI), or as part of the build process (plugins).

## Schema

An API specification needs to specify the HTTP request and response for all API
operations. The request and response body are represented as "schema" under each
operation. For Java project, these schemas are generated into Plain Old Java
Objects (POJOs). Let's take a deeper look into
that part. For the `addPet` operation mentioned in the section above, it's
defined as a reference for the Pet schema:

```yaml
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
```

where the Pet schema is defined as the code block below ([source code](https://github.com/OpenAPITools/openapi-generator/blob/24f476a38161a797c773577cab775ef285baeaba/samples/server/petstore/jaxrs-spec/src/main/openapi/openapi.yaml#L1316-L1369)). You can see the an
example payload, the properties defined in different types (primitives, embeded
object, array, enum), the required fields, etc.

```yaml
components:
  schemas:
    # ...
    Pet:
      example:
        photoUrls:
        - photoUrls
        - photoUrls
        name: doggie
        id: 0
        category:
          name: default-name
          id: 6
        tags:
        - name: name
          id: 1
        - name: name
          id: 1
        status: available
      properties:
        id:
          format: int64
          type: integer
          x-is-unique: true
        category:
          $ref: '#/components/schemas/Category'
        name:
          example: doggie
          type: string
        photoUrls:
          items:
            type: string
          type: array
          uniqueItems: true
          xml:
            name: photoUrl
            wrapped: true
        tags:
          items:
            $ref: '#/components/schemas/Tag'
          type: array
          xml:
            name: tag
            wrapped: true
        status:
          description: pet status in the store
          enum:
          - available
          - pending
          - sold
          type: string
      required:
      - name
      - photoUrls
      type: object
      xml:
        name: Pet
```

And the generated POJO `Pet.java` looks like this ([source code](https://github.com/OpenAPITools/openapi-generator/blob/v6.2.0/samples/server/petstore/jaxrs-spec/src/gen/java/org/openapitools/model/Pet.java)):

```java
@JsonTypeName("Pet")
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen")
public class Pet  implements Serializable {
  private @Valid Long id;
  private @Valid Category category;
  private @Valid String name;
  private @Valid Set<String> photoUrls = new LinkedHashSet<>();
  private @Valid List<Tag> tags = null;
  public enum StatusEnum {

    AVAILABLE(String.valueOf("available")), PENDING(String.valueOf("pending")), SOLD(String.valueOf("sold"));


    private String value;

    StatusEnum (String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    ...
}
```

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
