---
article_num: 164
layout:              post
title:               Making Backward-Compatible Schema Changes in MongoDB
lang:                en
date:                2021-02-27 17:07:27 +0100
categories:          [java-serialization, reliability]
tags:                [java, mongodb, serialization, jackson, reliability]
permalink:           /2021/02/27/mongodb-schema-compatibility/
comments:            true
excerpt:             >
    How to add or remove a field from a Mongo collection without breaking the
    production?
image:               /assets/bg-bence-sandor-sztrecska-wIs-mjKMiw4-unsplash.jpg
cover:               /assets/bg-bence-sandor-sztrecska-wIs-mjKMiw4-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .3), rgba(0, 0, 0, .2))"
---

## Introduction

Changing the schema of a Mongo collection is a common request for developers. We
need this when the business evolves: we need to add new fields or remove
existing fields from a target Mongo collection to better support different
use-cases. Nevertheless, this is a risky operation, it may trigger an incident or
outage when this is not handled correctly. In this article, we are going to what
can go wrong, how to change the schema safely, and how to investigate
if things go wrong. This article assumes that you are familiar with the basic
concepts of MongoDB and uses [Jackson](https://github.com/FasterXML/jackson-databind) as the serialization framework for your
Java application.

After reading this article, you will understand:

- Potential risks when adding a new field
- Filling missing data with a default value
- Writing unit tests
- Migrating existing documents
- Preparing the worst case: how to revert changes
- Incident: how to mitigate using Mongo queries?
- How to go further from here?

This article is written with MongoDB 4.2, Jackson 2.12, and Java 11. But the
concepts are not tight to these versions and should be valid for older versions.
Now, let's get started!

## Potential Risks

_What can go wrong when adding a new field?_

If a new field is added in the Java class without changing the existing
documents in MongoDB, the deserialization can be completely broken. This is
because the new field required by the Java class does not exist for those
documents. Deserializing them can trigger an `UnrecognizedPropertyException` by
Jackson Object Mapper.

Here is an example called `OrderV1`. The 1st version of the order contains
3 fields: the object ID in MongoDB, the customer ID, and the amount of this
order. Recently, the product owner wants the possibility to cancel an order, so
we need a new field "isCanceled" to support this use-case as `OrderV2`. Also,
the product owner wants us to add an operator to keep track of the person who
handles the order. The changes look pretty simple:

```diff
-public class OrderV1 {
+public class OrderV2 {

   @JsonProperty("_id")
   private final String id;

   @JsonProperty("customerId")
   private final String customerId;

   @JsonProperty("amount")
   private final double amount;

+  @JsonProperty("isCanceled")
+  private final boolean isCanceled;

+  @JsonProperty("operator")
+  private final String operator;

   ...
 }
```

But you will see that there are some major risks here.

### NullPointerException

Without changing existing documents in MongoDB, the deserialization of the new fields may
be set to `null`. This is the case for the new field `operator`. This is because
the field `operator` does not exist for those Mongo documents. In Java, having a
field with a `null`
value can trigger `NullPointerException` and break your application. You need to
either handle the `null` case in your Java code; or perform data migration in
Mongo, i.e. adding the missing fields for your existing documents. We will talk
about these tricks in detail in the following sections.

### Impossible To Rollback

Another risk is about reverting the changes. Without additional configuration in
the Jackson object mapper or your value class, you may not be able to roll back
your changes once they are deployed to production. Once the Java changes are reverted,
the deserialization of the new documents from MongoDB to Java will fail with the
following exception:

> "java.io.UncheckedIOException:
> com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field
> "isCanceled" (class io.mincong.mongodb.model\_changes.OrderV1), not marked as ignorable (3
> known properties: "amount", "customerId", "\_id"]) at \[Source: (String)"{"\_id": "2",
> "customerId": "Customer2", "amount": 200.0, "isCanceled": true, "operator":
> "emea@example.com", "productIds": ["A", "B", "C"]}"; line: 1, column: 77] (through reference
> chain: io.mincong.mongodb.model\_changes.OrderV1["isCanceled"])"

This is because new documents have the field "isCanceled" but the old value
class `OrderV1` does not know how to deserialize it! This is so dangerous, we
rolled back, but the production is on fire, exceptions are everywhere. But how to avoid this from
happening? We will discuss it in detail in the "Preparing For Rollback" section.

