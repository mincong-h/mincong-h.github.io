---
layout:      post
title:       "JGit RefFilter"
date:        "2018-06-28 20:42:48 +0200"
categories:  [java, jgit, git]
comments:    true
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

## References

- [org.eclipse.jgit.transport.RefFilter][1]
- [10.3 Git Internals - Git References][git-refs]

[git-refs]: https://git-scm.com/book/en/v2/Git-Internals-Git-References
[1]: http://download.eclipse.org/jgit/site/4.11.0.201803080745-r/apidocs/org/eclipse/jgit/transport/RefFilter.html
