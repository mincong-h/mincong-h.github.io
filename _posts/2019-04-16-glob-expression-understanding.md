---
layout:            post
title:             Glob Expression Understanding
date:              2019-04-16 22:21:18 +0200
date_modified:     2020-07-19 11:45:26 +0200
categories:        [java-core]
tags:              [java, glob]
comments:          true
excerpt:           >
    Glob expression syntax, and its usage in Java through Path Matcher and
    Directory Stream.
image:             /assets/bg-markus-winkler-afW1hht0NSs-unsplash.jpg
cover:             /assets/bg-markus-winkler-afW1hht0NSs-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In computer programming, glob patterns specify sets of filenames with wildcard
characters. There are many cases you can use glob expression, when using Bash,
your IDE, or other programs for file searching. The origin of glob comes from
the glob command, and was provided as a library function, `glob()` later on.
In this article, we will take look together the glob expression in Java.

After reading this article, you will understand:

- Basic Glob Syntax
- Glob in Path Matcher
- Glob in Directory Stream

Now, let's get started!

## Basic Glob Syntax

Wildcard | Description
:------- | :----------
`*`      | matches any number of any characters including none
`?`      | matches any single character
`[abc]`  | matches one character given in the bracket
`[a-z]`  | matches one character from the (locale-dependency) range given in the bracket.

In all cases, the path separator (`/` on Unix or `\` on Windows) will never be
matched. Now, let's take a look on some examples:

### The \* Character

The `*` character matches ≥ 0 characters of a name component without crossing
directory boundaries. For example, given the following expression:

```glob
*.txt
```

The matched / unmatched items are:

- ~~`/bar.txt`~~
- ~~`/bar.md`~~
- ~~`/foo/bar.txt`~~
- ~~`/foo/bar.md`~~
- `bar.txt`
- ~~`bar.md`~~

### The \*\* Characters

The `**` characters matches ≥ 0 characters crossing directory boundaries. For
example, given the following expression:

```glob
**.txt
```

The matched / unmatched items are:

- `/bar.txt`
- ~~`/bar.md`~~
- `/foo/bar.txt`
- ~~`/foo/bar.md`~~
- `bar.txt`
- ~~`bar.md`~~

### The ? Character

The `?` character matches exactly one character of a name component. For
example, given the following expression:

```glob
?.txt
```

The matched / unmatched items are:

- ~~`/foo/a.txt`~~
- ~~`/foo/b.txt`~~
- `a.txt`
- `b.txt`
- ~~`.txt`~~
- ~~`foo.txt`~~

### The \[\] Characters

The `[ ]` characters are a _bracket expression_ that match a single character of
a name component out of a set of characters. For example, `[abc]` matches "a",
"b", or "c". The hyphen (-) may be used to specify a range so `[a-z]` specifies
a range that matches from "a" to "z" (inclusive). These forms can be mixed so
`[abce-g]` matches "a", "b", "c", "e", "f" or "g". If the character after the
`[` is a `!` then it is used for negation so `[!a-c]` matches any character
except "a", "b", or "c".

For example, given the following expression:

```glob
[abc].txt
```

The matched / unmatched items are:

- ~~`/foo/a.txt`~~
- ~~`/foo/b.txt`~~
- ~~`/foo/c.txt`~~
- `a.txt`
- `b.txt`
- `c.txt`
- ~~`d.txt`~~
- ~~`ab.txt`~~

Another example, with the following expression:

```glob
/foo/[!abc]*.txt
```

The matched / unmatched items are:

- ~~`/foo/a.txt`~~
- ~~`/foo/b.txt`~~
- ~~`/foo/c.txt`~~
- `/foo/d.txt`
- `/foo/e.txt`
- `/foo/efg.txt`
- ~~`a.txt`~~
- ~~`b.txt`~~
- ~~`c.txt`~~
- ~~`d.txt`~~

Within a bracket expression the `*`, `?` and `\` characters match themselves.
The (`-`) character matches itself if it is the first character within the
brackets, or the first character after the `!` if negating.

## Wildcard Expressions

After all these examples, we have a basic understanding of how different glob
syntax works individually. But it's still not clear how their combination works.
In particular, the wildcard expressions looks very similiar and confusing. Here
is a table of comparison to clarify the usage of wildcard expressions `*.txt`,
`**.txt`, `**/*.txt`, and `/**/*.txt`. Character "M" means matched and "-"
means unmatched:

Path               | \*.txt | \*\*.txt | \*\*/\*.txt | /\*\*/\*.txt
:----------------- | :----: | :------: | :---------: | :----------:
`/bar.txt`         | -      | M        | M           | -
`/foo/bar.txt`     | -      | M        | M           | M
`/foo/bar/baz.txt` | -      | M        | M           | M
`foo/bar.txt`      | -      | M        | M           | -
`bar.txt`          | M      | M        | -           | -

## Glob in Path Matcher

In Java, you can match the path with glob expression via
[`java.nio.file.PathMatcher`](https://docs.oracle.com/javase/8/docs/api/java/nio/file/PathMatcher.html).
A Path Match can be created using `FileSystem#getPathMatcher(String)`, which
accepts a syntax (glob / regex) and pattern as input parameter:

    syntax:pattern

For example, using `**.java` to find all Java files in current directory
and all sub-directories:

```java
PathMatcher m = FileSystems.getDefault().getPathMatcher("glob:**.java");
m.matches(Paths.get("/src/Foo.java")); // true
m.matches(Paths.get("/src/Bar.java")); // true
```

You can combine it with many other use cases.

## Glob in Directory Stream

Glob expression can also be applied to directory stream, an object to iterate
over the entries in a directory. `DirectoryStream` extends `Iterable`, so you
can iterate all the paths in the stream. For example:

```java
try (DirectoryStream<Path> paths = Files.newDirectoryStream(dir, "*.txt")) {
  for (Path path : paths) {
    ...
  }
}
```

However, you should be aware that the directory stream is a listing on the
target directory, without going through the child directories recursively.

- `a.txt`
- `b.txt`
- ~~`sub/a.txt`~~
- ~~`sub/b.txt`~~

## Going Further

How to go further from here?

- To better understand "glob" patterns in computer programming in general, read Wikipedia
  page "glob (programming)".<br>
  <https://en.wikipedia.org/wiki/Glob_%28programming%29>
- To better understand the rules defined by `java.nio.file.PathMatcher` and the meaning of
  different characters, read the Javadoc of method
  `FileSystem#getPathMatcher(String syntaxAndPattern)`.<br>
  <https://docs.oracle.com/javase/8/docs/api/java/nio/file/FileSystem.html#getPathMatcher-java.lang.String->

You can also find the source code of this article on
[GitHub](https://github.com/mincong-h/java-examples/blob/blog/glob/basic/src/test/java/io/mincongh/io/GlobExpressionTest.java).

## Conclusion

In this article, we learnt the basic syntax of glob expression with examples, we
compared different wildcard expressions, we saw how to use glob via
`PathMatcher`, and how to use glob via `DirectoryStream`.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/).
Hope you enjoy this article, see you the next time!

## References

- Oracle, "FileSystem (Java Platform SE 8)", _Oracle_, 2018.
  <https://docs.oracle.com/javase/8/docs/api/java/nio/file/FileSystem.html#getPathMatcher-java.lang.String->
- Oracle, "PathMatcher (Java Platform SE 8)", _Oracle_, 2018.
  <https://docs.oracle.com/javase/8/docs/api/java/nio/file/PathMatcher.html>
- Wikipedia, "Glob (programming)", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/Glob_%28programming%29>
