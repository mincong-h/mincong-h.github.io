---
layout:            post
title:             "Git: Upstream Tracking Understanding"
date:              2018-05-02 20:41:53 +0200
last_modified_at:  2019-08-15 15:54:04 +0200
categories:        [git]
tags:              [git, java, jgit]
comments:          true
excerpt:           >
    A quick introduction about Git upstream tracking: set upstream with git-push
    or git-branch, the internal mechanism inside Git config (.git/config),
    unset upstream, and related implementation in Java (JGit).
image:             /assets/bg-salmon-1107404_1280.jpg
---

Today, I'd like to talk about tracking upstream branch in Git.

## Summary

Here're 3 possibilities to track upstream:

```sh
# Set upstream when pushing to remote
git push -u origin topic

# Set upstream without pushing it
# with option -u / --set-upstream-to
git branch -u origin/topic
git branch --set-upstream-to=origin/topic
```

More detail is available in the following sections.

{% include book-git-pro.html %}

## Set Upstream

You can make you local branch track the upstream the first time you push that
branch. Option `-u` or `--set-upstream` allows to add upstream (tracking)
reference for every branch that is up to date or successfully pushed. For
example, my local repository is checkout in `issue-1`: if I want to push it
to `origin` and add upstream reference as `origin/issue-1`, I can do:

```
$ git push -u origin issue-1
```

If you don't want to push anything, you can also do it using
[git-branch][git-branch] command. A local branch can track a remote branch using
git-branch with long option `--set-upstream-to=<upstream>` or short option
`-u <upstream>`. The command sets up `branchname`'s tracking information. If no
`branchname` is specified, then it defaults to the current branch. For example,

```
$ git branch -u origin/issue-1
Branch issue-1 set up to track remote branch issue-1 from origin.
```

... or longer option:

```
$ git branch --set-upstream-to=origin/issue-1
Branch issue-1 set up to track remote branch issue-1 from origin.
```

Note that `<upstream>` is the combination of remote and branch without spaces:

    <remote>/<branch>

Once the branch is tracked, the relationship can be verified via
[git-branch][git-branch] command in verbose list mode (twice 'v'):

```
$ git branch -vv
* issue-1 3646f49 [origin/issue-1] Initial commit
  master  3646f49 [origin/master] Initial commit
```

If you try to set upstream branch to a nonexistent one, you will see the
following error in your console. For example, `topic` branch does not exist on
remote `origin`:

> ```
> demo (topic) $ git branch -u origin/topic
> error: the requested upstream branch 'origin/topic' does not exist
> hint:
> hint: If you are planning on basing your work on an upstream
> hint: branch that already exists at the remote, you may need to
> hint: run "git fetch" to retrieve it.
> hint:
> hint: If you are planning to push out a new local branch that
> hint: will track its remote counterpart, you may want to use
> hint: "git push -u" to set the upstream config as you push.
> ```

You need to do a `git fetch` or `git push -u` depending on your situation, as
indicated by the hint.

## Push Without Branch Specified

> Is it possible to do `git push` without a branch specified?

Yes, it is possible. You can control the default behavior by setting
`push.default` in you Git config. It defines the action Git
push should take if no refsepc is given on the command line. In order to push
without branch specified, you can do set the mode to `current`, which pushes the
current branch to update a branch with the same name on the receiving end:

```
$ git config push.default current
```

More information can be reached in
[push.default](https://git-scm.com/docs/git-config#Documentation/git-config.txt-pushdefault)
section of `git-config`. Personally, I don't recommend it, because
without setting upstream, you lose comparison between local branch and its
upstream (behind commits, ahead commits). The `git pull` command won't be
possible without branch name neither:

```
demo (issue-1) $ git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> issue-1
```

## Git Configuration

> Once upstream is defined, how this information is stored in Git?

Given `master` as an example, the relationship between the local branch
`master` and it upstream `origin/master` is stored in `.git/config`, section
branch "master":

```ini
[branch "master"]
    remote = origin
    merge = refs/heads/master
```

As you can see, branch "master" has 2 properties: `remote` and `merge`. They are
also called as pattern `branch.<branch-name>.<prop>`:

- `branch.master.remote`
- `branch.master.merge`

Property `branch.master.merge` defines, together with `branch.master.remote`,
the upstream branch for the given branch. It tells git-fetch, git-pull,
git-rebase which branch to merge and can also affect git-push. When in branch
`master`, it tells git-fetch the default refspec to be marked for merging in
FETCH\_HEAD. The value is handled like the remote part of a refspec, and must
match a ref which is fetched from the remote given by `branch.master.remote`.
The merge information is used by git-pull (which at first call git-fetch) to
lookup the default branch for merging. Without this option, git-pull defaults
to merge the first refspec fetched. For more information, see git-config
[branch.\<name\>.merge](https://git-scm.com/docs/git-config#Documentation/git-config.txt-branchltnamegtmerge).

## Unset Upstream

Use flag `--unset-upstream` to unset an upstream:

    $ git branch --unset-upstream [<branchname>]

The section of branch "master" in Git configuration file becomes empty:

```
$ cat .git/config
...
[branch "master"]
```

During daily work, you can also do git-fetch with option `-p,--prune` to
remove any remote-tracking references that no longer exist on the remote before
fetching:

    $ git fetch -p

## JGit

The equivalent commands in JGit:

- `git branch -u origin/topic`: _None_. This API does not exist in JGit.
- `git push -u origin topic`: _None_. This API does not exist in JGit.

If you want to do the tracking, you need to handle it directly in Git
configuration. Like in `.git/config`:

```java
StoredConfig config = git.getRepository().getConfig();
config.setString(CONFIG_BRANCH_SECTION, "topic", "remote", "origin");
config.setString(CONFIG_BRANCH_SECTION, "topic", "merge", "refs/heads/topic");
config.save();
```

## References

- [git-config][1]
- [git-branch][git-branch]
- [git-fetch][3]
- [Stack Overflow: JGit - Pushing a branch and add upstream (-u option)][4]
- [Stack Overflow: Default behavior of "git push" without a branch
  specified](https://stackoverflow.com/questions/948354/)
- [Stack Overflow: Why do I need to do --set-upstream all the
  time?](https://stackoverflow.com/questions/6089294/)

[4]: https://stackoverflow.com/questions/27823940/jgit-pushing-a-branch-and-add-upstream-u-option
[3]: https://git-scm.com/docs/git-fetch
[git-branch]: https://git-scm.com/docs/git-branch
[1]: https://git-scm.com/docs/git-config
