#!/bin/bash
#
#    This script creates a new page for Monthly Digest in
#    directory "./{year}/{month}". Usage:
#
#        newmonthly.sh 2018-09
#

ym="${*:1}"

if [[ -z "$1" ]]
then
    echo 'usage: newtag.sh yyyy-MM'
    exit 1
fi

if [[ ! $ym =~ ^[0-9]{4}-[0-9]{2}$ ]]
then
    echo "Invalid input. Expected format yyyy-MM, got: ${ym}"
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
year="${ym%-*}"
month="${ym#*-}"
targetdir="${bloghome}/${year}/${month}"
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
layout:            monthly
title:             ${title}
date:              ${year}-${month}-01
---
EOF

echo "${title} created: ${filepath}"
