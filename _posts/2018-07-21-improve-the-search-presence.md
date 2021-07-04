---
layout:            post
title:             "SEO: Improve Blog Ranking in Google Search"
lang:                en
date:              2018-07-21 06:37:11 +0200
date_modified:     2018-07-22 18:00:40 +0200
categories:        [tech]
tags:              [search, seo, google-search-console, google-analytics]
comments:          true
excerpt:           >
    This post explains how to improve your blog ranking in Google Search when
    you know nothing about SEO. I'm using my Jekyll blog as an example, to
    implement everything step-by-step: add robots.txt, sitemap, structured data;
    improve title tags, meta description; use Google Search Console...
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today I want to talk about how to do SEO (Search Engine Optimization) for your
website. Note that I didn't finish everything. This is an ongoing post.
It covers:

- [Add robots.txt for web robots](#add-robotstxt)
- [Submit a sitemap file](#submit-a-sitemap-file)
- [Use structured data (schema markup)](#use-structured-data-schema-markup)
- [Optimize title tags](#optimize-title-tags)
- [Fix URL errors](#fix-url-errors)
- [Understand what keywords users are searching](#understand-user-queries)
- [Use SEO analyzer](#use-seo-analyzer)

## Add robots.txt

Web site owners use the `/robots.txt` file to give instructions about their
site to web robots; this is called _The Robots Exclusion Protocol_. A sample
file looks like:

    User-agent: *
    Disallow: /secret.html

which means allow all robots complete access, except the `secret.html` file.
Notice that robots can ignore your `/robots.txt`. Especially malware robots
that scan the web for security vulnerabilities, and email address harvesters
used by spammers will pay no attention. For more information, visit
<http://www.robotstxt.org> or [Google Search: Robots.txt Specifications][5].

## Submit a Sitemap File

**This helps Google better understand how to crawl your site.**
Google introduced the Sitemaps protocol so web developers can publish lists of
links from across their sites. The basic premise is that some sites have a
large number of dynamic pages that are only available through the use of forms
and user entries. The Sitemap files contains URLs to these pages so that web
crawlers can find them. Bing, Google, Yahoo and Ask now jointly support [the
Sitemaps protocol][3].

I'm using Jekyll Plugin [jekyll-sitemap][2] to generate the sitemap. The
generated result looks like:

{% highlight xml %}
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://mincong-h.github.io/2018/05/04/git-and-http/</loc>
    <lastmod>2018-05-04T15:31:59+00:00</lastmod>
  </url>
</urlset>
{% endhighlight %}

Once generated, the result is available at
<https://mincong-h.github.io/sitemap.xml>.
Test and submit this result to Google Search Console.

<p align="center">
  <img src="/assets/20180721-sitemap.png"
       alt="Sitemap">
</p>

You can also provide the sitemap information in `robots.txt` file, so that the
sitemap can be found by all the web crawlers (Google, Bing, Yahoo!, Baidu...):

    sitemap: https://mincong-h.github.io/sitemap.xml

Fore more advanced configuration about Sitemaps, visit [Sitemaps -
Wikipedia][3].

## Use Structured Data (Schema Markup)

**Structured data** helps Google understand the content on your site, which can
be used to display rich snippets in search results. Structured data is a
standardized format for providing information about a page and classifying the
page content.

You can use Google [Structured Data Testing Tool][sd-testing] to test an
existing page by giving their URLs, fix the errors and warnings based on
Google's feedback:

<p align="center">
  <img src="/assets/20180721-schema-BlogPosting-before.png"
       alt="Google Structured Data Testing Tool: errors and warnings">
</p>

You can use [Google Data Highlighter][6] to highlight the data. Or you can add
schema programmatically in your source code. I think the most interesting way is
to start by using Google Data Highlighter. Once you understand the essentials,
switch to DIY schema filling. And then continuously improve each field and stay
tight with <https://schema.org>.

1. Use Google Highlighter to understand the basics
2. Embed structured data in your website pages
3. Continuously improve your structured data using <https://schema.org>

## Optimize Title Tags

**Use descriptive, unique keywords.**
Title tags have withstood the test of time. They’re still a big part of how your
site will perform. Make sure that every one of your title tags is descriptive,
unique, and catered to your targeted keywords. Avoid using the same keywords and
title tags over and over. This way, you’ll diversify your opportunities while
avoiding cannibalizing your own efforts.

6 tips from [Neil Patel's blog][10] for title tag optimization:

- Use pipes ( `|` ) and dashes ( `–` ) between terms to maximize your real
  estate.
- Avoid ALL CAPS titles. They’re just obnoxious.
- Never keep default title tags like "Product Page" or "Home." They trigger
  Google into thinking you have duplicate content, and they’re also not very
  convincing to users who are looking for specific information.
- Put the most important and unique keywords first.
- Don't overstuff your keywords. Google increasingly values relevant,
  contextual, and natural strings over mechanical or forced keyword phrases.
- Put your potential visitors before Google – title tags can make-or-break
  traffic and conversions.

## Fix URL Errors

Web crawlers can show you which URLs are broken:

<p align="center">
  <img src="/assets/20180721-url-errors.png"
       alt="Fix URL errors">
</p>

## Understand User Queries

Once you've configured the sitemap and structured data, you can see the Search
Analytics on Google Search Console - [Search Analytics][sa]. For example, the
summary of your website:

- **Total clicks.** How many times a user clicked through to your site. How
  this is counted can depend on the type of search result type.
- **Total impressions.** How many times a user saw a link to your site in search
  results. This is calculated differently for images and other search result
  types.
- **Average CTR.** It is the percentage of impressions that resulted in a click.
- **Average position.** It is the average position in search results for you
  site.

You can also see the search queries used:

<p align="center">
  <img src="/assets/20180722-search-analytics.png"
       alt="Understand User Queries">
</p>

Once you've understood the user queries, you can improve the post title and post
description accordingly.

## Use SEO Analyzer

Use online SEO Analyzers to analyze and get suggestions for your website. I used
<https://neilpatel.com>, but you can use others as you wish. An SEO
analyzer helps you to know:

- Website level SEO analysis (errors, warnings, and advices)
- Page level SEO analysis (errors, warnings, and advices)

## References

- [GitHub: jekyll-sitemap][2]
- [Google: Build and submit a sitemap][1]
- [Google: Introduction to Structured Data][6]
- [Google Search: Robots.txt Specifications][5]
- [Google Search: Introduction][7]
- [Moz: Using Google Tag Manager to Dynamically Generate Schema/JSON-LD Tags][9]
- [Webmasters: Blog and BlogPosting for Google][8]
- [Wikipedia: Sitemaps][3]
- [The Web Robots Pages][4]
- [Schema.org: Full Hierarchy](https://schema.org/docs/full.html)
- [Neil Patel: The Step-by-Step Guide to Improving Your Google Rankings Without
  Getting Penalized][10]

[1]: https://support.google.com/webmasters/answer/183668?hl=en
[2]: https://github.com/jekyll/jekyll-sitemap
[3]: https://en.wikipedia.org/wiki/Sitemaps
[4]: http://www.robotstxt.org/
[5]: https://developers.google.com/search/reference/robots_txt
[6]: https://www.google.com/webmasters/tools/data-highlighter
[7]: https://developers.google.com/search/docs/guides/
[8]: https://webmasters.stackexchange.com/questions/106351/blog-and-blogposting-for-google
[9]: https://moz.com/blog/using-google-tag-manager-to-dynamically-generate-schema-org-json-ld-tags
[10]: https://neilpatel.com/blog/improve-google-rankings-without-getting-penalized/
[BlogPosting]: https://schema.org/BlogPosting
[sd-testing]: https://search.google.com/structured-data/testing-tool/
[gs]: https://schema.org/docs/gs.html
[sa]: https://www.google.com/webmasters/tools/search-analytics
