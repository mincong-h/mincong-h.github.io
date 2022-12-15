---
article_num: 123
layout:            post
title:             Unzipping File in Java
lang:                en
date:              2019-10-27 22:07:58 +0100
categories:        [java-core]
tags:              [java]
permalink:         /2019/10/27/unzipping-file-in-java/
comments:          true
excerpt:           >
    Unzipping zip file in Java 8 using builtin Java classes: ZipInputStream and
    ZipEntry. Implementation supports sub-directories as well.
image:             /assets/bg-coffee-2242213_1280.jpg
cover:             /assets/bg-coffee-2242213_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today, I will share with you how to unzip (extract) a ZIP file into a complete
directory. Recently, I need a code snippet for extracting a ZIP file for
QA purposes. However, the top results shown on the search engine did not work.
So I decided to share my implementation with you. After reading this article,
you will understand:

- How to unzip a given ZIP file?
- Required and optional parameters before launching the unzip command
- Limitations

Now let's get started.

## TL;DR

If you don't have time to read the entire article, here is the summary. You can
copy-paste the
following code snippet. Then, you have to complete 2 parameters: the source
file path (ZIP) to extract (`sourceZip`) and the target directory to store the
extracted files (`targetDir`). Note that a new directory without the ".zip"
suffix will be created in that target directory. For example, extracting zip
file `tomcat.zip` to `~/Downloads` target directory, the extracted files will be
stored at `~/Downloads/tomcat`.

```java
/**
 * Execute the unzip command.
 *
 * @throws IOException if any I/O error occurs
 */
public void exec() throws IOException {
  Path root = targetDir.normalize();
  try (InputStream is = Files.newInputStream(sourceZip);
      ZipInputStream zis = new ZipInputStream(is)) {
    ZipEntry entry = zis.getNextEntry();
    while (entry != null) {
      Path path = root.resolve(entry.getName()).normalize();
      if (!path.startsWith(root)) {
        throw new IOException("Invalid ZIP");
      }
      if (entry.isDirectory()) {
        Files.createDirectories(path);
      } else {
        try (OutputStream os = Files.newOutputStream(path)) {
          byte[] buffer = new byte[1024];
          int len;
          while ((len = zis.read(buffer)) > 0) {
            os.write(buffer, 0, len);
          }
        }
      }
      entry = zis.getNextEntry();
    }
    zis.closeEntry();
  }
}
```

---

Now, if you are interested in the complete version, let my explain the longer
story for you.

## Usage

My unzip command implementation uses the builder pattern so that you can pass
arguments as named parameters before launching the unzip command. There are
currently 3 parameters:

Parameter    | Description
:----------: | :------------------
`sourceZip`  | (REQUIRED) Source filepath to unzip.
`targetDir`  | (REQUIRED) Target directory where the unzipped files should be placed. The given input has to be an existing directory.
`bufferSize` | (OPTIONAL) Byte-size for the unzip buffer. The value must be positive. Default to 1024 bytes.

Here are two examples of usage:

```java
UnzipCommand cmd =
    UnzipCommand.newBuilder()
        .sourceZip(sourceZip)
        .targetDir(targetDir)
        .build();
cmd.exec();
```

```java
UnzipCommand cmd =
    UnzipCommand.newBuilder()
        .sourceZip(sourceZip)
        .targetDir(targetDir)
        .bufferSize(2048)  // optional
        .build();
cmd.exec();
```

Any I/O failure will be thrown as I/O exception (`java.io.IOException`).

## Implementation

