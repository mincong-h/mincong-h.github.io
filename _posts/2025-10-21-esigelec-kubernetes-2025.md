---
article_num:         221
layout:              post
type:                classic
title:               ESIGELEC Kubernetes 2025 Recap
subtitle:            >
    Designing and evolving a Kubernetes course for engineering students.

lang:                en
date:                2025-10-21 17:30:22 +0200
categories:          [kubernetes, java]
tags:                [kubernetes, java]
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

Recently, I taught a course on Kubernetes at ESIGELEC. This is a 20-hour module for 25 engineering students majoring in the Digital Services Engineering (Ingenieurie des Services du Numerique). It was such a privilege for me to return to school and share my passion for infrastructure with students. In this blog post, I would like to outline some thoughts on this module.

## Program

This module lasts for 20 hours. It consists of five chapters, each lasting 4 hours, including 1 hour of lecture and 3 hours of lap session. In this module, we discuss containerizing applications with Docker, the key components of a Kubernetes cluster, and then delve into workload deployment, networking, configuration, and storage in greater detail.

1. **Containerization with Docker.** In this part, they learned how to create Docker images for Java applications. They learned how to package a Java application as a JAR, and what the Java Runtime Environment (JRE) is. Then, they learn concepts related to Docker Runtime, Docker Registry, Docker CLI, Docker Desktop, and Dockerfile.
2. **Kubernetes Overview.** In this part, they learn the key components of Kubernetes, including the API server, etcd, scheduler, controller manager, kubelet, kube-proxy etc; the command line tool `kubectl`. Then, they start developing Pods in the Lab Session.
3. **Deployment in Kubernetes.** This part focuses on workloads. **We discussed deployment and operational challenges in companies and how Kubernetes addresses some of these challenges using ReplicaSets and Deployments. **
4. **Networking in Kubernetes.** This part discusses different networking components in Kubernetes to adapt to different use cases in a Kubernetes cluster. We also mention namespace, an efficient way to provide isolation in Kubernetes.
5. **Configuration and Storage.** Finally, this part discusses different ways to configure the resources in the cluster, for standalone or shared configuration, for sensitive and non-sensitive information. Additionally, various types of storage solutions.

Through this program, students gain a better understanding of the challenges associated with software operations. It not only applies to Kubernetes, but also other kinds of orchestration services (Google Cloud Run, AWS App Runner, AWS ECS, ...). To access the whole program, please visit <https://mincong.io/esigelec/2025>

In the following paragraphs, I would like to share some of the changes compared to last year.

### Spring Pet Clinic

This year, we changed the lab materials. We switched from a homemade “Weekend Server” to the Spring Pet Clinic project, maintained by the Spring community. “Weekend Server” was a simple Java server that determined whether today was a weekend or a weekday. It was a stateless web server without any business logic. It was designed to be easy to understand and easy to edit. But it was too simple to use across multiple teams and chapters. This year, I switched to [Spring Pet Clinic](https://spring-petclinic.github.io/), which better simulates real-world scenarios. Spring Pet Clinic has two versions: monolith and microservice. Both of them demonstrate technologies built by the Spring ecosystem. It includes features for customers, pets, veterinarians, and an AI chatbot. The microservice architecture is particularly interesting because it splits features into domains, which can be easily distributed across multiple teams. In the lab sessions, each team consists of two students who work on a specific domain. Then, 3 teams work together as a group for a clinic. It allows students to focus on a single domain and simulate their roles within the company.

For example, here is the project made by the team "south-1", where they were able to start the whole stack in microservices locally with some modifications. You can find their group name in the footer. They also added new features that were missing, such as the email for the pet owners and the qualification of the veterinarians.

<p align="center">

![Spring Pet Clinic started with team's logo](/assets/2025/south-1-petclinic.png)

![Spring Pet Clinic with email support](/assets/2025/south-1-email-support.png)

</p>

### One knowledge, learned 3 times.

In this module, I tried to teach each important knowledge 3 times. The concept is first introduced in the lecture through definitions, examples, and diagrams. Then, the knowledge is practiced through the lab session. It is typically represented as a task to develop a new feature or to troubleshoot a predefined problem. Finally, we recall the  concept at the beginning of the next chapter during the lab correction. By doing so, students can understand the definition of the knowledge, understand its application (through practice), and get refreshed and clarified in the next chapter.

### Focus on Kubernetes

Compared to last year, the module's content has been narrowed to Kubernetes. Last year, the module was called “Software Containerization and Orchestration”. It consisted of 4 hours in the containers, 6 hours in CI/CD, and then 12 hours in Kubernetes. It was too broad to go further into any topic. Before exploring any intermediate-level concept, we need to go through the basics. But we cannot do that because of the time constraints. That’s why this year I decided to replace the CI/CD part with Kubernetes, so that we can entirely focus on one single topic. Thanks to this decision, we can spend time on Kubernetes topics such as networking, configuration, secret management, storage, and isolation.

### Team collaboration within Kubernetes

Beyond the technology learning, it is more important for students to understand how they can collaborate with others in companies. Any significant changes must go through the organization and cannot be made alone. That’s why I developed lab sessions to be collaborative. The lab sessions 3, 4, 5 include exercises that require results from 1-2 other teams. 3 teams of students work together as a group to build an online pet clinic service. Technically, the Spring Pet Clinic project has multiple microservices. So one team is responsible for a specific microservice in the stack: either the frontend, customer service, or veterinarian service. Then, they have new features to be developed across teams. This is also a good exercise for them to practice their skills with container images and registries, since they will need to pull images from other teams.

### Incident with Docker Hub

Doing the first chapter, containerization with Docker, we had some bad luck. We rely on Docker Hub for the lab's Docker images, but it was down twice on the same day. Their service experienced a major outage that day, affecting multiple services. The first time was during the lecture, and the second was later that evening. As a consequence, students cannot really pull the base images or publish the Docker images they built. The root cause of the outage was likely the AWS SEV-0 outage in us-east-1, which broke half of the internet. As an immediate remediation, we switched from Docker Hub to AWS Elastic Container Registry (ECR), so that students can pull the images. Later in the evening, since the Docker Hub still wasn’t fully recovered, I decided to replicate all the students’ homework to GitHub Container Registry (GHCR), so that they can pull directly from GitHub for the subsequent lab sessions.

### GenAI

In Lab Session 5, students have the opportunity to interact with OpenAI via the GenAI service `spring-petclinic-genai-service`. They were asked to set up the application (Deployment), the networking (Service), and configure the AI service so that it can communicate with OpenAI and retrieve information from other microservices running in the cluster. It provides them with a first opportunity to explore AI integration within the company.

For example, here is the final result from the team "west-1", where they queried the information of the pet owner using the Gen AI service.

<p align="center">

![GenAI service successfully configured by the team "west-1"](/assets/2025/esigelec-k8s-assignment-genai-west-1.png)

</p>

## Conclusion

This is the 2nd year I have taught containers and Kubernetes at ESIGELEC. Several improvements were made to the course to enhance the learning experience and add greater value to students. It includes lab materials, methodology, goal refinement, and other relevant details. It was a privilege for me to be here again, 9 years after graduating from ESIGELEC. I hope that the students enjoyed this module. I am looking forward to doing this again next year :) 
