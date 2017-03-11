---
layout: post
title:  "Install Apache Lucene"
date:   2016-04-10 22:47:00 +0100
categories: [apache-lucene]
redirect_from:
  - /apache-lucene/2016/04/10/install-lucene/
---


## What is Apache Lucene ?

[Apache Lucene][lucene-home] is a high-performance, full-featured text search 
engine library written entirely in Java. It is a technology suitable for nearly 
any application that requires full-text search, especially cross-platform. It is
an open source project available for free download.

<img src="{{ site.url }}/assets/logo-lucene.png" width="200" alt="Logo of Apache Lucene">

As I was submitted to the Google Summer of Code 2016 (GSoC), I tried to install 
Apache Lucene 6.0.0 for learning basical concept before the final answer at 25th
April.

<!--more-->

## Download Apache Lucene 6.0.0

First, I've downloaded the latest Lucene distribution (6.0.0) and then extract 
it to my GSoC working directory located at `~/Documents/gsoc`


## Include jars for demo

Assume that we're located at the root path of Apache Lucene installation. 
THere're 4 jars that should be included for the demo, they're :

* the Lucene JAR `./core/lucene-core-6.0.0.jar`
* the queryparser JAR `./queryparser/lucene-queryparser-6.0.0.jar`
* the common analysis JAR `./analysis/common/lucene-analyzers-common-6.0.0.jar`
* the Lucene demo JAR `./demo/lucene-demo-6.0.0.jar`

Use the linux commandline `export` to add jars into java classpath :

{% highlight shell %}
$ export PATH=/home/mincong/Documents/gsoc/lucene-6.0.0/core/lucene-core-6.0.0.jar:/home/mincong/Documents/gsoc/lucene-6.0.0/queryparser/lucene-queryparser-6.0.0.jar:/home/mincong/Documents/gsoc/lucene-6.0.0/analysis/common/lucene-analyzers-common-6.0.0.jar:/home/mincong/Documents/gsoc/lucene-6.0.0/demo/lucene-demo-6.0.0.jar:$PATH
{% endhighlight %}

## Indexing Files

Once I've done that, I should now build an index! Assuming I'm currently located
at the home of lucene, then tape the following command the build index for
folder `docs`. Please notice that the official tutorial suggests to use `src`
folder. But this folder is not avaible to _Apache Lucene 6.0.0_ installation 
(I'm using `lucene-6.0.0.tgz`). So use another folder if you're in the same
situation, such as `docs` :

    java org.apache.lucene.demo.IndexFiles -docs docs

This will produce a subdirectory called `index` which will contain an index of 
all of the Lucene source code.

## Search results

We can search index / results using the following commandline :

{% highlight shell %}
java org.apache.lucene.demo.SearchFiles
{% endhighlight %}

Here're the search results for keyword `huangmincong` and keyword `string` :

{% highlight shell %}
mincong@mincong-samsung:~/Documents/gsoc/lucene-6.0.0$ java org.apache.lucene.demo.SearchFiles
Enter query: 
huangmincong
Searching for: huangmincong
0 total matching documents
Enter query: 
string
Searching for: string
1748 total matching documents
1. docs/analyzers-common/org/apache/lucene/analysis/util/AbstractAnalysisFactory.html
2. docs/benchmark/org/apache/lucene/benchmark/byTask/utils/Format.html
3. docs/queryparser/org/apache/lucene/queryparser/classic/class-use/ParseException.html
4. docs/queryparser/org/apache/lucene/queryparser/ext/Extensions.html
5. docs/core/org/apache/lucene/index/IndexFileNames.html
6. docs/queryparser/org/apache/lucene/queryparser/xml/DOMUtils.html
7. docs/highlighter/org/apache/lucene/search/vectorhighlight/BaseFragmentsBuilder.html
8. docs/highlighter/org/apache/lucene/search/postingshighlight/PostingsHighlighter.html
9. docs/analyzers-common/org/apache/lucene/analysis/custom/CustomAnalyzer.Builder.html
10. docs/queryparser/org/apache/lucene/queryparser/flexible/core/messages/QueryParserMessages.html
Press (n)ext page, (q)uit or enter number to jump to a page.
{% endhighlight %}

Tomorrow, I'll learn more about how Lucene works,especially the `IndexFiles`, 
the `Analyzer`, the `Directory` and the `IndexWriter`.

[lucene-home]: https://lucene.apache.org/core/
