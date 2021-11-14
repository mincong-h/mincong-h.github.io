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

# Functions
# -----

function print_usage {
    cat << EOF
Usage:

       newpost.sh [OPTIONS] TITLE


Options:

       -d,--debug   Print debug logs
       -h,--help    Show help
       -e,--en      Generate English post
       -c,--cn      Generate Chinese post
       -a,--all     Generate post in all languages (English and Chinese)


Examples:

       newpost.sh My Post Title

       newpost.sh --all My Post Title
       newpost.sh -a My Post Title

       newpost.sh --en My Post Title
       newpost.sh --cn My Post Title

       newpost.sh -h
EOF
}


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
ads_tags:            []
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
---

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
ads_tags:            []
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


function append_content_en {
  cat << EOF >> "$1"
## Introduction

Explain context here...
and why it is important to understand this topic (motivation)?

After reading this article, you will understand:

## Section 1

## Section 2

## Section 3

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article?
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
EOF
}


function append_content_cn {
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
   原创不易，希望大家点个赞、点个在看支持一下，谢谢！
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

create_en=1
create_cn=0
debug=0

for i in "$@"; do
    case $i in
        -a|--all)
            create_en=1
            create_cn=1
            shift
            ;;
        -e|--en)
            create_en=1
            create_cn=0
            shift
            ;;
        -c|--cn)
            create_en=0
            create_cn=1
            shift
            ;;
        -d|--debug)
            verbose=1
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            ;;
    esac
done

url=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

filepath_en="${bloghome}/_posts/$(date +"%Y-%m-%d")-${url}.md"
filepath_cn="${bloghome}/_cn/${url}.md"

if [[ $debug -eq "1" ]]
then
    cat << EOF
create_en=${create_en}
create_cn=${create_cn}

filepath_en=${filepath_en}
filepath_cn=${filepath_cn}

debug=${debug}
title=${@}
EOF
fi

if [[ $create_en -eq "1" ]]
then
    if [[ -f "$filepath_en" ]]
    then
        echo "${filepath_en} already exists."
        exit 1
    fi
    append_metadata_en "$filepath_en" "$title"
    append_content_en "$filepath_en"
fi

if [[ $create_cn -eq "1" ]]
then
    if [[ -f "$filepath_cn" ]]; then
        echo "${filepath_cn} already exists."
        exit 1
    fi
    append_metadata_cn "$filepath_cn" "$title"
    append_content_cn "$filepath_cn"
fi

if [[ $create_en -eq "1" && $create_cn -eq "1" ]]
then
    cat << EOF
Blog post created!
  EN: ${filepath_en}
  CN: ${filepath_cn}
EOF
elif [[ $create_en -eq "1" ]]
then
    cat << EOF
Blog post created!
  EN: ${filepath_en}
  CN: (disabled)
EOF
else
    cat << EOF
Blog post created!
  EN: (disabled)
  CN: ${filepath_cn}
EOF
fi
