#!/bin/bash
#
# Jekyll Docker
# https://github.com/envygeeks/jekyll-docker
#
# Enable to simulate production features, e.g. comments
#
#     --env JEKYLL_ENV=production
#
export JEKYLL_VERSION=3.8

short_commit=$(git rev-parse --short HEAD)
pipeline_id="${GITHUB_RUN_ID:-0}"
version="v${pipeline_id}-${short_commit}"

echo "version: ${version}"
docker run --rm \
  -p 4000:4000 \
  --env "JIMI_USERNAME=${JIMI_USERNAME}" \
  --env "JIMI_PASSWORD=${JIMI_PASSWORD}" \
  --env "SERVICE_VERSION=${version}" \
  --name jekyll \
  --volume "${PWD}:/srv/jekyll" \
  --volume "${PWD}/vendor/bundle:/usr/local/bundle" \
  -it "jekyll/jekyll:${JEKYLL_VERSION}" \
  jekyll serve $@
