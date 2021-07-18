#!/bin/bash
#
# Jekyll Docker
# https://github.com/envygeeks/jekyll-docker
#
export JEKYLL_VERSION=3.8
docker run --rm \
  --env JEKYLL_ENV=production \
  --volume="${PWD}:/srv/jekyll" \
  --volume="${PWD}/vendor/bundle:/usr/local/bundle" \
  jekyll/jekyll:$JEKYLL_VERSION \
  bundle exec jekyll build $@
