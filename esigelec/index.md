---
layout:         post
title:          Software Containerization and Orchestration
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

The course will be broken down into 3 parts: containerization, CI/CD, and orchestration. Containerization talks about what a container is and its core concepts. The CI/CD talks about how to build and deploy the container into production. In the end, the orchestration talks about how to operate containers using Kubernetes or similar technologies.

```mermaid
%%{
    init: {
        'logLevel': 'debug',
        'theme': 'base'
    }
}%%
timeline
    title Timeline
    section Containers
        §1 Containerization with Docker
            : Package Java application as a JAR
            : Create Docker image
            : Run Docker image
            : Storage in Docker
    section CI/CD
        §2 Continuous Integration
            : Run unit tests in GitHub Actions
            : Build Docker image in GitHub Actions
            : Publish Docker image to Docker Hub
        §3.1 Continuous Delivery
            : Deploy Docker image to Amazon Elastic Container Service (ECS) with GitHub Actions
    section Kubernetes
        §3.2 Introduction
            : Explore Kubernetes cluster with kubectl
            : Create a Pod for a frontend application
            : Create a Pod for a Java application
            : Operate a Pod with kubectl
        §4 Deployment and Networking
            : Create a ReplicaSet
            : Create a Deployment
            : Create a Service
            : Roll out a new version of the application
        §5 Configuration and Storage
            : Create a ConfigMap
            : Create a PersistentVolume
```

## Quick Links

Chapter | Date |  Slides | Assignment
:--- | ---: | :--- | :---
Chapter 1 | 21 Oct, 2024 | [slides](/esigelec/1/) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-1.md)
Chapter 2 | 23 Oct, 2024 | [slides](/esigelec/2/) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-2.md)
Chapter 3 | 28 Oct, 2024 | [slides](/esigelec/3/) | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-3.md)
Chapter 4 | 7 Nov, 2024 | not available yet | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-4.md)
Chapter 5 | 20 Nov 2024 | not available yet | [assignment](https://github.com/mincong-classroom/containers/blob/main/docs/lab-5.md)

Other resources:

* GitHub: organization [mincong-classroom](https://github.com/mincong-classroom/), classroom invitation <https://classroom.github.com/a/Wo093iKD>
* DockerHub: [mincongclassroom](https://hub.docker.com/u/mincongclassroom)
