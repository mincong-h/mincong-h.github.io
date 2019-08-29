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
image:             /assets/bg-coffee-84624_1280.jpg
ads:               Ads idea
---

## Overview

Explain context here...

After reading this article, you will understand:

## Conclusion

Hope you enjoy this article, see you the next time!

## References

Use IEEE citation style to write references (https://ieee-dataport.org/sites/default/files/analysis/27/IEEE%20Citation%20Guidelines.pdf):

Professional Internet Site:

- European Telecommunications Standards Institute, "Digital Video Broadcasting
  (DVB): Implementation guide for DVB terrestrial services; transmission aspects,"
  _European Telecommunications Standards Institute_, ETSI-TR-101, 2007. [Online].
  Available: http://www.etsi.org.

General Internet Site:

- J. Geralds, "Sega Ends Production of Dreamcast," _vnunet.com_, para. 2,
  Jan. 31, 2007. [Online]. Available: http://nli.vnunet.com/news/1116995.

Personal Internet Site

- G. Sussman, "Home Page-Dr. Gerald Sussman," July, 2002. [Online]. Available:
  http://www.comm.edu.faculty/sussman/sussmanpage.htm.

EOF

echo "Blog created: $filepath"
