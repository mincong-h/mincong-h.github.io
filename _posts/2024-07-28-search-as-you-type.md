---
article_num:         213
layout:              post
type:                classic
title:               Implementing Search-as-you-type with Elasticsearch
subtitle:            >
    Using Chrome extension "ChatGPT QuickSearch" as an example

lang:                en
date:                2024-07-28 09:11:34 +0200
categories:          [elasticsearch, java]
tags:                [elasticsearch, java]
comments:            true
excerpt:             >
    The mechanism of the search-as-you-type feature for the Chrome extension "ChatGPT QuickSearch".

image:               /assets/patterns/pawel-czerwinski-dQuNjCvy9uc-unsplash.jpg
cover:               /assets/patterns/pawel-czerwinski-dQuNjCvy9uc-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

The [`search_as_you_type`](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-as-you-type.html) field type is a text-like field that is optimized to provide out-of-the-box support for queries that serve an as-you-type completion use case. This article shares the experience of implementing this feature for the Chrome extension [ChatGPT QuickSearch](https://chromewebstore.google.com/detail/chatgpt-quicksearch/jclniokkhcjpgfijopjahldoepdikcko), a Chrome extension that allows you to quickly search the conversation history directly in ChatGPT by providing a search bar. This article talks about the choice of field data types for the mappings, the choice of queries, highlighting, frontend and observability related to this feature. Now, let's get started!

## Mappings

Configuring the mappings of the index correctly is important because they can only be done before the insertion of the data. These types cannot be changed once the field is created for an index. For the search-as-you-type feature, choosing the field type `search_as_you_type` is a natural choice. It creates a series of subfields that are analyzed to index terms that can be efficiently matched by a query that partially matches the entire indexed text value. The search-as-you-type field creates 3 sub-fields: `${my_field}._2gram`, `${my_field}._3gram`, and `${my_field}._index_prefix` for the top-level field.

Those shingles subfields are used to create multi-token sequences from text input, which can help improve the accuracy and relevance of search results. Shingles help in matching phrases or multi-word expressions accurately. For instance, the phrase "New York City" can be tokenized as "New York" and "York City", allowing the search engine to better understand and match the phrase. "New York" and "York City" are shingles of size 2 while "New York City" is a shingle of size 3.

We also use an edge ngram field to split a word into N grams starting from the edge — the left side of the word. This is another way to improve the accuracy and relevance of search results when a user types part of the word. Using an edge ngram is also useful for highlighting since users probably want to highlight the part of the word matching their queries.

## Query

When building the search query, we use a multi-match query targeting multiple fields: the top-level text field and its subfields (shingle 2-grams, shingle 3-grams, and edge N-grams). Doing this enhances the scoring of the results because the matching bi-grams or tri-grams carry more weight than matching individual words. The presence of a specific phrase often indicates a closer match to the user's intent. It also makes the results more precise. The query would only match documents containing the exact phrase or similar combinations, reducing false positives where the words appear separately.

Search-as-you-type is great. However, it only focuses on matching phrases or the prefix of a word, it does not fix the problem where a user mistypes some characters. To allow users to make a few typos, we chose the fuzzy query. A fuzzy query returns documents that contain terms similar to the search term, as measured by a Levenshtein edit distance. The fuzziness is configured to generate an edit distance based on the length of the term. When the term is short (less than 2 characters), it must match exactly; when the term is longer (3 to 5 characters), one edit is allowed; when the term is very long (more than 5), two edits are allowed.

Apart from queries related to the user's input, we also need to ensure that the scope of the search results is bound to the user itself. Documents of other users or organizations shouldn't be returned. This is done using a term query, where the documents must match the given value for a specific term.

Therefore, we provide a complex query: a boolean query combined with multiple conditions: a multi-match query, a fuzziness query, and some term queries. The boolean query must match all the term queries, and it should match at least one query between the multi-match query and the fuzziness query. If there are multiple matches, the ones having the highest scores will be returned since they are considered as the most relevant ones.

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
