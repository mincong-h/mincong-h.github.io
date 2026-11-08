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

## Introduction

In the end of October, I had the privilege to go to ESIGELEC, an engineering school in Saint-Étienne-du-Rouvray, Normandy, France, to share knowledge about Kubernetes with about 20 students. This is a 20-hour module for the students majoring in the Digital Services Engineering (Ingénieurie des Services du Numérique). In this article, I want to recapitulate the program of this course, the changes compared to last year, and some highlights from the students.

## Program

This module lasts for 20 hours. It consists of five chapters, each lasting 4 hours, including 1 hour of lecture and 3 hours of lap session. In this module, we discuss containerizing applications with Docker, the key components of a Kubernetes cluster, and then dive into workload deployment, networking, configuration, and storage in greater detail.

* **Containerization with Docker.** In this part, students learned how to create Docker images for Java applications. They learned how to package a Java application as a JAR, and what the Java Runtime Environment (JRE) is. Then, they learn concepts related to Docker Runtime, Docker Registry, Docker CLI, Docker Desktop, and Dockerfile.
* **Kubernetes Overview.** In this part, they learn the key components of Kubernetes, including the API server, etcd, scheduler, controller manager, kubelet, node; the command line tool `kubectl`. Then, they developped and operated Pods in the Lab Session.
* **Deployment in Kubernetes.** This part focuses on workloads. We discussed deployment and operational challenges in companies and how Kubernetes addresses some of these challenges using ReplicaSets and Deployments. We also talked about workload scaling and microservices architecture.
* **Networking in Kubernetes.** This part discusses different networking components in Kubernetes to adapt to different use cases in a Kubernetes cluster, including Service, Node Port, and Load Balancer. They also learned Namespace and Network Policy, concepts for isolation and control.
* **Configuration and Storage.** Finally, this part discusses different ways to configure the resources in the cluster, for standalone or shared configuration, for sensitive and non-sensitive information. Then, we talked about Stateful Set, a powerful concept for running stateful applications.

Through this program, students gain a better understanding of the challenges associated with software operations. It not only applies to Kubernetes, but also other kinds of orchestration services (Google Cloud Run, AWS App Runner, AWS ECS, …). To access the whole program, please visit <https://mincong.io/esigelec/2026>

## Changes

### Spring Pet Clinic Adoption

Here is the architecture of the official version, run with Docker Compose, compared to the version of the course, run in Kubernetes. The parts in orange are the ones that Kubernetes replaces, and the part in green is the server that I added:

```mermaid
---
title: "Spring PetClinic Microservices: the official version and the version of the course"
config:
  flowchart:
    nodeSpacing: 20
    rankSpacing: 40
---
flowchart TB
    subgraph course["Course: Kubernetes"]
        direction TB
        c_gw["api-gateway<br>+ About page"]
        c_svc["customers-service<br>vets-service<br>visits-service"]
        c_team["team-info-server<br>in Go"]
        c_cm[/"petclinic-config<br>ConfigMap"/]
        c_gw -- "http#58;//customers-service<br>Service, CoreDNS" --> c_svc
        c_gw -- "http#58;//team-info.classroom" --> c_team
        c_svc -. "mounted at /config" .-> c_cm
    end

    subgraph official["Official: Docker Compose"]
        direction TB
        o_gw["api-gateway"]
        o_svc["customers-service<br>vets-service<br>visits-service"]
        o_disc["discovery-server<br>Eureka"]
        o_conf["config-server<br>Git repository"]
        o_gw -- "lb://customers-service<br>Spring Cloud LoadBalancer" --> o_svc
        o_gw -. "look up" .-> o_disc
        o_svc -. register .-> o_disc
        o_svc -. configuration .-> o_conf
    end

    classDef replaced fill:#ffe8cc,stroke:#e8590c,color:#000
    classDef added fill:#d3f9d8,stroke:#2b8a3e,color:#000
    class o_disc,o_conf,c_cm replaced
    class c_team added
    linkStyle 0,3 stroke:#e8590c,stroke-width:2px
    linkStyle 1 stroke:#2b8a3e,stroke-width:2px
```

On the Spring PetClinic Microservices side, I made some patches to run the stack in Kubernetes. Because Kubernetes is not a supported platform by default.

We had to edit a new profile called Kubernetes, which is alongside the existing one, which is Docker. There are two profiles and then we activate the Kubernetes profile directly.

In the Kubernetes profile the load balancer provided by Spring is disabled. It is replaced by the native Kubernetes service for load balancing. For the discovery side it is also disabled. We don't use the discovery server from Spring and we use the discovery system from Kubernetes directly, which is based on the CoreDNS containers.

For the configuration we also disable the config server, which now relies on the config map. In the Spring demo they use the config server to centralize configuration and allow them to reload remotely and handle it in a centralized way. In Kubernetes we simulate similar behavior using a config map, which is shared between multiple microservices and mounted as a volume. By doing so we kind of understand the benefit of using Kubernetes and having some support from the ecosystem natively. 



In the Spring PetClinic API gateway for the frontend, we added a new page called the About page, which allows the team to show the information relevant to their team, which facilitates the integration. 

### Go Server

About the teaching material, this year we continue to use the Spring PetClinic project from the Spring open source community as the principal teaching material for the course. We use both the monolith version and the microservices option to show the evolution of the architecture from monolith to microservices. We deployed the spring-petclinic-microservices into Kubernetes using related concepts like service deployment, config map, and others.

On top of that we also have a new service called a team info server, which serves as a satellite service to interact with the main services. The goal is to help them understand some corner cases about the application and help them troubleshoot. For example they have to configure some environment variable otherwise the server won't start. They can use this material to understand the exchanges between namespaces and to understand things related to the load balancing mechanism when there are multiple pods.

The benefit of using the team info server is that it's a lightweight Go server whose size is significantly smaller than a Java container, which is only about 10 MB. By using that, it is possible to start the container quickly. It is especially interesting for students who are using their desktop because some of them have limited memory, like 8 GB or 16 GB, which is quite different from the school's computer. It is also, I think, an opportunity to show them that different services can be in different languages and they don't have to stick to one programming language inside the microservice architecture. 



 this year, in terms of the lecture, what we improved is that we added auto-scaling to the deployments part. Chapter 3 allows students to understand how to use the matrix server and define auto-scaling rules based on CPU. They have the opportunity to use the matrix and the tracing server to observe the changes related to the scaling events.

On the other hand, we also introduce the stack of observability, which was not discussed last time. It allows the student to understand how the microservices communicate with each other based on the traces observed in the PetClinic server. On the networking side, we also talk about the network policy to enforce communication between namespaces, which was not the case before. 

