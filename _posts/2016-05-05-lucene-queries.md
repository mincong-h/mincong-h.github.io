---
layout: post
title:  "Lucene queries in Hibernate Search"
date:   2016-05-05 23:00:00 +0100
categories: hibernate-search
redirect_from:
  - /hibernate-search/2016/05/05/lucene-queries/
---

Today, I want to share something about the search feature in Hiberante Search.
As mentionned in the official guide 
[Getting started with Hibernate Search][hsearch-1] :

>Now we’ll finally execute a first search. The general approach is to create a 
Lucene query, ..., and then wrap this query into a `org.hibernate.Query` in 
order to get all the functionality one is used to from the Hibernate API. 

In this article, I will focus on the Apache Lucene queries and find out what 
features can we use on it.

<!--more-->

The first step it to obtain a `org.hibernate.search.query.dsl.QueryBuilder`
object, configured for seraching on a given entity:

{% highlight java %}
// construct a DSL query builder                                                
QueryBuilder queryBuilder = fullTextEntityManager                               
    .getSearchFactory()                                                         
    .buildQueryBuilder()                                                        
    .forEntity(Address.class)                                                   
    .get();
{% endhighlight %}

Once done, we can go on to study different kinds of queries.


## Keyword query

The most basic form of search. As the name suggests, this query type searches
for one or more particular words.

{% highlight java %}
Query luceneQuery = queryBuilder
    .keyword()
    .onFields("name", "type")
    .matching(searchString)
    .createQuery();
{% endhighlight %}


### Example usage

I have built a webapp example based on US addresses. If I set `searchString` to
`san francisco rd`, then here are the top 10 results returned :

id | name | type | Left zip | Right zip
:--- | :--- | --- | --- | ---
6002503 | San Francisco | Rd | 62901 | 62901
6002504 | San Francisco | Rd | 62901 | 62901
6002505 | San Francisco | Rd | 62901 | 62901
6002506 | San Francisco | Rd | 62901 | 62901
6002507 | San Francisco | Rd | 62901 | 62901
6002508 | San Francisco | Rd | 62901 | 62901
6002509 | San Francisco | Rd | 62901 | 62901
6002510 | San Francisco | Rd | 62901 | 62901
8210917 | Francisco | Rd | 49089 | 49089
8210919	| Francisco | Rd | 49089 | 49089

We can see that the records 6002503, 6002504, 6002505, 6002506, 6002507, 
6002508, 6002509, 6002510 match all the 3 keywords `san`, `francisco` and `rd`.
By the way, in default configuration of Apache Lucene query, keywords are not
case sensitive. That is why they have been returned first. Then the record
8210917 and 8210919 come, with 2 words matched: `francisco` and `rd`. 


## Fuzzy query

With a fuzzy search, keywords match against fields even when they are off by 
one or more characters. Check [wikipedia][wiki-ed] to know more about the 
_Edit Distance_.

{% highlight java %}
Query luceneQuery = queryBuilder
    .keyword()
    .fuzzy()
    .withEditDistanceUpTo(2)   // default 2 (can be 0, 1, 2)
    .onFields("name", "type")
    .matching(searchString)
    .createQuery();
{% endhighlight %}


### Example usage

With `searchString = "san francsco"`, we can still find a similar result thanks
to fuzzy query :

id | name | type | Left zip | Right zip
:--- | :--- | --- | --- | ---
6002503 | San Francisco | Rd | 62901 | 62901
6002504 | San Francisco | Rd | 62901 | 62901
6002505 | San Francisco | Rd | 62901 | 62901
6002506 | San Francisco | Rd | 62901 | 62901
6002507 | San Francisco | Rd | 62901 | 62901
6002508 | San Francisco | Rd | 62901 | 62901
6002509 | San Francisco | Rd | 62901 | 62901
6002510 | San Francisco | Rd | 62901 | 62901
8210917 | Francisco | Rd | 49089 | 49089
8210919 | Francisco | Rd | 49089 | 49089 

Even if the character `i` is missing in the word `francsco`, the word is
reachable because its edit distance is 1. That means we only need to do 1
edition to transform `francsco` to `francisco`.

> Can we set up an edit distance greater than 2 ?

No, we can't. According to the [Hibernate search javadoc][hsearch-2], this is 
not allowed. Maximum value of the edit distance. Roughly speaking, the number 
of changes between two terms to be considered close enough. Can be either 1 or 
2 (0 would mean no fuzziness). Defaults to 2.


## Wildcard Search

Lucene supports single and multiple character wildcard searches within single 
terms (not within phrase queries), 

* To perform a single character wildcard search, use the `?` symbol
* To perform a multiple character wildcard search, use the `*` symbol

{% highlight java %}
Query luceneQuery = queryBuilder
    .keyword()
    .wildcard()
    .onFields("name", "type")
    .matching(searchString)
    .createQuery();
{% endhighlight %}


### Example usage

Set `searchString = "franci?co"` and search with wildcard option:

id | name | type | Left zip | Right zip
:--- | :--- | --- | --- | ---
3758060	| Francisco | Cir | 6706 | 6706
6002503	| San Francisco | Rd | 62901 | 62901
6002504	| San Francisco	| Rd | 62901 | 62901
6002505	| San Francisco | Rd | 62901 | 62901
6002506	| San Francisco | Rd | 62901 | 62901
6002507	| San Francisco | Rd | 62901 | 62901
6002508	| San Francisco | Rd | 62901 | 62901
6002509	| San Francisco | Rd | 62901 | 62901
6002510	| San Francisco | Rd | 62901 | 62901
15410367 | Francisco | St | 46360 | 46360


[wiki-ed]: https://en.wikipedia.org/wiki/Edit_distance
[hsearch-1]: http://hibernate.org/search/documentation/getting-started
[hsearch-2]: https://docs.jboss.org/hibernate/search/5.0/api/org/hibernate/search/query/dsl/FuzzyContext.html#withEditDistanceUpTo(int)
