#!/bin/bash
#
#    This script creates a new tag page with metadata in ./tags
#    folder. Usage:
#
#        newtag.sh Tag Label
#

title="${*:1}"

if [[ -z "$title" ]]; then
    echo 'usage: newtag.sh Tag Label'
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
tag=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
filepath="${bloghome}/tags/${tag}.md"

if [[ ! -d "${bloghome}/tags" ]]
then
    echo "Tags directory does not exist: ${bloghome}/tags"
    exit 1
fi

if [[ -f "$filepath" ]]
then
    echo "$filepath already exists."
    exit 1
fi

cat << EOF >> "$filepath"
---
layout:            tag
title:             ${title}
tag:               ${tag}
---
EOF

echo "Tag page created: $filepath"