Now we have a better understanding of how adding new fields may impact our
production, it's time to see how to improve the situation using different
techniques.

## Filling Missing Data

To prevent `NullPointerException`, we can fill the missing data in Java by
providing a default value. There are 4 ways to do that:

* Use Java language feature
* Fill null in the constructor
* Fill null in the getter
* Use Jackson module

### Using Java Language Feature

When declaring a class attribute as primitive, Jackson chooses a default value
for you. For `boolean`, it defaults to `false`; for `integer`, it defaults to 0;
for `double`, it defaults to 0.0; ...
Therefore, you can rely on this technique to avoid having a `null` field in your
Java application. For example, to express whether an order is canceled, we
can use the field `isCanceled` which is a primitive type `boolean`. When the field
does not exist in Mongo document, it defaults to `false`, which means the order
is valid, not canceled.

```java
public class OrderV2 {

  /**
   * This is a new boolean field.
   *
   * <p>For existing documents which do not contain this field, the
   * deserialization defaults to `false`.
   */
  @JsonProperty("isCanceled")
  private final boolean isCanceled;

  ...
}
```

However, be careful when choosing the adjective used for the new information. You
should ensure that `false` has the correct meaning for documents missing that
field. For example, if you are adding a field to represent the visibility of
an object, you have two choices: `isHidden` or `isVisible`, which one should
you use? You should probably choose the adjective
`isHidden` rather than `isVisible` because, for existing Mongo
documents, they don't have the field for visibility. In this case:

* `isHidden` defaults to false (visible) when the field does not exist
* `isVisible` defaults to false (hidden) when the field does not exist. This is
  NOT what we need: we want to default to visible, not hidden. 

So `isHidden` is a better choice here.

### Filling Null In Constructor

Another way is to handle to `null` in the constructor of the value class.
Therefore, when the deserialization happens, Jackson uses the constructor as the
JSON creator to create the Java instance, and the null case will be handled
properly.

```java
public class OrderV2 {

  @JsonProperty("operator")
  private final String operator;

  ...

  @JsonCreator
  public OrderV2(
      @JsonProperty("_id") String id,
      @JsonProperty("customerId") String customerId,
      @JsonProperty("amount") double amount,
      @JsonProperty("isCanceled") boolean isCancelled,
      @JsonProperty("operator") String operator,
      @JsonProperty("productIds") List<String> productIds) {
    ...

    if (operator == null) {
      this.operator = "support@example.com";
    } else {
      this.operator = operator;
    }
  }

  ...
}
```

Let's take a real example. Given a document in Mongo collection without the new
field `operator`:

```json
{
  "_id": "1",
  "customerId": "Customer1",
  "amount": 100.0
}
```

Then during the deserialization, this is considered as `null` by Jackson, but
then fall back to "support@example.com" in the constructor:

![Handle null in constructor](/assets/20210227-handle-null-in-constructor.png)

Therefore, the `null` case is handled successfully.

### Filling Null In Getter

In a similar approach, you can also handle null in the getter method.

```java
public class OrderV2 {

  @JsonProperty("operator")
  private final String operator;

  ...

  public String getOperator() {
    return operator == null ? "support@example.com" : operator;
  }

}
```

### Jackson Jdk8Module

Another solution is to use `Optional`, combined with Jackson module `Jdk8Module` to
serialize and deserialize it correctly. You can visit GitHub project
<https://github.com/FasterXML/jackson-modules-java8> or read the article ["Using
Optional with Jackson"](https://www.baeldung.com/jackson-optional) in Baeldung
to learn more about it.

## Writing Unit Tests

To better simulate the changes, you can write some unit tests to test different
behavior. I am not recommending you to write tests to cover all the cases, that
will be very time-consuming. I am just trying to share different testing
techniques to demonstrate that it is possible to assert in some way.

### Testing Reciprocity

One possible test is to ensure that you can serialize a document into MongoDB,
deserialize it back in Java, and the restored Java instance is equal to the
original one.

```
Java             MongoDB
---              ---
orignal   -----> Mongo document
restored <-----
```

Something like:

```java
// Given
var result = orderCollection.insertOne(order1);

// When
var results = orderCollection.find(Filters.eq("customerId", "BigCorp"));

// Then
assertThat(results).containsExactly(order1);
```

### Testing Backward-Compatibility

Another possible test is to test that deserializing an old Mongo document into
Java using the new schema (new Java class) will work as expected.

