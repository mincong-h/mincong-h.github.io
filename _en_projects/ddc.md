---
layout:              post
type:                classic
title:               Developing the next generation of CI/CD tool at Datadog
subtitle:            >
    Handling the internal software development lifecycle (SDLC)

lang:                en
date:                2024-08-23 14:02:20 +0200
categories:          []
tags:                [go, cicd]
comments:            true
excerpt:             >
    Handling the internal software development lifecycle (SDLC)

image:               /assets/marcin-jozwiak-kGoPcmpPT7c-unsplash.jpg
cover:               /assets/marcin-jozwiak-kGoPcmpPT7c-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Overview

_Note: "C" is not the real name of the project, it's just a symbol representing the actual work._

"C" is a new CI/CD tool which automates the continuous delivery at Datadog. It covers all the steps of the software delivery lifecycle changes (SDLC) including build, transformation, replication, and deployment. Compared to the previous version, it removes manual steps between build and deployment, supports deployment with multiple artifacts, contains graphical user interface (GUI) and command line interface (CLI) to operate the tool, hook into a standard service description, provides integration with Slack and GitHub, and more.

