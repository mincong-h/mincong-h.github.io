---
layout:            post
title:             "Git: Understanding Git Config"
date:              2018-07-29 14:45:46 +0200
categories:        [tech]
tags:              [git, study-note]
comments:          true
excerpt:           >
    The format of Git internal configuration file (.git/config) is very
    simple: it has multiple sections, each of which contains multiple options.
    An option is indeed a key-value pair...
---

<p align="center">
  <img src="/assets/logo-git.png"
       style="max-width:100px; width:100%; margin-top: 30px;"
       alt="Logo Git">
</p>

Today, let's take a look in Git configuration file (`.git/config`). Git config
is an [INI file][1], a basic structure composed of sections, properties, and
values. After reading this post, you'll understand: what is the structure of
such file; what happens when you read, add, modify, or delete an option from
configuration file; the scope of different configuration files.

- [Preparation](#preparation)
- [Format](#format)
- [Read an option](#read-an-option)
- [Add an option](#add-an-option)
- [Modify an option](#modify-an-option)
- [Delete an option](#delete-an-option)
- [Configuration scopes](#configuration-scopes)

Now, let's get started.

## Preparation

First of all, create a new project (done in macOS):

```
$ mkdir demo && cd demo
$ git init
Initialized empty Git repository in /Users/mincong/demo/.git/
```

Now, the Git configuration file (`.git/config`) looks like the following:

{% highlight ini %}
[core]
  repositoryformatversion = 0
  filemode = true
  bare = false
  logallrefupdates = true
  ignorecase = true
  precomposeunicode = true
{% endhighlight %}

## Format

The basic element contained in git config is the property. Every property has a
name and a value, delimited by an equals sign (`=`). The name appears to the
left of the equals sign.

{% highlight ini %}
bare = false
{% endhighlight %}

Keys may be grouped into arbitrarily named sections. The section name appears on
a line by itself, in square brackets (`[` and `]`). All keys after the section
declaration are associated with that section. There's no explicit end of
section—a section is ended at the next section declaration, or end of file.

{% highlight ini %}
[section1]
  a = a
  b = b
[section2]
  c = c
{% endhighlight %}

## Read an Option

To read an option in Git config, the syntax is:

<pre>
<span>git config [ --get ] <i>&lt;option&gt;</i></span>
</pre>

To read option `user.name` in Git config, do

```
$ git config --get user.name
Mincong HUANG
```

Or your can omit the `--get` keyword:

```
$ git config user.name
Mincong HUANG
```

## Add an Option

To add an new option into Git config, the syntax is:

<pre>
<span>git config <i>&lt;option&gt;</i> <i>&lt;value&gt;</i></span>
</pre>

To set the `mysection.k` to `v`, do:

```
$ git config mysection.k v
```

If the section associated to option does not exist, this section will be added
to the configuration file:

{% highlight ini %}
[mysection]
  ; mysection is created during the
  ; creation of option "mysection.k"
  k = v
{% endhighlight %}

## Modify an Option

Same as [add an option](#add-an-option).

## Delete an Option

To delete an option in Git config, the syntax is:

<pre>
<span>git config --unset <i>&lt;option&gt;</i></span>
</pre>

For example, unset the option `mysection.a`, do

```
$ git config --unset mysection.a
```

After having unset the option, the configuration file looks like:

{% highlight ini %}
# Empty section: all the keys have been
# removed, but the section remains.
[mysection]
{% endhighlight %}

## Configuration Scopes

There're 3 scopes of configuration:

- local (`--local`, default)
- global (`--global`)
- system (`--system`)

Local options are stored in `.git/config` file. When using command option
`--local` to write, the value will be written into `.git/config` file, which is
the default behavior. When using command option `--local` to read, only the
local configuration properties will be read. This is different from the default
behavior, where all available files (local, global, system) are read.

Global options are stored in `~/.gitconfig` file. When using command option
`--global` to write, the value will be written into
`$XDG_CONFIG_HOME/git/config` file if this file exists and the `~/.gitconfig`
file doesn’t. When using command option `--global` to read, only the global
scoped configuration will be read rather than from all available files.

System options are stored in `$(prefix)/etc/gitconfig`. When using command
option `--system` to write, write to system-wide config file rather than the
repository config. When using command option `--system` to read, read only from
the system-wide file rather than from all available files.

## References

- [Wikipedia: INI file][1]
- [Git: git-config][2]

[1]: https://en.wikipedia.org/wiki/INI_file
[2]: https://git-scm.com/docs/git-config
