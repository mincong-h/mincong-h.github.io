---
article_num:         223
layout:              post
type:                classic
title:               ESIGELEC Kubernetes 2026 Recap
subtitle:            >
    Designing and evolving a Kubernetes course for engineering students.

lang:                en
date:                2026-11-08 15:05:28 +0100
categories:          [kubernetes, java, go]
tags:                [kubernetes, java, go]
comments:            true
excerpt:             >
    This post reflects on a 20-hour Kubernetes course I recently taught at ESIGELEC, where engineering students explored containerization, Kubernetes fundamentals, and real-world collaboration using the Spring Pet Clinic project. It shares insights into the redesigned curriculum, hands-on labs, and lessons learned from focusing deeply on Kubernetes and team-based learning.

image:               /assets/esigelec.jpeg
cover:               /assets/esigelec.jpeg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

<style type="text/css">
  /* A thin gray border around each figure, to tell the screenshots and the diagram apart from the text. */
  .article__content p[align="center"] img,
  .article__content code.language-mermaid[data-processed] {
    border: 1px solid #d0d7de;
  }
</style>

## Introduction

In the end of October, I had the privilege to go to ESIGELEC, an engineering school in Saint-Étienne-du-Rouvray, Normandy, France, to share knowledge about Kubernetes with about 20 students. This is a 20-hour module for the students majoring in the Digital Services Engineering (Ingénieurie des Services du Numérique). In this article, I want to recapitulate the program of this course, the changes compared to last year, and some highlights from the students.

> **Writing hint**
>
> - **What:** who you are, for a reader who doesn't know you: a software engineer who teaches this module at ESIGELEC for the second year (the [2025 recap](/en/esigelec-kubernetes-2025/)). Then what the reader will find: the program, the student highlights, and how AI helps to teach and to grade. The introduction says "about 20 students": it's 21. The front matter is still the one of 2025: the same `image`, `subtitle` and `excerpt`, and the excerpt says "lessons learned" and "redesigned curriculum". The plugin `jekyll-seo-tag` turns `image` and `excerpt` into the preview card on LinkedIn, so the 2 recaps would show the same card.
> - **Why:** the post is public and shared on LinkedIn, so it reaches 4 kinds of readers: the director of a school or the head of a department who may hire you, engineering students, your colleagues, and the professionals of your network and of their network. Most of them decide from the card and the first 2 lines whether to click. A card identical to last year's looks like an old post.
> - **How:** 2 or 3 sentences: who you are, the course in numbers, what the post shows. A new `excerpt` of 1 or 2 sentences that names the highlights (GenAI, observability, troubleshooting, AI-assisted grading), and a new `image` from this year, e.g. Figure 6, or a photo of the class with the consent of the students. LinkedIn shows the card at about 1.91:1 (1200 × 627 px), while `esigelec.jpeg` is 3:1 (2000 × 667 px).

## Program

This module lasts for 20 hours. It consists of five chapters, each lasting 4 hours, including 1 hour of lecture and 3 hours of lap session. In this module, we discuss containerizing applications with Docker, the key components of a Kubernetes cluster, and then dive into workload deployment, networking, configuration, and storage in greater detail.

* **Containerization with Docker.** In this part, students learned how to create Docker images for Java applications. They learned how to package a Java application as a JAR, and what the Java Runtime Environment (JRE) is. Then, they learn concepts related to Docker Runtime, Docker Registry, Docker CLI, Docker Desktop, and Dockerfile.
* **Kubernetes Overview.** In this part, they learn the key components of Kubernetes, including the API server, etcd, scheduler, controller manager, kubelet, node; the command line tool `kubectl`. Then, they developped and operated Pods in the Lab Session.
* **Deployment in Kubernetes.** This part focuses on workloads. We discussed deployment and operational challenges in companies and how Kubernetes addresses some of these challenges using ReplicaSets and Deployments. We also talked about workload scaling and microservices architecture.
* **Networking in Kubernetes.** This part discusses different networking components in Kubernetes to adapt to different use cases in a Kubernetes cluster, including Service, Node Port, and Load Balancer. They also learned Namespace and Network Policy, concepts for isolation and control.
* **Configuration and Storage.** Finally, this part discusses different ways to configure the resources in the cluster, for standalone or shared configuration, for sensitive and non-sensitive information. Then, we talked about Stateful Set, a powerful concept for running stateful applications.

