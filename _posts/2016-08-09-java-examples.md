---
layout: post
title:  "New repo: Java Example"
date:   2016-08-09 22:15:00 +0100
categories: java
redirect_from:
  - /java/2016/08/09/java-examples/
---

I’ve been learning different Java frameworks since my last intern in Beijing.
In most of the time, they’re stored in my mac and never shown to others. If
lucky enough, they might get a chance to be published on Github. Today, my idea
is to have a unique place to store all these small pieces. And ideally, this
place should be able to welcome other frameworks too. Then I think about maven.
Maven supports project aggregation in addition to project inheritance, 

<!--more-->

which means that one project can contain multiple modules. So different
examples can go to different modules. Thanks to the aggregator, the project can
still be built using one command: 

    mvn clean install

If I need to add another example, then I do not need to rebuild everything.
Adding a new module will be enough. In the first time, I’ll add the examples for
hibernate-search, mockito, easymock, powermock, byteman.

