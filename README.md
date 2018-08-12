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
`lang` | A valid language abbreviation | The language for the HTML page, see [MDN: lang][lang]. Defaults to `en-us`.

## Useful Resources

- Jekyll cheatsheet (<https://devhints.io/jekyll>)

[1]: https://jekyllrb.com/
[json-ld]: https://json-ld.org/
[lang]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
