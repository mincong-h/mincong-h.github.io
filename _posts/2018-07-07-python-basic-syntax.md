---
layout:              post
title:               Python 3 Basic Syntax
lang:                en
date:                2018-07-07 09:57:16 +0200
date_modified:       2021-10-07 08:28:29 +0200
categories:          [python]
tags:                [python, study-note]
excerpt:             >
  The basic syntax to learn before writing code in Python 3.

comments:            true
image:               /assets/bg-museums-victoria-G9Yy-iitjjg-unsplash.jpg
cover:               /assets/bg-museums-victoria-G9Yy-iitjjg-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"

redirect_from: /2018/07/07/python-3-cheatsheet/
---

## Introduction

I occasionally write scripts in Python 3 and this article keeps track of basic
syntax that is frequently used according to my experience. To keep things
simple, this article is focus on language syntax and does not include framework
or tooling of the Python ecosystem. Code written here is tested and hosted on
[GitHub](https://github.com/mincong-h/learning-python). I hope that it will be
useful for you as well. Enjoy!

## Iteration

Iterate keys of a dictionary:

```py
for key in my_dict:
    print(key)
```

Iterate values of a dictionary:

```py
for value in my_dict.values():
    print(value)
```

Iterate key-value pairs of a dictionary:

```py
for key, value in my_dict.items():
    print(key, value)
```

## List Comprehension

List comprehensions are used for creating new lists from other iterables like tuples, strings, arrays, lists, etc. A list comprehension consists of brackets containing the expression, which is executed for each element along with the for loop to iterate over each element.

```
new_list = [ expression(element) for element in old_list if condition ]
```

Examples:

```py
>>> my_dict = {'k1': 'v1', 'k2': 'v2'}

>>> [v for v in my_dict.values()]
['v1', 'v2']

>>> [k for k in my_dict]
['k1', 'k2']

>>> [k for k in my_dict if k == 'k1']
['k1']

>>> [k + ':' + v for k, v in my_dict.items()]
['k1:v1', 'k2:v2']
```

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

## References

- GeeksforGeeks, "Python – List Comprehension", 2021. <https://www.geeksforgeeks.org/python-list-comprehension/>
