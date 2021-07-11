---
layout:            post
title:             "Elasticsearch: Scroll API in Java"
lang:                en
date:              2020-01-19 13:32:29 +0100
categories:        [elasticsearch]
tags:              [java, elasticsearch]
permalink:         /2020/01/19/elasticsearch-scroll-api/
comments:          true
excerpt:           >
    Elasticsearch Scroll API sample written in Java, useful for retrieving
    large numbers of results (or even all results) from a single search
    request.
image:             /assets/bg-dylan-nolte-wYEj-xonKcg-unsplash.jpg
cover:             /assets/bg-dylan-nolte-wYEj-xonKcg-unsplash.jpg
ads:               Ads idea
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Today I would like to share with you how to use [Scroll
API](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-body.html#request-body-search-scroll)
in Java to retrieve large numbers of results (or even all results) from a single
search request from Elasticsearch. After reading this article, you will
understand how to scroll search results in two steps: sending an initial search
request and sending more scroll requests until no more results.
This post is tested under Elasticsearch 7.5 and Java 11.

## Send the First Request

To use scrolling, you need to send an initial search request with the
`scroll` parameter, which tells Elasticsearch how long it should keep the
"search context" alive, for example, 1 minute. You can set the size --- the
number of search hits returned, the default value is 10.

```java
var results = new ArrayList<String>();
var searchResponse =
    client
        .prepareSearch()
        .setIndices("my_index")
        .setSize(100)
        .setScroll(TimeValue.timeValueMinutes(1))
        .execute()
        .actionGet();
for (var hit : searchResponse.getHits()) {
  results.add(hit.getId()); // 1
}
```

The result from the above request holds a scroll ID. This ID should also be
included in the following requests to retrieve the next batch of
results. In my sample, document ids are collected as results as you can see in
(1), but you can modify it to adapt your needs.

## Send More Requests

Now, you need to send more requests until all results are returned (no more new results).
Index name(s) is not needed for these requests because this had
been specified in the original search request. The timeout value tells
Elasticsearch to keep the search context open for another 1 minute.

```java
var scrollId = searchResponse.getScrollId();
var hasNext = true;
while (hasNext) {
  var resp =
      client
          .prepareSearchScroll(scrollId)
          .setScroll(TimeValue.timeValueMinutes(1))
          .execute()
          .actionGet();
  var newResults = new ArrayList<String>();
  for (var hit : resp.getHits()) {
    newResults.add(hit.getId()); // 1
  }
  results.addAll(newResults);

  hasNext = !newResults.isEmpty();
  scrollId = resp.getScrollId();
}
```

You need to keep sending scroll requests until no more results left. It is also
important to use the more recent scroll ID in the next request because the
scroll ID may change over time. Search context is automatically removed when
the scroll timeout exceeds. You can also clear it manually via Clear Scroll API.
In my sample, document ids are collected as results in (1), but you can modify
it to adapt your needs.

## Full Version

Here is the full version of my sample ([source code in
GitHub](https://github.com/mincong-h/learning-elasticsearch/blob/blog-scroll/test-framework/src/test/java/io/mincongh/elasticsearch/SearchScrollTest.java)):

```java
var results = new ArrayList<String>();

// first request
var searchResponse =
    client
        .prepareSearch()
        .setIndices("my_index")
        .setSize(100)
        .setScroll(TimeValue.timeValueMinutes(1))
        .execute()
        .actionGet();
for (var hit : searchResponse.getHits()) {
  results.add(hit.getId());
}
logger.info("results={} ({} new), scrollId={}",
      results.size(),
      results.size(),
      searchResponse.getScrollId());

// more requests
var scrollId = searchResponse.getScrollId();
var hasNext = !results.isEmpty();
while (hasNext) {
  var resp =
      client
          .prepareSearchScroll(scrollId)
          .setScroll(TimeValue.timeValueMinutes(1))
          .execute()
          .actionGet();
  var newResults = new ArrayList<String>();
  for (var hit : resp.getHits()) {
    newResults.add(hit.getId());
  }
  results.addAll(newResults);
  logger.info("results={} ({} new), scrollId={}",
      results.size(),
      newResults.size(),
      resp.getScrollId());

  hasNext = !newResults.isEmpty();
  scrollId = resp.getScrollId();
}
```

The logs produced by the sample looks like:

```
[INFO] results=100 (100 new), scrollId=DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAEWSllnSERuWjBSOWFzVTk4cnN4RmJaQQ==
[INFO] results=200 (100 new), scrollId=DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAEWSllnSERuWjBSOWFzVTk4cnN4RmJaQQ==
[INFO] results=300 (100 new), scrollId=DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAEWSllnSERuWjBSOWFzVTk4cnN4RmJaQQ==
[INFO] results=300 (0 new), scrollId=DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAEWSllnSERuWjBSOWFzVTk4cnN4RmJaQQ==
```

## Going Further

To go further in this topic, I suggest you to read the official documentation of
Elasticsearch [Search APIs > Request Body Search >
Scroll](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-body.html#request-body-search-scroll)
where you can see the cURL examples and more explanation about the API.

## Conclusion

In this article, we saw how to use Scroll API in java to retrieve large numbers
of results (or even all results) from a single search request from
Elasticsearch by using scroll API.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- hmldd, "Example of Elasticsearch scrolling using Python client", _GitHub_, 2019.
  <https://gist.github.com/hmldd/44d12d3a61a8d8077a3091c4ff7b9307>
- Elastic, "Scroll - Request Body Search", _Elastic_, 2019.
  <https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-body.html#request-body-search-scroll>
