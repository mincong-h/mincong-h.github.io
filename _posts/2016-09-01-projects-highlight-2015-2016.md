---
layout:         post
title:          Projects Highlight 2015-2016
date:           2016-09-01 07:00:00 +0100
categories:     [tech]
tags:           [project]
comments:       true
excerpt:        >
  Today, I want to share with you all the projects that I've done during the last
  365 days. They’ve special meaning for me because it’s the first time that I kept
  a very active status in programming during a whole year. There're many projects
  that have been done in various contexts, including IoT, Mobile, Web, blog,
  Business Intelligence and open-source framework.
redirect_from:
  - /project/2016/09/01/projects-highlight-2015-2016/
---

Today, I want to share with you all the projects that I’ve done during the last
365 days. They’ve special meaning for me because it’s the first time that I kept
a very active status in programming during a whole year. There’re many projects
that have been done in various contexts, including IoT, Mobile, Web, blog,
Business Intelligence and open-source framework. Now, let’s take a look into
them.

<p align="center"><img src="{{ site.url }}/assets/20160901-github-contribution.png" width="600" alt="Github Contributions 2015 - 2016"></p>

## Smart P3

<p align="center"><img src="{{ site.url }}/assets/20160901-ping-poster.jpg" width="400" alt="Smart P3 - Poster"></p>

**Smart P3** is a scholar-level engineering project which aims to provide a
complete IoT (Internet of Things) solution for fire diagnostic: from sensor
data collection to real-time fire data diagnostic and monitoring. Thanks to our
system, fire fighters and fire system administrators are able to monitoring the
situation through responsive Web UI or Android applications on real-time. This
project is part of the R&D program [FireDiag (ANR-14-CE28-0011)][firediag],
sponsored by the National Research Agency of France (ANR), in collaboration
with 4 Normandy laboratories and the Fire Department of Normandy (SDIS 76). This
project was started at February 2015 and ended at February 2016. It was
composite by 6 students of ESIGELEC and contains 4 major parts:

- Building IoT system with [Libelium][libelium] ZigBee solution
- Time series analysis using Python 2.7
- Web development in Java EE
- Android development

As the team lead of this project, my missions were:

- Define roles and distribute tasks among team members according their abilities
- Documentation (Scope statement / Functional requirement / ...)
- Build Java EE solution with Struts + Spring + Hibernate
- Time series analysis in Python ([statsmodel][py-sm] package)
- MySQL database design and administration

<img src="{{ site.url }}/assets/20160901-ping-arma-20151112-sensor19.png" alt="Smart P3 - Modeling / ARMA models">

In module **PING32M**, I compare different models for data modeling, applied to
real-time prediction. This part is implemented in Python. Actually, **PING32M**
runs as a daemon in the server, so it can reveive permenantly sensor data sent
from IoT using M2M protocol MQTT. Once data are treated, the results will be
sent to module **PING32J**.

<img src="{{ site.url }}/assets/20160901-ping-node.png" alt="Smart P3 - Web UI / node">

Through the page _node_, we can monitor the number of nodes and their status.
This information comes from module **PING32M** using HTTP.

<img src="{{ site.url }}/assets/20160901-ping-sensor.png" alt="Smart P3 - Web UI / sensor">

Through the page _sensor_, we can see the temperature evolutions of different
sensors, which are associated to one node. Actually, our system is not only able
to see the temperature graph, but also able to predict the temperature evalution
for the future. The prediction is done in module **PING32M** using Python - 
statsmodel, then the result is send to Java EE using HTTP. 

## E-Rally

<p align="center"><img src="{{ site.url }}/assets/20160901-eb-elles-bougent.jpg" width="500" alt="Elles bougent - Ingénieure ... un métier pour moi!"/></p>

**E-Rally** is a rally event organized by French association _Elles bougent_ on
7th April 2016 at Paris, which provides an opportunity for female teenagers to
discover several industrial & internet companies. We hope this program can help
them to understand power of engineering and choose this domain as their career
in the future.

<img src="{{ site.url }}/assets/20160901-eb-android-ui.png" alt="Elles bougent - Android UI" />

Our solution **E-Rally** is an Android application which provides an interaction
platform for the participants of this event “E-Rally”. It provides the
possibility to define groups among users, find the game objectives from GPS,
reply questions, share users’ etc. Each user has a group and each group has its
own score. Answering questions correctly or post more photos can gain more
points. At the end of the rally, the team having the highest points will be
rewarded.

In term of technologies, we have 2 major parts: a web server written in Java and
an Anroid application. For the server side, we use Tomcat server. This solution
contains also Spring and Hibernate ORM. Angular JS is used for web pages
development.

## Google Summer of Code

