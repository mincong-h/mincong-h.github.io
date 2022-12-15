---
article_num: 103
layout:            post
title:             Merging 20 Git Repositories
lang:                en
date:              2019-03-09 07:41:39 +0100
categories:        [git]
tags:              [git]
permalink:         /2019/03/09/merging-20-git-repositories/
comments:          true
excerpt:           >
    Recently, I merged 20 Git repositories into a single one while keeping the
    history. Here's how I did it.
image:             /assets/bg-ferris-wheel-2575709_1280.jpg
cover:             /assets/bg-ferris-wheel-2575709_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today, I want to share my experience on merging 20 Git repositories into a
single one while keeping the history. After reading this article, you will
understand:

- The context and motivation
- How repositories are cloned
- How history is rewritten before merge
- How to merge them

## Context and Motivation

> Why merging these repositories?

In our codebase, there're two repositories: one for the source code, and the
other for the integration tests ("itests"). Currently, they are completely
separated. On the source code side, everything is normal: we have master branch
and maintenance branches, the repository keeps changing in the history.

```
nos (master u=) $ git branch | grep -E 'master|maintenance'
  3.1-maintenance
  3.2-maintenance
  3.3-maintenance
  3.4-maintenance
  3.5-maintenance
  3.6-maintenance
  3.7-maintenance
* master
```

On the itests side, it's quite particular: we have 19 branches, where each
branch represents one target for testing. 19 branches together, they become a
matrix for all targets. The initial goal of having this structure is that all
the tests are almost the same, and they are very stable. By using the Git branch
mechanism, it allows to cherry-pick easily the changes between branches, without
doing copy-paste.

```
nuxeo-studio-itests (master u=) $ git branch
  10.1
  10.10
  10.10.x
  10.2
  10.3
  5.6
  5.8
  6.0
  7.10
  7.10.x
  8.10
  8.10.x
  9.10
  9.10.x
* master
```

However, as you can see, it is very challenging to maintain such structure. The
tests are actually hidden inside the each branch. Searching is a pain. Comparing
test logic across branches must rely on Git. And the worst, the source code and
tests are separated. It means that there's no isolation for artifacts testing:
the artifacts must be deployed to Nexus and then downloaded, before launching
the itests.

