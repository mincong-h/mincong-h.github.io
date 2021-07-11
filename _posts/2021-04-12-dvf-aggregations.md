---
layout:              post
title:               "DVF: Aggregations"
subtitle:            >
    Metric aggregations, bucket aggregations, scripted aggregation, and
    sub-aggregations in Elasticsearch.

lang:                en
date:                2021-04-12 07:34:30 +0800
categories:          [elasticsearch]
tags:                [elasticsearch, java]
series:              [dvf]
permalink:           /2021/04/12/dvf-aggregations/
comments:            true
excerpt:             >
    How to write and execute metric and bucket aggregations in Elasticsearch for
    dataset: Demandes de valeurs foncières (DVF) for data analytics. Also, how
    to execute aggregations that contain sub-aggregations.

image:               /assets/bg-henrique-ferreira-ZyYsY0ez2D4-unsplash.jpg
cover:               /assets/bg-henrique-ferreira-ZyYsY0ez2D4-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
ads:                 none
---

## Introduction

Open data "Demande de valeurs foncières (DVF)" is an open dataset provided by
the French government which collects all the real-estate transactions since
January 2014, in mainland France and the overseas departments and territories.
In the previous DVF articles, we talked about the write path: how to index new
documents, how to optimize storage, and how to perform snapshots and restores.
Starting from this article, we are going to focus on the read path: how to
perform different search actions on this dataset.

