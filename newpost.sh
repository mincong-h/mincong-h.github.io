#!/bin/bash
#
#    This script creates a new blog post with metadata in ./_posts
#    folder. Date will be generated according to the current time in
#    the system. Usage:
#
#        ./newpost.sh My Blog Post Title
#

title="${*:1}"

if [[ -z "$title" ]]; then
    echo 'usage: newpost.sh My New Blog'
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
url=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
filename="$(date +"%Y-%m-%d")-$url.md"
filepath="$bloghome/_posts/$filename"

if [[ -f "$filepath" ]]; then
    echo "$filepath already exists."
    exit 1
fi

cat << EOF >> "$filepath"
---
layout:              post
title:               $title
date:                $(date +"%Y-%m-%d %H:%M:%S %z")
categories:          [java-core]
tags:                []
comments:            true
excerpt:             >
    TODO
image:               /assets/bg-coffee-84624_1280.jpg
cover:               /assets/bg-coffee-84624_1280.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
ads:                 none
---

## Introduction

Explain context here...
and why it is important to understand this topic (motivation)?

After reading this article, you will understand:


## Going Further

How to go further from here?

## Conclusion

Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

EOF

echo "Blog created: $filepath"
