# mincong-h.github.io

Hi, welcome to my blog! I'm a software engineer at Nuxeo. I write blog posts in
my free time, most of which are related to `java`, `git`, and `web`. Hope you
enjoy them! This blog is powered by [Jekyll][1], a simple, blog-aware, static
sites solution.

## Install and Run

Install required Jekyll plugins:

```sh
# if `bundle` command is not available
# install bundler first
$ gem install bundler

# install Jekyll plugins (gems) required
# by this blog using bundler
$ bundle install
```

Run Jekyll:

```
$ jekyll serve
```

## Create New Pages

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
`img_url` | Image URL | Related path to image resource, such as `/assets/my-image.jpg`. Jekyll will complete it as an absolute path.
`img_height` | Image height | Image height in pixel (px). Used as HTML metadata, in particular for post sharing.
`img_width` | Image width | Image width in pixel (px). Used as HTML metadata, in particular for post sharing.
`series` | A meaningful name for the series. | The value will be `slugify` for generating the URL. For example, giving value _"Maven Plugins" will generate `maven-plugins` for the URL.

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
