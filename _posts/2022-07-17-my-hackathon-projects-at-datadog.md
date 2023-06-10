---
article_num: 202
layout:              post
type:                classic
title:               My Hackathon Projects At Datadog
subtitle:            >
    The only limit is your imagination.

lang:                en
date:                2022-07-17 14:31:57 +0200
date_modified:       2022-12-13 17:37:58 +0100
categories:          [review]
tags:                [java, python, javascript, go]
comments:            true
excerpt:             >
    This article shared the 5 projects that I did over the last hackathons in
    Datadog and the lessons learned from those experiences.

image:               /assets/bg-karsten-winegeart-ewfHXBcuFA0-unsplash.jpg
cover:               /assets/bg-karsten-winegeart-ewfHXBcuFA0-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

It's been 3 years since I joined Datadog and I had the chance to
participate in 5 hackathon projects. They were a great experience and  I learned a
lot from them! That's why I want to share my experience with you, to give you an
idea of what can an engineer build in a short period. And perhaps give you
some inspiration to do the same.

_What does a hackathon look like at Datadog?_

A hackathon at Datadog lasts for 2 days. It happens once or twice per year.
You can use this time to implement
something that you want, either individually or collectively. There are many
kinds of projects: a new feature in the existing platform, a new tool, a side
project that you want to work on, a new framework that you want to explore, etc.
It's not necessarily related to professional projects, you can also work on a
personal one. At the end of the hackathon, there is a 2-minute
presentation where you can show the results to other engineers.

Now you have a better understanding of the context, let's continue to see the
projects that I participated in in the past.

## Auto-completion For Python Scripts

