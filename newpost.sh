#!/bin/bash
#
# Description:
#
#    This script creates two new blog post with metadata, one in English and the
#    other in Chinese. They are stored in two different directories for two
#    different collections:
#
#      - EN: _posts/
#      - CN: _cn/
#
#    Both articles mush the same name because the internationalization (i18n)
#    system relies on this name to find the other version, if exists.
#    Date will be generated according to the current time in the system.
#
# Usage:
#
#        ./newpost.sh My Blog Post Title
#

# Functions
# -----

function append_metadata_en {
  path="$1"
  title="$2"
  cat << EOF >> "$path"
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
wechat:              false
ads:                 none
---

<!--
This article is translated with Google Translate and reviewed by Mincong.
{:.info}
 -->
EOF
}

function append_metadata_cn {
  path="$1"
  title="$2"
  cat << EOF >> "$path"
---
layout:              post
title:               $title
subtitle:            >
    Given one sentence to expand the title or explain why this article may interest your readers.

lang:                zh
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

EOF
}

function append_content {
  cat << EOF >> "$1"
<!--
  Replace asset link with following on Chinese Platforms:
  https://github.com/mincong-h/mincong-h.github.io/raw/master/
 -->

## 前言

为什么读者想读这篇文章？

阅读本文后，你会明白：

事不宜迟，让我们马上开始吧！

## 扩展

如何从这篇文章中拓展出去？

## 结论

在本文中，我们看到了。。。最后，我们还简要讨论了其他的场景，并且分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你的系统变得。。。如果你有兴趣了解更多的资讯，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h "GitHub") 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

<!--
 WeChat:
   写作不易，希望大家点个赞、点个在看支持一下，谢谢！
   ![](https://mincong.io/assets/wechat-QR-code.jpg)

 CSDN:
   ![扫码关注](https://img-blog.csdnimg.cn/img_convert/f07c6cc9272c721180bad20c599e4ff7.png#pic_center =600x333)
-->
EOF
}

# Main
# -----

title="${*:1}"

if [[ -z "$title" ]]; then
    echo 'usage: newpost.sh My New Blog'
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
url=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
filepath_en="${bloghome}/_posts/$(date +"%Y-%m-%d")-${url}.md"
filepath_cn="${bloghome}/_cn/${url}.md"

if [[ -f "$filepath_en" ]]; then
    echo "${filepath_en} already exists."
    exit 1
fi

if [[ -f "$filepath_cn" ]]; then
    echo "${filepath_cn} already exists."
    exit 1
fi

append_metadata_en "$filepath_en" "$title"
append_metadata_cn "$filepath_cn" "$title"

# Not for EN, because EN post is translated.
append_content "$filepath_cn"

echo "Blog posts created!"
echo "  EN: ${filepath_en}"
echo "  CN: ${filepath_cn}"
