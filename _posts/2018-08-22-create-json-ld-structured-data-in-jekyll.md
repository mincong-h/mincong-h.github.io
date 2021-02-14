---
layout:            post
title:             Create JSON-LD Structured Data in Jekyll
date:              2018-08-22 21:57:07 +0200
categories:        [tech]
tags:              [seo, jekyll, google-search-console]
comments:          true
excerpt:           >
    In this post, I will explain how to create JSON-LD structured data for
    Jekyll blog.
image:             /assets/bg-home-office-336373_1280.jpg
cover:             /assets/bg-home-office-336373_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Google uses structured data that it finds on the web to understand the content
of the page, as well as to gather information about the web and the world in
general. In this post, I will explain how I create JSON-LD structured data for
my blog, powered by [Jekyll][2].

## Include JSON-LD in Post Generation

In order to include JSON-LD structured data in the blog post, you need to find
out which HTML template(s) generate such page for you. In my case, the HTML is
handled by:

    /_layouts/post.html

So I need to edit the page `post.html` by adding a new HTML element `<script>`:

{% highlight liquid %}
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---
layout: default
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "url": "{% raw %}{{ site.url }}{{ page.url }}{% endraw %}",
  "name": {% raw %}{{ page.title | jsonify }}{% endraw %},
  "headline": {% raw %}{{ page.title | jsonify }}{% endraw %},
  "keywords": {% raw %}{{ page.tags | join: ',' | jsonify }}{% endraw %},
  "description": {% raw %}{{ page.excerpt | strip_newlines | strip | jsonify }}{% endraw %},
  "articleBody": {% raw %}{{ page.content | strip_html | jsonify }}{% endraw %},
  "datePublished": {% raw %}{{ page.date | jsonify }}{% endraw %},
  "dateModified": {% raw %}{{ page.last_modified_at | default: page.date | jsonify }}{% endraw %},
  "author": {
    "@type": "Person",
    "name": {% raw %}{{ site.author_name | jsonify }}{% endraw %},
    "givenName": {% raw %}{{ site.author_first_name | jsonify }}{% endraw %},
    "familyName": {% raw %}{{ site.author_last_name | jsonify }}{% endraw %},
    "email": {% raw %}{{ site.email | jsonify }}{% endraw %}
  },
  "publisher": {
    "@type": "Organization",
    "name": {% raw %}{{ site.title | jsonify }}{% endraw %},
    "url": "{% raw %}{{ site.url }}{% endraw %}",
    "logo": {
      "@type": "ImageObject",
      "width": 32,
      "height": 32,
      "url": "{% raw %}{{ site.url }}{% endraw %}/icon/favicon.ico"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{% raw %}{{ site.url }}{{ page.url }}{% endraw %}"
  },
  "image": {
    "@type": "ImageObject",
    "width": {% raw %}{{ page.img_width | default: site.img_width }}{% endraw %},
    "height": {% raw %}{{ page.img_height | default: site.img_height }}{% endraw %},
    "url": "{% raw %}{{ site.url }}{{ page.img_url | default: site.img_url }}{% endraw %}"
  }
}
</script>
{% endhighlight %}

Once you've added the code above, the generated [JSON-LD][1] structured data
snippet should be included in your blog post as follows (simplified):

{% highlight html %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "url": "https://mincong-h.github.io/2018/08/21/why-you-should-use-auto-value-in-java/",
  "name": "Why You Should Use Auto Value in Java?",
  "headline": "Why You Should Use Auto Value in Java?",
  "keywords": "java,auto-value",
  "description": "Auto Value generates immutable value classes during Java compilation, including equals(), hashCode(), toString(). It lighten your load from writing these boilerplate source code.",
  "datePublished": "2018-08-21 07:22:49 +0000",
  "dateModified": "2018-08-21 07:22:49 +0000",
  "author": {
    "@type": "Person",
    "name": "Mincong Huang",
    "givenName": "Mincong",
    "familyName": "Huang",
    "email": "mincong.h@gmail.com"
  }
}
</script>
{% endhighlight %}

Quite easy, right? In the following sections, we'll see how to choose the right
schema and test the generated data. If you've questions about [Jekyll
expressions][6] or [Liquid expressions][5], I'll explain them at the end of this
post, at section _"Advanced Configuration"_.

