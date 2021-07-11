---
layout:      post
title:       "Learning Git Basics"
lang:                en
date:        2017-01-20 22:00:00 +0100
categories:  [git]
tags:        [git]
excerpt:     >
  Learning Git Basics.
permalink:         /2017/01/20/learning-git-basics/
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

It’s been six weeks since my arrival at Nuxeo now. I learned a lot of things and
passed a very great time here. Starting from this week, I’ll try to write new
things that I learned around software development and share with all of you.
This week’s topic is about git.

## Git-Commit

We can commit at git using the `commit` command. Argument `-m` helps us to
commit with a meaningful message. For example, if this is the first commit of
the repository, then a message "init commit" can be given:

<!--more-->

    $ echo '# Learn Git' > README.md
    $ git add README.md
    $ git commit –m 'init commit'
    $ git log
    commit 0dd5d8918a5a0f9ad467a8ddf5154be737a34a5b
    Author: Mincong HUANG <mincong.h@gmail.com>
    Date:   Fri Jan 20 22:13:39 2017 +0100
    
        init commit

But what if we forget something to commit? The evident answer is to add another
commit. Yes, this is fine and it works perfectly for personal projects where we
are the only developer. However, if we work with other people and want to ensure
the readability of the workflow, then we might need another solution: "add" the
latest changes into the previous commit. It often happens in a company or an
open source organization, where there’re a lot of commits. To achieve this, we
can use the argument `--amend`.

    $ echo 'Learn amazing Git.' >> README.md
    $ git add README.md
    $ git commit –-amend
    $ git log
    commit ba6569fee63832d402d2cbdefbc6d08248aad9ef
    Author: Mincong HUANG <mincong.h@gmail.com>
    Date:   Fri Jan 20 22:13:39 2017 +0100
    
        init commit

As you can see, the commit-hash value has been changed, but the author, date,
commit message remain the same. Further reading:

- [Why does Git use a cryptographic hash function?][git hash 1]
- [How does Git compute file hashes?][git hash 2]
- [How is Git commit SHA1 formed?][git hash 3]

## Git-Rebase

Git `rebase` moves the entire topic branch to begin on the tip of the master
branch, effectively incorporating all of the new commits in master. But, instead
of using a merge commit, rebasing re-writes the project history by creating
brand new commits for each commit in the original branch. Assume the following
history exists and the current branch is `"topic"`:

              A---B---C topic
             /
    D---E---F---G master

From this point, the result of either of the following commands:

    git rebase master
    git rebase master topic

would be:

                  A'--B'--C' topic
                 /
    D---E---F---G master

The major benefit of rebasing is that you get a much cleaner project history.
First, it eliminates the unnecessary merge commits required by git merge.
Second, as you can see in the above diagram, rebasing also results in a
perfectly linear project history—you can follow the tip of `"topic"` all the way
to the beginning of the project without any forks. This makes it easier to
navigate your project with commands like `git log`, `git bisect`, and `gitk`.

But, there are two trade-offs for this pristine commit history: safety and
traceability. If you don’t follow the [Golden Rule of Rebasing][golden rule],
re-writing project history can be potentially catastrophic for your
collaboration workflow. And, less importantly, rebasing loses the context
provided by a merge commit—you can’t see when upstream changes were incorporated
into the feature.

Further reading:

- [Git - git-rebase Documentation][git rebase]
- [Merging vs. Rebasing][merge vs rebase]

[git hash 1]: http://stackoverflow.com/questions/28792784/why-does-git-use-a-cryptographic-hash-function
[git hash 2]: http://stackoverflow.com/questions/7225313/how-does-git-compute-file-hashes
[git hash 3]: https://gist.github.com/masak/2415865
[golden rule]: https://www.atlassian.com/git/tutorials/merging-vs-rebasing#the-golden-rule-of-rebasing
[merge vs rebase]: https://www.atlassian.com/git/tutorials/merging-vs-rebasing
[git rebase]: https://git-scm.com/docs/git-rebase