```
Java             MongoDB
---              ---
BSON      -----> Mongo document
restored <-----
```

Because your Java class is changed (added new fields), you cannot use it to create the same
structure as it was before. To simulate the existing Mongo documents, you can
create a Mongo document using `org.bson.Document`:

```java
Document.parse("{ \"_id\": \"1\", \"customerId\": \"Customer1\", \"amount\": 100.0 }");
```

In the example, we created a BSON document without the new field `isCanceled`
in the test. It simulates the existing Mongo documents created before the schema
change. It allows us to assert the
deserialization and ensure that the restored document contains the values that
we expect.

### Testing Rollback

This sounds a bit overkill to me. Testing in staging is probably enough. But
if you want to do this, it's possible as well.

```
Java                  MongoDB
---                   ---
original (V2)  -----> Mongo document
restored (V1) <-----
```

You can copy the existing Java class into a new class, such as
`LegacyOrder.java` or `OrderV1.java`. Then, write an instance V2 into
MongoDB and read it back as V1 (legacy) format to assert if the result is what
you expect.

## Migrating Existing Documents

Besides providing a default value during the deserialization, another possibility
to avoid the `NullPointerException` is to migrate the existing documents in
MongoDB. Before doing so, consider:

- Whether you need to perform a backup before running your query. Ideally, the
  backup is scheduled regularly. Or consider export the concerned
  documents using
  [mongoexport](https://docs.mongodb.com/database-tools/mongoexport/).
- Testing your query in localhost and staging environment before running it in
  production.
- Ask for approval from at least one of your teammates before changing the
  documents.
- Create a conversation in the chat tool, e.g. Slack or Microsoft Teams, to keep
  track of the operations.
- Update one document before updating multiple ones.

Now, back to the Mongo query for migration. This can be as simple as:

```js
db.orders.update(
  { isCanceled: { $exists: false } },  // 1
  { $set: { isCanceled: false } },  // 2
  { multi: true }  // 3
)
```

In the query above:

1. We find the documents in collection `orders` that do not contain the field
   `isCanceled`.
2. Then for those documents, we set the missing field `isCanceled` as "false".
3. By default, an update statement only updates one single document. We set it to
   update multiple ones — all those matching the selection (without field
   `isCanceled`). Note that it's better to perform the update query twice: the
   first time with option `{ multi: false }` to test if the update statement
   works. Then perform it a second-time with option `{ multi: true }` to update
   all the documents that matched the selection. In this way, we reduce the risk of
   breaking the entire collection.

Then the update result shows how many documents were concerned: the number of
documents matched the query, number of documents updated or inserted, and number
of documents modified.

```js
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```

## Preparing For Rollback

_How to handle an unknown field in Jackson?_

In the previous section "Potential Risks", we mentioned that rolling back to
the previous version in Java application may not be possible.
The deserialization of the new documents in MongoDB may fail with the
following exception:

> "java.io.UncheckedIOException:
> com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field
> "isCanceled" (class io.mincong.mongodb.model\_changes.OrderV1), not marked as ignorable (3
> known properties: "amount", "customerId", "\_id"]) at \[Source: (String)"{"\_id": "2",
> "customerId": "Customer2", "amount": 200.0, "isCanceled": true, "operator":
> "emea@example.com", "productIds": ["A", "B", "C"]}"; line: 1, column: 77] (through reference
> chain: io.mincong.mongodb.model\_changes.OrderV1["isCanceled"])"

This is because new documents have the field "isCanceled" but the old value
class `OrderV1` does not know how to deserialize it! In this section, we are
going to see how to handle unknown fields correctly in Jackson.

### Handle Unknown Field Globally

Make the Jackson object mapper more lenient face to unknown properties during
the JSON deserialization by disabling the feature `FAIL_ON_UNKNOWN_PROPERTIES`.
We can do that using one of the following lines:

```java
objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
```

```java
objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```

This will apply to all the JSON objects deserialized by this object mapper.

### Handle Unknown Field Locally