Through this program, students gain a better understanding of the challenges associated with software operations. It not only applies to Kubernetes, but also other kinds of orchestration services (Google Cloud Run, AWS App Runner, AWS ECS, …). To access the whole program, please visit <https://mincong.io/esigelec/2026>

> **Writing hint**
>
> - **What:** a few numbers at the end of this section: 20 hours, 21 students in 13 teams, 5 chapters and 226 slides, 31 lab exercises, 284 commits by the students. The growth from 2025 shows a course that is maintained: 207 to 226 slides, 24 to 31 exercises. Also: everything runs on the students' own laptops, Windows or macOS, with the Kubernetes cluster of Docker Desktop.
> - **Why:** a director first wants the format and the scale: hours, group size, topics. A student wants to know what they will be able to do after 20 hours. The public slides of the year (mincong.io/esigelec/2026, draft PR #174) let both judge the material by themselves, and a director can do it before contacting you. And no Kubernetes cluster to rent in the cloud means no infrastructure budget for the school.
> - **How:** a short list of numbers, without sentences around them, then one sentence that points to the public slides.

## Highlights

Here are some highlights and changes from this year. It's either some improvements I did this year or some highlights from the student that I think are worth sharing with you.

> **Writing hint for the whole section "Highlights"**
>
> - **Readers:** 4 kinds, coming from LinkedIn: 1) the director of a school or the head of a department who may hire you, in France or abroad; 2) engineering students, at ESIGELEC or elsewhere, including the 21 students of this year, who will look for their team; 3) your colleagues; 4) the professionals of your network and of their network. They scroll: they look at the figures, read the headings and the captions, and maybe one sentence per section.
> - **Message:** for a director, "If I hire Mincong, my students will practice what the industry asks for (Kubernetes, observability, GenAI, security), they will learn to analyze rather than copy commands, and the course comes with modern material and a fair evaluation." For a student, "In this course, I would build, break and fix a real system, with the tools of 2026." For a colleague or another professional, "This course teaches what we do at work."
> - **How:** one section = one skill, one figure, and one or two sentences of proof. Put the strongest sections first: GenAI and Qdrant, then Troubleshooting Stories and Observability. The sentence above can say what the students achieved this year rather than "changes from this year". Keep the tone positive: what didn't work stays in the course repository.
> - **Public post:** credit the students by the color of their team, not by name, and tag them on LinkedIn only if they agree. The figures show no names and no private URLs: I masked the repository of purple, and the owners in Figure 6 are the demo data of the PetClinic. The paths such as `k8s-green/docs/lab-3.md` in these hints point to the private repositories of the teams: they're for you, not links for the readers.

### Spring Pet Clinic Adoption

Here is the architecture of the official version, run with Docker Compose, compared to the version of the course, run in Kubernetes. The parts in orange are the ones that Kubernetes replaces. The parts in green are new in the version of the course (the ConfigMap, the HTTP calls through a Service, and the server that I added):

```mermaid
---
title: "Figure 1: Spring PetClinic Microservices: the official version and the version of the course"
config:
  flowchart:
    nodeSpacing: 20
    rankSpacing: 40
---
flowchart TB
    subgraph course["Course: Kubernetes"]
        direction TB
        c_gw["api-gateway<br><span style='color:#868e96 !important'>+ About page</span>"]
        c_svc["Microservices<br><span style='color:#868e96 !important'>customers-service<br>vets-service<br>visits-service</span>"]
        c_team["team-info-server<br><span style='color:#868e96 !important'>in Go</span>"]
        c_cm["petclinic-config<br><span style='color:#868e96 !important'>ConfigMap</span>"]
        c_gw -- "http#58;//customers-service<br>Service, CoreDNS" --> c_svc
        c_gw -- "http#58;//team-info.classroom" --> c_team
        c_svc -. "mounted at /config" .-> c_cm
    end

    subgraph official["Official: Docker Compose"]
        direction TB
        o_gw["api-gateway"]
        o_svc["Microservices<br><span style='color:#868e96 !important'>customers-service<br>vets-service<br>visits-service</span>"]
        o_disc["discovery-server<br><span style='color:#868e96 !important'>Eureka</span>"]
        o_conf["config-server<br><span style='color:#868e96 !important'>Git repository</span>"]
        o_gw -- "lb://customers-service<br>Spring Cloud LoadBalancer" --> o_svc
        o_gw -. "look up" .-> o_disc
        o_svc -. register .-> o_disc
        o_svc -. configuration .-> o_conf
    end

    classDef replaced fill:#ffe8cc,stroke:#e8590c,color:#000
    classDef added fill:#d3f9d8,stroke:#2b8a3e,color:#000
    class o_disc,o_conf replaced
    class c_team,c_cm added
    linkStyle 3 stroke:#e8590c,stroke-width:2px
    linkStyle 0,1 stroke:#2b8a3e,stroke-width:2px
```

