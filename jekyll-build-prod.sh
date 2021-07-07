#!/bin/bash
#
# Jekyll Docker
# https://github.com/envygeeks/jekyll-docker
#
export JEKYLL_VERSION=3.8
docker run --rm \
  -p 4000:4000 \
  --env JEKYLL_ENV=production \
  --volume="${PWD}:/srv/jekyll" \
  --volume="${PWD}/vendor/bundle:/usr/local/bundle" \
  -it jekyll/jekyll:$JEKYLL_VERSION \
  jekyll build $@
