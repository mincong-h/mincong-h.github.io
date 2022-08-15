# mincong.io

Hi, welcome to my blog! I'm a software engineer at Datadog. I write blog posts in
my free time. My blogs are bits and pieces of my tech journey. Most of them are
related to Java. Hope you enjoy them! My opionions are my own, not Datadog's.
This blog is powered by [Jekyll][1], a simple, blog-aware, static
sites solution. It is also powered by [TeXt
Theme](https://github.com/kitian616/jekyll-TeXt-theme), a super customizable
Jekyll theme written by Tian Qi ([kitian616](https://github.com/kitian616)).

- [Install and Run](#install-and-run)
- [Generators](#generators)
- [Blog Post](#blog-post)
  - [Types of Blog Post](#types-of-blog-post)
  - [Configuration](#configuration)
- [Collections](#collections)
- [Search](#search)
  - [Indexing Documents](#indexing-documents)
  - [Querying Documents](#querying-documents)
- [Assets](#assets)
- [Social Network Sharing](#social-network-sharing)
- [WeChat](#wechat)
- [Useful References](#useful-resources)

## Install and Run

Install required Jekyll plugins, then run Jekyll:

```sh
# if `bundle` command is not available
# install bundler first
gem install bundler

# install Jekyll plugins (gems) required
# by this blog using bundler
bundle install

# run Jekyll
jekyll serve
```

Or run via Docker:

```sh
# full generation
./docker-serve.sh

# incremental generation
./docker-serve.sh --incremental
```

## Generators

Create new blog post (article). By default, only English post is created:

```sh
$ ./newpost.sh My New Post
Blog post created!
  EN: /Users/minconghuang/github/mincong-h.github.io/_posts/2021-11-14-my-new-post.md
  CN: (disabled)
```

Print help:

```sh
$ ./newpost.sh -h
Usage:

       newpost.sh [OPTIONS] TITLE


Options:

       -d,--debug   Print debug logs
       -h,--help    Show help
       -e,--en      Generate English post
       -c,--cn      Generate Chinese post
       -a,--all     Generate post in all languages (English and Chinese)
          --qna     Generate post using a Q&A (Question and Answer) template


Examples:

       newpost.sh My Post Title

       newpost.sh --all My Post Title
       newpost.sh -a My Post Title

       newpost.sh --en My Post Title
       newpost.sh --cn My Post Title

       newpost.sh -h
```

Create new tag page:

```sh
$ ./newtag.sh Java EE
Tag page created: /Users/mincong/github/mincong-h.github.io/tags/java-ee.md
```

## Blog Post

### Types Of Blog Post

There are two types of blog post: classic and Q&A.

**Classic blog post** is a blog post that describes a language feature, a framework,
an architecture; translates a meaningful article; project review; or anything
that is rather long and insightful. It is rich in
content, i.e. going deep in a topic or showing the big picture. This should be
interesting for the audience to follow. A classic blog post typically requires
several hours of writing and contains 3000+ words. It consists of an
introduction, 3 to 4 sections, notes for going further, conclusion, and
references. Generating a classic blog post can be done using the following
command:

```sh
$ ./newpost.sh My Regular Post Title
```

**Q&A blog post** is a blog post that answers a specific question. It consists
one question and one answer. Compared to classic blog post, it's much shorter
and means less work (done in less than 2 hours with less than 1000 words).
Usually it means the question is specific to a language and a framework. You can
consider it as questions you see on <https://stackoverflow.com>.
It consists of one question, one answer, notes for
going further, and references. But why creating Q&As?
For readers, it aims to provide them useful information without the needs to understand the
underlying implementation. For author, it means having faster delivery speed,
providing more
arguments for the classic blog posts, and having more page views (classic blog posts
are not SEO friendly). Generating a Q&A blog post can be done using the
following command:

```sh
$ ./newpost.sh --qna My Question
```

### Configuration

Property | Type | Description
:--- | :--- | :---
`type` | String | The type of the blog post: "classic", "Q&A".
`image` | URL | Related path to image resource, such as `/assets/my-image.jpg`. Jekyll will complete it as an absolute path. Used by [Jekyll Feed](https://github.com/jekyll/jekyll-feed#optional-front-matter) plugin, [Jekyll SEO tag](https://github.com/jekyll/jekyll-seo-tag/blob/master/docs/advanced-usage.md) and Twitter cards.
`cover` | URL | Related path to image resource, such as `/assets/my-image.jpg`. Used for Jekyll TeXt Theme.
`lang` | String | The language tag of the post: `en` or `zh`.
`date` | Date | A humain readable date string (ISO-8601 like) for the creation date time of the blog post, e.g. "2018-08-22 21:57:07 +0200"
`date_modified` | Date | A humain readable date string (ISO-8601 like) for the latest modification date time of the blog post, e.g. "2021-03-07 16:47:00 +0200"
`series` | String | A meaningful name for the series. The value will be `slugify` for generating the URL. For example, giving value "Maven Plugins" will generate `maven-plugins` for the URL.
`comments` | Boolean | Whether the comments section will be enabled. Default to true.
`subtitle` | String | The subtitle of the blog post in one sentence.
`wechat` | Boolean | Whether WeChat QR code should be shown. Default to false.
`ads` | String | Ads provider for the post, currently support "ethical-ads" (<https://www.ethicalads.io/>) or "none". Defaults to "ethical-ads".
`ads_tags` | List | A list of tags for ads, in additional to existing `tags`.

## Collections

Collection Directory       | Description
:------------------------- | :----------
`_posts`                   | Blog posts written in English.
`_cn`                      | Blog posts written in Chinese.
`_displayed_en_categories` | Categories displayed for users, written in English.
`_displayed_cn_categories` | Categories displayed for users, written in Chinese.

## Search

### Indexing Documents

Indexing documents are done during the build process of the website, usually in
the CI. This is powered by the custom BlogSearch plugin
(`_plugins/hooks/site/post_write/blogsearch.rb`). To debug it, you can set
environment variable `JIMI_ENABLED` and then build/serve the Jekyll website.
Username (`JIMI_USERNAME`) and password (`JIMI_PASSWORD`) are required.

### Querying Documents

The search feature is powered by Jimi Search (`jimi`), a custom search solution
that I created based on Java and Elasticsearch.

## Assets

When adding a new image to the website, you need to register its metadata in
`_data/images.yml`.

- <https://unsplash.com> Beasutiful free images & pictures
- <https://pixabay.com> 2.6 million+ strunning free images to use anywhere

## Social Network Sharing

Website | Preview Tool
:---: | :---
Facebook | <https://developers.facebook.com/tools/debug/sharing/>
LinkedIn | <https://www.linkedin.com/post-inspector/>
Twitter | <https://cards-dev.twitter.com/validator>

## WeChat

Edit using 墨滴 https://www.mdnice.com/ which converts markdown into WeChat
article.

格式：

- 格式化文档，让英文单词和中文字符之间加空格
- 微信外链转脚注，优雅处理微信中外部链接无法点击的问题。有些时候代码监测不出来，需要手动修改。
- 取消衬线字体

主题：

- 橙蓝风（axuebin）

代码主题：

- 选择 atom-one-dark
- 取消 Mac 风格

内容：

- “参考资料”改成“外部链接”

## Useful Resources

- Jekyll cheatsheet (<https://devhints.io/jekyll>)

[1]: https://jekyllrb.com/
[json-ld]: https://json-ld.org/
[lang]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