On the Spring PetClinic Microservices side, I made some patches to run the stack in Kubernetes. Because Kubernetes is not a supported platform by this project.

1. We had to create a new profile called `kubernetes`, which provides an alternative to the existing one `docker`, which was mainly designed for Docker Compose. Typically, it disables the load balancer, the config server and replace them by the native Service resources and ConfigMap in Kubernetes.
2. In the Spring PetClinic API gateway for the frontend, a new About page was added, which allows the team to practice API integration by showing the information relevant to their team.
3. Qdrant as an external vector database. The implementation of the GenAI service has been modified to support the external vector database Qdrant. By default, it only supports an in-memory database, and this time, to better simulate the real use cases and understand the stateful set, I added another implementation for connecting to Qdrant.

> **Writing hint**
>
> - **What:** the students measured the cost of microservices themselves in Lab 3: 8 teams compared the memory of the monolith and of the microservices, and found 3 to 4 times more for the microservices, e.g. red 352 Mi against 1116 Mi, purple 424 Mi against 1285 Mi, cyan 284 Mi against 1073 Mi. Point 3 (Qdrant) can move to "GenAI and Qdrant".
> - **Why:** Spring PetClinic is the reference application of the Spring community, so the students work on a realistic system rather than a toy, and every Java developer of your network knows it. And measuring a trade-off with numbers is the judgment that companies expect from an engineer: microservices aren't free.
> - **How:** one sentence after the list, with the 3 pairs of numbers. Keep Figure 1 as the only visual of this section.

### Team Info

