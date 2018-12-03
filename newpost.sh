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
layout:            post
title:             $title
date:              $(date +"%Y-%m-%d %H:%M:%S %z")
categories:        [tech]
tags:              []
comments:          true
excerpt:           >
    TODO
img_url:           /assets/bg-coffee-84624_1280.jpg
img_width:         1280
img_height:        960
---

## Overview

Explain context here...

After reading this article, you will understand:

## Conclusion

Hope you enjoy this article, see you the next time!

## References
EOF

echo "Blog created: $filepath"
