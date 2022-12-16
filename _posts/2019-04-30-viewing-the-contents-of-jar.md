---
article_num: 108
layout:            post
title:             Viewing the Contents of JAR
lang:                en
date:              2019-04-30 19:58:52 +0200
categories:        [java-core]
tags:              [java]
permalink:         /2019/04/30/viewing-the-contents-of-jar/
comments:          true
excerpt:           >
    Listing files inside a JAR or displaying content of a single file using
    different commands: "jar", "unzip", or "vim".
image:             /assets/bg-philatelist-1844078_1280.jpg
cover:             /assets/bg-philatelist-1844078_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

As a Java developer, it's important to understand how to manipulate
JAR file. It happened to me recently, because I needed to inspect and modify
some files in a JAR during development. In this article, I will share with you
some commands that help to do that. After reading this article, you will
understand how to:

- Create a JAR
- List all files inside a JAR
- Display content of a single file
- Extract files

## Create JAR

Before continuing, let's create a simple JAR file for the demo purpose. Here's
the structure of the project with 3 files:

```
demo $ tree
.
├── App.java
├── README.md
└── docs
    └── foo.txt

1 directory, 3 files
```

README.md:

```md
# App

README is not always useful. The end.
```

App.java:

```java
public class App {
  public static void main(String[] args) {
    System.out.println("Hello world!");
  }
}
```

docs/foo.txt:

```
bar
```

Now, compile the source code and use command `jar` to create (`c`) a JAR file,
which will include 3 files: the class file, the txt and the README. The
created JAR will be stored in relative filepath (`f`)  `app.jar`. The entire
process will be done in verbose mode (`v`).

```
$ javac App.java
$ jar cvf app.jar App.class README.md docs
added manifest
adding: App.class(in = 412) (out= 288)(deflated 30%)
adding: README.md(in = 45) (out= 47)(deflated -4%)
adding: docs/(in = 0) (out= 0)(stored 0%)
adding: docs/foo.txt(in = 4) (out= 6)(deflated -50%)
```

## List Files

List all the files inside the JAR without extracting it. This can be done using
either command `jar`, `unzip` or `vim`.

Using `jar` command in normal mode: viewing the table (`t`) of contents of the
JAR file, available in filepath (`f`) `app.jar` which is the current directory.
The command displays the contents of the JAR file to standard output:

```
$ jar tf app.jar
META-INF/
META-INF/MANIFEST.MF
App.class
README.md
docs/
docs/foo.txt
```

Using `jar` command in verbose mode (`v`):

```
$ jar tvf app.jar
     0 Tue Apr 30 20:38:16 CEST 2019 META-INF/
    69 Tue Apr 30 20:38:16 CEST 2019 META-INF/MANIFEST.MF
   412 Tue Apr 30 20:37:34 CEST 2019 App.class
    45 Tue Apr 30 20:12:46 CEST 2019 README.md
     0 Tue Apr 30 20:36:16 CEST 2019 docs/
     4 Tue Apr 30 20:36:16 CEST 2019 docs/foo.txt
```

Using `unzip` command in normal mode: list (`-l`) archive files in short format.
The names, uncompressed file sizes and modification dates and times of the
specified files are printed, along with totals for all files specified.

```
$ unzip -l app.jar
Archive:  app.jar
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  04-30-2019 20:38   META-INF/
       69  04-30-2019 20:38   META-INF/MANIFEST.MF
      412  04-30-2019 20:37   App.class
       45  04-30-2019 20:12   README.md
        0  04-30-2019 20:36   docs/
        4  04-30-2019 20:36   docs/foo.txt
---------                     -------
      530                     6 files
```

Using `unzip` command in verbose mode (`-v`):

```
$ unzip -v app.jar
Archive:  app.jar
 Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
--------  ------  ------- ---- ---------- ----- --------  ----
       0  Defl:N        2   0% 04-30-2019 20:38 00000000  META-INF/
      69  Defl:N       68   1% 04-30-2019 20:38 4c2a0a51  META-INF/MANIFEST.MF
     412  Defl:N      288  30% 04-30-2019 20:37 3bcbe29a  App.class
      45  Defl:N       47  -4% 04-30-2019 20:12 0f4320d6  README.md
       0  Stored        0   0% 04-30-2019 20:36 00000000  docs/
       4  Defl:N        6 -50% 04-30-2019 20:36 04a2b3e9  docs/foo.txt
--------          -------  ---                            -------
     530              411  23%                            6 files
```

Using VIM: VIM editor contains a ZIP script (`zip.vim`) which allows you to
browse ZIP file directly, which is also valid for JAR files. To enter into a
file, you need to select a file with cursor and press ENTER key.

```
$ vim app.jar
```

```vim
" zip.vim version v28
" Browsing zipfile /Users/mincong/Desktop/demo/app.jar
" Select a file with cursor and press ENTER

META-INF/
META-INF/MANIFEST.MF
App.class
README.md
docs/
docs/foo.txt
```

For those who are curious, you can show all the script names using command
`:scriptnames` in VIM editor.

## Display File Content

Using `unzip` command: extract files to stdout / screen with the name of each
file printed. Similar to `-p`. Here's an example of displaying content of
README and foo:

```
$ unzip -c app.jar README.md docs/foo.txt
Archive:  app.jar
  inflating: README.md
# App

README is not always useful. The end.

  inflating: docs/foo.txt
bar
```

Using `unzip` command (2): extract files to pipe (`-p`) (stdout). Nothing but
the file data is sent to stdout, and the files are always extracted in binary
format, just as they are stored (no conversions).

```
$ unzip -p app.jar README.md
# App

README is not always useful. The end.
```

```
$ unzip -p app.jar docs/foo.txt
bar
```

Using `vim` command: open VIM editor and browse the file as described in section
above. Select a file and press ENTER will enter into a file. You can edit it and
save (`:x`), too.

```
$ vim app.jar
```

## Extract Files

After viewing the contents is not enough for you, perhaps you will want to
extract some files from the JAR, too.

Extracting (`x`) one file from JAR can be done using `jar`, where you need to
provide the filepath `f` of the JAR and the target files to extract:

```
$ jar xf app.jar README.md
```

Without the target files to extract, command `jar` will extract all files in the
current directory:

```
$ jar xf app.jar
```

## Conclusion

In this article, we saw different methods of viewing contents of a JAR file
using `jar`, `unzip`, and `vim`. Hope you enjoy this article, see you the next
time!

## References

- Oracle, "Viewing the Contents of a JAR File",
  _Oracle - Java Documentation_, 2017.
  <https://docs.oracle.com/javase/tutorial/deployment/jar/view.html>
- Rob Rolnick, "How do I list loaded plugins in Vim?", _Stack Overflow_, 2008.
  <https://stackoverflow.com/a/48952>
- Dustin Marx, "Viewing a JAR's Manifest File", _Java World_, 2011.
  <https://www.javaworld.com/article/2074054/viewing-a-jar-s-manifest-file.html>
