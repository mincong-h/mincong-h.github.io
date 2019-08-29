---
layout:            post
title:             Fixing Comparator
date:              2019-07-18 20:47:15 +0200
categories:        [tech]
tags:              [java, testing]
comments:          true
excerpt:           >
    Fun experience on fixing a custom comparator by identifying the sub-problems,
    testing different combinations, and finally fix it.
image:             /assets/bg-cup-of-coffee-1280537_1280.jpg
img_width:         1280
img_height:        851
---

## Overview

Today, I want to share a bug fixing experience on
[java.util.Comparator](https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html).
In our production environment, there is an error that happens frequently.
It happens so often that it is actually spamming the logs, so I decided to fix
it. After reading this article, you will understand:

- How to identify the problem?
- How to translate it mathematically?
- How to test the comparator?
- How to fix it?

Let's begin :)

## Identify Problem

In the stacktrace, there is an exception logged as follows:

```
Caused by: java.lang.IllegalArgumentException: Comparison method violates its general contract!
	at java.util.TimSort.mergeLo(TimSort.java:777)
	at java.util.TimSort.mergeAt(TimSort.java:514)
	at java.util.TimSort.mergeCollapse(TimSort.java:439)
	at java.util.TimSort.sort(TimSort.java:245)
	at java.util.Arrays.sort(Arrays.java:1512)
	at java.util.ArrayList.sort(ArrayList.java:1454)
	at java.util.Collections.sort(Collections.java:175)
	at com.nuxeo.connect.track.NuxeoConnectProfileImpl$1ProfileExtractorRunner.run(NuxeoConnectProfileImpl.java:165)
```

As mentioned in book "Effective Java, 2nd Edition", Item 12: _"... a `compareTo`
method must obey the same restrictions imposed by the `equals` contract:
reflexivity, symmetry, and transitivity."_ Therefore, I need to check if they
are respected in the source code. Let's have an example for transitivity. Let
`A` be the first object, `B` the second and `C` the third object. If `A > B`
and `B > C`, then `A > C` must be respected. Otherwise, the comparison method
violates its general contract.

In order to check that, I searched in the source code. Then I found the
comparator, written as a lambda. As you can see, the logic is very complex.
It's almost impossible to find the cause in such situation. I tried to find a
counterexample to prove the incorrectness, but after one hour attempts with 5
different combinations, I still couldn't find anything. So I gave up at the end.
I decided to try something else: divide the problem into sub-problems

```java
Collections.sort(projects, (p1, p2) -> {
  try {
    Service s1 = p1.getAssociatedServiceByType(session, Service.BASE_TYPE);
    Service s2 = p2.getAssociatedServiceByType(session, Service.BASE_TYPE);
    if (s1 != null && s2 != null) {
      Calendar exp1 = s1.getEndDate();
      Calendar exp2 = s2.getEndDate();

      if (s1.isServiceValid() && s2.isServiceValid()) {
        // project with the first expiring subscription comes first
        return ObjectUtils.compare(exp1, exp2, true);
      } else {
        if (!s1.isServiceValid() && s2.isServiceValid()) {
          return 1;
        } else if (s1.isServiceValid() && !s2.isServiceValid()) {
          return -1;
        }
      }
    }
    // both projects are invalid or at least one has no BASE MAINTENANCE service associated
    Calendar d1 = (Calendar) p1.getDoc().getPropertyValue("dc:created");
    Calendar d2 = (Calendar) p2.getDoc().getPropertyValue("dc:created");
    // project with the last creation date comes first
    return ObjectUtils.compare(d2, d1, true);
  } catch (RuntimeException e) {
    logger.warn("Unable to compare projects, considering equal", e);
    return 0;
  }
})
```

## Find Fields in Comparator

In the existing implementation, we didn't respect transitivity. When there are
multiple fields to compare, we should compare the next field if and only if the
current field is equal in both object 1 and object 2. But first of all, let's
find out the different fields as comparison order:

1. Service existence
2. Service validity
3. Service expiration date
4. Project creation date

In each field, there are different values to be filled. For service existence,
it can be existing or non-existent. For service validity, it can be either valid
or invalid. For service expiration date, it can be null, an earlier date, or a
later date. For project creation date, it can be null, an earlier date, or a
later date. So, there are actually 36 combinations:

```
2 * 2 * 3 * 3 = 36
|   |   |   |
|   |   |   |
|   |   |   +-- Project created date (0: null, 1: early, 2: late)
|   |   +------ Service expired date (0: null, 1: early, 2: late)
|   +---------- Service validity     (0: True, 1: False)
+-------------- Service existence    (0: null, 1: defined)
```

## Reproduce Bug in Test

The next step is to reproduce the exception in unit test. In order to do that,
there are the following conditions:

1. Use something to represent the combination
2. Create a dataset having all the 36 combinations based on that representation
3. Randomly permutes the dataset
4. Sort the dataset to reproduce the bug

**Preparation: replace lambda by static nested class.** Replace lambda by static
nested class, it helps us the create test easily, without having the need to
prepare everything in the outer class.

```java
// before
Collections.sort(projects, (p1, p2) -> { ... });
```

```java
// after
projects.sort(new ProjectComparator(session));
```

**Represent the combination.**
For the 1st point, I thought about different solutions and finally chose array
as data structure. An integer array `int[]` with 4 items allows to store the
state of 4 fields. It can be initialized as:

```java
int[] mode = { 0, 0, 0, 0 };
```

Thanks to this data structure, we can easily compute all the different
combinations, via a method for incrementation. It should look like the decimal
system, but here digits can only be in range of 0-1 or 0-2. Here's how it is
used and how it is implemented:

