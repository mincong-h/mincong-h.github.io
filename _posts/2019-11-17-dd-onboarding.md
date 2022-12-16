---
article_num: 126
layout:            post
title:             Datadog Onboarding Recap
lang:                en
date:              2019-11-17 09:01:50 +0100
categories:        [review]
tags:              [review]
permalink:         /2019/11/17/dd-onboarding/
comments:          true
excerpt:           >
    Recapitulating my first two weeks at Datadog: what I observed and I
    learned as a Software Engineer, not only the onboarding part but also the
    strong DevOps culture!

image:             /assets/bg-josh-rakower-zBsXaPEBSeI-unsplash.jpg
cover:             /assets/bg-josh-rakower-zBsXaPEBSeI-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

It's been two weeks that I joined Datadog as a Software Engineer working at the
Logs team. During this two-week onboarding, not only I participated in a lot of
presentations and training, but I also learned a lot about DevOps best practices. That's
why I'm very excited to share them with you.

## Onboarding

Datadog gives a lot of materials on Day 1 to help you onboard: the latest version
of Macbook Pro 13 and accessories, a State Backpack, a Beats headphone, and much
more. As a developer, you will also have a Dell 27" Quad HD monitor and a
standing desk. If they don't fit your need, you can ask IT team for other
material, even for your preferred mechanical keyboard found on the internet :)
Many meetings are scheduled to help
you understand different subjects:

- HR: Datadog history, contacts, tools and resources
- IT: Computer set up, especially the security enforcements
- Security: Security training
- Team: Architecture overview and different big topics
- Code: How to set up your environment
- Health: sign the healthcare plan, the death and disability plan, etc
- ...

Each person also has a mentor and a buddy: the mentor is someone inside your team
and buddy is someone in another team. Mentor, buddy, teammates and team lead,
they helped me a lot to learn, discover, and adapt to this new environment.
Things are going fast and I may forget to share some other information for you,
but I think what matters most here is: Datadog cares about new employees
and gives you the best they can to help you onboard.

In the following sections, I want to share something different: as a new
Software Engineer, the good practices I observed over development and operations
using the Logs team as an example.

## Development

**Architecture.** Architecture has an important role in the whole team. In the
last two weeks, I participated in different presentations about the Logs
platform. Despite the focus of each speaker, all of them shared the same
overview of the platform: they use the same vocabulary and identify major
components in the same way, without ambiguities. As many data-intensive
applications, we use [Apache Kafka](https://kafka.apache.org) to build our
system. It makes the system easy to decouple and each component easy to
describe. Typically, when new data arrives, it is stored in a
Kafka topic with replicas. After another step, data is modified and stored again in another
topic, ... and so on. In this way, we reduce the impact of incidents since
data is persistent and avoid eventual data loss. There are physical and virtual
isolations for different business units and different customers to protect data
and avoid incident escalation.
Whenever there is an important change in the system, people draft their proposal
as "Request For Change (RFC)" and discuss it with others.

**Dependency.** As a Software Engineer, I am quite surprised by how our dependencies
are up-to-date. In the Logs team, we are using the latest version of JUnit 5,
AssertJ, ... even JDK—we are running on JDK 13 for several days now. The team
treats software dependencies as a first-class concept and handles them very
with care.

**Build.** The build is very fast: even though there are 60+ modules and 3M+ lines of
code, the build pipeline can finish within less than 30 minutes with all
the tests executed. I believe the big secret behind the screen is the
multi-steps build, where many steps are being executed in parallel. It is worth
mentioning that some plugins are enabled to enforce the Java compiler, such as
[Google Error-Prone](https://errorprone.info), which catches common Java
mistakes as compile-time errors.

## Operations

**Release.** At Datadog internal repositories, we don't use [Semantic
Versioning](https://semver.org/), because release happens so often that semantic
versioning does not fit the need anymore. Instead, the release version is the
combination of the commit id and the Docker image id: `v{commit}-{docker}`.
Every pull-request merged into the `prod` branch generates a new release
automatically. For example, there are 196 releases over the last two weeks in
the Logs team:

```sh
$ git log --oneline --merges --since='2 weeks' | wc -l
196
```

**Deploy.** Deployment is started manually but the process is 100% automated.
The deployment granularity is fine: engineers have the choice to deploy artifacts
per environment and component. For a given component,
there are also flags for separating deployment and activation: artifacts can be
deployed without being enabled. In terms of deployment, engineers did a great
job on system design, so deploying artifacts does not cause any downtime. Also,
a lot of technical detail is configurable at runtime so deployment is not even
necessary.

**Operate.** We use Ansible, Terraform, Chef, Kubernetes and other modern
frameworks to instantiate, provision and operate our cloud environments. [Infrastructure as code
(IaC)](https://en.wikipedia.org/wiki/Infrastructure_as_code) might be the best
summary of this part. In case of an incident, there is a well-defined process.
The severity of incidents are categorized is 5 levels from 1 to 5. Level 1 and
level 2 are said "outage", level 3 to 5 are said "regular incident". Outage
requires an incident commander and several responders. On-call members will be
notified within minutes, even it is 3 AM in the morning. A lot of tools have
been developed to ensure the process goes smoothly. When an incident happened, a
Slack channel is automatically created for a live conversation. A postmortem is
created for each incident regardless of the severity. Another incident-related
meeting also organized to ensure the postmortem action points have been
addressed. It is also worth to notice that the on-call members are software
engineers because the one who knows the best about the system is the one who
created it in the first place.

**Monitor.** Monitoring is the core business of Datadog. Software engineers
monitor our system via our own product. We have dashboards, monitors (alerts),
APM, Logs and much more to ensure we observe correctly the health of our
production. There are also other products used for different purposes. For
example, we also keep track of the errors that happened in production.

## Conclusion

In this article, I shared the onboarding process and some good practices I
observed these two weeks. For now, what amazed me the most is the ownership of the
software: engineers code, test, release, deploy, operate in the same team.
There must be a lot of cool things that I didn't cover in this article.
But I plan to write more :) Interested to know more? You can subscribe to [my feed](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/).
There are [many open positions at Datadog](https://www.datadoghq.com/careers/). If
you would like to join, free feel to ping me at "mincong.huang _\[ AT \]_
datadoghq.com". Hope you enjoy this article, see you the next time!

## References

- Semver, "Semantic Versioning 2.0.0", _Semantic Versionning_, 2019.
  <https://semver.org>
- Wikipedia, "Infrastructure as code", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/Infrastructure_as_code>
- Error Prone, "Error Prone", _Error Prone_, 2019.
  <https://errorprone.info>
