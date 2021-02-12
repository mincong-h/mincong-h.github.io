---
layout:            post
title:             Discard Old Build Artifacts on Jenkins
date:              2018-12-25 20:43:25 +0100
categories:        [tech]
tags:              [jenkins, engineering]
comments:          true
excerpt:           >
    How to discard old build artifacts on Jenkins and free the disk space by
    configuring the duration to keep builds / artifacts, and the quantity of
    builds / artifacts to keep.
cover:             /assets/bg-jenkins.jpg
---

## Overview

In this article, I want to share my own experience on Jenkins. It's about
discarding old artifacts created by builds (job executions). This article is
written on Jenkins version 1.651.24.1 (CloudBees Jenkins Enterprise 16.06).
After reading this article, you will understand how to save disk space by
discarding old builds on traditional Jenkins job.

## Job Configuration

We're going to configure « Discard Old Builds » of the Jenkins job. It controls
the disk consumption of Jenkins by managing how long you'd like to keep records
of the builds (such as console output, build artifacts, and so on.) Jenkins
offers two criteria: driven by age and driven by number. So in order to change
it:

- Click « Configure » on the left menu of your Jenkins job
- Enable option « Discard Old Builds »
- Use strategy « Log Rotation »
- Click « Advanced... »
- Change the 4 options according to your own needs

<img src="/assets/20181225-discard-old-builds-on-jenkins.png"
     alt="Discard old builds on Jenkins" />

## Conclusion

In my own experience, more than 160G of disk space on
Jenkins by changing the max age (60 -> 15) and max number (60 -> 15) for
builds, the max number (60 -> 1) for artifacts for 40+ jobs.
Hope you enjoy this article, see you the next time!
