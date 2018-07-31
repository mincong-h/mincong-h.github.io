---
layout:            post
title:             "JGit: Protect Branches on Git Server"
date:              2018-07-30 21:06:35 +0200
last_modified_at:  2018-07-31 09:58:33 +0200
categories:        [tech]
tags:              [java, git, jgit]
comments:          true
excerpt:           >
    If you're using JGit for your Git server, you can combine Git config
    (.git/config) and a customized pre-receive hook to protect branches on a
    specific Git repository.
---

This post explains how to protect branches on your Git server (implemented by
JGit HTTP server). It needs to be done in two steps:

- Setup [pre-receive-hook](#pre-receive-hook)
- Add a new property in [git-config](#git-config)

## Pre-receive-hook

A [org.eclipse.jgit.transport.PreReceiveHook][javadoc-PreReceiveHook] is a hook
invoked by ReceivePack before any updates are executed. According to JGit
Javadoc, the hook is called with
any commands that are deemed valid after parsing them from the client and
applying the standard receive configuration options to them:

- receive.denyDenyDeletes
- receive.denyNonFastForwards

This means the hook will not receive a non-fast-forward update command if
`denyNonFastForwards` is set to true in the configuration file.

As the hook is invoked prior to the commands being executed, the hook may choose
to block any command by setting its result status with
`ReceiveCommand.setResult(ReceiveCommand.Result).` This is what we're doing
here—we will set the result to _"REJECTED"_ when any non-fast-forward updates is
detected.

{% highlight java %}
public class UpdateHook implements PreReceiveHook {

  @Override
  public void onPreReceive(ReceivePack rp,
      Collection<ReceiveCommand> commands) {
    // Reject all non-fast-forward updates
    for (ReceiveCommand c : commands) {
      if (c.getType() == Type.UPDATE_NONFASTFORWARD) {
        c.setResult(Result.REJECTED_NONFASTFORWARD);
      }
    }
  }
}
{% endhighlight %}

Once the pre-receive-hook is created, you can include it into
receive-pack-factory, as part of the receive-pack handling:

{% highlight java %}
GitServlet gitServlet = new GitServlet();
gitServlet.setReceivePackFactory(new MyReceivePackFactory());
{% endhighlight %}

{% highlight java %}
public class MyReceivePackFactory
    implements ReceivePackFactory<HttpServletRequest> {

  @Override
  public ReceivePack create(HttpServletRequest req, Repository db) {
    ReceivePack pack = new ReceivePack(db);
    pack.setPreReceiveHook(new UpdateHook());
    return pack;
  }
}
{% endhighlight %}

However, this might not fit your need, because:

1. It cannot prevent non-fast-fastforward updates based on branch names.
2. It does not differentiate one repository's update-policy from another.

For the 1st point, it's easy. You just need to add more logic into the
pre-receive-hook. For example, protecting only the master branch
(`refs/heads/master`) can be done as follows:

{% highlight java %}
// public void onPreReceive(...) {
if (c.getType() == Type.UPDATE_NONFASTFORWARD
    && "refs/heads/master".equals(c.getRefName())) {
  c.setResult(Result.REJECTED_NONFASTFORWARD);
}
{% endhighlight %}

For the 2nd point, let's see the next section.

## Git Config

If you need to have an individual protection policy on each repository hosted,
you can also define a git configuration property _"receive.denyNonFastForwards"_
in repo's Git configuration (`.git/config`). Therefore, pre-receive-hook
understand how to deny the non-fast-forward updates:

{% highlight ini %}
[receive]
  ; Deny non-fast-forward updates
  ; property is case-insensitive
  denynonfastforwards = true
{% endhighlight %}

The equivalent Java code which writes this property into Git configuration file:

{% highlight java %}
try (Git git = Git.open(repo)) {
  StoredConfig config = git.getRepository().getConfig();
  // subsection: null
  config.setBoolean("receive", null, "denynonfastforwards", true);
  config.save();
}
{% endhighlight %}

Once the configuration is correctly set, you can use the builtin method of
receive-pack `ReceivePack#isAllowNonFastForwards` to determine if the repo
allows non-fast-forward updates:

{% highlight java %}
public class UpdateHook implements PreReceiveHook {

  @Override
  public void onPreReceive(ReceivePack rp, Collection<ReceiveCommand> commands) {
    if (!rp.isAllowNonFastForwards()) { ... }
  }
}
{% endhighlight %}

## References

- [Javadoc: org.eclipse.jgit.transport.PreReceiveHook][javadoc-PreReceiveHook]

[javadoc-PreReceiveHook]: http://download.eclipse.org/jgit/site/5.0.1.201806211838-r/apidocs/org/eclipse/jgit/transport/PreReceiveHook.html
