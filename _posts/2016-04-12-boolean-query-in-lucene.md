---
layout: post
title:  "Boolean query in Apache Lucene"
date:   2016-04-12 21:34:00 +0100
categories: [apache-lucene]
tags:       [apache-lucene]
redirect_from:
  - /apache-lucene/2016/04/12/boolean-query-in-lucene/
---


Today, I created an example to demonstrate how `BooleanQuery` works and its
two difference ways to construct a boolean query, using default constructor and 
using query builder. The construction using default constructor has been 
deprecated after _Apache Lucene 5.3.0_ and deleted in _Apache Lucene 6.0.0_. So 
we should use `BooleanQuery.Builder` to build queries.

<img src="{{ site.url }}/assets/logo-lucene.png" width="200" alt="Logo of Apache Lucene">

<!--more-->

This change has been annonced at the Apache Lucene's news at 24 August 2015,
the release of [Apache Lucene 5.3.0][2] :

> Lucene 5.3.0 Release Highlights:
>
> API Changes
>
> * PhraseQuery and BooleanQuery are now immutable
> * ...

Here’s an example showing the difference between them :

{% highlight java %}
Query query = queryParser.parse("keyword");
BooleanQuery booleanQuery;
switch (mode) {
    
    // deprecated since 5.3.0
    // because PhraseQuery and BooleanQuery are immutable now
    case USE_CONSTRUCTOR:
        booleanQuery = new BooleanQuery();
        booleanQuery.add(query, Occur.MUST);

    // now, builder should be used instead
    case USE_BUILDER:
    default:
        booleanQuery = new BooleanQuery.Builder()
                .add(query, Occur.MUST)
                .build();
}
{% endhighlight %}

You can download my example code on github [gsoc-lucene][1]. Import the projet 
called `boolean-query` in Eclipse. Once finished, run the main method of
class `io.github.mincongh.App` (Run As > Java Application).

The result will be printed in console :

```
Indexing /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/apache-lucene-about.txt
Indexing /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/apache-lucene-news.txt
Indexing /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/gsoc.txt
3 File indexed, time taken: 135 ms

Using default constructor in boolean query (up to 5.2.x) ...
2 documents found. Time :24
File: /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/apache-lucene-about.txt
File: /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/apache-lucene-news.txt

Using query builder in boolean query (since 5.3.0) ...
2 documents found. Time :0
File: /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/apache-lucene-about.txt
File: /Users/mincong/Documents/GitHub/gsoc-lucene/boolean-query/src/main/resources/docs/apache-lucene-news.txt
```

[1]: https://github.com/mincong-h/gsoc-lucene
[2]: https://lucene.apache.org/core/corenews.html#24-august-2015-apache-lucenetm-530-available
