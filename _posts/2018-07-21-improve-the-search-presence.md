---
layout:      post
title:       "Improve the Search Presence"
date:        "2018-07-21 06:37:11 +0200"
categories:  [tech]
tags:        [search, seo, google-search-console, google-analytics]
comments:    true
---

Today I want to talk about how to do SEO (Search Engine Optimazation) for your
website. Note that I didn't finish everything. This is an ongoing post.

<!--more-->

## Select Target Country

**Target your audience based on location and language settings.** It's very
useful when your website support multiple locales. However, in my case, my
website does not have such support and needs, so I simply skipped the this part.

## robots.txt

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

## Fix URL Errors

Web crawlers can show you which URLs are broken:

<p align="center">
  <img src="/assets/20180721-url-errors.png"
       alt="Fix URL errors">
</p>

## References

- [GitHub: jekyll-sitemap][2]
- [Google: Build and submit a sitemap][1]
- [Wikipedia: Sitemaps][3]
- [The Web Robots Pages][4]

[1]: https://support.google.com/webmasters/answer/183668?hl=en
[2]: https://github.com/jekyll/jekyll-sitemap
[3]: https://en.wikipedia.org/wiki/Sitemaps
[4]: http://www.robotstxt.org/
[5]: https://developers.google.com/search/reference/robots_txt