On top of that we also have a new service called a [Team Info Server](https://github.com/mincong-classroom/team-info-server), which serves as a satellite service to interact with the main services. The main purpose of this server was to have a teaching material for troubleshooting. It simulates application error, container crashes, etc. This material is also used to understand the cross-namespace exchanges; observe load balancing mechanism across multiple Pods.

The benefit of using the team info server is that it's a lightweight Go server whose size is significantly smaller than a Java container, which is only about 5 MB. By using that, it is possible to start the container quickly. It is especially interesting for students who are using their desktop because some of them have limited memory, like 8 GB or 16 GB, which is quite different from the school's computer. It is also, I think, an opportunity to show them that different services can be in different languages and they don't have to stick to one programming language inside the microservice architecture. 

For example, here is the About page of the team "purple", before and after they added the route to the Team Info Server in the API gateway, in Lab Session 4:

<p align="center">

  <img alt="The About page of the team purple before the route: 404 Not Found"
       src="/assets/2026/purple-about-page-before.png">

  <figcaption>Figure 2: The About page of the team "purple" before the route to the Team Info Server: 404 Not Found</figcaption>

</p>

<p align="center">

  <img alt="The About page of the team purple after the route: 200 OK, with the information of the team"
       src="/assets/2026/purple-about-page-after.png">

  <figcaption>Figure 3: The About page of the team "purple" after the route to the Team Info Server: 200 OK, with the information of the team</figcaption>

</p>

Before the route, the API gateway answered 404 itself, because no route matched `/api/about/`. After the route, it forwarded the request to the Service `team-info` in the namespace `classroom`, and the page showed the information of the team. Thanks to this Team-Info integration, a student learns the route configuration in Spring and then network troubleshooting through the access logs (so they know whether the error is located in the API gateway, in the Go service, or elsewhere).

> **Writing hint**
>
> - **What:** you wrote this small server in Go for the course, so that each team sees its own About page through the API gateway (Figures 2 and 3). Its image is about 5 MB compressed on Docker Hub (amd64), against 284 MB for the API gateway: check it on Docker Hub, the draft says "about 10 MB". Its only failure is to refuse to start when `TEAM_ID` is invalid (the broken Pod of Lab 2), so drop "application error, container crashes, etc.". A student who went further: green dumped the iptables rules of kube-proxy in Lab 4 to see how the Service spreads the requests across the Pods: "The first rule picks the first Pod with probability 1/3; if not, the second rule picks the second Pod with probability 1/2" (`k8s-green/docs/lab-4.md:231`).
> - **Why:** it shows that you build material for the course instead of reusing a tutorial, and that each team gets a visible, personal result, which keeps them motivated. green's iptables show students curious enough to look under the abstraction, which is how good engineers are made.
> - **How:** replace the second paragraph with the comparison of the 2 images, keep Figures 2 and 3, then 1 or 2 sentences on green with the quote.

### Observability

We also introduced the observability stack, including Grafana, Zipkin, and Prometheus. It allowed the students to understand how the microservices communicate with each other based on the traces observed in the PetClinic server; observe the scaling events and the system loads; and more.

<p align="center">

  <img alt="Prometheus of the team green: 3/3 up while vets-service is scaled to 0"
       src="/assets/2026/green-prometheus-targets.png">

  <figcaption>Figure 4: Prometheus of the team "green" while vets-service was scaled to 0: "3/3 up", and no target for vets-service</figcaption>

</p>

> **Writing hint**
>
> - **What:** Lab 3 deploys Prometheus, Grafana and Zipkin next to the PetClinic, and the teams use them to understand the system. In Exercise 6, they stopped vets-service and noticed that Prometheus still showed "3/3 up": the target of the stopped service disappears instead of turning red. green: "So Prometheus does not report the outage as a failed target: it shows 3/3 up" (`k8s-green/docs/lab-3.md:754`); purple, red, white, gold and brown found the same. Fact to fix: this is taught in the lab; the lecture only shows the stack.
> - **Why:** observability is a core skill of DevOps and SRE jobs, and most courses stop at the deployment. Here the students read the monitoring critically: "all green" doesn't mean "healthy". Engineers usually learn this during their first incident; your students learned it in class. The engineers of your network who lived an outage will recognize the trap at once, which makes the course credible to them.
> - **How:** the surprise in one sentence, Figure 4, then the lesson in one sentence. The list of tools in one line.

### Autoscaling

This year, in terms of the lecture, what we improved is that we added auto-scaling to the deployments part. Chapter 3 allows students to understand how to install the metrics server on the Kubernetes Control Plane and define auto-scaling rules based on CPU.

More precisely, the team needs to install the Metrics Server to the Kubernetes cluster and add a horizontal pod autoscaler (HPA) to a service and send loads to it. Each team has their freedom to choose an implementation for the load test, and they can send it and observe the load from the observability tool Grafana.

The teaching material is also prepared for them to succeed, meaning that I lower the maximum number of spans and the lower threshold for the upscaling (because, overall, all the events happen on the laptop). The importance is to observe the upscale and downscale events without crashing their machine. 

<p align="center">

  <img alt="Grafana of the team black: vets-service goes from 1 to 2, 4, then 5 Pods"
       src="/assets/2026/black-grafana-autoscaling.png">

  <figcaption>Figure 5: Grafana of the team "black" in Lab 3: vets-service scales from 1 to 2, 4, then 5 Pods (top) while the requests rise to about 13 per second (bottom right)</figcaption>

</p>

Here, in this screenshot, you can see that the black team used a loop generator based on the BC box to run an infinite loop of `wget` to get the content from the veterinarian service. This generated an increased amount of HTTP traffic, which resulted in the auto-scaling of the deployment.

> **Writing hint**
>
> - **What:** new in 2026: a slide on the HPA in chapter 3, and Lab 3 Exercise 7, where each team adds a HorizontalPodAutoscaler to a service and sends load to it. Figure 5 shows the vets-service of black scaling out in steps up to 5 Pods while the load rises to about 13 requests per second. The team purple linked it to production: "right after the HPA spawned the new Pods, I got a short burst of HTTP 503 Service Unavailable errors. The YAML has no readiness probe" (`k8s-purple/docs/lab-3.md:1212`). Fact to fix: the Metrics Server runs in the namespace `kube-system` (deployed by `observability.yaml`), not "on the control plane".
> - **Why:** autoscaling is how companies absorb the peaks of traffic and control their cloud bill. The students didn't only write the YAML: they watched it work on a real dashboard, and purple found on its own why new Pods need a readiness probe: a classic issue of production that your colleagues will recognize.
> - **How:** one sentence for the concept, one for the proof with Figure 5, one for purple.

### Network Policy

On the networking side, we also talked about the network policy to enforce communication between namespaces, which was not the case last year.

In the new slides, under the networking chapter (Chapter 4), I added 7 new slides, starting with business use cases such as personal data and card payment. They then share the motivation for network protection based on business requirements. This helps sensitize the student to security and data protection, which is a frequent request from companies, especially in Europe.

After learning the motivation, they start practicing it by defining the network policy and applying it through PetClinic, while protecting the PetClinic application as a production environment so that other namespaces in the Kubernetes cluster cannot access the data. 

> **Writing hint**
>
> - **What:** 7 new slides in chapter 4 (#40 to #46) that start from business cases (personal data, card payments, SaaS, intrusion), and Lab 4 Exercise 7 with a GDPR story: block the other namespaces from reaching the PetClinic. purple and green proved it with a request from another namespace that the policy refused.
> - **Why:** security and data protection are top concerns for companies, and GDPR makes them a legal duty in Europe. The course starts from the business reason before the YAML, so the students learn why a policy exists, not only how to write one. The message: graduates who protect data by default.
> - **How:** the business reason in one sentence, then the exercise in one sentence. I can prepare a screenshot of the refused request of purple or green if you want a student figure here.

### GenAI and Qdrant

<p align="center">

  <img alt="The chatbot of the team olive answers that Max visited the clinic on September 15, 2023, while the page shows visits on 2013 Jan 02 and Jan 03"
       src="/assets/2026/olive-chat-max.png">

  <figcaption>Figure 6: The chatbot of the team "olive" invents a visit of Max on September 15, 2023, while the page shows 2 visits in January 2013</figcaption>

</p>

<p align="center">

  <img alt="The Zipkin trace of one chat question of the team olive: chat gpt-4o-mini, tool_call listvets, qdrant query, chat gpt-4o-mini"
       src="/assets/2026/olive-zipkin-genai.png">

  <figcaption>Figure 7: The Zipkin trace of one question to the chatbot of the team "olive" (17 s), with the boxes added by the evaluator</figcaption>

</p>

> **Writing hint**
>
> - **What:** Lab 5 deploys a GenAI service (OpenAI `gpt-4o-mini`) behind the "Chat with Us!" box of the PetClinic, with Qdrant as a vector database in a StatefulSet of 3 replicas. 3 student highlights. 1) olive caught the assistant inventing a visit (Figure 6) and explained why with the trace: the tool `listOwners` reads Customers, not Visits, so "the model invents information instead of recognizing this limit" (translated from `k8s-olive/docs/lab-5.md:587`); navy and blue reached the same conclusion. 2) The teams measured where the time goes (Figure 7): in this trace of 17 s, the first call to `gpt-4o-mini` takes 7.9 s and the Qdrant query 3.1 s. 3) gold deleted the leader of the Qdrant cluster and measured the failover: "The term went from 1 to 2 and qdrant-1 became the leader, within 6.5 s of the deletion" (`k8s-gold/docs/lab-5.md:816`), while the chat kept answering.
> - **Why:** it's the strongest section, for every reader. GenAI is what every company wants to put in production in 2026, and few courses combine it with cloud-native operations. The students didn't only use an AI assistant: they deployed one (prompt, tools, RAG, memory), made it highly available, and audited its answers with traces. Knowing that an HTTP 200 doesn't prove that an answer is right is the skill that companies need to run AI safely. For a student, deploying and auditing an AI assistant is a project worth a line on a CV. For the professionals who work with LLMs, the invented visit and the 7.9 s of the first call are problems they know.
> - **How:** put this section first in "Highlights". Lead with Figure 6: anyone gets it in 2 seconds. Then Figure 7, then one sentence on the failover. Move point 3 of "Spring Pet Clinic Adoption" here.

