---
article_num: 60
layout:            post
title:             "JGit: Customize Git references using RefFilter"
lang:                en
date:              2018-06-28 20:42:48 +0200
date_modified:     2018-07-22 16:42:41 +0200
categories:        [git]
tags:              [java, jgit, git]
permalink:         /2018/06/28/jgit-reffilter/
comments:          true
excerpt:           >
    This post explains how to apply a Git reference filter to your Git server
    in Java. It allows you to customize Git references before sending data to
    clients (upload-pack).

image:             /assets/bg-wade-austin-ellis-WxNcit-ZDCw-unsplash.jpg
cover:             /assets/bg-wade-austin-ellis-WxNcit-ZDCw-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

This post explains how to apply a reference filter to your Git server using
JGit. This might be useful if you want to filter refs, e.g. hide internal refs.
This can be achieved by implementing the interface [`RefFilter`][1]. Once
implemented, you just need to apply it to your upload-pack factory so that it
can change the upload-pack creation.

> If you're not familiar with Git references, this post will be too difficult
> for you. I suggest you to first take a look at
> [§10.3 Git Internals - Git References][git-refs] of book _"Pro Git"_, you'll
> get a much better understanding of this subject.

<!--read more-->

Let's code. First of all, implement the `RefFilter`:

{% highlight java %}
/**
 * Ref filter based on regular expression.
 *
 * @author Mincong Huang
 */
public class RegexRefFilter implements RefFilter {

  private final Pattern pattern;

  public RegexRefFilter(Pattern pattern) {
    this.pattern = pattern;
  }

  @Override
  public Map<String, Ref> filter(Map<String, Ref> map) {
    return map.entrySet()
        .stream()
        .filter(e -> pattern.matcher(e.getKey()).matches())
        .collect(Collectors.toMap(Entry::getKey, Entry::getValue));
  }
}
{% endhighlight %}

Then, include it in your upload-pack factory to change the upload-pack creation.
For example, only takes the public refs `refs/heads/public/.*` in the ref
database, and provide them to the client:

{% highlight java %}
class MyUploadPackFactory implements UploadPackFactory<HttpServletRequest> {
  @Override
  public UploadPack create(HttpServletRequest req, Repository db) {
    UploadPack pack = new UploadPack(db);
    pack.setRefFilter(new RegexRefFilter(Pattern.compile("^refs/heads/public/.*$")));
    return pack;
  }
}
{% endhighlight %}

At the end, use this upload-pack factory in your `GitServlet`:

{% highlight java %}
GitServlet gitServlet = new GitServlet();
gitServlet.setUploadPackFactory(new MyUploadPackFactory());
...
{% endhighlight %}

That's it. Now it should work :)

{% include book-git-pro.html %}

## References

- [org.eclipse.jgit.transport.RefFilter][1]
- [10.3 Git Internals - Git References][git-refs]

[git-refs]: https://git-scm.com/book/en/v2/Git-Internals-Git-References
[1]: http://download.eclipse.org/jgit/site/4.11.0.201803080745-r/apidocs/org/eclipse/jgit/transport/RefFilter.html
