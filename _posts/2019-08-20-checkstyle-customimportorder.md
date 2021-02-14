---
layout:            post
title:             Checkstyle CustomImportOrder
date:              2019-08-20 20:27:05 +0200
categories:        [build]
tags:              [java, checkstyle, code-quality]
comments:          true
excerpt:           >
    Fix import order in Java class using Checkstyle's CustomImportOrder module.
    This article explains how I did it for Nuxeo Online Services.
image:             /assets/bg-notebook-1280538_1280.jpg
cover:             /assets/bg-notebook-1280538_1280.jpg
ads:               None
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today I would like to share my recent work on Checkstyle at Nuxeo. In our
codebase, we use Java heavily. Managing import statements for Java files is
not easy, import order might be changed unintentionally. To avoid this
kind of manual checking, I decided to add a new rule for Checkstyle:
[CustomImportOrder](https://checkstyle.org/config_imports.html#CustomImportOrder).

After reading this article, you will understand:

- The Different groups in "CustomImportOrder"
- Modeling import statements
- Configuring Checkstyle module
- Fixing existing import
- Other tasks to handle

If you don't have time to read the whole article, here is the summary of the
changes in Checkstyle configuration (`checkstyle.xml`):

```diff
@@ -27,6 +27,11 @@
     <module name="AvoidStarImport"/>
     <module name="RedundantImport"/>
     <module name="UnusedImports"/>
+    <module name="CustomImportOrder">
+      <property name="customImportOrderRules" value="STATIC###STANDARD_JAVA_PACKAGE###SPECIAL_IMPORTS###THIRD_PARTY_PACKAGE"/>
+      <property name="specialImportsRegExp" value="^org\."/>
+    </module>

     <!-- Miscellaneous -->
     <module name="ArrayTypeStyle"/>
```

## Import Groups

According to Checkstyle documentation [Checkstyle CustomImportOrder > Rule
Description](https://checkstyle.org/config_imports.html#CustomImportOrder_Rule_Description),
the rule consists 5 groups: STATIC, SAME\_PACKAGE(n), THIRD\_PARTY\_PACKAGE,
STANDARD\_JAVA\_PACKAGE, and SPECIAL\_IMPORTS.

**STATIC group.** This group sets the ordering of static imports.

**SAME\_PACKAGE(n) group.** This group sets the ordering of the same package
imports. Imports are considered on SAME\_PACKAGE group if n first domains in
package name and import name are identical:

```java
package java.util.concurrent.locks;

import java.io.File;
import java.util.*; //#1
import java.util.List; //#2
import java.util.StringTokenizer; //#3
import java.util.concurrent.*; //#4
import java.util.concurrent.AbstractExecutorService; //#5
import java.util.concurrent.locks.LockSupport; //#6
import java.util.regex.Pattern; //#7
import java.util.regex.Matcher; //#8
```                

If we have SAME\_PACKAGE(3) on configuration file, imports `#4-6` will be
considered as a SAME\_PACKAGE group (java.util.concurrent.\*,
java.util.concurrent.AbstractExecutorService,
java.util.concurrent.locks.LockSupport). SAME\_PACKAGE(2) will include `#1-8`.
SAME\_PACKAGE(4) will include only `#6`. SAME\_PACKAGE(5) will result in no
imports assigned to SAME\_PACKAGE group because actual package
java.util.concurrent.locks has only 4 domains.

**THIRD\_PARTY\_PACKAGE group.** This group sets ordering of third party
imports. Third-party imports are all imports except STATIC, SAME\_PACKAGE(n),
STANDARD\_JAVA\_PACKAGE and SPECIAL\_IMPORTS.

**STANDARD\_JAVA\_PACKAGE group.** By default, this group sets ordering of
standard java/javax imports.

**SPECIAL\_IMPORTS group.** This group may contain some imports that have
particular meaning for the user.

## Modeling Import Statements

Before applying the Checkstyle module CustomImportOrder, I have to understand how
Nuxeo import statements work. Nuxeo import order is defined by file
`nuxeo.importorder`:

```ini
#Organize Import Order
#Thu Dec 04 14:57:39 CET 2014
3=com
2=org
1=javax
0=java
```

It means Java (`java`) and Java EE (`javax`) import statements go first; then
non-profitable organization (`org`) go next; finally, the company's statements go
last (`com`). It is worth to mention that static statements are not part of this
order. In IntelliJ IDEA, static statements go before Java statements, so I just
followed the existing rule, thus considered it as the order "-1".

```java
package com.nuxeo.pkg;

import static com.nuxeo.pkg.Constants.A;
import static com.nuxeo.pkg.Constants.B;
import static com.nuxeo.pkg.Constants.C;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;

import org.apache.commons.io.FileUtils;

import com.nuxeo.pkg.ClassA;
import com.nuxeo.pkg.ClassB;
import com.nuxeo.pkg.ClassC;
```

As you can see, static statements match Checkstyle group STATIC; Java and Java
EE statements match Checkstyle group STANDARD\_JAVA\_PACKAGE, defined
by the regular expression: `^(java|javax)\.`. For the remaining ones, there are only
`org.*` and `com.*`. But how to match them with groups? My first feeling is to
avoid SAME\_PACKAGE(n) group, because there is no distinction for packages
starting with the same package name as the current one. So SAME\_PACKAGE(n) is
not an option. Then, I went to THIRD\_PARTY\_PACKAGE: since this group contains
all statements not being included by other groups, it can fit our need! Make
`org.*` goes to SPECIAL\_IMPORT group, then `com.*` can be considered as others.
Therefore, the import groups are modelized as:

1. STATIC
2. STANDARD\_JAVA\_PACKAGE
3. SPECIAL\_IMPORT
4. THIRD\_PARTY\_PACKAGE

## Configuring Checkstyle

Based on the result above, the Checkstyle module can be configured with property
`customImportOrderRules` containing the 4 groups, with `###` as the separator:

```xml
<property
  name="customImportOrderRules"
  value="STATIC###STANDARD_JAVA_PACKAGE###SPECIAL_IMPORTS###THIRD_PARTY_PACKAGE" />
```

Combined with special imports regular expression:

```xml
<property
  name="specialImportsRegExp"
  value="^org\." />
```

and all remaining properties can be kept as default. They don't have to be
changed.

The final diff in checkstyle.xml is:

```diff
@@ -27,6 +27,11 @@
     <module name="AvoidStarImport"/>
     <module name="RedundantImport"/>
     <module name="UnusedImports"/>
+    <module name="CustomImportOrder">
+      <property name="customImportOrderRules" value="STATIC###STANDARD_JAVA_PACKAGE###SPECIAL_IMPORTS###THIRD_PARTY_PACKAGE"/>
+      <property name="specialImportsRegExp" value="^org\."/>
+    </module>

     <!-- Miscellaneous -->
     <module name="ArrayTypeStyle"/>
```

## Fix Existing Imports

Once done, I had to fix all existing import statements. I launched the following
Maven command to check them manually:

```
$ mvn checkstyle:check
```

They might also be fixed using IDE auto-format tool. For example, in IntelliJ
IDEA, you can select the root directory in Project view, right-click and choose
either "Reformat Code" or "Optimize Imports" to do that.

<p align="center">
  <img src="/assets/20190820-imports.png" alt="Optimize Imports" />
</p>

## Other Tasks

After the fix, I have to notify teammates about the changes, also ensure their
IDE settings have the custom import order defined by our own file
`nuxeo.importorder`. This step is very important because teammates might not
aware of such changes.

## Conclusion

Today, I shared my work experience about adding
[CustomImportOrder](https://checkstyle.org/config_imports.html#CustomImportOrder)
into existing checkstyle rules for Maven project. We saw the 5 import groups for
static, same-package, third-party, standard Java, and special imports.

By the way, I sent some pull-requests to the Checkstyle project recently. You can
see my contributions here:
<https://github.com/checkstyle/checkstyle/commits?author=mincong-h>.
Thanks to them, I believe I will be able to share more with you in the future,
related to Checkstyle or code-quality in general. Hope you enjoy this article,
see you the next time!

## References

- Checkstyle, "CustomImportOrder", _Checkstyle_, 2019.
  <https://checkstyle.org/config_imports.html#CustomImportOrder>