### Troubleshooting Stories

<p align="center">

  <img alt="The terminal of the team black: the Service team-info has no endpoints, and a temporary Pod gets Connection refused"
       src="/assets/2026/black-broken-selector.png">

  <figcaption>Figure 8: The team "black" breaks the selector of the Service team-info: no endpoints, and "Connection refused" instead of the timeout that the team expected</figcaption>

</p>

> **Writing hint**
>
> - **What:** Lab 4 Exercise 5 asks the teams to break the Service of the Team Info Server in 2 ways: a selector that matches no Pod, then a `targetPort` where the container doesn't listen. 3 teams went beyond the expected answer. 1) black expected a timeout, got "Connection refused" in both cases (Figure 8), and found that the endpoints tell the 2 cases apart: `<none>` for the selector, the wrong port for the `targetPort` (`k8s-black/docs/lab-4.md:371`). 2) red saw the About page still answer 200 right after breaking the Service, and explained it: the API gateway reused its open connection until a restart. 3) white found that the API gateway reads its ConfigMap only at startup, and that a Pod can be Running before Spring Boot listens.
> - **Why:** troubleshooting is what companies value most in a junior engineer, and it's the hardest skill to teach: it can't be copied from a tutorial or from an AI assistant. These 3 stories show students who observe, form a hypothesis and verify it, beyond the instructions. The message: the course trains engineers who can operate a system, not only deploy it. The engineers of your network will relate: a reused connection or a Pod that is Running before the application listens are bugs that they debug at work.
> - **How:** one short paragraph per team, each ending with its lesson. Credit the teams by their color.