The plan is to flatten the branches into directories, and include them inside
the main repository: `nos`. In total, it means I need to merge 20 repositories
into a single one. Why 20 repositories, and not just 2? Because 19 branches in
itests need to be considered as `master`, to be matched with the NOS `master`
branch. This is a prerequisite for using tool
[git-merge-repos](https://github.com/robinst/git-merge-repos). If you don't
understand this part, it doesn't matter, you will know better once you see the
code.

Branch           | New Location (NOS)
:--------------- | :-----------
`nos:master`     | `${nos}` (no changes)
`itests:5.6`     | `${nos}/itests/5.6`
`itests:5.8`     | `${nos}/itests/5.8`
`itests:6.0`     | `${nos}/itests/6.0`
`itests:7.10`    | `${nos}/itests/7.10`
`itests:7.10.x`  | `${nos}/itests/7.10.x`
`itests:8.10`    | `${nos}/itests/8.10`
`itests:8.10.x`  | `${nos}/itests/8.10.x`
`itests:9.10`    | `${nos}/itests/9.10`
`itests:9.10.x`  | `${nos}/itests/9.10.x`
`itests:10.1`    | `${nos}/itests/10.1`
`itests:10.2`    | `${nos}/itests/10.2`
`itests:10.3`    | `${nos}/itests/10.3`
`itests:10.10`   | `${nos}/itests/10.10`
`itests:10.10.x` | `${nos}/itests/10.10.x`

The following sections will provide a step-by-step explanation about this merge
operation.

## Clone Repositories

First of all, clone and go into the
[git-merge-repos](https://github.com/robinst/git-merge-repos) tool:

```
git-merge-repos (master u=) $ pwd
/Users/mincong/github/git-merge-repos
```

Use the following script `clone.sh` to clone NOS and clone all branches in
itests. Each branch will be cloned as a separated repositories.

```sh
versions=( \
  "5.5" "5.5.x" \
  "5.6" "5.6.x" \
  "5.8" "5.8.x" \
  "6.0" "6.0.x" \
  "7.10" "7.10.x" \
  "8.10" "8.10.x" \
  "9.10" "9.10.x" \
  "10.1" "10.2" "10.3" "10.10" "10.10.x" \
)

for version in "${versions[@]}"
do
  git clone \
    --single-branch \
    --branch "$version" \
    --mirror \
    git@github.com:nuxeo/nuxeo-studio-itests.git \
    "itests-${version}.git"
done

git clone \
  --single-branch \
  --branch master \
  --mirror \
  git@github.com:nuxeo/nos.git
```

```
git-merge-repos (master u=) $ ./clone.sh
```

## Rewrite ITests History

Preserve itests history of each platform, by moving files into sub-directory
called "itests". This is done by rewriting the Git history. Here's the
`mvpath.sh` to use:

```sh
versions=( \
  "5.5" "5.5.x" \
  "5.6" "5.6.x" \
  "5.8" "5.8.x" \
  "6.0" "6.0.x" \
  "7.10" "7.10.x" \
  "8.10" "8.10.x" \
  "9.10" "9.10.x" \
  "10.1" "10.2" "10.3" "10.10" "10.10.x" \
)
for version in "${versions[@]}"
do
  echo "Rewrite history: itests-${version}.git"
  cd "itests-${version}.git"
  git filter-branch --index-filter \
      'tab=$(printf "\t") && newdir="itests/${version}" && git ls-files -s --error-unmatch . >/dev/null 2>&1; [ $? != 0 ] || (git ls-files -s | sed "s~$tab\"*~&${newdir}/~" | GIT_INDEX_FILE=$GIT_INDEX_FILE.new git update-index --index-info && mv "$GIT_INDEX_FILE.new" "$GIT_INDEX_FILE")' \
      --tag-name-filter cat \
      -- --all
  git branch -m master
  cd ..
done
```

As you can see, after rewriting history, the itest branch is set to `master`. So
that it can be matched to NOS `master` branch right after.

## Merge 20 repositories

Then, list all the directories for merge:

```
git-merge-repos (master *% u+1) $ find "$(pwd -P)" -type d -maxdepth 1 | grep -E 'itests|nos' | sort
/Users/mincong/github/git-merge-repos/itests-10.1.git
/Users/mincong/github/git-merge-repos/itests-10.10.git
/Users/mincong/github/git-merge-repos/itests-10.10.x.git
/Users/mincong/github/git-merge-repos/itests-10.2.git
/Users/mincong/github/git-merge-repos/itests-10.3.git
/Users/mincong/github/git-merge-repos/itests-5.5.git
/Users/mincong/github/git-merge-repos/itests-5.5.x.git
/Users/mincong/github/git-merge-repos/itests-5.6.git
/Users/mincong/github/git-merge-repos/itests-5.6.x.git
/Users/mincong/github/git-merge-repos/itests-5.8.git
/Users/mincong/github/git-merge-repos/itests-5.8.x.git
/Users/mincong/github/git-merge-repos/itests-6.0.git
/Users/mincong/github/git-merge-repos/itests-6.0.x.git
/Users/mincong/github/git-merge-repos/itests-7.10.git
/Users/mincong/github/git-merge-repos/itests-7.10.x.git
/Users/mincong/github/git-merge-repos/itests-8.10.git
/Users/mincong/github/git-merge-repos/itests-8.10.x.git
/Users/mincong/github/git-merge-repos/itests-9.10.git
/Users/mincong/github/git-merge-repos/itests-9.10.x.git
/Users/mincong/github/git-merge-repos/nos.git
```

Edit the results and create a command for merge:

```
git-merge-repos (master *+ u=) $ ./run.sh \
/Users/mincong/github/git-merge-repos/itests-10.1.git:. \
/Users/mincong/github/git-merge-repos/itests-10.10.git:. \
/Users/mincong/github/git-merge-repos/itests-10.10.x.git:. \
/Users/mincong/github/git-merge-repos/itests-10.2.git:. \
/Users/mincong/github/git-merge-repos/itests-10.3.git:. \
/Users/mincong/github/git-merge-repos/itests-5.5.git:. \
/Users/mincong/github/git-merge-repos/itests-5.5.x.git:. \
/Users/mincong/github/git-merge-repos/itests-5.6.git:. \
/Users/mincong/github/git-merge-repos/itests-5.6.x.git:. \
/Users/mincong/github/git-merge-repos/itests-5.8.git:. \
/Users/mincong/github/git-merge-repos/itests-5.8.x.git:. \
/Users/mincong/github/git-merge-repos/itests-6.0.git:. \
/Users/mincong/github/git-merge-repos/itests-6.0.x.git:. \
/Users/mincong/github/git-merge-repos/itests-7.10.git:. \
/Users/mincong/github/git-merge-repos/itests-7.10.x.git:. \
/Users/mincong/github/git-merge-repos/itests-8.10.git:. \
/Users/mincong/github/git-merge-repos/itests-8.10.x.git:. \
/Users/mincong/github/git-merge-repos/itests-9.10.git:. \
/Users/mincong/github/git-merge-repos/itests-9.10.x.git:. \
/Users/mincong/github/git-merge-repos/nos.git:.
```

After executing the previous command, you'll see the output, where the 20
repositories are all merged into a single one as `merged-repo`:

> Merged repository: /Users/mincong/github/git-merge-repos/merged-repo

By doing this, the 1000+ commits history are preserved, as you can see in this
screenshot:

<img src="/assets/20190309-merge.png"
     alt="History preserved from 20 Git repos"/>

## Check the Merge Result

Go to `merged-repo` and check that only `itests` directory is added. Other
directories remain unchanged.

```
merged-repo (mhuang u=) $ git diff master.. --dirstat=files,100
 100.0% itests/
```

And all platforms are added:

```
merged-repo (mhuang u=) $ find itests -maxdepth 1 | sort
itests
itests/10.1
itests/10.10
itests/10.10.x
itests/10.2
itests/10.3
itests/5.5
itests/5.5.x
itests/5.6
itests/5.6.x
itests/5.8
itests/5.8.x
itests/6.0
itests/6.0.x
itests/7.10
itests/7.10.x
itests/8.10
itests/8.10.x
itests/9.10
itests/9.10.x
```

## Conclusion

In this article, I shared my experience on merging 20 Git repositories into a
single one, by explaining the context and motivation, the clone operation, the
history rewrite, merge, and post operation check.
[git-merge-repos](https://github.com/robinst/git-merge-repos) is an excellent
tool. You might want to try for your team too. Hope you enjoy this article, see
you the next time!

{% include book-git-pro.html %}

## References

- Robin Stocker, "git-merge-repos", 2019. <https://github.com/robinst/git-merge-repos>
