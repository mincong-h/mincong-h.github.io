---
layout:      post
title:       "JGit Internal: Reference and RevObject"
date:        "2018-03-17 08:24:10 +0100"
categories:  [jgit, git, java]
tags:        [jgit, git, java]
comments:    true
---

Today, I want to discuss Git internal mechanism with you: How Git resolves
references? How JGit, a pure Java implementation of Git, resolves references in
Java? Then, how to use them via class `RevObject` and its subtypes.

## Git References

In Git, files containing SHA-1 values in `.git/refs` directory are called
_"references"_, or _"refs"_. References are used as pointers, so that you don't
need to remember the raw SHA-1 value. For example, checkout `master` instead of
checkout a commit SHA-1. There're different types of reference stored in the Git
repository. You can explore them using a `find` command:

```
$ find .git/refs -type d
.git/refs
.git/refs/heads
.git/refs/tags
.git/refs/remotes
.git/refs/remotes/origin
```

As you can see, there're head, tag, and remote references. I'll explain them
one by one. But before that, let's see the equivalent in JGit.

## JGit References

In JGit, the references are stored in `RefDatabase`:

{% highlight java %}
public abstract class RefDatabase {
  /**
   * Order of prefixes to search when using non-absolute references.
   * <p>
   * The implementation's {@link #getRef(String)} method must take this search
   * space into consideration when locating a reference by name. The first
   * entry in the path is always {@code ""}, ensuring that absolute references
   * are resolved without further mangling.
   */
  protected static final String[] SEARCH_PATH = { "", //$NON-NLS-1$
      Constants.R_REFS, //
      Constants.R_TAGS, //
      Constants.R_HEADS, //
      Constants.R_REMOTES //
  };

  ...
}
{% endhighlight %}

## Resolving HEAD

The HEAD file is a symbolic reference to the branch you're currently on. By
symbolic reference, it means that id doesn't generally contain a SHA-1 value,
but rather a pointer to another reference. The reference of HEAD can be
retrieved from `.git/HEAD` in Git. Here, it points to _jgit_, the current branch
where I'm writing this blog post. If you check the file stored in path
`refs/heads/jgit`, you can see the object pointed by this reference is a commit.

```
$ git show-ref HEAD --head --heads
eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc HEAD

$ cat .git/HEAD
ref: refs/heads/jgit

$ cat .git/refs/heads/jgit
eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc

$ git cat-file -t eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc
commit
```

The same logic can be done in JGit: after peeling the intermediate reference,
the HEAD resolution points to a commit, which is the latest commit of the
current branch:

{% highlight java %}
ObjectId commitId = repo.resolve(Constants.HEAD);
try (RevWalk walk = new RevWalk(repo)) {
  RevObject object = walk.parseAny(commitId);
  // Do sth ...
}
{% endhighlight %}

## Resolving Branch

Resolving branch is almost the same as resolving HEAD, but you need to
distinguish local branches and remote branches. Local branches are stored in
directory `.git/refs/heads` and remote branches are stored in
`.git/refs/remote`. Actually, using the word "remote branch" are incorrect,
the right word is "remote reference". All the remote references (tags, heads)
are stored in `.git/refs/remote`.

Resolve the master branch from reference database using Git:

```
$ git show-ref master --heads
eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc refs/heads/master

$ cat .git/refs/heads/master
eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc

$ git cat-file -t eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc
commit
```

In JGit:

{% highlight java %}
ObjectId commitId = repo.resolve(Constants.MASTER);
try (RevWalk walk = new RevWalk(repo)) {
  RevCommit commit = walk.parseCommit(commitId);
  // Do sth ...
}

{% endhighlight %}

## Resolving Tag

### Lightweight Tag

Lightweight tag is basically the commit checksum stored in a file—no other
information is kept. To create a light weighting tag, don't supply any of the
`-a`, `-s`, or `-m` options, just provide a tag name. Then you can verify the
creation by using git-show-ref command, and verify the information stored by
using the git-cat-file command:

```
$ git tag 1.0-lw

$ git show-ref 1.0-lw --tags
eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc refs/tags/1.0-lw

$ git cat-file -t eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc
commit
```

In JGit, resolving a light weight can be done as following. Note that I'm using
the method `RevWalk#parseCommit(ObjectId)`, because lightweight tag points to
commit.

{% highlight java %}
// Create an lightweight tag (annotated=false)
git.tag().setAnnotated(false).setName("1.0-lw").call();

ObjectId tagId = repo.resolve("1.0-lw");
try (RevWalk walk = new RevWalk(repo)) {
  RevCommit commit = walk.parseCommit(tagId);
  // Do sth ...
}
{% endhighlight %}

### Annotated Tag

Different from lightweight tags, annotated tags are stored as full objects in
the Git database. They're checksum, contain the information of tagger
(name, email, date), have a tagging message, and can be signed and verified with
GNU Privacy Guard (GPG).

```
$ git tag -a 1.0 -m "Release 1.0"

$ git show-ref 1.0 --tags
0e63979ea6b60f077f7e8f7234d9a7448b1243aa refs/tags/1.0

$ git cat-file -t 0e63979ea6b60f077f7e8f7234d9a7448b1243aa
tag
```

Unlike lightweight, the resolution of an annotated tag points to a tag object.
Therefore, you should parse it as `RevTag`:

{% highlight java %}
// Create an annotated tag (annotated=true)
Ref tagRef = git.tag().setAnnotated(true).setName("1.0").call();

ObjectId tagId = repo.resolve("1.0");
try (RevWalk walk = new RevWalk(repo)) {
  RevTag tag = walk.parseTag(tagId);
  // Do sth ...
}
{% endhighlight %}

If you're not interested by tags, you can also peel them, and find the commit
directly using the `RevWalk#parseCommit(ObjectId)` method:

{% highlight java %}
ObjectId tagId = repo.resolve("1.0");
try (RevWalk walk = new RevWalk(repo)) {
  RevCommit commit = walk.parseCommit(tagId);
  // Do sth ...
}
{% endhighlight %}

## Resolving Tree

Tree objects look like UNIX directory entries. A single tree object contains one
or more tree entries, each of which contains a SHA-1 pointer to a blob or
subtree. For example, the tree of a commit looks like:

```
$ git cat-file -p eb6c6a5d1f06da34e88eb28c7d51560d721bf0dc^{tree}
100644 blob c009c0f4ec2a635473c5be36b3d0f55740b69d9d	.gitignore
100755 blob 4bf3f7d8fca35a944e38e273e6ff3da2e292d81b	404.html
100644 blob f7041372d8f983b48eb96586909282bbc5f142c2	README.md
...
```

In JGit, you can use method `RevWalk#parseTree(ObjectId)` to parse a tree:

{% highlight java %}

String revStr = initialCommit.name() + "^{tree}";
ObjectId treeId = repo.resolve(revStr);
try (RevWalk walk = new RevWalk(repo)) {
  RevTree tree = walk.parseTree(treeId);
  // Do sth ...
}
{% endhighlight %}

## References

- [Git documentation: git-show-ref][git-show-ref]
- [Git Pro (2nd Edition): 2.6 Git Basics - Tagging][git-tagging]
- [Git Pro (2nd Edition): 10.3 Git Internals - Git References][git-ref]

[git-show-ref]: https://git-scm.com/docs/git-show-ref
[git-ref]: https://git-scm.com/book/id/v2/Git-Internals-Git-References
[git-tagging]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
