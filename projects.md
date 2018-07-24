---
layout:     page
title:      Projects
permalink:  /projects/
comments:   true
---

Hi everybody, I'm Mincong. Here's a list of projects I've done in my work or in
my spare time.

For the _"effort"_ size, my definition is:

- `S`: less than 20 hours
- `M`: 20 hours to 100 hours
- `L`: more than 100 hours

## Personal Blog SEO Improvement

I've been writing blog posts for two years now, but the visits are very low.
This project aims to improve the SEO (Search Engine Optimization) for Google
Search. It includes the understanding of Jekyll, adding crawlers-friendly's
files (`robots.txt`, `sitemap.xml`), collect user search queries, improve the
title and meta description of blog posts, add structured data, etc. For more
detail, see my blog post: [SEO: Improve Blog Ranking in Google Search](https://mincong-h.github.io/2018/07/21/improve-the-search-presence/)

&#35;  | Description
:----- | :----------
Date   | July 2018
Effort | S
Type   | Personal Project
Tags   | `jekyll`, `seo`, `google-search-console`

## Gitty Server

Gitty server is a lightweight Git server written in Java. It is fast and
reliable: it can be started in less than 1 second and can host 1000+ Git
repositories without problem.
It contains two components: Git and RESTful API.
The Git component is implemented using [JGit HTTP Server](https://github.com/eclipse/jgit/tree/master/org.eclipse.jgit.http.server).
The API component is implemented by Jersey 1.0 (JAX-RS 1.0). Both components are
hosted inside a Jetty container. As a Git server, Gitty supports all Git
operations. It also contains customized data detection logic.

&#35;  | Description
:----- | :----------
Date   | March 2018 - June 2018
Effort | M
Type   | Company Project
Tags   | `git`, `java`, `jgit`, `jax-rs`, `jersey`