Make the Jackson object mapper more lenient for a given value class during the
JSON deserialization by adding annotation `@JsonIgnoreProperties` in your value
class:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderV1 { ... }
```

This will apply to all the JSON objects deserialized into this value class
`OrderV1`. Compared to setting the feature globally, setting it locally at the class
level gives you finer control about the behavior over different classes, but
it's also easier to forget adding this annotation because you will have to do
that for _all_ the classes and bring inconsistency over the deserialization
behavior.

Once you configured one of the features mentioned above (globally or locally),
then it should be safe to rollback! Hopefully, you won't need to rollback, but
it's always a good idea to know that your code is prepared for that.

## Useful Mongo Queries

In the previous sections, we were focused on how to avoid breaking the schema in
the first place. But what if the production is already broken? Maybe someone
else didn't realize his changes can trigger an incident. Therefore, it's always
a good thing to learn some basic Mongo queries to prepare the worst case. That
is, fixing the production when it is broken. Here are some Mongo queries that I
prepared for you.

```js
> db.orders.count()
2
```

Count the number of documents in the collection `orders`. Useful to understand
how many documents are concerned and the potential impact if things go wrong.

```js
> db.orders.find({ isCanceled: { $exists: false } }).limit(10).pretty()
{ "_id" : "1", "customerId" : "Customer1", "amount" : 100 }
```

Find out 10 documents without the field `isCanceled` and print them in pretty
format. Useful to inspect the JSON before or after the actual update.

```js
> db.orders.update(
  { isCanceled: { $exists: true } },
  { $unset: { isCanceled: "" } }
  { multi: true }
)
```

Remove field `isCanceled` from all the documents having this field. Useful for
reverting the changes. Especially when your Java code had been rolled back to
the previous version but the Jackson fails to deserialize the recently-added Mongo
documented, which contains the new field `isCanceled`.

## Other Scenarios

In the sections above, we mainly discussed what happened when adding a new field
in MongoDB. But what about other scenarios?

* Another common scenario is to remove a field. Removing a field may have an issue
  because the Java class may not be prepared for accepting unknown properties.
  This is exactly what we discussed during the section "Preparing For Rollback".
* Another possible scenario is to change the type of an existing field. I would
  avoid doing this. There must be a better solution, such as creating a new
  field using another name.
* Renaming or removing an element in a Java enum. Renaming is possible but please
  ensure that the JSON property naming is not going to be changed implicitly.
  For example, by renaming an enum item from `FOO` to `BAR`, the serialization will
  be changed from "FOO" to "BAR", which will completely break your application.
  Removing an element is dangerous as well. Ensure that
  this element does not exist in any of your databases (staging, production)
  before doing so.

There are eventually other scenarios that I didn't mention. Please leave a
comment so that everyone reading this article can learn about that.

## Going Further

How to go further from here?

- This article assumes that you use [Jackson
  Databind](https://github.com/FasterXML/jackson-databind) to serialize and
  deserialize your Mongo documents in Java. If you are not using it and want to
  give it a try, take a look at this Stack Overflow question [Is there any way
  for creating Mongo codecs
  automatically?](https://stackoverflow.com/a/47949886/4381330), my implementation
  is highly inspired by Kevin Day's answer.
- To learn more about different update operators in MongoDB, such as `$set`,
  `$unset`, visit MongoDB Manual ["Update
  Operators"](https://docs.mongodb.com/manual/reference/operator/update/).
- To learn more about database tool `mongodump`, visit MongoDB documentation
  [mongodump](https://docs.mongodb.com/database-tools/mongodump/#mongodb-binary-bin.mongodump).

You can also find the source code of this article on GitHub under project
[mincong-h/java-examples](https://github.com/mincong-h/java-examples/tree/blog/mongo-schema-compatibility/mongo),
in particular the [source
code](https://github.com/mincong-h/java-examples/tree/blog/mongo-schema-compatibility/mongo/src/main/java/io/mincong/mongodb/model_changes)
and the [test code](https://github.com/mincong-h/java-examples/tree/blog/mongo-schema-compatibility/mongo/src/test/java/io/mincong/mongodb/model_changes).

## Conclusion

In this article, we saw the potential risks for MongoDB when adding a new field
in the Java application (`NullPointerException` and issue for rollback), the
different techniques for filling the `null` value, how to write unit tests, how
to migrate the existing documents, how to prepare for rollback by handling
unknown field correctly via object mapper or via Java class annotation, and some
useful MongoDB queries to help you investigate the incident when something goes
wrong. Finally, we discussed briefly other scenarios and saw some resources
about how to go further from here.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- MongoDB, "MongoDB Documentation", 2021.
  <https://docs.mongodb.com/>
- Tatu Saloranta et al., "Jackson Databind", 2021.
  <https://github.com/FasterXML/jackson-databind>
