---
article_num:         221
layout:              post
type:                classic
title:               ESIGELEC Kubernetes 2025 Recap
subtitle:            >
    Designing and evolving a Kubernetes course for engineer students.

lang:                en
date:                2025-10-21 17:30:22 +0200
categories:          [kubernetes]
tags:                [kubernetes]
comments:            true
excerpt:             >
    This post reflects on a 20-hour Kubernetes course I recently taught at ESIGELEC, where engineering students explored containerization, Kubernetes fundamentals, and real-world collaboration using the Spring Pet Clinic project. It shares insights into the redesigned curriculum, hands-on labs, and lessons learned from focusing deeply on Kubernetes and team-based learning.

image:               /assets/bg-coffee-84624_1280.jpg
cover:               /assets/bg-coffee-84624_1280.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---


Recently, I taught a course on Kubernetes at ESIGELEC. This is a 20-hour module for 25 engineering students majoring in the Digital Services Engineering (Ingenieurie des Services du Numerique). I want to create this document to outline some thoughts on this module.

This module lasts for 20 hours. It consists of five chapters, each lasting 4 hours, including 1 hour of lecture and 3 hours of lap session. In this module, we discuss containerizing applications with Docker, the key components of a Kubernetes cluster, and then delve deeper into workload deployment, networking, configuration, and storage.

## Spring Pet Clinic

This year, we changed the lab materials. We switched from a homemade “Weekend Server” to the Spring Pet Clinic project, maintained by the Spring community. “Weekend Server” was a simple Java server that determined whether today was a weekend or a weekday. It was a stateless web server without any business logic. It was designed to be easy to understand and easy to edit. But it was too simple to use across multiple teams and chapters. This year, I switched to Spring Pet Clinic, which better simulates real-world scenarios. Spring Pet Clinic has two versions: monolith and microservice. Both of them demonstrate technologies built by the Spring ecosystem. It includes features for customers, pets, veterinarians, and an AI chatbot. The microservice architecture is particularly interesting because it splits features into domains, which can be easily distributed across multiple teams. In the lab sessions, each team consists of two students who work on a specific domain. Then, 3 teams work together as a group for a clinic. It allows students to focus on a single domain and simulate their roles within the company.

## One knowledge, learned 3 times.

In this module, I tried to teach each important knowledge 3 times. The piece of knowledge is firstly described in the lecture using definitions, examples, and diagrams. Then, the knowledge is practiced through the lab session. It is usually represented as a task to develop a new feature or to troubleshoot a predefined problem. Finally, we recall the same concept at the beginning of the next chapter during the lab correction.

## Focus on Kubernetes
Compared to last year, the module's content has been narrowed to Kubernetes. Last year, the module was called “Software Containerization and Orchestration”. It consisted of 4 hours in the containers, 6 hours in CI/CD, and then 12 hours in Kubernetes. It was too broad to go further into any topic. Before exploring any intermediate-level concept, we need to go through the basics. But we cannot do that because of the time constraints. That’s why this year I decided to replace the CI/CD part with Kubernetes, so that we can entirely focus on one single topic. Thanks to this decision, we can spend time on Kubernetes topics such as networking, configuration, secret management, storage, and isolation.

## Team collaboration within Kubernetes

Beyond the technology learning, it is more important for students to understand how they can collaborate with others in companies. Any significant changes must go through the organization and cannot be made alone. That’s why I developed lab sessions to be collaborative. The lab sessions 3, 4, 5 include exercises that require results from 1-2 other teams. 3 teams of students work together as a group to build an online pet clinic service. Technically, the Spring Pet Clinic project has multiple microservices. So one team is responsible for a specific microservice in the stack: either the frontend, customer service, or veterinarian service. Then, they have new features to be developed across teams. This is also a good exercise for them to practice their skills with container images and registries, since they will need to pull images from other teams.

## Incident with Docker Hub

Doing the first chapter, containerization with Docker, we had some bad luck. We rely on Docker Hub for the lab's Docker images, but it was down twice on the same day. Their service experienced a major outage that day, affecting multiple services. The first time was during the lecture, and the second was later that evening. As a consequence, students cannot really pull the base images or publish the Docker images they built. The root cause of the outage was likely the AWS SEV-0 outage in us-east-1, which broke half of the internet. As an immediate remediation, we switched from Docker Hub to AWS Elastic Container Registry (ECR), so that students can pull the images. Later in the evening, since the Docker Hub still wasn’t fully recovered, I decided to replicate all the students’ homework to GitHub Container Registry (GHCR), so that they can pull directly from GitHub for the subsequent lab sessions.

## Conclusion

This is the 2nd year I have taught containers and Kubernetes at ESIGELEC. There were many improvements made to the course to enhance the learning experience and add greater value to students. It includes the lab materials, the methodology, goal refinement, etc. It was a privilege for me to be here, 9 years after graduating from ESIGELEC, as a visiting professor.
