---
layout:            post
title:             Prepare Commit Message using Git Hook
date:              2019-07-23 20:46:37 +0200
categories:        [tech]
tags:              [git]
comments:          true
excerpt:           >
    Create a Git hook prepare-commit-msg for inferring JIRA ticket as commit
    message prefix, based on the branch name.
image:             /assets/bg-light-bulbs-1125016_1280.jpg
img_width:         1280
img_height:        720
ads:               Git Pro
---

## Overview

Today, I want to share with you about preparing Git commit message
using Git hook. It allows you to automate some repetitive tasks in your daily
work, such as respecting some naming conventions in your commit. In this
article, I will use JIRA as an example. I will show you how Git hook can infer
the JIRA ticket as commit message prefix using the branch name.

After reading this article, you will understand:

- What is "prepare-commit-msg" hook?
- My "prepare-commit-msg" hook for JIRA
- More advanced topic

## What is prepare-commit-msg hook?

Script "prepare-commit-msg" hook is one of hooks available in Git:

```
$ find .git/hooks -type f
.git/hooks/commit-msg.sample
.git/hooks/pre-rebase.sample
.git/hooks/pre-commit.sample
.git/hooks/applypatch-msg.sample
.git/hooks/pre-receive.sample
.git/hooks/prepare-commit-msg.sample
.git/hooks/post-update.sample
.git/hooks/pre-applypatch.sample
.git/hooks/pre-push.sample
.git/hooks/update.sample
```

According to Git, this is a hook script to prepare the commit log message.
The hook's purpose is to edit the commit message file. To enable this hook, you
need to rename this file to "prepare-commit-msg":

```
.git/hooks/prepare-commit-msg
```

## JIRA Hook Overview

In our company Nuxeo, each commit must be prefixed by the JIRA ticket id, as you
can see on GitHub repository [nuxeo/nuxeo](https://github.com/nuxeo/nuxeo). It
helps to track of the work we did and understand the context of each commit.
Also, we need to have the branch respecting naming convention as follows, which
helps to search easily and perform automatic cleanup for stale branches.

```
${taskType}-${jiraId}-${description}
```

such as:

```
fix-NXP-12345-something-broken
```

However, filling the JIRA ticket for each commit can be annoying. That's why I
developed this script, to do auto-detection and have the Git message pre-filled.
Now, let's take a look on the content of the script:

```sh
#!/bin/bash
#
# An example hook script to prepare the commit log message.
# Called by "git commit" with the name of the file that has the
# commit message, followed by the description of the commit
# message's source.  The hook's purpose is to edit the commit
# message file.  If the hook fails with a non-zero status,
# the commit is aborted.
#
# To enable this hook, rename this file to "prepare-commit-msg".

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

# Only add custom message when there is no commit source
# ($COMMIT_SOURCE is empty). Otherwise, keep the default message
# proposed by Git. Possible commit source: message, template,
# merge, squash or commit. See https://git-scm.com/docs/githooks
if [[ -z "$COMMIT_SOURCE" ]]
then
  ref=$(git rev-parse --abbrev-ref HEAD)
  if [[ $ref =~ ^.*((NXP|NXS|NXCONNECT)-[0-9]+).* ]]
  then
    hint=$(cat "$COMMIT_MSG_FILE")
    ticket="${BASH_REMATCH[1]}"
    echo "${ticket}: " > "$COMMIT_MSG_FILE"
    echo "$hint" >> "$COMMIT_MSG_FILE"
  fi
fi
```

In the following paragraphs, I will explain each line in detail.

## Input Parameters

The first section is provided by Git hook, I did not change anything. The 1st
input parameter, commit message file (`$COMMIT_MSG_FILE`) allows to understand
in which file path the commit message is stored, so that you can read and
modify the content easily in the script. The 2nd input parameter, commit source
(`$COMMIT_SOURCE`), indicates in which condition the commit is invoked. Possible
values are none (`git commit`), message (`git commit -m <msg>`), template,
merge, squash, or commit. You can see more detail in
<https://git-scm.com/docs/githooks>. The 3rd input parameter is pretty obvious,
it is the SHA1, id of the commit object.

```sh
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3
```

## JIRA Ticket Detection

Now, let's take a look into the second section.

In second section, the script checks the commit source. It modifies the commit
message if and only if command `git command` (without `-m` option) is received.
No changes if this is a merge, squash, commit with `-m` etc.

```sh
if [[ -z "$COMMIT_SOURCE" ]]
then
  # JIRA ticket detection ...
fi
```

Once done, parse the actual Git reference. If `git rev-parse` is called without
`--abbrev-ref`, the result will be the commit id where `HEAD` points to. Option
`--abbrev-ref` allows to find the abbreviation of Git reference, e.g. `master`.
This is different from option `--symbolic-full-name`, which returns the full
name, e.g. `refs/heads/master`.

```sh
ref=$(git rev-parse --abbrev-ref HEAD)
```

Once we have the Git reference, we can detect the JIRA ticket. In our company,
we have many JIRA projects, such as `NXP` for Nuxeo Platform, `NXS` for Nuxeo
Studio, and `NXCONNECT` for Nuxeo Connect. Actually, there are more than three,
but I want to simplify here.

```sh
if [[ $ref =~ ^.*((NXP|NXS|NXCONNECT)-[0-9]+).* ]]
then
  ticket="${BASH_REMATCH[1]}"
  # ...
fi
```

Since I want to preserve the original commit message provided by Git, and only
use JIRA ticket as prefix, I saved the original one as hint. The hint is
re-inserted into the commit message file right after JIRA ticket:

```sh
hint=$(cat "$COMMIT_MSG_FILE")
ticket="${BASH_REMATCH[1]}"
echo "${ticket}: " > "$COMMIT_MSG_FILE"
echo "$hint" >> "$COMMIT_MSG_FILE"
```

## Final Result

Final result (screenshot) after typing `git commit` and hit ENTER key:

<img src="/assets/20190723-git-prepare-commit-msg-demo.png"
     alt="Git prepare-commit-msg hook demo">

## Additional Tips

When developing your own Git prepare-commit-msg hook, you might face to the
following problems:

1. You might need to change the [Shebang][shebang] in your script. Change the
   interpreter from the Bourne Shell (`#!/bin/sh`) to the Bourne Again Shell
   (`#!/bin/bash`), so that you can have more support in your script, such as
   for regular expression.
2. The script must be named as `prepare-commit-msg` without suffix. Otherwise,
   Git cannot load it.
3. The script must be executable. If it's not the case, `chmod +x
   prepare-commit-msg` to make it executable.

## Conclusion

In this article, we learnt how to use Git hook `prepare-commit-msg` via a
concrete example for filling JIRA ticket in commit message. We saw the input
parameters, the commit sources, some implementation detail about Git reference
and regular expression. And finally, the demo screenshot and some additional
tips. Hope your enjoy this article, see you next time!

{% include book-git-pro.html %}

## References

- Wikipedia, "Shebang (Unix)", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/Shebang_(Unix)>
- node ninja, "Why do you need to put #!/bin/bash" at the beginning of a script
  file?", _Stack Overflow_, 2012.
  <https://stackoverflow.com/questions/8967902>
- Mincong Huang, "NXBT-2929: Add Git hook prepare-commit-msg", _GitHub_, 2019.
  <https://github.com/nuxeo/integration-scripts/pull/56>

[shebang]: https://en.wikipedia.org/wiki/Shebang_(Unix)
