---
layout:            post
title:             8 Lessons Learned From Data Deletion
date:              2020-11-28 18:59:29 +0100
categories:        [tech]
tags:              [data]
comments:          true
excerpt:           >
    8 lessons learned from data deletion: data organization, naming convention,
    deletion checks, multi-step deleiton, dangling resources, observability,
    tecnical constraints and verification.
image:             /assets/bg-gary-chan-YzSZN3qvHeo-unsplash.jpg
cover:             /assets/bg-gary-chan-YzSZN3qvHeo-unsplash.jpg
ads:               none
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

In any SaaS application, storing customer's data is a critical mission. We have
to ensure the correctness, availability, safety, retention, cost efficiency, and
much more. I am lucky to be part of the Event Storage Team of Datadog as a
software engineer. Today, I would like to share my experience with data
management, focusing on the deletion part: 8 lessons I learned from data
deletion.

But... why should we care about data deletion? We want to
care about it because deleting data is an important part of the lifecycle. By
doing it well, we can improve the cost efficiency and make our business more
profitable by cleaning the expired data on time; we can reduce the risk of
sensitive data exposure by deleting the right data; etc. Also, thinking about
the potential risk of we're doing it wrong: we may lose customer data; it may
lead to service interruption; in case of mistake, it can be difficult or
impossible to recover if something goes wrong.

After reading this article, you will understand some thoughts before, during,
and after the deletion process:

* Data organization
* Naming convention
* Deletion checks
* Multi-step deletion
* Dangling resources
* Observability
* Technical constraints
* Verification

Now, let's get started!

## Data Organization

The way we store the data impacts dramatically the efficiency of data lookup and
deletion. Here are some data organization that I saw in the past and I recommend
for you.

**Grouping data per customer.** Storing data per customer means that all data of
a customer will be located in the same place. It provides a physical or virtual
separation across customers, which makes a clear boundary for each of them.
Some concrete examples of physical separation are: Amazon S3 buckets, Docker
volumes, Elasticsearch clusters, etc. Some concrete examples of virtual
separation are: different prefixes in the same Amazon S3 bucket, different
directories in the same Docker volume, different repositories of the same
Elasticsearch cluster, etc. When visiting data inside one location, you know
that you are accessing data of which customer. A pseudo-code to represent such
an organization is:

    /{customerId}/{data}

Therefore, when deleting data, you have to specify the location by including the
customer ID, which makes the deletion request explicit and without ambiguity.

**Grouping data per type.** You may need to store different types of data for
each customer. Grouping data per type is also a good choice. It makes it easy to
understand which type of data you are visiting. The type can be functional or
technical. A concrete example of a functional type is products: each product may
have their specific type of storage, different retention, different
administrators, etc. Therefore, it makes sense to separate the storage in this
case. When deleting data, you have to specify the type of data in your
request, which clarifies the target type of data. A pseudo-code to represent
such an organization is:

     /{customerId}/{type}/{data}

