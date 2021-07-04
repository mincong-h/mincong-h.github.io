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
subtitle:            >
    Given one sentence to expand the title or explain why this article may interest your readers.

lang:                en
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
wechat:              true
ads:                 none
---

## Introduction 前言

Explain context here...
and why it is important to understand this topic (motivation)?
为什么读者想读这篇文章？

After reading this article, you will understand:
阅读本文后，你会明白：

事不宜迟，让我们马上开始吧！

## Going Further 扩展

How to go further from here?

## Conclusion 结论

Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

在本文中，我们看到了。。。最后，我们还简要讨论了其他的场景，并且分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你的系统变得。。。如果你有兴趣了解更多的咨询，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h) 或者微信订阅号【码农小黄】。谢谢大家！

## References 参考文献

写作不易，希望大家点个赞、点个在看支持一下，谢谢(花)
EOF

echo "Blog created: $filepath"
