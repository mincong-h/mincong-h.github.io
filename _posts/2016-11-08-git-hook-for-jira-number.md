---
article_num: 13
layout:      post
title:       "Git Hook for JIRA Number"
lang:                en
date:        2016-11-08 12:00:00 +0100
categories:  [git]
tags:        [git]
comments:    false
permalink:   /2016/11/08/git-hook-for-jira-number/
excerpt:     >
  Git commit hook for checking the JIRA number before commiting.
redirect_from:
  - /git/2016/11/08/git-hook-for-jira-number/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Did you try to enforce the Git commit message to respect a pattern, but you feel
upset when your teammates are doing something like these?

    JIRA-1 Let's use this style
    JIRA-2: Having a colon is better
    JIRA-3 : I feel upset now

It's important to keep a clean and unique message pattern. However, how can you
achieve it without cursing at each meeting? Today, I want to share with you an
easy method to enforce the JIRA number, as the prefix of a git commit message.
I'm using a Git hook to do this, inspired by [Wenfeng's blog][wenfeng-blog].

First, let's create a new git project and add a README file.

    $ git init
    $ git add README.md

Then, create a new file `commit-msg` to the Git hooks' folder to hook the commit
message. If you need inspiration before your own implementation, take a look on
the samples provided by git in the hook's folder. So let's do:

    $ vim ./.git/hooks/commit-msg

The implementation of this hook is a regex, applying to the first word of the
commit message. This word must start by a prefix of `JIRA-` and be followed by
a number then a colon without spaces.

```
#!/bin/sh

# This hook checks the commit starts with prefix "JIRA-*:".

regex='\JIRA-\d+:'

red='\033[0;31m'
default='\033[0m'
error_msg="${red}Aborting commit. Please follow the commit message pattern:

    JIRA-*: Your message

For example:

    JIRA-123: This is a good commit.
${default}"

if ! grep -qE "$regex" "$1"; then
    echo "$error_msg" >&2
	exit 1
fi
```

Now, the git hook configuration is done. Let's do some commits to test it! If
I do something wrong, the commit will be aborted.

    $ git commit -m "JIRA-1 Let's use this style"
    Aborting commit. Please follow the commit message pattern:
    
        JIRA-*: Your message
    
    For example:
    
        JIRA-123: This is a good commit.

And the same error will be raised for using the colon at the wrong place. No
empty space should be allowed between JIRA number and colon.

    $ git commit -m "JIRA-3 : I feel upset now"

After the implementation, every developer need to hook the commit by
following the pattern. The commit logs become more elegant now.

    $ git log --oneline
    1b39e03 JIRA-3: I
    3e7162e JIRA-2: Love
    5626d87 JIRA-1: Git Hooks.

[wenfeng-blog]: http://wenfeng-gao.github.io/2016/09/28/Simple-Commit-Msg-hook.html
