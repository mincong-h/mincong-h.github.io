---
layout:            post
title:             "Mockito: 4 Ways to Verify Interactions"
date:              2019-09-22 16:37:15 +0200
categories:        [java-testing]
tags:              [java, mockito, testing]
comments:          true
excerpt:           >
    Verify interaction with mock objects with verify(), verifyZeroInteractions()
    verifyNoMoreInteractions(), and inOrder().
image:             /assets/bg-alex-block-eicoRD590x4-unsplash.jpg
cover:             /assets/bg-alex-block-eicoRD590x4-unsplash.jpg
ads:               Ads idea
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today, I'd like to share different ways to verify interactions with mock
objects in Mockito via methods: `verify()`,
`verifyZeroInteractions()`, `verifyNoMoreInteractions()`, and `inOrder()`.
After reading this article, you will understand:

- How to verify the exact number of invocations?
- How to verify the boundaries of invocations (at most, at least)?
- How to verify no more interactions with other methods?
- How to verify the invocations are in order?

This article is written with Mockito 1.10.19 (it's a bit old now, I know...).
Without additional specification, all methods without class prefix come from
factory class org.mockito.Mockito:

```java
import static org.mockito.Mockito.*;
```

## Verify Exact Invocations

The exact number of invocations can be asserted via method `Mockito#verify(T mock,
VerificationMode mode)` combined with verification mode `Times`. You need to
provide the target mock object to be verified, the expected number of calls
(non-negative), and also the invocation to be verified. For example, given an
instance of class "Context", called "mockContext", and a validator, I would
like to verify that when validating input string _"Hello world!"_, an error is
added to the context as _"No space allowed"_:

```java
Context mockContext = mock(Context.class);

Validator validator = new Validator(mockContext);
validator.validate("Hello world!");

verify(mockContext, times(1)).addError("No space allowed.");
```

Or using alias method (times=1):

```java
verify(mockContext).addError("No space allowed.");
```

Now, if you need to verify invocation happens several times, you can just modify
the value of times. For example, validating three sentences, two of which
contain space, then two errors will be added:

```java
Context mockContext = mock(Context.class);

Validator validator = new Validator(mockContext);
validator.validate("Hello world!"); // error
validator.validate("Hello Java!");  // error
validator.validate("Hello!");       // ok

verify(mockContext, times(2)).addError("No space allowed.");
```

If you want to ensure target invocation never happens, you can set times=0 or
use alias method `never()`:

```java
verify(mockContext, never()).addError("No space allowed.");
```

## Verify Boundaries of Invocations

If you want to verify the target method is invoked at least or at most N times,
you can use factory method `Mockito.atLeast(int)`, `Mockito.atLeastOnce()`, and
`Mockito.atMost(int)`.

At least:

```java
Context mockContext = mock(Context.class);

Validator validator = new Validator(mockContext);
validator.validate("Hello world!");
validator.validate("Hello Java!");
...

verify(mockContext, atLeast(2)).addError("No space allowed.");
```

At least once:

```java
verify(mockContext, atLeastOnce()).addError("No space allowed.");
```

At most:

```java
verify(mockContext, atMost(2)).addError("No space allowed.");
```

## Verify Interaction with Other Methods

Beside verifying the invocations of the target method, you may also want to
ensure that there is no more interaction with other methods. This can be done
using `Mockito.verifyNoMoreInteractions`. For example, the following code
ensures that beside `addError(String)`, there is no more interaction with the
context `mockContext`. Method like `Context#neverCalled()` is never called by
validator.

```java
Context mockContext = mock(Context.class);

Validator validator = new Validator(mockContext);
validator.validate("Hello world");

verify(mockContext).addError("No space allowed.");
verifyNoMoreInteractions(mockContext);
```

In other words, the only invocation is `Context#addError`.

```java
verify(mockContext, only()).addError("No space allowed.");
```

Personally, I don't recommend this kind of verification because it is too
strict: it means that you don't trust the actual implementation and the test
needs to be updated frequently, every time when more interaction is added with
the target mock object.

## Verify Invocation Order

Perform in-order verifications for one or more mock objects. In this way, you
can verify if one method is called before another. It also works for multiple
mocks. Also, verification in-order is flexible—you don't have to verify all
interactions one-by-one but only those that you are interested in testing in
order.

Here's an example with two mock objects to be verified. Only error A and error C
are asserted, error B is ignored.

```java
Context ctx1 = mock(Context.class);
Context ctx2 = mock(Context.class);

ctx1.addError("A");
ctx2.addError("B");
ctx2.addError("C");

// all verifications done in same InOrder instance
InOrder inOrder = inOrder(ctx1, ctx2);
inOrder.verify(ctx1).addError("A");
// you don't have to verify all interactions, but only
// mocks that are relevant for in-order verification
inOrder.verify(ctx2).addError("C");
```

## Conclusion

In this article, we saw different methods in Mockito to verify invocations with
mock objects. The source code of this article is available on GitHub as
[MockitoVerifyTest.java](https://github.com/mincong-h/java-examples/blob/blog/2019-09-22-mockito-verify/mock/src/test/java/io/mincongh/library/mockito/verify/MockitoVerifyTest.java).
Hope you enjoy this article, see you the next time!

## References

- Mockito, "Mockito 1.10.19 API", _javadoc.io_, 2019.
  <https://static.javadoc.io/org.mockito/mockito-core/1.10.19/org/mockito/Mockito.html>
