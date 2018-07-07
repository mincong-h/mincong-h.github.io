---
layout:      post
title:       "Python 3 Cheatsheet"
date:        "2018-07-07 09:57:16 +0200"
categories:  [python, study-note]
comments:    true
---

I occasionally write Python scripts, but I always forget those very basic
syntaxs. So I'm writing this cheatsheet in Python 3.

## Iteration

Dictionary iteration for keys:

{% highlight python %}
for key in d:
{% endhighlight %}

Dictionary iteration for values:

{% highlight python %}
for v in d.values():
{% endhighlight %}

Dictionary iteration for items (key, value):

{% highlight python %}
for key, value in d.items():
{% endhighlight %}

## Insertion

Append an element into list:

{% highlight python %}
list.append(e)
{% endhighlight %}

## If Statement

Ternary operator:

{% highlight python %}
# 1. expression if true
# 2. condition
# 3. expression if false
'not empty' if list else 'empty'
{% endhighlight %}