This article will focus on aggregations. Aggregations are important for your
application because it provides an overview to your users without showing any
documents in detail. It also provides information about the selection range, such
as the min/max value of a given field. This topic is also part of the [Elastic
Certified Engineer
Exam](https://www.elastic.co/training/elastic-certified-engineer-exam). After
reading this article, you will understand:

* How to write and execute metric aggregation?
* How to write and execute bucket aggregation?
* How to write and execute aggregations that contain sub-aggregations?

To better demonstrate the importance of aggregations in real-world scenarios, I am going to use
different examples from the DVF dataset.
This article is written in Elasticsearch 7.12 and Java 11, but most of the
concepts should be appliable to any Elasticsearch 7.x cluster. Most of the
examples are written in two formats: HTTP requests with JSON content and Java. The goal is
to let you better understand how it works even if you are not familiar with
Java.

## Prerequisite

Before writing any aggregation, we need to index the dataset into Elasticsearch.
This has been done in the previous articles so I am not going to go into detail
about it in this article. If you were interested in how to do it, you can
find the previous articles under the category "Elasticsearch" of my blog, they
are prefixed by "DVF". Once the index is ready, you can find it in the
Elasticsearch cluster via the `_cat` indices API as "transactions":

```
$ curl localhost:9200/_cat/indices
yellow open transactions xMLeTfvwTYW1mdz5P85JsA 1 1 827105 0 207.3mb 207.3mb
```

## Metric Aggregation

According to Elasticsearch documentation [Metrics Aggregation
(7.x)](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-aggregations-metrics.html),
the aggregations in this family compute metrics based on values extracted in one
way or another from the documents that are being aggregated. The values are
typically extracted from the fields of the document (using the field data), but
can also be generated using scripts.

Here I am going to take a simple one: the metric [value
count](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-aggregations-metrics-valuecount-aggregation.html). As the name indicated,
metric `value_count` shows how many documents are extracted from the aggregated
documents. To do that via REST API, we can use the `_search` endpoint as
follows:

```
GET /transactions/_search
```

```js
{
  "query": {
    "match_all": {}  // 1
  },
  "size": 0,  // 2
  "aggs": {
    "mutation_id/value_count": {  // 3
      "value_count": {  // 4
        "field": "mutation_id"  // 5
      }
    }
  }
}
```

If we take a quick look into the HTTP request, you will see that:

1. We use a `match_all` query, which matches all the documents of the index
   "transactions" without filtering.
2. The number of search hits to return is set to 0. The default value is 10.
   Since we don't care about those documents, setting it to 0 simplifies the
   HTTP response.
3. We use one single-value metric aggregation and name it as
   `mutation_id/value_count`. I name it using the naming convention:

   ```
   ${field_name}/${metric_type}
   ```

   so that I can understand the target field name to be aggregated and the type
   of metric. But this is just a personal preference. You are free to choose the name you
   want.
4. The type of metric is `value_count`.
5. The metric applies to field `mutation_id`. I use this field because it is the
   key of the mutation (transaction), so it is always non-null.

Sending the request above will return:

```js
{
  "took": 100,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 10000,
      "relation": "gte"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "mutation_id/count": {
      "value": 827105
    }
  }
}
```

It means that there were 827105 transactions in 2020 according to
the dataset. It matches the number of lines in the CSV file.
There is a difference of 1 line because the CSV file includes the header.

```
➜  dvf git:(master u=) wc -l downloads/full.2020.csv
  827106 downloads/full.2020.csv
```

Now, let's see how to do the same thing in Java:

```java
var sourceBuilder =
    new SearchSourceBuilder()
        .size(0)  // 1
        .aggregation(AggregationBuilders.count("mutation_id/value_count").field("mutation_id"))  // 2
        .query(QueryBuilders.matchAllQuery());  // 3

var request = new SearchRequest()  // 4
    .indices("transactions")
    .source(sourceBuilder);

var response = restClient.search(request, RequestOptions.DEFAULT);  // 5
var valueCount = (ValueCount) response.getAggregations().get("mutation_id/value_count");  // 6
...
```

It is almost the same thing as the HTTP request. Here we:

1. Create an HTTP request with a search source. The hit size is set to 0 to avoid
   returning hits.
2. The aggregation used is the value count (`value_count`), named as `mutation_id/value_count`,
   targeting field `mutation_id`.
3. On the query side, it matches all documents without filtering.
4. Combining the index name and the search source, we create a search request.
5. We use the Java REST High Level Client to send the search request and get the
   search response.
6. We can retrieve the aggregation from the response using the name of the
   aggregation, i.e. using "mutation_id/value_count".

In this section, we discussed how metric aggregation works: we need to provide
the index names to be searched, the query to filter the document, and the
metrics aggregations to be performed. Now, let's go to the next part: bucket
aggregations.

## Bucket Aggregation

Bucket aggregations that group documents into buckets, also called bins, based
on field values, ranges, or other criteria. In this section, we are going to use
postal code as an example: let's see which postal code in France contains the
highest number of transactions?

To answer this question, we need to prepare an HTTP request for bucket
aggregation:

```js
{
  "query": {
    "match_all": {}  // 1
  },
  "size": 0,  // 2
  "aggs": {
    "postal_code/terms": {
      "terms": {  // 3
        "field": "postal_code",
        "size": 3  // 4
      }
    }
  }
}
```

If we take a quick look into the HTTP request, you will see the same concept as
above for the metric aggregation. This time, the bucket aggregation `term` does
the following things:

1. It queries all the documents in the target index.
2. It sets the size to 0 to avoid returning documents (hits) because we don't need them.
3. This is the key of the request. It specifies the type of aggregation to
   `terms` on field `postal_code`. Therefore, we can obtain a result grouped by
   postal code.
4. It only takes the top 3 results. More precisely, there are two notions: size
   and order. Here we specified the size, which means the aggregation will return 3
   results. As for the order, terms aggregation returns results in descending
   order by default. So the terms having the most occurrences will be returned (defaults to 10).
   Therefore, combined together (size and order), this setting returns the top 3 results.

Sending the request above will return:

```js
{
  "took": 97,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 10000,
      "relation": "gte"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "postal_code/terms": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 812333,
      "buckets": [
        {
          "key": "",
          "doc_count": 9392
        },
        {
          "key": "51100",
          "doc_count": 2859
        },
        {
          "key": "75016",
          "doc_count": 2521
        }
      ]
    }
  }
}
```

So the top 1 result is... missing value. Oh my god 😅 But this is the forever
pain for data scientists or whoever doing data analytics, isn't it? If
we filter out that result, then the top 1 goes to Reims (51100) and the top 2
goes to Paris 16e district (75016).

And here is the implementation in Java. I am not going to explain this code
block because it's pretty straightforward:

```java
var sourceBuilder =
    new SearchSourceBuilder()
        .size(0)
        .aggregation(AggregationBuilders.terms("postal_code/terms").field("postal_code").size(3))
        .query(QueryBuilders.matchAllQuery());

var request = new SearchRequest().indices("transactions").source(sourceBuilder);

var response = restClient.search(request, RequestOptions.DEFAULT);
var terms = (ParsedStringTerms) response.getAggregations().get("postal_code/terms");
var countPerPostalCode = terms.getBuckets().stream()
    .map(b -> (ParsedBucket) b)
    .collect(
        Collectors.toMap(
            ParsedBucket::getKeyAsString,
            ParsedBucket::getDocCount));
```

In this section, we saw how to create a bucket aggregation using terms
aggregations and field `postal_code`. But all we saw are very primitive examples and they
didn't provide much added value for data analytics. In the following sections, I
want to share something more interesting with you, such as: <mark>what is the average
price of a second-hand apartment in Paris?</mark> Before answering this question, we will
need to compute the price per square meter (€/m2). I will show you how to do
that in the next section. And then, we will do the analysis for Paris.

## Scripted Metric Aggregation

_How to compute the price per square meter (€/m2)?_

Our current goal is to compute the price per square meter for each apartment sold.
We can do that by doing simple math:

```
price_m2 = total_price / built-up area
```

There are mainly 3 choices to compute this field:

1. Do it at index-time: when we create the new document in Elasticsearch, we can
   compute a field in our value class in Java. This is useful when we know
   exactly what we need in advance.
2. Do it at runtime: update the index mapping to include a new scripted field.
   This will apply to all the documents. This is useful when we don't know what
   additional fields we need when indexing documents. It provides flexibility to modify documents
   at runtime. Especially useful for end-users.
3. Do it at query-time: create the field when running the query. This is probably
   the most expensive one but it fits the on-demand requirement. Sometimes we
   don't want to keep one additional field forever because it's only useful for
   some queries.

For now, I am going to use choice 3 because it fits the current article
which is about search. To prepare the scripted metric aggregation, we need to
provide a runtime mapping `price_m2`, which is computed by two existing fields:
`property_value` and the `real_built_un_area`. It looks like this:

```
GET /transactions/_search
```

```js
{
  "runtime_mappings": {
    "price_m2": {
      "type": "double",
      "script": "emit(doc['property_value'].value / doc['real_built_up_area'].value)"
    }
  },
  ...
}
```

The script is written in "Painless Script". Be careful about the logic that you
are going to add to this script because it is easy to change from painless to
painful 🙂. If you want to know more about Painless, visit Elasticsearch
documentation: [Painless Language
Specification](https://www.elastic.co/guide/en/elasticsearch/painless/master/painless-lang-spec.html).

Now, going back to our scripted metric, we will need to handle some corner cases
because the property value or real built-up area may be missing or equal to 0. I
filtered them out in the "query" section of the aggregation. Also, we need to
filter the nature of the transaction (mutation) to select only the sales. Other
types like expropriation, exchange, judgement are not what we want. To simplify a
bit, I also excluded the category "sales under construction". The final HTTP
request looks like this:

```js
{
  "query": {  // 1
    "bool": {
      "filter": [
        { "match": { "mutation_nature": { "query": "Vente" } } },
        { "match": { "local_type": { "query": "Appartement" } } },
        { "range": { "property_value": { "gt": 0 } } },
        { "range": { "real_built_up_area": { "gt": 0 } } }
      ]
    }
  },
  "runtime_mappings": {  // 2
    "price_m2": {
      "type": "double",
      "script": "emit(doc['property_value'].value / doc['real_built_up_area'].value)"
    }
  },
  "size": 0,  // 3
  "aggs": {   // 4
    "price_m2/stats": {
      "stats": {
        "field": "price_m2"
      }
    }
  }
}
```

If we take a quick look into the HTTP request, you will see the same concept
again, as above for the metric aggregation and bucket aggregation. This time,
the metric aggregation term does the following things:

1. It does not query all the documents anymore. It contains multiple filters,
   encapsulated in a boolean query.
2. It defines a runtime mapping for field `price_m2`, computed from property
   value and real built-up area.
3. It sets the size to 0 to avoid returning documents (hits) because we don’t need them.
4. This is the key of the request. It specifies the type of aggregation. We use
   multi-valued metric aggregation `stats`, which returns the min, max, average,
   sum, and count of the field `price_m2` in the selected documents.

Sending the request above will return:

```js
{
  "took": 14,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 10000,
      "relation": "gte"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "price_m2/stats": {
      "count": 147763,
      "min": 0.003750000149011612,
      "max": 8166666.666666667,
      "avg": 26941.800127837614,
      "sum": 3981001212.2896695
    }
  }
}
```

## Transactions In Paris

Now we have all the elements that we need, it's time to do something fun! We
know how to execute a multi-valued metric aggregation, e.g. stats. We know how
to execute a bucket aggregation, e.g. per postal code. We know how to compute a
scripted metric for the price per meter square (m2). Now, let's
use them to do a quick case study for Paris. This section aims to answer two questions:

1. What is the price for second-hand apartments in Paris per district
   (arrondissement)?
2. What is the price for second-hand apartments in Paris per type of apartment (T1,
   T2, T3, ...)?

To answer the first question, we need to use sub-aggregations with 2 levels. The first
level is a terms aggregation per postal code and the second level is a list of
multi-valued metric aggregations: `percentiles` and `stats`. `percentiles` for
price per square meter and
`stats` for the total property value.

```js
{
  "query": {
    "bool": {
      "must": [
        { "wildcard": { "postal_code": { "value": "75*" } } }
      ],
      "filter": [
        { "match": { "mutation_nature": { "query": "Vente" } } },
        { "match": { "local_type": { "query": "Appartement" } } },
        { "range": { "property_value": { "gt": 0 } } },
        { "range": { "real_built_up_area": { "gt": 0 } } }
      ]
    }
  },
  "runtime_mappings": {
    "price_m2": {
      "type": "double",
      "script": "emit(doc['property_value'].value / doc['real_built_up_area'].value)"
    }
  },
  "size": 0,
  "aggs": {
    "postal-code-aggregation": {
      "terms": {
        "field": "postal_code",
        "size": 20
      },
      "aggs": {
        "price_m2/percentiles": {
          "percentiles": {
            "field": "price_m2"
          }
        },
        "property_value/percentiles": {
          "stats": {
            "field": "property_value"
          }
        }
      }
    }
  }
}
```

Sending the request above will return:

```js
{
  ...
  "aggregations": {
    "postal-code-aggregation": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "75018",
          "doc_count": 1740,
          "property_value/stats": {
            "count": 1740,
            "min": 0.15000000596046448,
            "max": 9278000,
            "avg": 685657.4655678796,
            "sum": 1193043990.0881104
          },
          "price_m2/percentiles": {
            "values": {
              "1.0": 38.31908831908832,
              "5.0": 4263.305322128852,
              "25.0": 8581.576948155804,
              "50.0": 10221.628370766353,
              "75.0": 12191.63493555511,
              "95.0": 62619.36339522546,
              "99.0": 205629.62962962964
            }
          }
        },
        {
          "key": "75017",
          "doc_count": 1411,
          "property_value/stats": { ... },
          "price_m2/percentiles": { ... }
        },
        ...
      ]
    }
  }
}
```

If we transform the response a bit, we can obtain the following tables.

### Total Price Per District

Here is the total price per district in Paris in percentiles: p5, p25, p50, p75,
p95. You can see that the 8th district (<mark>75008</mark>) is the most
expensive for most of the percentiles. 50% of the apartments are more expensive
than 1.3M€ 🤯.

Postal Code | p5 (€) | p25 (€) | p50 (€) | p75 (€) | p95 (€)
:---: | ---: | ---: | ---: | ---: | ---: |
75001 | 41,000 | 404,794 | 691,666 | 1,740,000 | 7,005,000
75002 | 45,000 | 278,350 | 496,075 | 970,392 | 18,500,000
75003 | 610 | 319,583 | 541,163 | 1,095,193 | 12,550,000
75004 | 16,100 | 350,000 | 595,000 | 1,030,000 | 2,171,100
75005 | 86,722 | 303,805 | 500,000 | 852,500 | 1,746,600
75006 | 103,500 | 389,867 | 729,260 | 1,504,999 | 3,408,400
75007 | 146,600 | 452,985 | 845,000 | 1,854,400 | 6,000,000
<mark>75008</mark> | 19,310 | 433,250 | <mark>1,299,950</mark> | 3,323,542 | 33,100,000
75009 | 80,000 | 301,325 | 551,894 | 1,148,000 | 6,300,000
75010 | 106,499 | 295,000 | 486,668 | 837,383 | 3,716,667
75011 | 122,505 | 272,264 | 436,082 | 719,349 | 9,320,000
75012 | 124,172 | 290,000 | 432,585 | 680,481 | 3,150,000
75013 | 148,800 | 280,867 | 424,521 | 609,400 | 1,378,005
75014 | 149,250 | 310,500 | 494,981 | 770,160 | 12,104,743
75015 | 154,400 | 316,764 | 471,024 | 699,333 | 1,280,571
75016 | 118,915 | 395,990 | 781,012 | 1,400,268 | 3,500,000
75017 | 97,013 | 312,448 | 562,425 | 1,199,034 | 13,230,000
75018 | 87,000 | 237,636 | 371,317 | 586,359 | 2,800,000
75019 | 117,750 | 262,500 | 353,613 | 540,250 | 1,018,594
75020 | 134,060 | 248,990 | 407,585 | 636,100 | 8,500,000

### Price Per M2 Per District

But using the total price of the apartment is not objective for judging whether
the appartment is expensive because they don't have the same real built-in area
(m2). So we should normalize it. We can normalize it by calculating the price per meter square (€/m2). It
gives another table:

Postal Code | p5 (€/m2) | p25 (€/m2) | p50 (€/m2) | p75 (€/m2) | p95 (€/m2)
:---: | ---: | ---: | ---: | ---: | ---: |
75001 | 729 | 11,591 | 14,208 | 26,602 | 231,818
75002 | 3,492 | 10,853 | 12,505 | 15,586 | 391,045
75003 | 14 | 11,144 | 13,308 | 17,131 | 167,899
75004 | 343 | 11,405 | 13,077 | 15,448 | 32,767
75005 | 2,616 | 11,004 | 12,679 | 15,000 | 30,905
<mark>75006</mark> | 3,348 | 12,679 | <mark>15,492</mark> | 19,666 | 49,035
<mark>75007</mark> | 7,114 | 12,857 | <mark>15,236</mark> | 20,179 | 130,105
75008 | 260 | 10,715 | 13,301 | 39,951 | 919,444
75009 | 2,925 | 10,208 | 12,207 | 14,734 | 342,463
75010 | 5,331 | 9,570 | 11,174 | 13,747 | 128,161
75011 | 6,140 | 9,787 | 11,167 | 13,078 | 198,674
75012 | 5,222 | 9,015 | 10,264 | 11,669 | 84,290
75013 | 5,010 | 8,345 | 9,769 | 11,386 | 56,522
75014 | 6,389 | 9,378 | 10,805 | 12,948 | 318,546
75015 | 6,994 | 9,546 | 10,762 | 12,066 | 17,901
75016 | 4,000 | 9,910 | 11,504 | 13,810 | 28,489
75017 | 4,152 | 9,967 | 11,700 | 14,165 | 181,150
75018 | 4,263 | 8,582 | 10,222 | 12,192 | 62,619
75019 | 5,204 | 7,294 | 9,060 | 10,579 | 30,095
75020 | 5,390 | 8,347 | 9,664 | 11,538 | 234,160

You can see that not only the 8th district (75008), but all the districts from
1th to 8th are very expensive. In particular, the median (percentile 50) of 6th
district (<mark>75006</mark>) and 7th district (<mark>75007</mark>) are higher
than 15k€/m2.

### Prices Per Lot Type

In the previous tables, we use bucket aggregation on postal code. But we can
also analyze from another angle: the lot type (T1, T2, T3, T4, ...). T1 means
there is only 1 piece in the apartment, T2 means there are 2 pieces, etc.
This type of analysis is useful because different people have different needs in
their lives. Young people probably want
to save some money and buy a small apartment, but a family probably wants a better
one (T3+) because they need more room for the babies, etc. Using the runtime
mappings (painless script) we saw before, we can compute the lot type as part
of the search aggregation request
and obtain the following tables.

```js
{
  "runtime_mappings": {
    "price_m2": {
      "type": "double",
      "script": "emit(doc['property_value'].value / doc['real_built_up_area'].value)"
    },
    "lot_type": {
      "type": "keyword",
      "script": "if (0 < doc['lots_count'].value && doc['lots_count'].value < 6) { emit('T' + doc['lots_count'].value) } else { emit('Others') }"
    }
  },
  ...
}
```

The prices per lot type in Paris in percentiles:

Lot Type | p5 (€) | p25 (€) | p50 (€) | p75 (€) | p95 (€)
:---: | ---: | ---: | ---: | ---: | ---: |
T1 | 31,264 | 210,041 | 358,500 | 600,600 | 1,565,087
T2 | 179,993 | 338,870 | <mark>517,788</mark> | 792,894 | 1,702,597
T3 | 162,000 | 372,188 | 618,806 | 1,232,125 | 2,740,950
T4 | 147,470 | <mark>414,250</mark> | 699,413 | 1,222,750 | 3,173,845
T5 | 331,108 | 530,791 | 809,000 | 1,275,048 | 3,220,000
Others | 262,500 | 2,880,000 | 5,712,857 | 12,572,222 | 33,100,000

From the table above, we can see that it will be very hard to find an apartment if
your budget is below <mark>400,000€</mark>. It means that either you have a wonderful job or
you will have to the house with your partner. Or maybe with some luck you won the
loto 😉. Anyway it's very expensive.

We can also normalize the price as we did before. Here is the price per meter square (€/m2) in Paris per lot type in percentiles:

Lot Type | p5 (€/m2) | p25 (€/m2) | p50 (€/m2) | p75 (€/m2) | p95 (€/m2)
:---: | ---: | ---: | ---: | ---: | ---: |
T1 | 840 | 8,936 | 10,857 | 13,118 | 31,321
T2 | 6,235 | 9,246 | 10,742 | 12,545 | 19,277
T3 | 5,763 | 9,679 | 11,488 | 13,572 | 23,407
T4 | 3,047 | 9,251 | 11,021 | 13,586 | 22,644
T5 | 8,169 | 10,498 | 12,649 | 15,878 | 37,168
Others | 6,250 | 63,372 | 147,957 | 300,013 | 916,866

From this table, we can see that regardless the number of pieces you want (the
lot type), the price per meter square (m2) does not change much. The lot type is
not an important factor for the price. The district is probably more important
as we saw in the previous sections.

Alright, we go far enough into the Paris real-estate market. It's
crazy and it's not for us right now. Let's come back to the aggregations
of Elasticsearch and we are reaching the end of this article.

## Recapitulation

We saw several metric and bucket aggregations in this article, but we didn't
see all of them. There are so many metrics in Elasticsearch that we cannot
remember everything. For me, the takeover is the syntax of the aggregation API.
Once you remember this, it's easy to search on the internet and complete the rest:

```
GET /{index_name_expression}/_search
```

```js
{
  "query": {
    "{query_type}": { ... }
  },
  "size": 0,
  "runtime_mappings": {
    "{mapping_name}": { ... }
  },
  "aggs": {
    "{aggregation_name}": {
      "{aggregation_type}": {
        "field": "{field_name}"
        ...
      }
    }
  }
}
```

The API path contains the name of the index to be searched. It can also be multiple
indices separated by comma (`,`) or `_all` indices. As for the API request body,
it consists of multiple parts: the query part where you can specify the criteria
of the selection; the size part where you can specify the number of search hits
returned (actual documents found in Elasticsearch); the runtime mappings part
to define one or multiple computed fields at query time; and finally the
aggregations part where you can define your metric or bucket aggregation. You
can also provide sub-aggregations under a given aggregation.

As for the response:

```js
{
  "took": 14,
  "timed_out": false,
  "_shards": { ... },
  "hits": { ... },
  "aggregations": {
    "price_m2/stats": {
      "count": 147763,
      "min": 0.003750000149011612,
      "max": 8166666.666666667,
      "avg": 26941.800127837614,
      "sum": 3981001212.2896695
    }
  }
}
```

It contains some metadata about the search settings and performance, such as the
execution time, the timeout, the number of shards reached. Then, it contains the
number of hits and the actual documents. And finally the aggregations, each
aggregation is a key-value pair in the JSON response, where the key is the name
of the aggregation we specified and the value is the actual result of the
aggregation. As for the structure of the aggregation result:

* For metric aggregation, the actual result is the metric. There is one metric
  if this is a single-valued metric; there are multiple metrics if this is a
  multi-valued metric.
* For bucket aggregation, the actual results are shown under entry `buckets`.
  Each bucket contains the key, the number of documents found, and the actual
  metric(s) requested.

We can also see it from another angle by comparing the syntax of Elasticsearch
Aggregations API to SQL. They are
not exactly equivalent, but I believe this comparison is helpful for
understanding:

Item | SQL | Elasticsearch | Comment
:--- | :--- | :--- | :---
Source | `FROM {source_table}` | Index name | You can select multiple indices in Elasticsearch but you cannot do that in SQL without JOIN.
Metric | `SELECT my_func(my_field)` | Name of the aggregation |
Aggregation | `GROUP BY my_field` | `"field": {my_field}` |
Query | `WHERE {clause}` | `"query": {clause}` |
Size | - | `"size": {size}` | There are no equivalent. In SQL, you cannot GROUP BY and select all the fields of some documents at the same time.

## Going Further

How to go further from here?

- To learn more about aggregations for Elasticsearch 7, visit official
  documentation ["Aggregations
  (7.x)"](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-aggregations.html)
- To learn more about boolean query for Elasticsearch 7, visit official
  documentation ["Boolean query (7.x)"](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/query-dsl-bool-query.html)
- To learn more about dataset "Demandes de valeurs foncières géolocalisées",
  visit the website of the French government
  [etalab](https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/).
- To learn how to earn 1M€ and buy an apartment in Paris? Well, I want to know
  as well. Please let me know if you have an answer by leaving a comment below. 😬

If you are interested to see the source code, you can also find it on my GitHub
under project
[mincong-h/learning-elasticsearch](https://github.com/mincong-h/learning-elasticsearch/tree/blog-dvf-aggregations/demo-dvf).

## Conclusion

In this article, we saw how to use metric aggregation using an example of
value-count aggregation, how to use bucket aggregation for postal code via
terms aggregation, and how to use
scripted aggregation by computing the metric of price per square meter (m2). We
also saw how to perform an aggregation that contains sub-aggregations (stats and
percentiles) using Paris real-estate market as a demo. Finally, we saw how to
remember the syntax efficiently and how to go further from here.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Elasticsearch, "Value count aggregation", _elastic.co_, 2021.
  <https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-aggregations-metrics-valuecount-aggregation.html>
- Elasticsearch, "Elastic Certified Engineer Exam", _elastic.co_, 2021.
  <https://www.elastic.co/training/elastic-certified-engineer-exam>
- Jingwen Zheng, "Second-hand apartments transactions in Paris (01/2014 -
  06/2020)", _jingwen.github.io_, 2021. <https://jingwen-z.github.io/second-hand-apartments-transactions-in-paris-1420/>
