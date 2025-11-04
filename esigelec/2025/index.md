---
layout:         post
title:          Kubernetes 2025
subtitle: >
  Welcome to the world of containers!

excerpt: >
  Welcome to the world of containers! In this course, we will learn how to containerize your applications with Docker, automate the release process with GitHub Actions, and run them with Kubernetes.

image:               /assets/william-william-NndKt2kF1L4-unsplash.jpg
cover:               /assets/william-william-NndKt2kF1L4-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

{% comment %}
The target readers are students in ESIGELEC.
{% endcomment %}

## Introduction

In modern software development, containers are just everywhere: they are in the continuous integration (CI) system, in the local development environment (devenv), in the production environment with microservices architecture, in the serverless environment, … Understanding the basics of containers becomes an essential skill for any role related to software development. No matter whether you are going to be developers, DevOps, data scientists, project managers, QA, or any other roles, the knowledge of containers can only help you to better fit into the role. It helps you to better understand the needs, better communicate with other professionals and accelerate the development process.

The course lasts for 20 hours. It is broken down into two parts: containerization and orchestration. Containerization refers to the development and operations of a container. Then, the orchestration relates to developing, configuring, and exposing containers in Kubernetes.

```mermaid
timeline
    section Containers
        §1 Containerization with Docker
            : Package Java application as a JAR
            : Create Docker image
            : Publish Docker image to a registry
            : Run Docker image
    section Kubernetes
        §2 Pods
            : Explore a Kubernetes cluster with kubectl
            : Create Pods in different ways
            : Operate Pods with kubectl
        §3 Deployment
            : Create a new ReplicaSet
            : Create a Deployment
            : Understand Deployment characteristics
            : Adapt microservice architecture
        §4 Networking
            : Create a Service
            : Roll out a new version of the application
            : Collaborate with other teams to develop new features
        §5 Configuration and Storage
            : Create a ConfigMap
            : Set up a new workload end-to-end
```

## Quick Links

Chapter   |         Date |  Slides | Assignment
:-------- | -----------: | :------ | :---------
Chapter 1 | 20 Oct, 2025 | [slides](/esigelec/2025/1) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-1.md)
Chapter 2 | 21 Oct, 2025 | [slides](/esigelec/2025/2) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-2.md)
Chapter 3 | 28 Oct, 2025 | [slides](/esigelec/2025/3) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-3.md)
Chapter 4 | 29 Oct, 2025 | [slides](/esigelec/2025/4) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-4.md)
Chapter 5 | 30 Oct, 2025 | [slides](/esigelec/2025/5) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-5.md)

Other resources:

* GitHub: organization [mincong-classroom](https://github.com/mincong-classroom/), classroom invitation <https://classroom.github.com/a/l38CNSR0>
* DockerHub: [mincongclassroom](https://hub.docker.com/u/mincongclassroom)