### Teaching Assistant

The command-line interface [`mc`](https://github.com/mincong-classroom/mc) has been improved too. These command lines were used last year for grading, I mean, some of the statical without static result from last year, like checking the content of some file. It was used to manage Git-related operations in batch for all the teams, but this year we went further into this. It becomes more like a teaching assistant.
In order of respect:
1. It replaces GitHub Classroom to provision the team. It allows the team to register themselves, and then it uses the underlying GitHub command line `gh` to provision the team, add the team member (a student) to the team as a team member, create the team repository by cloning the repo from the public template, and manage the relationship (granting team access to those repositories).
2. It is also used with some coding agent skill to perform an in-depth evaluation for each team. That evaluation part is valuable since it solves multiple problems. First, as a system-level course, it is hard to reproduce all the scenarios. Each team has its own specification description. Based on the `mc` command line and the coding skills, we were able to reproduce those scenarios for each team, even if there are no standard answers. It helps by giving an AI-generated screenshot for teams that didn't provide evidence for the result, so it helps asserting the correctness of the result despite the lack of evidence. Thirdly, it annotates the existing screenshot provided by the team, so it allows highlighting the important part of the screenshot, especially when there are many screenshots.

<p align="center">

  <img alt="Evidence generated by the evaluator for the team purple: the Veterinarians page says Veterinarian data is temporarily unavailable"
       src="/assets/2026/purple-ai-generated-evidence.png">

  <figcaption>Figure 9: Evidence generated by the evaluator for the team "purple" in Lab 3: the Veterinarians page while vets-service is down</figcaption>

</p>

> **Writing hint**
>
> - **What:** `mc` provisions the teams on GitHub in place of GitHub Classroom, and runs the evaluation of every team: `mc eval run` starts the skills `report-lab` and `grade-lab` of the course repository with `claude -p`, one agent per team (`esigelec/EVALUATION.md`). Over 13 teams and 5 labs, the evaluator replayed or annotated 294 screenshots and 465 command outputs. 2 kinds of evidence: annotated, to point at what matters in the screenshots of a team (Figure 7, the numbered boxes), and generated, to check a result in the setup of the team (Figure 9). Each team also has its own lab page with its variables (mincong.io/esigelec/lab/?team=red). 2 facts to fix: you registered the teams yourself, from the names and GitHub usernames they gave you (`esigelec/slides/chapter-1.md`, notes of the slide "Team Registration"); and "In order of respect" was probably "In order of appearance".
> - **Why:** a director worries about the workload of a technical course: the setup, the grading, the fairness. You bring your own tooling as a software engineer: the teams are ready on GitHub in minutes, and every team gets detailed feedback based on evidence, even though each team has its own cluster and its own names. The banner of Figure 9 and your review of the grades show AI used under control. Your colleagues and other engineers will look at the tooling itself: a CLI that runs one coding agent per team is a use of agents beyond writing code, and `mc` is public on GitHub.
> - **How:** split the long paragraph into 3 short ones: provisioning, evaluation, evidence. If Figure 9 looks like it points at a missing screenshot of purple, keep Figure 7 only: it shows the same idea.

### Animation in Slides

With the advance of AI and coding agents, it became possible to have more advanced assistance for the lecture and the presentation.

In the past, we used some diagrams to illustrate some scenarios, but those diagrams were more or less static. They were screenshots, and it was hard to maintain them because we needed to generate them separately from the site and then import them as static images into the presentation.

Now, with coding agents like Claude Code, it was possible to embed the diagrams directly into the slide and also ensure that they animate in a coordinated way with the content. When we express some view, some definition of a specific topic, it can not only show the diagram to illustrate the interaction or relationship between different components, but also highlight a specific component that the teacher wants the student to focus on. It makes the whole flow more dynamic and more attractive.

On the other hand, it also allows some comparison. For example, we can compare the interactive and declarative commands side by side. Whenever I click, we can show the evolution of both sides. This kind of advanced animation was not possible in the past. Thanks to a coding agent, we can do a lot more on this site to make the course and the lecture more attractive. 

<p align="center">

  <img alt="Animation of the slide Deployment: Rolling Update of chapter 3: the Pods of the new version replace the Pods of the previous version, click after click"
       src="/assets/2026/slide-rolling-update.gif">

  <figcaption>Figure 10: The slide "Deployment: Rolling Update" of chapter 3, click after click</figcaption>

</p>

> **Writing hint**
>
> - **What:** Figure 10 replays the 9 clicks of the rolling update (chapter 3, slide 17). The diagrams are Mermaid code inside the Slidev deck, and each click switches to the next diagram (`<v-switch>`), in 25 places across the 5 chapters. The deck grew from 207 to 226 slides this year.
> - **Why:** an animated diagram keeps the attention of the students on the component that you talk about, so the lecture is easier to follow. And since the slides are text versioned with Git, they're updated every year and can be adapted quickly to another school, another duration or another language: a selling point for a new school. The teachers and the colleagues who give talks can reuse the idea, since Slidev and Mermaid are open source.
> - **How:** cut the 3 paragraphs to 2 or 3 sentences around Figure 10: static images before, one diagram per click now, and what it allows. I can make a second GIF for the comparison of the imperative and the declarative commands.

### AI-assisted Lab Sessions

> **Writing hint**
>
> - **What:** the rule you set this year (D12, 31 Oct): "An AI assistant gives the result in a few seconds, so a result alone doesn't tell whether the team did the work" (`esigelec/EVALUATION.md`). So the result of an exercise counts for 70%, the analysis for 15% and the evidence for 15%. In Labs 3 to 5, an observation earns its full credit with the team's own screenshot or output, which shows that the team opened Zipkin or Grafana.
> - **Why:** every school asks how to teach and grade when the students use AI. You have a concrete, tested answer: the students may use AI, and the grade rewards what AI can't produce for them, their own analysis and evidence. The student highlights above (Figures 4, 6 and 8) are exactly the work that this rule rewards. The message: a teacher who embraces AI and keeps the learning real. Students see that they may use AI and that the grade rewards their own reasoning. Professionals face the same question when they evaluate a junior who uses AI.
> - **How:** one sentence for the question, the 70/15/15 split as a short list, one sentence for the screenshots, and a link back to one student figure as the example.
