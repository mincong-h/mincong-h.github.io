---
article_num: 36
layout:      post
title:       "What Is Git Branch?"
lang:                en
date:        "2017-10-04 16:04:48 +0200"
categories:  [git]
tags:        [git]
permalink:         /2017/10/04/what-is-git-branch/
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Many developers use Git in their daily life. Among all the operations, branch
commands might be one of the most important part. But do you know what "branch"
is, and what are the secrets behind branches? This blog post will share some Git
internals with you.

<!--more-->

## Preparation

Before going further, let's prepare a new Git repository with a dummy commit:

    $ git init
    $ echo "Hello world" > README.md
    $ git add README.md
    $ git commit -m "Initial commit"
    $ git log --pretty=oneline
    56f0a2324c87464be433b0aa34c0faa4c4eb761f (HEAD -> master) Initial commit

As you can see, there're only one commit in the repository, the initial one.
Please remember this value because we'll use it later:

    56f0a2324c87464be433b0aa34c0faa4c4eb761f

## Branch Listing

Now let's do a basic branch command `git branch`, which will list all the local
branches in the repository:

    $ git branch
    * master

Branches are stored under a subdirectory of Git internal directory `.git/refs/`,
where local branches are stored in `.git/refs/heads/` and remote branches are
stored in `.git/refs/remotes/`. In our example, you can find `master` branch in
the directory of local branches:

    $ find .git/refs/heads -type f
    .git/refs/heads/master

The asterisk symbol (`*`) means this branch is our HEAD, a reference to the
currently checked-out branch.

    $ cat .git/HEAD
    ref: refs/heads/master

## Finding Commit From Branch

We can see a list of branch names using command `git branch`, but what if we
want to see the information about the last commit in this branch? Well, we can
still use the `git branch` command, with the verbose option:

    $ git branch --verbose
    * master 56f0a23 Initial commit

Why it knows my last commit? Because **a branch in Git is simply a lightweight
movable pointer to one of the commits**. We can prove it by printing the content
of the branch file:

    $ cat .git/refs/heads/master
    56f0a2324c87464be433b0aa34c0faa4c4eb761f

As you can see, it is a SHA1 value, the hash of the commit I mentioned in the
"preparation" section. Thanks to this commit hash, Git is able to find the type
and content of this commit-object:

    $ git cat-file -t 56f0a2324c87464be433b0aa34c0faa4c4eb761f
    commit

    $ git cat-file -p 56f0a2324c87464be433b0aa34c0faa4c4eb761f
    tree 6fab39d62bb85966ad2c061936d74059adcdbe74
    author Mincong HUANG <mincong.h@gmail.com> 1507126168 +0200
    committer Mincong HUANG <mincong.h@gmail.com> 1507126168 +0200

    Initial commit

## Adding New Commits

What happens if you create a new commit in the current branch? The SHA1 value in
the branch changes automatically—pointing to the last commit you made. Branch,
as a lightweight movable pointer, it moves forward automatically.

    $ echo 'Hello Git.' >> README.md
    $ git commit -am 'Update README.md'
    $ cat .git/refs/heads/master
    e5309a4608abbe0ae34fa87ee83fbd4032caf454

    $ git cat-file -p e5309a4608abbe0ae34fa87ee83fbd4032caf454
    tree 443318058f7d5f9db56a9303afe7440e46e5707a
    parent 56f0a2324c87464be433b0aa34c0faa4c4eb761f
    author Mincong HUANG <mincong.h@gmail.com> 1507144455 +0200
    committer Mincong HUANG <mincong.h@gmail.com> 1507144455 +0200

    Update README.md

## Creating A Branch

What happens if you create a new branch? Well, Git will create a new pointer
for you to move around. Let's say you create a new issue-branch for bugfix,
called `issue1`. You can do this with the `git branch` command:

    $ git branch issue1

This creates a new pointer at the same commit you're currently on:

    $ git log --oneline --decorate
    e5309a4 (HEAD -> master, issue1) Update README.md
    56f0a23 Initial commit

And a new file called `issue1` is created under directory `.git/refs/heads/`:

    $ find .git/refs/heads -type f
    .git/refs/heads/issue1
    .git/refs/heads/master

However, your current branch is still `master`, because the `HEAD` doesn't
change—it is another lightweight movable pointer on top of branches:

    $ cat .git/HEAD
    ref: refs/heads/master

Switching branches can be done using the checkout command:

    $ git checkout issue1
    $ git branch
    * issue1
      master

## Conclusion

From this blog post, we dug into the Git internals to understand what is HEAD,
branches. We saw about how a branch interacts with commits. At the end, we
compared the difference between two pointers: HEAD and branch. The key point of
this post is to understand:

> A branch in Git is simply a lightweight movable pointer to one of the commits.

Hope your enjoy this one. See you the next time!

{% include book-git-pro.html %}

## References

- [Pro Git (2nd Edition), Chapter 3 Git Branching][1]
- [Git - git-branch Documentation][2]
- [Git - git-cat-file Documentation][3]

[1]: https://git-scm.com/book/en/v2
[2]: https://git-scm.com/docs/git-branch
[3]: https://git-scm.com/docs/git-cat-file
