---
layout:            post
title:             Create Your Own Cheatsheets
lang:                en
date:              2020-02-22 20:40:24 +0100
categories:        [tech]
tags:              [bash]
comments:          true
excerpt:           >
    Create your own cheatsheets in Bash.
image:             /assets/bg-absolutvision-82TpEld0_e4-unsplash.jpg
cover:             /assets/bg-absolutvision-82TpEld0_e4-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In this article, I want to share with you how to create your own cheatsheets in
Bash and bootstrap your productivity. As a developer, we spend a lot of time in
our terminal. It is essential to remember the commands that are frequently used.
While each command has its manual page (`man <command>`) or help option
(`<command> --help`), it is difficult to make them completely relevant to your need.
Also, you cannot add examples that are specific to your work context. That is
why I wrote this short article to explain what I discovered recently.

## Create Bash Cheatsheet

Create a bash script using your initials followed by the actual command.
I use "mc-\*" for all cheatsheets in general and "mc-curl" for cURL in
particular. I chose `echo` with option `-e` here, which enables interpretation
of backslash escapes, so that colors can be added. Using `cat` won't work with
colors.

```sh
#!/bin/bash

echo -e "cURL Commands
-------------

Encode query parameter via option --data-urlencode. This is useful
when the parameter is too long, and you want to delegate the URL encoding
to curl. For GET request, -G or --get is necessary, which will make
all data specified with -d, --data, --data-binary, or --data-urlencode
to be used in an HTTP request instead of the POST request. The data
will be appended to the URL with a '?' separator.

    curl -G https://example.com/search --data-urlencode \"query=SELECT * FROM table\"


Use option -o, --output <file> to write HTTP response body to file
instead of stdout. For a single file, you can use -O instead of
-o <file> to use the last segment of the URL path as the filename.
The file will be saved in the current working directory. If you want
the file saved in a different directory, make sure you change the
current working directory before invoking curl with this option.

    curl https://mincong.io/feed.xml -o feed.xml
    curl https://mincong.io/feed.xml -O

"
```

My recommendation is to store all the cheatsheets into a single directory so
that they can be exported all together in the PATH. Once done, export the
directory to environment variable PATH in your `.bashrc`, `.bash_profile` or
other bash files so that you can type the command everywhere in your shell:

```sh
export PATH="/path/to/cheatsheets:${PATH}"
```

It will look like:

<img src="/assets/20200222-without-color.png" alt="Command output (without color)"/>

The description here is perhaps too long. The detail level to expose really
depends on yourself.

## Getting Colors

You can also add some colors to the cheatsheet: to highlight important keywords,
make descriptions look less important than actual commands, etc. My coloring
solution comes from [Drew Noakes'
solution](https://stackoverflow.com/a/20983251/4381330) on Stack Overflow
question: "How to change the output color of echo in Linux"
My preference is to use bold gray colors for headers, normal gray colors for
description and black for commands. Then, highlight one or two keywords about
the command. Here is the screenshot of the final result:

<img src="/assets/20200222-with-color.png" alt="Command output (with color)"/>

## Going Further

You may also want to try <https://cheat.sh>, which contains many cheatsheets,
use it via curl: `curl cheat.sh/<command>`. But overall, I think the most
efficient solutions remain the manual page (`man <command>`) or reading
the usage of your command (`<command> -h`) or the sub-command
(`<command> <subcommand> -h`).

## Conclusion

In this article, we saw how to create your own cheatsheets to bootstrap your
productivity in the command line.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Drew Noakes, "How to change the output color of echo in Linux?", _Stack
  Overflow_, 2014. <https://stackoverflow.com/a/20983251/4381330>
