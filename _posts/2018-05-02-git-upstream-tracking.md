---
layout:      post
title:       "Git Upstream Tracking"
date:        "2018-05-02 20:41:53 +0200"
categories:  [git, java, jgit]
tags:        [git, java, jgit]
comments:    true
---

Today, I'd like to talk about tracking upstream branch in Git.

## Set Upstream

A local branch can track a remote branch using git-branch command with
option `--set-upstream-to=<upstream>`:

    $ git branch --set-upstream-to=origin/master
    Branch master set up to track remote branch master from origin.

Or shorter option `-u`:

    $ git branch -u origin/master
    Branch master set up to track remote branch master from origin.

Note that `<upstream>` is the combination of remote and branch without spaces:

    <remote>/<branch>

Once the branch is tracked, the relationship can be verified via git-branch
command:

    $ git branch -vv
    * master 3646f49 [origin/master] Initial commit

## Git Configuration

The relationship between the local branch `master` and it upstream
`origin/master` is stored in `.git/config`:

```
$ cat .git/config
...
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

As you can see, branch "master" has 2 properties: `remote` and `merge`. They are
also called as pattern `branch.<branch-name>.<prop>`:

- `branch.master.remote`
- `branch.master.merge`

Property `branch.master.merge` defines, together with `branch.master.remote`,
the upstream branch for the given branch. It tells _git fetch/git pull/git
rebase_ which branch to merge and can also affect _git push_. When in branch
`master`, it tells _git fetch_ the default refspec to be marked for merging in
FETCH\_HEAD. The value is handled like the remote part of a refspec, and must
match a ref which is fetched from the remote given by `branch.master.remote`.
The merge information is used by _git pull_ (which at first call _git fetch_) to
lookup the default branch for merging. Without this option, _git pull_ defaults
to merge the first refspec fetched.

## Unset Upstream

Use flag `--unset-upstream` to unset an upstream:

    $ git branch --unset-upstream [<branchname>]

The section of branch "master" in Git configuration file becomes empty:

```
$ cat .git/config
...
[branch "master"]
```

During daily work, you can also do _git fetch_ with option `-p,--prune` to
remove any remote-tracking references that no longer exist on the remote before
fetching:

    $ git fetch -p

## JGit

The equivalent commands in JGit:

- `git branch -u origin/topic`: _None_. This API does not exist in JGit.
- `git push -u origin topic`: _None_. This API does not exist in JGit.

If you want to do the tracking, you need to handle it directly in Git
configuration. Like in `.git/config`:

{% highlight java %}
StoredConfig config = git.getRepository().getConfig();
config.setString(CONFIG_BRANCH_SECTION, "topic", "remote", "origin");
config.setString(CONFIG_BRANCH_SECTION, "topic", "merge", "refs/heads/topic");
config.save();
{% endhighlight %}

## References

- [git-config][1]
- [git-branch][2]
- [git-fetch][3]
- [StackOverflow: JGit - Pushing a branch and add upstream (-u option)][4]

[4]: https://stackoverflow.com/questions/27823940/jgit-pushing-a-branch-and-add-upstream-u-option
[3]: https://git-scm.com/docs/git-fetch
[2]: https://git-scm.com/docs/git-branch
[1]: https://git-scm.com/docs/git-config
