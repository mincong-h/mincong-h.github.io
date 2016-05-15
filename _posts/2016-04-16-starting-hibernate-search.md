---
layout: post
title:  "Starting Hibernate Search"
date:   2016-04-16 23:00:00 +0100
categories: hibernate-search
---


This week I've started learning the Hibernate Search. Actually, this is my
very first experience in open source project, so I'm really excited about it.
At the first step, I started by Apache Lucene about the index and search.
Then I learnt the Lucene query syntax, such as wildcard search, fuzzy search,
proximatity search. Then I read a book about Hibernate Search, called 
_Hibernate Search by Example_. The book is quite good for beginers despite
some methods are deprecated now. The essential of book reading, is to 
understand the mechanism about how hibernate search works, with hibernate ORM, 
JPA and Apache Lucene.

<!--more-->

Sanne has assgined me to the issue [HSEARCH-2207 Treat BooleanQuery as an 
immutable Query][HS2207] at the beginning of this week. Now, there're some
advances: some modifications were made to these classes :

* `engine/src/main/java/org/hibernate/search/query/dsl/impl/ConnectedAllContext.java`
* `orm/src/test/java/org/hibernate/search/test/bridge/BridgeTest.java`

<img src="{{ site.url }}/assets/20160417-hsearch-2207-code-changes.png" alt="HSEARCH-2207 - code changes">

Tests have been validated as following

<img src="{{ site.url }}/assets/20140417-hsearch-2207-maven-result.png" alt="HSEARCH-2207 - Maven clean install">

These modifications will be doned tommorrow or Monday. 
I feel tired now ... So good night everybody

(∪｡∪)｡｡｡zzz

[HS2207]: https://hibernate.atlassian.net/browse/HSEARCH-2207
