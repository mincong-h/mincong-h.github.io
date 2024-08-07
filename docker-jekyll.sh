#!/bin/bash
#
# Jekyll Docker
# https://github.com/envygeeks/jekyll-docker
#
# Enable to simulate production features, e.g. comments
#
#     --env JEKYLL_ENV=production
#
export JEKYLL_VERSION=latest

short_commit=$(git rev-parse --short HEAD)
pipeline_id="${GITHUB_RUN_ID:-0}"
version="v${pipeline_id}-${short_commit}"

echo "version: ${version}"

# gem sources
#     List available sources
#
# bundle install
#     Install gems in China because the official repository
#     (https://rubygems.org) is not accessible in the mainland China.
docker run --rm \
  -p 4000:4000 \
  --env "BS_ENABLED=true" \
  --env "BS_USERNAME=${BS_USERNAME}" \
  --env "BS_PASSWORD=${BS_PASSWORD}" \
  --env "SERVICE_VERSION=${version}" \
  --name jekyll \
  --volume "${PWD}:/srv/jekyll" \
  --volume "${PWD}/vendor/bundle:/usr/local/bundle" \
  -it "jekyll/jekyll:${JEKYLL_VERSION}" \
  sh -c "echo \"gem version $(gem --version)\" && \
         bundle --version && \
         echo \"jekyll version $JEKYLL_VERSION\" && \
         echo \"config bundle ...\" && \
         bundle config mirror.https://rubygems.org https://mirrors.aliyun.com/rubygems/ && \
         echo \"install bundle ...\" && \
         bundle install --verbose && \
         jekyll $@"
#  sh -c "gem --version && \
#         gem sources && \
#         echo \"Removing official source...\" && \
#         gem sources --remove https://rubygems.org/ && \
#         gem sources && \
#         echo \"Adding new mirror...\" && \
#         gem sources --add https://mirrors.aliyun.com/rubygems/ && \
#         gem sources && \
#         bundle install --verbose && \
#         jekyll $@"
