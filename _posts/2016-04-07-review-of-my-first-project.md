---
layout: post
title:  "Review of my first project"
date:   2016-04-07 08:10:00 +0100
categories: [tech]
tags:       [project]
excerpt:    >
  After 8 weeks intensive works in nights and weekends, we've finally released
  the first application of our life: "eRallye". This Android application is
  an app built for French association "Elles bougent". This article reviews what
  have been done and how to do better in the future.
redirect_from:
  - /project/2016/04/07/review-of-my-first-project/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

After 8 weeks intensive works in nights and weekends, we've finally released the 
first application of our life : **eRallye**. This Android application is an app built
for French association _**Elles bougent**_. During their rallies _**Ingénieure ou 
techinicienne ... un métier pour moi**_ destined for teenagers, participants and 
rally hosts use our app for several usages: find goals in the city, play quizzes
using QR code, score check, share photos, read companies’ info etc.

<!-- more -->

For the review, there're many things to talk about. The most important must be test.
Testing, like unit testing, integration testing is really necessary. We've made a huge
mistake to not to include them in our project. For unit testing, it is a good-practice. 
Each time before the deployment, all tests will be launched. If one failed, then the 
deployment is automatically lead to refused. On the other side, we should embed integration
tools on GitHub like [Jenkins][1] and [Travis Ci][2]. All git push must go through them,
so we can ensure correctness of git code. These actions / tools can eliminate most of 
the problems. I consider it as a test-driven project.


<img src="{{ site.url }}/assets/logo-jenkins.png" width="100" alt="Logo of Jenkins">
<img src="{{ site.url }}/assets/logo-travis-ci.png" width="100" alt="Logo of Travis Ci">


The second part is the use of technology. If the team do not have a mastery on a technology, 
no matter how wonderful it is, we should avoid them. It will be a great thing if everything 
works, but in most of the time, the lack of mastery drives us to nightmare when a failure 
occurs.


The last part is task assignment. Do not place too many tasks to the one person. If he is ill, 
or for any reason, cannot participate in the project, we will therefore pay a heavy price.

At the end, I'd like to thanks my teammates. No matter the result, we've been working together
days and nights (we all have an intern for weekdays as well). Really appreciate the motivation
of everyone !! Great team ESIGELEC. #FantasticFour

Commits of the server side _erally_server_:

<img src="{{ site.url }}/assets/20160408-erally-server.png" width="600" alt="Commits of erally_server">

Commits of the client side _erally_android_:

<img src="{{ site.url }}/assets/20160408-erally-android.png" width="600" alt="Commits of erally_android">

[1]: https://jenkins.io/
[2]: https://travis-ci.org/