The first hackathon project that I did was adding auto-completion for some
internal Python scripts, built for handling operations for the logs team. It
happened in February 2020.
At that time, I was in the logs storage team, where we had a lot of operations
to do every day. Those operations were related to multiple domains: Elasticsearch,
Kafka, MongoDB, etc. Therefore, it involved many scripts and each of those has
multiple options and values. It's hard to remember what are the right options or
values. To make things easier, I wanted to add an auto-completion feature so
that we can use a `tab` to let the system show the options or the list of values
that are related to the current option. This was built on top of
[argparse](https://docs.python.org/3/library/argparse.html).

_Below, you can find a more detailed and technical version._

The scripts are built in Python using the library
[argparse](https://docs.python.org/3/library/argparse.html). When calling the
script, we parse the arguments provided to the script and use them as a
dictionary. There is another library called
[argcomplete](https://pypi.org/project/argcomplete/) which provides easy,
extensible command line tab completion of arguments for your Python script.
Thanks to `argcomplete`, we can find out the list of available options, or the
list of values related to a given option. For example, when creating a new
Elasticsearch cluster, you need to specify the data center, the cloud provider,
the name of the Kubernetes cluster, etc. Also, you may want to let the
data center or Kubernetes cluster be completed automatically.

To achieve auto-completion, we need to:

1. **Install auto-completion.** Register the completion when installing the
   Python scripts. It means creating a Bash script for completion and hooking it
   into the installation file (in our case, it's a
   [Makefile](https://en.wikipedia.org/wiki/Make_(software))). Inside the Bash
   script, we need to iterate each command and call the
   [`register-python-argcomplete`](https://pypi.org/project/argcomplete/) to
   register them; or use the global completion.
2. **Add completer to argument parser.** We need to create a completer and add it
   to the argument parser to provide completions. `argcomplete` contains a list
   of completers, such as `ChoicesCompleter` to complete values as an
   enumeration.
3. **Making the completion meaningful and optional.** We need to ensure that the completion
   is meaningful to the user. For example, giving the right list of data centers, the
   right list of Kubernetes clusters, the right tags, etc. Also, we need to make
   the completion optional so that people enable them if they want to, but we
   don't force anyone.
4. **Add tests.** To set up the tests, we need to add some environment variables and
   simulate user behavior (mainly pressing `tab`) in the tests and ensure that
   the script behaves correctly. The simulation is mainly done by creating a
   parser and running the completer on the user's behavior.
5. **Other tasks.** There are also some minor tasks related to dependencies,
   test setup, and documentation.

In the end, I gave up the project... 😅 I completed items 1, 2, 4,
5 during the Hackathon, but item 3 "Making the completion meaningful and
optional" was hard.
Making the completion meaningful means I need to have the source of truth of the
staging and production environment defined in the source code; or querying
some external services in real-time, which has additional performance concerns
(auto-completion needs to be fast),
or requires additional setup (such as kubectl-port-forward). I didn't have
much time to continue after the hackathon and we had reduced significantly our
manual operations after switching to Kubernetes. So I decided to stop continuing
on it.

## Completable Future And Vavr

For the second Hackathon in July 2022, I didn't find out anything too interesting to work on,
so I picked some refactoring at the last minute. It was about Completable
Future in Java. However, one day later, my
colleague convinced me that I should try something cooler, so I started to work
on Vavr integration, an object-functional library.

### Completable Future

If you are familiar with the [Completable
Future](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/util/concurrent/CompletableFuture.html)
in Java, you probably know that there are two notions: [Completion
Stage](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/util/concurrent/CompletionStage.html)
and [Completable
Future](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/util/concurrent/CompletableFuture.html).
Completion Stage is an interface, which allows you to write code in an asynchronous
way, e.g. `thenApply(...)`, `thenCompose(...)`, to describe the relationship
between multiple stages. On the other hand, Completable Future is the
implementation for interfaces: Completion Stage and Future. On top of the completion
stages, it contains all the APIs to manipulate future, such as `join()`,
`get()`, which makes it more powerful.

My refactoring was to remove all the unnecessary usage of Completable Future and
replace them with Completion Stage. By doing so, it allows us to:

* Make it more explicit that we don't want to complete or fail the future.
* Avoid additional calls of method `toCompletableFuture()`, which enables interoperability
  among different implementations of this interface by providing a common
  conversion type.

Now I re-think this initiative, I won't do this again. Because:

* The impact of the change was low but it requires a lot of work. I needed to
  create 10 PRs (one per group of services) and merge them individually to avoid having too many conflicts
  to handle.
* The regression happens quite soon because people don't know why we should use
  the Completion Stage and we don't have any rule in the CI or IDE to enforce
  this. On the other side, giving the possibility to developers to manipulate futures
  (`join()`, `get()`) is not dangerous, we never had a problem with this as
  everyone uses the APIs carefully.

### Vavr

In the 2nd day of the hackathon, I moved to something else.
I wanted to demonstrate the usage of Java object-functional library
[vavr](https://github.com/vavr-io/vavr), which brings many concepts of Scala
into the Java world. In my hackathon, I tried to integrate Vavr into an existing
service. I demonstrated multiple data types: streams, map, tuple, optional,
either; demonstrated support of JSON serialization; I discussed
interoperability, performance, migration plan, etc. However, the project was
rejected by our director and some other developers because using the library
in the critical path may have a performance impact; also, the Vavr APIs
are pretty invasive due to their names, which makes integration
hard as we cannot distinguish the normal Java API and the vavr API only using
the short name (`List`, `Set`, `Map`, ...).

I tried my best to convince people that it's cool to use Vavr but unfortunately,
it's rejected. That's also why I stopped contributing to Vavr as I don't find
any use-cases in the near future.

## Datadog Instant

In the 3rd hackathon in August 2022, I worked with a colleage on a frontend
project called "Datadog Instant". This is an experimental project
proposed by my colleage, which allows users to have instant
recommendations in the [Log Explorer](https://docs.datadoghq.com/logs/explorer/)
in Datadog, like what Google proposes in their search bar (see screenshot
below). The idea is to provide more relevant results to the user based on the search
history; complete a word instantly without waiting, and bring information to the
user rather than asking them to look into the "saved views" or other locations.
Nobody wants to enter the same query again and again.

![Google instant recommendations](/assets/20220717-google-recommendations.png)

There were several aspects to manage:

* **Data structure.** We need to store users' historical data to provide personalized
  suggestions. This is done using a [trie](https://en.wikipedia.org/wiki/Trie),
  a type of k-wary search tree. It allows us to persist words or sentences as
  characters or keys, the number of occurrences in the history, and finally to
  recompute the words during completion. For the hackathon, we persisted the
  trie in the local storage of the browser.
* **Frontend.** We need to intercept multiple events when the user presses keys on
  their keyword, especially the A-Z keys and the TAB key. When the event
  happened, we need to either read the trie or update the content of the search
  bar. As we were backend developers and we didn't know the frontend very well,
  we use the old-school jQuery to handle the logic.

This was the first time that I worked with someone else on a Hackathon project
and it was cool! Compared to a solo project, we were able to discuss,
validate or reject some ideas, share tasks, and review. Now, this proof of
concept (POC) is picked up by the Events UI team and will probably become the
reality in the future! Thanks to Arnaud, I also learned how to plan and
distribute tasks so that we can work more efficiently as a team.

## Temporal Java Worker

In April 2022, I worked with another colleague on workflows.
At Datadog, we use the workflow engine [Temporal](https://temporal.io/) to
handle internal deployments and running workflows for different usages. All the
existing code is written in Go. It works well for most of the team. However,
some teams use Java. Using Go means having an additional barrier to benefit from
the existing workflow engine, such as learning the language, re-building domain
models and existing features, managing source code in two different
repositories, etc. The goal of the Hackathon is to try building a Temporal Java
worker using the [Temporal Java SDK](https://github.com/temporalio/sdk-java).

During the Hackathon, I worked with my teammate Julien to make this work. More
precisely, we had to:

* **Create a Temporal worker.** This was the most obvious part as we can handle
  can follow the official [Java
  samples](https://github.com/temporalio/samples-java) and the previous PoC done
  by other teams. It also meant creating a Maven module, making configuration
  work, modifying the CI so that we can release the application, etc.
* **Make the authentication work.** The communication to the Temporal Server is
  done in HTTPS and requires authentication using OAuth and JWT, so we needed to
  find a way to do that in Java. It implies fetching the certificate, finding
  the right role, providing the token in the header, etc.

We made the entire logic work at the end (a bit after the Hackathon). Thanks
to this experience, we figured out the solution to many issues and make it
possible to plan the work with much better visibility. Although we didn't have a
chance to move forward right now, there is a good chance that we will do that
again soon.

## Query Troubleshooting Assistant

In November 2022, I made a query troubleshooting assistant (QTA), a small static web page
which allows administrators to troubleshoot query problems. Different services
have different facets and it leads to confusion and slowness in the
troubleshooting process. This tool unifies the user input and provides mappings
between user input and service outputs, which allows users to
troubleshoot more efficiently. For example, it asks you to provide information
related to customer, storage location, sources, request ID or other information,
and then suggests different outputs as URLs for you. The facet mappings between
the input and output is handled by the tool. You can also share the result with
others because all parameters are reflected as query parameters.

## Lessons Learned

_What did I learn across these projects?_

1. **You don't have to know everything to get started.** Do not be afraid of
   starting something you don't know very well. There are chances that you can
   learn that quickly, or get help from your teammates. In my case, it was the
   Datadog Instant project. I didn't know much about jQuery, but I had
   experience with Vue.js, so I learned that during the hackathon.
2. **Write a plan before writing code.** If you write down your plan, there is
   a much better chance that you will succeed in this game. It helps you to
   clarify the needs, your goal, the milestones to achieve that, the known
   constraints, the available resources, etc. It gives better visibility and
   expectation and also helps distribute works across participants.
3. **Work on something impactful.** If your project is really useful for the
   company (for the product, for teammates, ...), there is a much higher chance that
   your work won't be lost after the Hackathon.
4. **An incomplete project is not a failure.** The most important thing is to learn
   and explore, it's ok to fail. Even a failed project can provide much
   information for further discussion and decisions.

## Conclusion

Today I shared the previous Hackathon projects with you in this article. I
showed the 5 projects that I did: auto-completion for Python scripts; the
completable features refactoring and Vavr integration; the Datadog Instant,
providing Google-like instant recommendations in the search bar; the
Temporal Java worker to write workflows in Java; and finally the query
troubleshooting assistant. I also shared some
lessons learned from these projects.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