**Grouping data per date.** You may want to group the data per date or time as
well. When a new date is started, the system creates a new location to store the
new data. This is useful when your system continuously receives data from most of
the customers every day and your deletion request is often related to a time
range. When implementing this solution, I suggest using [ISO
8601](https://en.wikipedia.org/wiki/ISO_8601) to format the date-time objects. A
pseudo-code to represent such an organization is:

     /{customerId}/{datetime}/{data}

There must be other ways to organize your storage. The key points of data
organization are to make the important parameters visible, to avoid mistakesi, and
facilitate the operations.

## Naming Convention

Having a naming convention for the data makes your life easier. Instead of
having a random string for each resource as an identifier, you may consider using
something meaningful and human-readable. For example, include the customer ID,
the creation time of the resource, the type of the product, the version, etc.
Thanks to the naming convention, you can retrieve the key info without performing
any additional requests to the database or other places.

My favorite way to do this is by using label trees. It consists of a sequence of
multiple labels separated by dots, such as `L1.L2.L3`, representing a path from
the root of a hierarchical tree to a particular node. Each label is a sequence
of alphanumeric characters and underscores (`A-Za-z0-9_`). In PostgreSQL, this
data structure is called `ltree`. Let's see one concrete example of a label
tree, where a resource is named using the customer ID, the type of product, and
the creation time of the resource in epoch second:

    {customer}.{type}.{creationTime}

Besides dot (`.`), other commonly used separators are dash (`-`), underscore
(`_`). Some other characters are less used, such as slash `/` (used for
path), dollar `$` (used for variables). Another thing I like is to add a
one-letter prefix for each label section so that it's easier for humans to
understand the type of information. For example, use "2020-w49" to represent
the 49th week of the year 2020 rather than using "2020-49".

In my opinion, the key points of having a good naming convention are:

* Provide a unique ID for each resource (data)
* Provide key information for humans to make decisions face to different
  operations, such as deletion, without the need for additional queries.
* Have a common rule for all the resources.

## Deletion Checks

Before deleting any data, it's important to check that we can delete it. The
first reason is that deletion is an irreversible action: we cannot go back if we
choose to do it. The second reason is that there is usually a dependency between
some resources, in which case we must delete them in a specific order. Doing it in
the wrong order may result in unexpected errors and even service interruption.

_But what should we check before deletion?_

I would like to split this discussion into two types of deletion: deleting
data vs deleting a data container. For example, deleting
an index inside an Elasticsearch cluster vs deleting an Elasticsearch cluster
itself.

There are several dimensions to think about when deleting data:

- **Retention.** Ensure that the data is expired before any deletion.
- **Authorization.** Ensure that the actor has sufficient permission to perform
  this action.
- **Dependency**. Ensure that there is no dependent referencing this resource to
  avoid cascading errors.

There are several dimensions to think about when deleting a "data container":

- **Storage.** Ensure that the container is empty: it does not store any data.
  Or the existing data are expired thus it is safe to delete.
- **Upstream/downstream.** Ensure that no services in the upstream or downstream
  are referencing this container. For example, before deleting an Elasticsearch
  cluster, ensure that none of the Elasticsearch clients will insert new
  documents to this cluster by changing the routing; ensure that none of the
  Elasticsearch clients will read from the cluster.
- **Routing.** Ensure that nothing will be routed to this container in the
  future because it won't exist as a destination.
- **Scheduling.** Ensure that nothing will be scheduled for this
  container in the future because it won't exist as a destination. The
  difference between this one and the previous one is that in this case, we are
  using the current routing but the event is scheduled to be executed in the
  future, such as some events being backed off.
- **Authorization.** Ensure that the actor has sufficient permission to perform
  this action.

There may be more checks that are not covered in this section. Also,
not all the checks are necessary for you. It's up to you to decide which checks
are the most relevant for you. My suggestion is to write a simple framework to
support deletion checks, then add more checks when the business grows, when
the deletion happens more often, or when regression (incident) is detected.

## Multi-Step Deletion

Sometimes, deleting a resource cannot be done in one step because the resource
is stored in multiple locations. For example, some data in the database and some
files in the filesystem. There are several ways to handle this situation:

- Delete data from the source of truth and consider data from other locations as
  dangling resources.
- Introduce a status for deletion-in-progress, such as "DELETING".

Let's dig deeper into the first approach: deleting data from the source of
truth. Let's say you have a database and you consider that data inside this
database
is the source of truth. In this case, any other locations outside of the
database are
not the source of truth, such as the filesystem, Elasticsearch clusters, Amazon
S3, etc. Therefore, when deleting data, we can do it in multiple steps: the first
step is to delete the data from the source of truth (database), and the
remaining steps are to delete data from other locations. In case of failure in
the
database, you just have to do it again. In case of failure in other locations,
they are considered as unreferenced objects. You can implement a job to clean
them up periodically.

Let's dig deeper into the second approach: introduce a status "DELETING". Let's
say you have a database and you consider that data inside this database is the
source of truth. When deleting a resource, we change its status into DELETING in
the database and perform deletion on other locations first. Also, prevent
access to this resource from the read path just like it's deleted. Once the
resource is deleted in every location, remove the entry from the database, and
consider the deletion process is complete.

Maybe you have other ideas. Please let me know your thoughts
:)

