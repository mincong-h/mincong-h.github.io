---
layout:              post
title:               String Operations in Bash
subtitle:            >
    4 tips for making your scripting easier.

lang:                en
date:                2021-12-04 12:10:41 +0100
categories:          [bash]
tags:                [bash, scripting]
ads_tags:            []
comments:            true
excerpt:             >
    This article shares tips for different string operations in Bash, including
    string declaration, substring removal, regular expressions in if-statement, and
    operations in streams.

image:               /assets/bg-pawel-czerwinski-ScYk6KKEPUI-unsplash.jpg
cover:               /assets/bg-pawel-czerwinski-ScYk6KKEPUI-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

When working in the software industry, no matter you are a software engineer, a
data scientist, a support engineer, or any other role, you probably need to
know some basic skills about Bash to
improve your productivity. This can be useful for automating complex tasks in
your terminal, generating the file for configuration or documentation, sharing
commands with your teammates, etc. In this post, we are going to explore some
frequently used techniques about string operations.

This article is written in macOS 11.6 and the default Bash environment (more
details are described in the command below):

```sh
$ bash -version && sw_vers
GNU bash, version 3.2.57(1)-release (x86_64-apple-darwin20)
Copyright (C) 2007 Free Software Foundation, Inc.
ProductName:	macOS
ProductVersion:	11.6
BuildVersion:	20G165
```

After reading this article, you will understand:

* How to declare a variable?
* How to remove a substring using shell parameter expansion?
* How to determine string value using regular expressions in if-statement?
* How to manipulate streams using different commands?

Now, let's get started!

## Declaring Variables

**Declare a single line variable.** To declare a single line variable, just
declare a variable, followed by an equal sign (`=`) for the assignment, and ends
with the value of the variable, either using a string directly, or using a
command inside a subshell (`$(...)`):

```sh
content="Hello Bash"
creation_date=$(date +"%Y-%m-%d") # 2012-12-04
```

**Declare a multi-line text.** A heredoc is a special-purpose code block that
tells the shell to read input from the current source until it encounters a line
containing a delimiter. EOF (end of file) is a commonly used delimiter but it's
not mandatory. You can use JSON, YAML, TEXT, or any other delimiter that you
think is relevant to your situation. The syntax for Heredoc in Bash is:

```sh
COMMAND << DELIMITER
Here is the long description
...
DELIMITER
```

Here is an example for generating a YAML file, where we generate the heredoc and
print it inside a subshell
and assign the result to a variable:

```sh
content=$(cat << YAML
cluster:
  type: $TYPE
  name: elasticsearch-$TYPE
  date: $(date +"%Y-%m-%d")
YAML
)
```

## Substring Removal

Removing a substring can be done inside a shell parameter expansion `${param}`.
Using character `#` can delete a prefix of the string and using character `%`
can delete a suffix of the string. Using the same characters once or twice will
delete the shortest and the longest match respectively. To better remember this,
look at your ISO layout keyboard:

`# 3`, `$ 4`, `% 5`

In a standard keyboard layout, keys 3/4/5 represent `#`/`$`/`%`. Since `#` is
before `$` and `%` is after `$`, deletion with `#` happens from the front of a string
(`$`), and deletion with `%` happens from the end of a string (`$`). Here are some
concrete examples:

Deleting the shortest match from the front of a string:

```sh
d=2021-12-04
echo ${d#*-}  # 12-04
```

Deleting the longest match from the front of a string:

```sh
d=2021-12-04
echo ${d##*-}  # 04
```

Deleting the shortest match from the back of a string:

```sh
d=2021-12-04
echo ${d%-*}  # 2021-12
```

Deleting the longest match from the back of a string:

```sh
d=2021-12-04
echo ${d%%-*}  # 2021
```

## If Statement

Normal regular expression:

```sh
if [[ "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]
```

Negate regular expression:

```sh
# inside
if [[ ! "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]

# outside
if ! [[ "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]
```

Contain keyword using `==`, e.g. word "2021":

```sh
if [[ "$date" == *"2021"* ]]
```

## Stream

To manipulate streams (`stdin`, `stdout`, `stderr`) in Bash, you can use a pipe
(`|`) followed by a `command` after your stream to filter, update, or collect
information. This can be achieved using `grep`, `sed`, `cut`, `xargs`, or other
commands. Here is the syntax:

```sh
my_stream | <command>
```

Here are some examples using "users.csv":

```sh
$ cat users.csv
"User A","10","Paris"
"User B","20","London"
"User C","30","New York"
"User d","40","Toulouse"
```

Find users in Paris:

```sh
$ cat users.csv | grep Paris
"User A","10","Paris"
```

Remove quotes (`"`):

```sh
$ cat users.csv | sed 's/"//g'
User A,10,Paris
User B,20,London
User C,30,New York
User d,40,Toulouse
```

Remove user with incorrect format, e.g. ID written in lower case:

```sh
$ cat users.csv | sed '/User [[:lower:]]/d'
"User A","10","Paris"
"User B","20","London"
"User C","30","New York"
```

Cut column 2 and only keep columns 1 and 3:

```sh
$ cat users.csv | cut -f 1,3 -d ,
"User A","Paris"
"User B","London"
"User C","New York"
"User d","Toulouse"
```

... to learn more about the syntax of your target command, use `man` command or
use the help option `-h`:

```sh
# man cut
# man grep
# man sed
# ...
man <command>

# cut -h
# grep -h
# sed -h
<command> -h
```

## Conclusion

In this article, we discussed different string operations in Bash, including
variable declaration, substring removal, built-in regular expression for
if-statement, manipulating streams (filter, update, collect). The source code is
also available on
[GitHub](https://github.com/keweishang/tech-resources/tree/master/tool).
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Kewei Shang & Mincong Huang, ["Bash \| Tech Resources"](https://github.com/keweishang/tech-resources/blob/master/tool/bash.md), _GitHub_, 2020.
- GNU, ["3.5.3 Shell Parameter
  Expansion"](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html),
_GNU_, 2021.
- Vivek Gite, ["How to find out macOS version information from Terminal command
  prompt"](https://www.cyberciti.biz/faq/mac-osx-find-tell-operating-system-version-from-bash-prompt/), _CyberCiti_, 2021.
