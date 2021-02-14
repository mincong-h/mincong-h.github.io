---
layout:            post
title:             Merging Git Repositories
date:              2018-11-06 20:02:35 +0100
categories:        [git]
tags:              [git, java, engineering, ci]
comments:          true
excerpt:           >
    Engineering story: how I merge two Git repositories and what are the hidden
    tasks you didn't think about.
image:             /assets/railway-1245906_1280.jpg
cover:             /assets/railway-1245906_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today I would like to share my recent experience about merging two Git
repositories, and share the hidden tasks which you might not be aware of.
Our team just merged two repositories into one. Initially, I thought it
was simple and should take one morning to finish. However, the reality is,
the merge has a lot of implications during the whole sprint. In our
case, we use Java and Maven, so I'll mainly talk about them.

After reading this article, you'll understand:

- How to merge two Git repositories (using Maven)
- The impact on existing branches
- The existing tags and releases
- Pull requests
- Reorganize the Maven POM
- Fix Maven bugs
- CI changes (Jenkins)
- Deployment
- Tool changes (daily tool, release tool, ...)
- Issue management
- Documentation

## Merging Two Repositories

I followed the Nuxeo documentation [Git Usage - Merging Two Repositories][1] for
the entire operation. If I remember correctly, I did the following steps:

1. Ask for a new repository from company's DevOps team
2. Clone tool from <https://github.com/robinst/git-merge-repos>
3. Clone project A as `projectA` in mirror mode
4. Clone project B as `projectB` in mirror mode
5. Prepare the merge (need to use Maven)
6. Extract the result from the merge tool `git-merge-repos` in its sub-directory
   called `merged-repo`
7. Add Git remote
8. Improve the merge commit description if needed
9. Push to upstream

Step 2 and 3 are important. You need to clone projects in mirror or bare mode.
Otherwise, in normal mode, the `git-merge-repos` script will not understand the
distinction between remote branches and local branches. It results to a
unsuccessful merge: only the `master` branch will be present in the new repo. In
order to preserve all the branches, use Git bare repository.

## Existing Branches

Normally, all the existing branches are merged. (I said normally because I
didn't check each of them myself). If both repos contain branch having the same
name, they will be merged as one branch in the new repo. For example, we have
branch `1.0` on project A, and branch `1.0` on project B. Then in final project,
we'll still have branch `1.0`—the merge script creates a new merge commit for
branch `1.0`.

In our case, all the work-in-progress (WIP) branches contains more than 1000
commits differed from master. It means that it is almost impossible to rebase
the branch against `master`. We have two solutions:

1. Start a new branch from `master` and cherry-pick the latest commits on WIP branch
2. Start a new branch and recreate everything

Both of them are useful. In complex cases, I suggest the second one. You might
also want to synchronize changes from old repositories to the new one using
`rsync`. Use option `-r`, `--recursive` to look up files recursively; use option
`--delete` to delete files if they exist on the new repo:

    $ rsync -r --delete /old /new

Tip: ensure branches have few changes and already rebased before merging
repositories. Or even better, merge them or delete them. This will avoid
additional work after the merge.

## Existing Tags and Releases

There're two choices in regards to the existing tags: either transfer them to
the new repositories, or not transfer them. Transferring tags to new repositories
might create conflicts if project A and project B have the same tags.

In our case, we choose not to transfer any tags from the previous repositories.
Because the old repositories are archived, not deleted. If needed, people can
still go there and download existing tags from the old ones. This is also
because we want to start a new versioning on the new repositories: using the
existing one will be conflicting (versions already used).

## Pull Requests

Existing pull requests in status "open" are closed and moved to the new
repositories. Before the merge, you might want to consider how many PRs are
still open, whether they can be merged before the repository merge. Moving from
one repo to another makes you lost your review comments. So be careful.

## Reorganize the Maven POM

If you want to move the new repo, refactoring your build tool is almost a must.
In regards to Maven, we need to create a new Maven POM, as the parent POM of
both existing projects A and B.

We chose to rename the group ID, even though it is not mandatory. It allows us
to restart the versioning and have a better semantic for the future. While the
new group ID looks better, it implies the following tasks:

- Change all the group ID in all the `pom.xml`
- Change the Ant tasks where the group ID is used

Also, need to be careful whether a simple find-replace is enough. In some
cases, you might keep both the old group ID and the new one. Because some other
dependencies are still using the old group ID.

We didn't completely finish the re-organization of the Maven POM. Since our plan
is to have multiple components having (better) well-separated responsibilities,
this is a long running tasks. I plan to do at least the following:

- Move components to the same level as project A and project B
- Create a module for packaging
- Move integration tests after the packaging module
- Move the dependency management and plugin management to the top level POM
- Create a new project on Sonar and remove the existing ones

## Fix Maven Bug(s)

One Maven "bug" has been fixed during the sprint, which is the
`distributionManagement`. Previously, we have two sections of
`distributionManagement`, one in project A and the other in project B. Once
these projects are merged, we need a single section declared at the parent POM
so that the deploy plugin knows where the snapshots should be deployed.
Different from other Maven tasks, this one is the only blocker one, which fails
the Jenkins builds.

## CI Changes (Jenkins)

On Jenkins, we need to ensure all the jobs are still available for continuous
integration. It includes mainly:

- The master job
- The maintenance job
- The on-demand jobs
- The release job
- The customized jobs

Note that the build time might increase significantly since each build is now
executing tasks from both project A and project B! You might want to find out
ways to speed up the build. For example, I did some studies on [how to speed up
the Maven build][2].

## Deployment

It might also change to way you deploy your software. Check before doing the
merge.

## Tools

In our cases, we've similar tools for both projects for creating branches,
changing versions, releasing etc. They are now merged into a single directory
and can be used for both projects.

## Issue Management

Our issue management tool changes too. We use JIRA, and there were one JIRA
project for project A and one JIRA project for project B. Now, we use a single
one for both.

If I can do the repo-merge again, I might want to change the issue management
tool first.

## Documentation

We use confluence wiki for documentation. Merging repositories mean merging the
confluence wiki as well. So this is yet another task to be considered.

## Conclusion

As you can see, merging two repositories might not be as simple as you think
about. It implies changes on different parts of the development cycle. Some
tasks are also dependent on others, so planning is ready important when
merging repositories.
Hope you enjoy this article, see you the next time!

{% include book-git-pro.html %}

## References

- [Nuxeo: Git Usage - Merging Two Repositories][1]

[1]: https://doc.nuxeo.com/corg/git-usage/#merging-two-repositories
[2]: /2018/11/01/speed-up-the-maven-build/