## Dangling Resources

Dangling resources are unreferenced resources. They are incomplete and unusable
from the user's point of view. Therefore, it's important to reduce the lifetime and
the volume of dangling resources.

**Safety.**
Not all the dangling resources are intended to be deleted. Some of them
may be introduced by an undesired operation. For example, we have a file in
the filesystem and a record in the database pointing to this file. If someone
deleted the record from the database mistakenly, the file in the filesystem
becomes dangling. However, we may not want to delete the file in this case to
avoid worsening the situation. In such a situation, we want to recover from this
situation by restoring the record in the database. Therefore, it's important to
design a deletion logic that does not delete dangling resources automatically.
Also, we should design the system so that we have sufficient information about
the file itself when such a situation happens. The way we organize the resource and
naming the resource plays an important role here. For example, having the custom
ID in the resource name will make the recovery easier comparing to having a random
generated ID, because we know immediately which customer is impacted.

**Decision making.**
We should provide enough information about the resource so that an administrator
can understand the situation, estimate the importance, and decide what to do to
this resource. The information can be related to dates (creation, expiry),
customer, size (bytes), quantity, references from other locations, etc.

Other things that are important to be considered such as how to
reduce the dangling resources in the first place and how to automate the
clean-up. But we don't have enough time to dig into these topics.

## Observability

It's important to improve the observability of the system. Let's take
logging and metrics as examples.

For logging, it's important to add a log mentioning which resource had been
deleted for audit purposes. Sometimes it's also worth adding two logs: one when
the deletion is requested and another one when the deletion is complete. This is
because some deletions can fail.

For metrics, here are some examples I have in mind. You can record metrics about
the actions, record metrics about data in different states, and use them to
compute additional metrics

Metric Name | Description
:---------- | :----------
Number of deletion requests | Useful to measure how often the deletion happens.
Number of successful deletions |
Success rate | 
Failure rate |
Number of failed deletions | Useful to detect the anormaly
Number of dangling resources | Useful as volume lag and dangling resource ratio
The age of the oldest dangling resource | Useful as the time lag
Dangling resource ratio | Storage efficiency and trend

## Technical Constraints

There are also some technical constraints to be considered when deleting
resources.

**Concurrent actions.** For example, in the older version of Elasticsearch, you cannot perform
multiple snapshot actions at the same time. You can either create, restore, or
delete a snapshot, but you cannot do multiple actions simultaneously. So
you have to design your workflow to make everything works as expected.

**Rate limit.** When dealing with an Amazon S3 bucket, you cannot send more than
3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per prefix in
an S3 bucket. So it's important to design the storage structure inside the
bucket to avoid hitting the rate-limit problem.
See [How can I increase Amazon S3 request limits to avoid throttling on my Amazon S3 bucket?](https://aws.amazon.com/premiumsupport/knowledge-center/s3-request-limit-avoid-throttling/?nc1=h_ls)

## Verification

_How to verify the data are deleted?_

There are multiple ways to verify that the data are deleted.

**Testing.** You can write unit tests or integration tests to ensure the deletion
logic is working as expected.

**Verify storage.** If your data well organized, you can just visit
the storage location and verify that the data for the target customer or target
dates don't exist anymore. This can be true for filesystem, databases, cloud
storage, and much more.

**End to end verification.** You can verify the deletion by asking the customer to check
this manually or if possible, to substitute the customer to check the deletion by
launching a query or visiting the target location. This
is important, especially for sensitive data deletion.

## Conclusion

In this article, I shared some lessons I learned about data deletion (before,
during, and after the deletion process): data organization, naming convention,
deletion checks, multi-step deletion, dangling resources, observability,
technical constraints, and verification.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!
