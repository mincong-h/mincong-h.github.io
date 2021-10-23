---
layout:            post
title:             'JGit: Config Loading Optimization'
lang:                en
date:              2019-09-08 15:52:08 +0200
categories:        [git]
tags:              [java, git, jgit]
permalink:         /2019/09/08/jgit-config-loading-optimization/
comments:          true
excerpt:           >
    How JGit optimizes internally the configuration loading process using file
    snapshots and reduces unnecessary file I/O?
image:             /assets/bg-josh-calabrese-zcYRw547Dps-unsplash.jpg
cover:             /assets/bg-josh-calabrese-zcYRw547Dps-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today, I will share with you how JGit optimizes the configuration loading
process internally on file repository. After reading this article, you will
understand:

- What is Git repository and Git config
- Why cache is needed for config
- File snapshot as cache
- Invalidation: file size changed
- Invalidation: file key changed
- Invalidation: file content modified

This article is done based on JGit 5.5.0 release candidate 1
(`v5.5.0.201909041048-rc1`).

## Git Repository

A Git repository holds all objects and references used for managing source code
(could by any type of file, but source code is what SCM's are typically used
for). In JGit, there are two types of repositories: file repository
([FileRepository.java][FileRepository])
and distributed filesystem repository
([DfsRepository.java](https://github.com/eclipse/jgit/blob/v5.5.0.201909041048-rc1/org.eclipse.jgit/src/org/eclipse/jgit/internal/storage/dfs/DfsRepository.java)).
Today, I am going to focus only on file repository, the one we used most of the
time on our computer.

In Git terms all data is stored in GIT_DIR, typically a directory called `.git`.
A work tree is maintained unless the repository is a bare repository. Typically
the `.git` directory is located at the root of the work dir.

Directory|Usage
:---|:---
`objects/` | objects
`refs/` | tags and heads
`config` | configuration
`info/` | more configurations

In the following sections, we are going to study the loading of file
`GIT_DIR/config` in JGit.

## Git Configuration

Git configuration is stored as files, e.g. user-scoped configuration
(`~/.gitconfig`) or repository-scoped configuration (`GIT_DIR/config`). They
can be modified anytime by the user or other programs. To keep the
configuration up-to-date and avoid unnecessary file I/O, JGit has to find a
solution. Here is how [FileRepository.java][FileRepository] handles it:

```java
/** {@inheritDoc} */
@Override
public FileBasedConfig getConfig() {
    try {
        SystemReader.getInstance().getUserConfig();
        if (repoConfig.isOutdated()) {
            loadRepoConfig();
        }
    } catch (IOException | ConfigInvalidException e) {
        throw new RuntimeException(e);
    }
    return repoConfig;
}
```

It loads user-scoped configuration, then loads the repo-scoped configuration.
Repository configuration is loaded lazily: it will only be reloaded if the current
one in memory is outdated. But in which conditions the config file is considered
as outdated? 🤔 Let's take a look together.

## File Snapshot

In JGit, a file can be cached as a [FileSnapshot][FileSnapshot]. It caches when
a file was last read, making it possible to detect future edits. This object
tracks the last modified time of a file. Later during an invocation of
`isModified(File)`, the object will return true if the file may have been
modified and should be re-read from disk.

In particular, it contains the following fields to achieve the goal described
above:

1. File key
2. File size
3. File metadata related to changes

When Git repo config is loaded, a [FileSnapshot][FileSnapshot] is created for
the config file using factory method `FileSnapshot#saveNoConfig(File)`:

```java
// org.eclipse.jgit.storage.file.FileBasedConfig#load()
final FileSnapshot newSnapshot;
newSnapshot = FileSnapshot.saveNoConfig(getFile());
```

Then, before reading the actual file, JGit asks if the file snapshot is
modified based on 3 criteria: is size changed? is file key changed? is last
modified (metadata) changed?

```java
// org.eclipse.jgit.internal.storage.file.FileSnapshot
public boolean isModified(File path) {
    // extract metadata from `path`
    ...
    sizeChanged = isSizeChanged(currSize);
    if (sizeChanged) {
        return true;
    }
    fileKeyChanged = isFileKeyChanged(currFileKey);
    if (fileKeyChanged) {
        return true;
    }
    lastModifiedChanged = isModified(currLastModified);
    if (lastModifiedChanged) {
        return true;
    }
    return false;
}
```

Now, let's see how these three invalidation criteria are implemented.

## File Size Changed

```java
// org.eclipse.jgit.internal.storage.file.FileSnapshot#isModified(File)
try {
    BasicFileAttributes fileAttributes = FS.DETECTED.fileAttributes(path);
    currSize = fileAttributes.size();
    ...
} catch (IOException e) {
    currSize = path.length();
    ...
}
```

JGit uses two methods to read file size. Firstly, it tries to obtain this
information from file attributes, if not possible, then fallback to
`java.io.File#length()`.

File attributes are obtained using Java built-in package File NIO
(`java.nio.file`). File size belongs to basic file attributes
(`BasicFileAttributes.class`). It means they are
common to many file systems. If any I/O error occurs, JGit will fallback to
`File#length()`, which uses JVM native method behind the screen.

It is worth mention how JGit initializes the attribute `size` in FileSnapshot.
By default, Java sets class attribute to 0 for primitive type `long`. This will
be confusing face to empty file (length=0). JGit avoids this by setting the
initial value to -1 when length is unknown:

```java
// org.eclipse.jgit.internal.storage.file.FileSnaphost
/**
 * An unknown file size.
 *
 * This value is used when a comparison needs to happen purely on the lastUpdate.
 */
public static final long UNKNOWN_SIZE = -1;
```

## File Key Changed

```java
// org.eclipse.jgit.internal.storage.file.FileSnapshot#isModified(File)
try {
    BasicFileAttributes fileAttributes = FS.DETECTED.fileAttributes(path);
    currFileKey = getFileKey(fileAttributes);
    ...
} catch (IOException e) {
    currFileKey = MISSING_FILEKEY;
    ...
}
```

JGit gets the file key from file basic attributes. File key is an object that
uniquely identifies the given file. On some platforms or file systems,
it is possible to use an identifier, or a combination of identifiers to
uniquely identify a file. Such identifiers are important for operations
such as file tree traversal in file systems that support symbolic links or file
systems that allow a file to be an entry in more than one directory. On UNIX file
systems, for example, the device ID and inode are commonly used for such
purposes.

```sh
jshell> Path p = Paths.get("/Users/mincong/github/jgit/README.md")
p ==> /Users/mincong/github/jgit/README.md

jshell> Files.readAttributes(p, BasicFileAttributes.class).fileKey()
$3 ==> (dev=1000004,ino=8608922817)
```

If the file key changed, JGit considers the file snapshot is invalid (outdated).

## Last Modified Changed

```java
try {
    currLastModified = fileAttributes.lastModifiedTime().toInstant();
    ...
} catch (IOException e) {
    currLastModified = Instant.ofEpochMilli(path.lastModified());
    ...
}
```

JGit gets the last modified time from basic file attributes or from the Path
object. This timestamp indicates the last modified time of the file. If it is
different from the previous one, it means that the file snapshot is outdated.

However, if the last modified time remains the same, we still cannot be sure the
file is not being modified. This is called the ["racy
Git"](https://git-scm.com/docs/racy-git/en) problem (discovered by Pasky). If
two consecutive modifications happen to the file in the same timestamp, the file
snapshot that appears clean when it may not be. Here are the steps for
reproduction:

1. modify 'foo'
2. record file snapshot
3. modify 'foo' again, in-place, without changing its size

In this case, the file is "racily clean". The last modified time remains the same
after step 3, but the file snapshot is no longer valid. More detail is described
in Git documentation page: <https://git-scm.com/docs/racy-git/en>.

## Conclusion

In this article, we saw JGit's optimization on configuration file loading. I
explained what is Git repository and its configuration at different scopes.
We saw how a file is cached as `FileSnapshot`. Then, the 3 conditions to
invalidate the file snapshot: file size changed, file key changed, or last
modified time changed. Also, the corner case "racy Git" to be careful about.

Hope you enjoy this article, see you the next time!

## References

- Git, "racy-git", _Git Documentation_, 2019.
  <https://git-scm.com/docs/racy-git/en>
- Oracle, "BasicFileAttributes (Java Platform SE 8)", _Oracle_, 2019.
  <https://docs.oracle.com/javase/8/docs/api/java/nio/file/attribute/BasicFileAttributes.html>

[FileRepository]: https://github.com/eclipse/jgit/blob/v5.5.0.201909041048-rc1/org.eclipse.jgit/src/org/eclipse/jgit/internal/storage/file/FileRepository.java
[FileSnapshot]: https://github.com/eclipse/jgit/blob/v5.5.0.201909041048-rc1/org.eclipse.jgit/src/org/eclipse/jgit/internal/storage/file/FileSnapshot.java