[Google Summer of Code][gsoc] is a global program focused on bringing more
student developers into open source software development. Students work with an
open source organization on a 3 month programming project during their break
from school. My GSoC project provides an alternative to the current mass indexer
implementation of Hibernate Search, using the Java Batch architecture (JSR 352).
I’ve been working on this project for 4 months.

<p align="center">
  <img style="display:inline-block" src="{{ site.url }}/assets/20160901-gsoc-logo-gsoc.png" width="100" alt="Logo - Google Summer of Code">
  <img style="display:inline-block" src="{{ site.url }}/assets/20160901-gsoc-logo-redhat.jpg" width="100" alt="Logo - Red Hat">
  <img style="display:inline-block" src="{{ site.url }}/assets/20160901-gsoc-logo-hibernate.svg" width="100" alt="Logo - Hibernate">
</p>

> What is it about?

[Hibernate Search][hsearch] brings full-text search capabilities to your
Hibernate/JPA applications by synchronizing the state of your entities with a
search index maintained by Lucene (or Elasticsearch as of Hibernate Search
5.6!). Index synchronization usually happens on the fly as entities are
modified, but there may be cases where an entire index needs to be re-built,
e.g. when enabling indexing for an existing entity type or after changes have
been applied directly to the database, bypassing Hibernate (Search).

Hibernate Search provides the mass indexer for this purpose. **It was the goal
of my GSoC project to develop an alternative using the API for Java batch
applications standardized by JSR 352.**

> What do we gain from JSR 352?

Implementing the mass indexing functionality using the standardized batching API
allows you to use the existing tools of your runtime environment for
starting/stopping and monitoring the status of the indexing process. E.g. in
WildFly you can use the CLI to do so.

Also JSR 352 provides a way to restart specific job runs. This is very useful
if re-indexing of an entity type failed mid-way, for instance due to
connectivity issues with the database. Once the problem is solved, the batch job
will continue where it left off, not processing again those items already
processed successfully.

As JSR 352 defines common concepts of batch-oriented applications such as item
readers, processors and writers, the job architecture and workflow is very easy
to follow. In JSR 352, the workflow is written in an XML file (the "job XML"),
which is used to specify a job, its steps and directs their execution. So you
can understand the process without jumping into the code. Check the complete
blog post in hibernate team blog [in.relation.to][gsoc-blogpost] or visit this
project on [GitHub][gsoc-github].

## BI DVI

<img src="{{ site.url }}/assets/20160901-orange-sqlserver2012.png" alt="Orange - Microsoft BI soltuion based on SQL Server">

**BI DVI** is a Microsoft BI solution for Orange DVI, which provides a unique
platform for data integration (ETL), data storage, data analysis and data
reporting for this sales department. This prototype was started at the early
2013 using SQL Server 2012 and now migrated to SQL Server 2016. I’m the only
developer since October 2013. As you can see, there’re 5 layers in this complex
solution:

* SQL Server Integration Services (SSIS) for data integration (ETL)
* SQL Server Database Engine (SSDE) for data storage
* SQL Server Analysis Services (SSAS) for data analysis
* SQL Server Reporting Services (SSRS) for data reporting development
* Microsoft SharePoint and Microsoft Excel for data reporting

Our system is not a huge system, there’re about 20 different data sources coming
from 4 systems. Data entries are varied, e.g. flat files, Microsoft Access
Database and SQL Server. The major pain is the ETL part, because the data
integration is not a simple CTRL + C and CTRL + V but rather a complex
transformation. The entry sources need to be transformed from tabular into a
multiple dimensional storage model, which means that the dimensions and facts
are stored separately. Then, the associated data among dimensions and facts are
referenced by primary keys and foreign keys. Also, this system treats rejected
data, so for those rows failed for integration, they are still stored in
rejection tables. All these ETL processes are written in SQL Server Integration
Services (SSIS). My mission of this year is to:

* Data qualification
* Evaluate some table structures
* Skill transfer
* Solution migration from SQL Server 2012 to SQL Server 2016
* Documentation for the functional architecture and the technical architecture
* DB maintenance plan, security, encryption, planning
* Issue tracking
* Development in VBA for dashboard and tooling

[firediag]: http://www.agence-nationale-recherche.fr/?Project=ANR-14-CE28-0011
[gsoc]: https://summerofcode.withgoogle.com
[gsoc-blogpost]: http://in.relation.to/2016/08/22/new-implementation-of-mass-indexer-using-jsr-352/
[gsoc-github]: https://github.com/mincong-h/gsoc-hsearch
[hsearch]: http://hibernate.org/search
[libelium]: http://www.libelium.com
[py-sm]: http://statsmodels.sourceforge.net
