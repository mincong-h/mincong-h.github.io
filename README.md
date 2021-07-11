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

Property | Type | Description
:--- | :--- | :---
`image` | URL | Related path to image resource, such as `/assets/my-image.jpg`. Jekyll will complete it as an absolute path. Used by [Jekyll Feed](https://github.com/jekyll/jekyll-feed#optional-front-matter) plugin, [Jekyll SEO tag](https://github.com/jekyll/jekyll-seo-tag/blob/master/docs/advanced-usage.md) and Twitter cards.
`cover` | URL | Related path to image resource, such as `/assets/my-image.jpg`. Used for Jekyll TeXt Theme.
`lang` | String | The language tag of the post: `en` or `zh`.
`date` | Date | A humain readable date string (ISO-8601 like) for the creation date time of the blog post, e.g. "2018-08-22 21:57:07 +0200"
`date_modified` | Date | A humain readable date string (ISO-8601 like) for the latest modification date time of the blog post, e.g. "2021-03-07 16:47:00 +0200"
`series` | String | A meaningful name for the series. The value will be `slugify` for generating the URL. For example, giving value "Maven Plugins" will generate `maven-plugins` for the URL.
`comments` | Boolean | Whether the comments section will be enabled. Default to true.
`subtitle` | String | The subtitle of the blog post in one sentence.
`wechat` | Boolean | Whether WeChat QR code should be shown. Default to false.

## Collections

Collection Directory       | Description
:------------------------- | :----------
`_posts`                   | Blog posts written in English.
`_cn`                      | Blog posts written in Chinese.
`_displayed_en_categories` | Categories displayed for users, written in English.
`_displayed_cn_categories` | Categories displayed for users, written in Chinese.

## Assets

When adding a new image to the website, you need to register its metadata in
`_data/images.yml`.

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
