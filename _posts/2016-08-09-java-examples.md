---
layout:        post
title:         "New repo: Java Examples"
lang:                en
date:          2016-08-09 22:15:00 +0100
categories:    [tech]
tags:          [java]
excerpt:       >
  I’ve been learning different Java frameworks since my last intern in Beijing.
  Today, I want to share my new GitHub repository: Java Examples. This
  repository is built on Maven, modularized and extensible.
permalink:         /2016/08/09/java-examples/
comments:      true
redirect_from:
  - /java/2016/08/09/java-examples/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

I’ve been learning different Java frameworks since my last intern in Beijing.
In most of the time, they’re stored in my Mac and never shown to others. If
lucky enough, they'll get a chance to be published on Github. Today, I want to
create a unique repository to store these small pieces. Ideally, this repo is
modularized and extensible, so other frameworks can also be integrated in the
future. Then I think about [Maven][mvn]! Maven supports project aggregation in
addition to project inheritance, which means that one project can
contain multiple modules. So different examples can go to different modules.
Thanks to Maven aggregator, the project (repo) can still be built using one
command: 

    mvn clean install

If another example need to be added, then we can create a new module. There's
no need to rebuild everything. Pretty cool, right? Now, check this repo at
<https://github.com/mincong-h/java-examples>

<hr>
<p align="center">
  <img src="{{ site.url }}/assets/logo-travis-ci.png" alt="Logo - Travis CI" width="50">
</p>

On 16 Nov 2016, Travis CI was added to this project too. The process is really
simple:

1. Sign-up at Travis CI and link the GitHub repo "java-examples"
2. Embed the script `.travis.yml` into the repo at root level
3. Check the result at [Travis CI][travis]

[mvn]: https://maven.apache.org/
[travis]: https://travis-ci.org/mincong-h/java-examples
