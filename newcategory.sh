#!/bin/bash
#
#    This script creates a new category page with metadata in ./categories
#    folder. Usage:
#
#        newcategory.sh Category Label
#

title="${*:1}"

if [[ -z "$title" ]]; then
    echo 'usage: newcategory.sh Category Label'
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
category=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
filepath="${bloghome}/_displayed_en_categories/${category}.md"

if [[ ! -d "${bloghome}/_displayed_en_categories ]]
then
    echo "Categories directory does not exist: ${bloghome}/_displayed_en_categories"
    exit 1
fi

if [[ -f "$filepath" ]]
then
    echo "$filepath already exists."
    exit 1
fi

cat << EOF >> "$filepath"
---
layout:            category
title:             ${title}
category:          ${category}
sidebar:
  nav:             categories
comments:          false
---
EOF

echo "Category page created: $filepath"
echo "Please manually edit _data/navigation.yml"
