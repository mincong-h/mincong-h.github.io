#!/bin/bash
#
#    This script creates a new page for Monthly Digest in
#    directory "./{year}/{month}". Usage:
#
#        newquarterly.sh 2020-Q1
#

yq="${*:1}"

if [[ -z "$1" ]]
then
    echo 'usage: newquarterly.sh yyyy-QQ'
    exit 1
fi

if [[ ! $yq =~ ^[0-9]{4}-Q[1-4]$ ]]
then
    echo "Invalid input. Expected format yyyy-QQ, got: ${yq}"
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
year="${yq%-*}"
quarter="${yq#*Q}"
targetdir="${bloghome}/${year}/${quarter}"
filepath="${targetdir}/index.md"

mkdir -p "${targetdir}"

if [[ -f "$filepath" ]]
then
    echo "${filepath} already exists."
    exit 1
fi

title="Monthly Digest $(date -jf '%F' "${year}-${month}-01" +'%B %Y')"
cat << EOF >> "$filepath"
---
layout:            quarterly
title:             ${title}
year:              ${year}
quarter:           ${quarter}
---
EOF

echo "${title} created: ${filepath}"
