---
layout:      post
title:       "Python 3 Cheat sheet"
lang:                en
date:        "2018-07-07 09:57:16 +0200"
categories:  [python]
tags:        [python, study-note]
excerpt:     >
  I occasionally write Python scripts, but I always forget those very basic
  syntax. So I'm writing this Python 3 cheat sheet.
permalink:         /2018/07/07/python-3-cheatsheet/
comments:    true
image:       /assets/bg-museums-victoria-G9Yy-iitjjg-unsplash.jpg
cover:       /assets/bg-museums-victoria-G9Yy-iitjjg-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

I occasionally write Python scripts, but I always forget those very basic
syntax. So I'm writing this cheat sheet in Python 3.

## Iteration

Dictionary iteration for keys:

{% highlight python %}
for key in d:
{% endhighlight %}

{% highlight python %}
>>> for key in {1:2, 2:4}:
...   print(key)
...
1
2
{% endhighlight %}

Dictionary iteration for values:

{% highlight python %}
for v in d.values():
{% endhighlight %}

{% highlight python %}
>>> for v in {1:2, 2:4}.values():
...   print(v)
...
2
4
{% endhighlight %}

Dictionary iteration for items (key, value):

{% highlight python %}
for key, value in d.items():
{% endhighlight %}

{% highlight python %}
>>> for k, v in {1:2, 2:4}.items():
...   print(k, v)
...
1 2
2 4
{% endhighlight %}

## Insertion

Append an element into list:

{% highlight python %}
list.append(e)
{% endhighlight %}

{% highlight python %}
>>> l = [1, 2]
>>> l.append(3)
>>> l
[1, 2, 3]
{% endhighlight %}

Add an element into set:

{% highlight python %}
s.add(e)
{% endhighlight %}

{% highlight python %}
>>> s = {1, 2}
>>> s.add(3)
>>> s
{1, 2, 3}
{% endhighlight %}

## If Statement

Ternary operator:

<figure class="highlight">
<pre>
<code class="language-python" data-lang="python"><span class="s"><i>TrueExpression</i></span> <span class="k">if</span> <span class="s"><i>Condition</i></span> <span class="k">else</span> <span class="s"><i>FalseExpression</i></span></code>
</pre>
</figure>

{% highlight python %}
>>> l = []
>>> 'not empty' if l else 'empty'
'empty'
{% endhighlight %}