Here is my implementation ([see it on
GitHub](https://github.com/mincong-h/java-examples/blob/blog/2019-10-27-unzip/io/src/main/java/io/mincongh/io/UnzipCommand.java)):

```java
package io.mincongh.io;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * @author Mincong Huang
 * @since 0.1
 */
public class UnzipCommand {

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private Path targetDir;
    private Path sourceZip;
    private int byteSize = 1024;

    private Builder() {}

    /**
     * (REQUIRED) Source filepath to unzip.
     *
     * @param zip the filepath to unzip
     * @return this
     */
    public Builder sourceZip(Path zip) {
      this.sourceZip = zip;
      return this;
    }

    /**
     * (REQUIRED) Target directory where the unzipped files should be placed. The given input has to
     * be an existing directory.
     *
     * <p>Example: Unzipping "/source/foo.zip" to target directory "/target/", the results will be
     * found in directory "/target/foo/".
     *
     * @param dir existing target directory
     * @return this
     */
    public Builder targetDir(Path dir) {
      this.targetDir = dir;
      return this;
    }

    /**
     * (OPTIONAL) Byte size for the unzip buffer. The value must be positive. Default to 1024 bytes.
     *
     * @param byteSize byte size for the unzip buffer
     * @return this
     */
    public Builder bufferSize(int byteSize) {
      this.byteSize = byteSize;
      return this;
    }

    public UnzipCommand build() {
      Objects.requireNonNull(sourceZip);
      Objects.requireNonNull(targetDir);
      if (byteSize <= 0) {
        throw new IllegalArgumentException("Required positive value, but byteSize=" + byteSize);
      }
      return new UnzipCommand(this);
    }
  }

  private final int byteSize;
  private final Path sourceZip;
  private final Path targetDir;

  private UnzipCommand(Builder builder) {
    this.byteSize = builder.byteSize;
    this.sourceZip = builder.sourceZip;
    this.targetDir = builder.targetDir;
  }

  /**
   * Execute the unzip command.
   *
   * @throws IOException if any I/O error occurs
   */
  public void exec() throws IOException {
    Path root = targetDir.normalize();
    try (InputStream is = Files.newInputStream(sourceZip);
        ZipInputStream zis = new ZipInputStream(is)) {
      ZipEntry entry = zis.getNextEntry();
      while (entry != null) {
        Path path = root.resolve(entry.getName()).normalize();
        if (!path.startsWith(root)) {
          throw new IOException("Invalid ZIP");
        }
        if (entry.isDirectory()) {
          Files.createDirectories(path);
        } else {
          try (OutputStream os = Files.newOutputStream(path)) {
            byte[] buffer = new byte[byteSize];
            int len;
            while ((len = zis.read(buffer)) > 0) {
              os.write(buffer, 0, len);
            }
          }
        }
        entry = zis.getNextEntry();
      }
      zis.closeEntry();
    }
  }
}
```

In my implementation, the file input stream and ZIP input stream are used to
read and extract entries. They are automatically and safely closed at the end
using the try-with-resources statement. Each entry in the ZIP
file is considered as a ZIP entry (`java.util.zip.ZipEntry`) and is visited
using ZIP input stream. The entry list will be exhausted when all entries are
visited once. In other words, the list will be exhauste when the next entry
will be _null_. Note that ZIP entry can be either a directory or a regular
file, they need to be treated differently. The size of the output buffer
(byte array) is controlled by the parameter `bufferSize`. It defaults to 1024 bytes.

lang:                en
Update: my friend [Florent Guillaume](https://github.com/efge) pointed out that
the previous version was vulnerable for [Zip
Slip](https://snyk.io/research/zip-slip-vulnerability) attack. Now the source
code has been updated and the problem has been fixed.

## Limitations

- The file permissions are not preserved. When the ZIP file contains an executable
  entry, such as `rwxr-xr-x`, the access permission for the executable is lost.
- The source code is tested manually on Windows (Windows 10), because Travis CI
  does not support Windows build for Java project. Let me know if there is any
  bug.

## Conclusion

Today, we saw how to unzip a ZIP file in Java 8+ using `java.util.zip.*`, more
precisely using Zip Entry and Zip Input Stream. The source code is available on GitHub in
[mincong-h/java-examples](https://github.com/mincong-h/java-examples) as
[UnzipCommand.java](https://github.com/mincong-h/java-examples/blob/blog/2019-10-27-unzip/io/src/main/java/io/mincongh/io/UnzipCommand.java).
Interested to know more about Java? You can subscribe to [my feed](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Pankaj, "Java Unzip File Example", _JournalDev_, 2019.
  <https://www.journaldev.com/960/java-unzip-file-example>
- Baeldung, "Zipping and Unzipping in Java", _Baeldung_, 2019.
  <https://www.baeldung.com/java-compress-and-uncompress>
- Lokesh Gupta, "Java - Unzip File with Sub-directories", _HowToDoInJava_, 2019.
  <https://howtodoinjava.com/java/io/unzip-file-with-subdirectories/>
- Mkyong, "How to decompress files from a ZIP file", _Mkyong_, 2010.
  <https://www.mkyong.com/java/how-to-decompress-files-from-a-zip-file/>
- Waypoint, "Java ZIP - how to unzip folder?", _StackOverflow_, 2012.
  <https://stackoverflow.com/questions/10633595/java-zip-how-to-unzip-folder>