## Which Schema Should I Use?
I use [BlogPosting](https://schema.org/BlogPosting) for my blog posts. Some
websites use [NewsArticle](https://schema.org/NewsArticle), such as
[Medium](https://medium.com). I'm not really sure which is the best choice, but
I believe we should use [Article](https://schema.org/Article), or any schema
derived from it.

<https://schema.org> is a website, useful for choosing the right schema.
Schema.org is a
collaborative, community activity with a mission to create, maintain, and
promote schemas for structured data on the Internet, on web pages, in email
messages, and beyond. A schema can be found in the following URL pattern:

    https://schema.org/${mySchema}

<https://webmasters.stackexchange.com> is another website, useful for choosing
the right schema. There're many questions and answers about schemas, or about 
web-masters in general. Typically, there's a discussion about [Using Schema.org
for blogging: Article VS BlogPosting][4].

## Test Your Structured Data

[Google Structured Data Testing Tool][7] is an easy and useful tool for
validating your structured data, and in some cases, previewing a feature in
Google Search. Try it out:

<img src="/assets/20180822-google-structured-data-testing-tool.png"
     alt="Google Structured Data Testing Tool">

You can either provide an URL or directly the HTML source code. In my opinion,
submitting HTML source code is a good choice, which allows validating the
previewed version (localhost) before pushing the changes into production.

Google Structured Data Testing Tool is also useful for knowing which fields are
required by the target schema. My technique is to submit an empty schema to the
testing tool, where only the schema name is filled, then let Google tell you
which fields is missing.

> Note: image URL will always fail when submitting your blog post generated in
> localhost, because Google does not recognize the image URL. But it does not
> matter, this problem will be fixed once the changes are pushed to your
> production.

## Advanced Configuration

Now, let's talk about the Jekyll and Liquid expressions used in JSON-LD. If the
above code fits your needs, you can skip this section.

**Use "jsonify" to convert data to JSON.** You can apply a `jsonify` filter to a
string or an array to create a valid JSON value. Note that the generated output
_already contains_ the double-quotes (`"`), do not add them again yourself.

{% highlight liquid %}
{% raw %}{{ your.property | jsonify }}{% endraw %}
{% endhighlight %}

For example, the input message:

    Line 1
    Line 2

will be converted as output (with double quotes):

    "Line 1\nLine2"

**Use "default" to provide fall-back value.** Liquid's `default` filter allows
you to provide a default value for your blog post. It's useful for optional
properties like image URL, or modification date. They might not present in your
post: therefore, fall-back to default image URL (image of your blog) or creation
date.

{% highlight liquid %}
{% raw %}"{{ site.url }}{{ page.img_url | default: site.img_url }}"{% endraw %}
{% endhighlight %}

## Limits of JSON-LD

Even though JSON-LD might be the best format for structured data format, not
every actors recognize it. Social networks, like LinkedIn, does not read the
schemas for their metadata creation. So using only JSON-LD snippet is not
enough, you still need to have some HTML meta tags.

## Next Steps

So far, we added the JSON-LD snippet into blog posts generation. Is it good
enough? No, not yet. You still need to:

1. **Test the real blog URL** in Google Structured Data Testing Tool to ensure
   everything works well, including the images.
2. **Follow the structured data discovery** on Google Search Console to ensure
   that Google Search really discovered them. This process might take a few
   days.
3. **Continuously improve your JSON-LD snippet** to ensure they're relevant to
   the content and match user's expectations (their search queries). For
   example, you can edit the content, provide more optional fields, or add new
   schemas.

## Conclusion

In this post, we learnt how to create [JSON-LD][1] (JSON for Linking Data) for
Jekyll, the choice of schemas, testing the result, the limits of JSON-LD and the
remaining tasks to do once JSON-LD is embedded. By doing this, there's chance that
your blog posts will rank better and have more views in the next months. Hope
you enjoy this article, see you next time!

## References

- [JSON-LD: JSON for Linking Data][1]
- [JSON-LD examples](https://jsonld-examples.com)
- [Google Search: Introduction to Structured Data][3]
- [Google Structured Data Testing Tool][7]

[1]: https://json-ld.org
[2]: https://jekyllrb.com
[3]: https://developers.google.com/search/docs/guides/intro-structured-data?hl=en
[4]: https://webmasters.stackexchange.com/questions/46680/using-schema-org-for-blogging-article-vs-blogposting/
[5]: https://help.shopify.com/en/themes/liquid
[6]: https://jekyllrb.com/docs/templates/
[7]: https://search.google.com/structured-data/testing-tool/
