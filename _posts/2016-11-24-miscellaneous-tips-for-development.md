---
layout:        post
title:         "Miscellaneous Tips for Development"
lang:                en
date:          2016-11-24 21:46:00 +0100
categories:    [tech]
tags:          [git, maven, linux]
excerpt:       >
  Miscellaneous tips for development in Git and Maven.
comments:      true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

I'm currently learning many different programming languages and frameworks.
During the work, I found some interesting tips for accelerating the development.
Here, I want to share them with you.

## Git: show the staged difference in CLI

    git diff --staged

`git diff` is a useful command to see the staged difference of all files which
are staged for the next commit. `--cached` means show the changes in the cache /
index against the current `HEAD`. `--staged` is a synonym for `--cached`.
Therefore, we don't need to launch a GUI to check the staged files anymore!

<!--more-->

Source: [Stack Overflow - How do I show the changes which have been staged?][1]

<hr>

## Git: protect the master branch!

I wanted to try some git features on Windows 10, but I didn't setup anything
like username and useremail on my global settings. After cloning my project
`java-examples` and modified some code, I push my code the master using
`git push origin master`. And it works?! This shouldn't be allowed actually!!
Because I didn't setup my account and as an anonymous, I shouldn't be trusted.
You can see from the recent `git log` that **the commit `ebb724e` do not possess
a valid author email**.

    $ git log --pretty=format:'%h %ae'
    36ee504 mincong.h@gmail.com
    300337c mincong.h@gmail.com
    9320fa1 mincong.h@gmail.com
    b1e93b0 mincong.h@gmail.com
    e0f3928 mincong.h@gmail.com
    35c6a70 mincong.h@gmail.com
    500759d mincong.h@gmail.com
    8c56336 mincong.h@gmail.com
    ebb724e Mincong HUANG        # Invalid!
    71a33b0 mincong.h@gmail.com
    7355062 mincong.h@gmail.com
    dd7b913 mincong.h@gmail.com

It means that the commit `ebb724e` is a force-pushing commit. In order to
prevent this situation happens again, we need to protect the master.

<p algin="center">
  <img src="{{ site.url }}/assets/20161124-protect-master-branch.png"
       alt="Protect the Master branch from GitHub" />
</p>

<hr>

## Maven: using slash is safe on all platforms

In maven configuration, the file separator `${file.separator}` is used to ensure
a good interpretation in both Unix-like platform and Windows. However, this
isn't necessary: using a simple slash `/` is safe too! According to
_T.J. Crowder_:

> With the Java libraries for dealing with files, you can safely use `/` (slash,
  not backslash) on all platforms. The library code handles translating things 
  into platform-specific paths internally.
>
> You might want to use `File.separator` in UI, however, because it's best to
  show people what will make sense in their OS, rather than what makes sense to
  Java.

So, it's up to your choice to work with either slash `/` or `File.separator`.
I tested both solutions on my Windows 10, both work.

Source: [Stack Overflow - File.separator vs Slash in Paths][2]

<hr>

## Linux: configure Maven in Ubuntu

1. [Install OpenJDK 8][l1]
2. [Set JAVA_HOME][l2]
3. Download Maven using `sudo apt-get install maven`

[1]: http://stackoverflow.com/questions/1587846/how-do-i-show-the-changes-which-have-been-staged
[2]: http://stackoverflow.com/questions/2417485/file-separator-vs-slash-in-paths
[l1]: http://askubuntu.com/questions/464755/how-to-install-openjdk-8-on-14-04-lts
[l2]: http://askubuntu.com/questions/175514/how-to-set-java-home-for-java
