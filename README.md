# mincong-h.github.io

Hi, welcome to my blog! I'm a software engineer at Datadog. I write blog posts in
my free time. My blogs are bits and pieces of my tech journey. Most of them are
related to Java. Hope you enjoy them! My opionions are my own, not Datadog's.
This blog is powered by [Jekyll][1], a simple, blog-aware, static
sites solution. It is also powered by [TeXt
Theme](https://github.com/kitian616/jekyll-TeXt-theme), a super customizable
Jekyll theme written by Tian Qi ([kitian616](https://github.com/kitian616)).

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

Create new post page:

```sh
$ ./newpost.sh My New Post
```

Create new tag page:

```sh
$ ./newtag.sh Java EE
Tag page created: /Users/mincong/github/mincong-h.github.io/tags/java-ee.md
```

## Blog Post

This section descibes blog post configuration.

Property | Value | Description
:--- | :--- | :---
`image` | Image URL | Related path to image resource, such as `/assets/my-image.jpg`. Jekyll will complete it as an absolute path. Used by [Jekyll Feed](https://github.com/jekyll/jekyll-feed#optional-front-matter) plugin and [Jekyll SEO tag](https://github.com/jekyll/jekyll-seo-tag/blob/master/docs/advanced-usage.md).
`cover` | Image URL | Related path to image resource, such as `/assets/my-image.jpg`. Used for Jekyll TeXt Theme.
`series` | A meaningful name for the series. | The value will be `slugify` for generating the URL. For example, giving value "Maven Plugins" will generate `maven-plugins` for the URL.
`comments` | Whether the comments section will be enabled. Default to true.

## Assets

When adding a new image to the website, you need to register its metadata in
`_data/images.yml`.

## Social Network Sharing

Website | Preview Tool
:---: | :---
Facebook | <https://developers.facebook.com/tools/debug/sharing/>
LinkedIn | <https://www.linkedin.com/post-inspector/>
Twitter | <https://cards-dev.twitter.com/validator>

## Useful Resources

- Jekyll cheatsheet (<https://devhints.io/jekyll>)

[1]: https://jekyllrb.com/
[json-ld]: https://json-ld.org/
[lang]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
