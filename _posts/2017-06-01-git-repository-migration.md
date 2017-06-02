---
layout:      post
title:       "Git Repository Migration"
date:        "2017-06-01 09:02:14 +0200"
categories:  [weekly, git]
comments:    true
---

During your study or in your daily job, you might need to use Git as your
versioning system. Sometimes, you might also need to transfer your Git
repository based on different reasons: backup, ownership transfer, Git server
migration, etc. **No matter for which reason, you'll need to ensure the entirety
of the Git repository during the transfer, including all the branches and
tags.** This article explains how to achieve it step-by-step, and the mechanism
behind the screen.

<!--more-->

In this example, we've 2 Git repositories:

* Old repository: <https://mhuang@gitlab.com/mhuang/awesome.git>
* New repository: <https://mhuang@gitlab.com/mhuang/backup.git>

And the summary for this transfer is:

```sh
$ git clone --mirror https://mhuang@gitlab.com/mhuang/awesome.git
$ cd awesome.git
$ git remote set-url origin https://mhuang@gitlab.com/mhuang/backup.git
$ git push origin
```

Now, if you're curious to know about the technical detail, please read the rest
of my article.

## Clone the Git Repository in Mirror Mode

The first step is to clone the Git repository from the old URL in mirror mode
`--mirror`. It means that we're setting up a mirror of the source repository.
This implies `--bare`. Compared to `--bare`, `--mirror` not only maps local
branches of the source to local branches of the target, it maps all refs
(including remote-tracking branches, notes etc.) and sets up a refspec
configuration such that all these refs are overwritten by a `git remote update`
in the target repository.

What we're interested here, is that `--mirror` mode maps all references,
especially all the tags. The refspec configuration the refs overwriting is not
used here, since we'll change the remote URL in the next step.

```sh
$ git clone --mirror https://mhuang@gitlab.com/mhuang/awesome.git
Cloning into bare repository 'awesome.git'...
remote: Counting objects: 10, done.
remote: Compressing objects: 100% (4/4), done.
remote: Total 10 (delta 1), reused 0 (delta 0)
Unpacking objects: 100% (10/10), done.
```

We're currently in directory `~/gitlab`. In order to manipulate the mirror,
we need to go into the directory of the mirror.

    $ cd awesome.git

## Check the Entirety of References (Optional)

Now we've cloned the existing repository from GitLab. You might want to check
the entirety of the mirrored repo by verifying the references in it. This
operation can be done via the [git-show-ref][git-show-ref] command:

    $ git show-ref
    5e84f7e6ae291bcd9f5efc50156075f9d891f904 refs/heads/issue-1
    cf5a1efc29a988ab730b64db4d90b34e09f2e911 refs/heads/issue-2
    2155d68e12e0d95f1e5bc5e34e48401eb447cc5d refs/heads/master
    3e096cd37e128d929a530bb99d0702c13a6bc433 refs/tags/v1.0

So everything has been cloned from the old repository: 3 branches and a tag.

## Reset the Remote URL

Now we want to transfer our Git repository to the new location. Before that,
we need to reset the URL of the remote `origin` from `awesome.git` to
`backup.git`. On one side, it means we're now ready to push the new
repository `backup.git`; on the other side, it remove the relationship with the
old repository `awesome.git`—which ensures that all the following operations
will NOT damage the old repository in any case. This is important because we
don't want to damage the production environment. So now, the remote that we're
tracking is no longer the old repository, but the new one.

```sh
$ git remote set-url origin https://mhuang@gitlab.com/mhuang/backup.git
```

## Push the Local Mirror to the New Remote

We're ready for the transfer in this step. Let's do it! A simple `git-push`
command to the origin would be enough.

```sh
awesome.git (BARE:master) $ git push -f origin
Counting objects: 10, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (4/4), done.
Writing objects: 100% (10/10), 769 bytes | 0 bytes/s, done.
Total 10 (delta 1), reused 0 (delta 0)
To https://gitlab.com/mhuang/backup.git
 * [new branch]      issue-1 -> issue-1
 * [new branch]      issue-2 -> issue-2
 * [new branch]      master -> master
 * [new tag]         v1.0 -> v1.0
```

As you might have already noticed, after the `git-push` command:

* All branches have been transferred, including `issue-1`, `issue-1`,
  and `master`.
* All tags have been transferred, including `v1.0`.

So we did a great job and all the references have been transferred successfully.
Congratulations!

See also:

* [Git - git-clone Documentation][git-clone]
* [Git - git-show-ref Documentation][git-show-ref]

[git-clone]: https://git-scm.com/docs/git-clone
[git-show-ref]: https://git-scm.com/docs/git-show-ref