```java
int mode = { 0, 0, 0, 0 };
for (int i = 0; i < 36; i++) {
  // translate to Java
  ...
  mode = increment(mode);
}
```

```java
private static int[] increment(int[] mode) {
  int[] newMode = Arrays.copyOf(mode, mode.length);
  boolean carry = false;
  newMode[0]++;
  if (newMode[0] > 1) {
    newMode[0] = 0;
    carry = true;
  }
  if (carry) {
    newMode[1]++;
    if (newMode[1] > 1) {
      newMode[1] = 0;
      carry = true;
    } else {
      carry = false;
    }
  }
  if (carry) {
    newMode[2]++;
    if (newMode[2] > 2) {
      newMode[2] = 0;
      carry = true;
    } else {
      carry = false;
    }
  }
  if (carry) {
    newMode[3]++;
  }
  return newMode;
}
```

**Create dataset.**
For the 2nd point, since we have mode, we can translate this mathematical
representation into actual Java state. As you can see, the comparator did a lot
of things. It uses a `session` object to perform a database lookup, and has a
underlying document model, retrieved via method `Project#getDoc()`. In order to
create the dataset, we need to mock these exchanges.

Here, I used Mockito as the mocking framework, because it is already a
dependency in our codebase, and it's quite easy to understand.

```java
// mock classes
Project project = mock(Project.class);
Service service = mock(Service.class);
DocumentModel document = mock(DocumentModel.class);

// stubbing before then actual execution
when(service.getEndDate()).thenReturn(/* TODO: fill state here */);
when(project.getDoc()).thenReturn(document);
...
```

So we saw how the implementation is done for each individual combination in
combinations.

```java
List<Project> projects = new ArrayList();
int mode = { 0, 0, 0, 0 };
for (int i = 0; i < 36; i++) {
  // mock goes here:
  // math -> Java
  ...
  projects.add(p);
  mode = increment(mode);
}
```

**Randomly permutes the dataset**. Having a dataset is not enough. We still need
to permute the list to ensure each two items can be used by comparator and will
raise exception because some pairs violate the general contract. This can be
done using method
[java.util.Collections#shuffle(List<?>)](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#shuffle-java.util.List-).
Repeat the shuffle operation for 10,000 times to a high probability of
having the exception:

```java
Comparator<Project> comparator = new ProjectComparator(session);
for (int i = 0; i < 10_000; i++) {
  Collections.shuffle(projects);
  projects.sort(comparator); // exception?
}
```

**Sorting to raise exception.** After "shuffle" operation, sort the projects
again. Exception should be thrown — and should be fixed once the implementation
is fixed.

## Fix Comparator

Fixing the field comparison order as mentioned above, solves the problem:

1. Service existence
2. Service validity
3. Service expiration date
4. Project creation date

Here is the code:

```java
static class ProjectComparator implements Comparator<Project> {

  private final CoreSession session;

  ProjectComparator (CoreSession session) {
    this.session = session;
  }

  /**
   * Comparing:
   * <ol>
   * <li>Service existence (nullability)</li>
   * <li>Service validity</li>
   * <li>Service expiration date</li>
   * <li>Project creation date</li>
   * </ol>
   */
  @Override
  public int compare(Project p1, Project p2) {
    try {
      Service s1 = p1.getAssociatedServiceByType(session, Service.BASE_TYPE);
      Service s2 = p2.getAssociatedServiceByType(session, Service.BASE_TYPE);
      boolean hasS1 = s1 != null;
      boolean hasS2 = s2 != null;

      if (hasS1 != hasS2) {
        return hasS1 ? -1 : 1;
      }
      if (!hasS1) { // stop here to avoid NPE
        return 0;
      }
      if (s1.isServiceValid() != s2.isServiceValid()) {
        return s1.isServiceValid() ? -1 : 1;
      }
      if (s1.isServiceValid() && s2.isServiceValid()) {
        // project with the first expiring subscription comes first
        Calendar exp1 = s1.getEndDate();
        Calendar exp2 = s2.getEndDate();
        return ObjectUtils.compare(exp1, exp2, true);
      }
      // both projects are invalid
      Calendar d1 = (Calendar) p1.getDoc().getPropertyValue("dc:created");
      Calendar d2 = (Calendar) p2.getDoc().getPropertyValue("dc:created");
      // project with the last creation date comes first
      return ObjectUtils.compare(d2, d1, true);
    } catch (RuntimeException e) {
      logger.warn("Unable to compare projects, considering equal", e);
      return 0;
    }
  }
}
```

The test passed. o(〃＾▽＾〃)o

Obviously, it's not normal that the comparator contains so many logic here, and
should be refactored as the next step... But for now, at least the problem is
fixed.

## Conclusion

Let's do a recap of what have been discussed here. There was a problem about
sorting, due to incorrect implementation of a comparator. The problem was not
easy to be identified, and was finally identified by method of exhaustion —
listing all the combinations, shuffle then sort, and repeat 10,000 times. The
solution was to compare all fields properly, by comparing fields one after
another. Hope you enjoy this article, see you the next time!

## References

- Mockito, "Mockito framework site", _Mockito_, 2019.
  <https://site.mockito.org/>
- Oracle, "Comparator (Java Platform SE 8)", _Java Documentation_, 2019.
  <https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html>
- Oracle, "Collections (Java Platform SE 8)", _Java Documentation_, 2019.
  <https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html>
- Joshua Bloch, "Effective Java (Second Edition)", _Addison Wesley_, 2015. [Book]
