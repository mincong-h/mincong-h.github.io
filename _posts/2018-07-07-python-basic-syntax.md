---
layout:              post
title:               Python 3 Basic Syntax
lang:                en
date:                2018-07-07 09:57:16 +0200
date_modified:       2021-10-16 18:50:20 +0200
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

## Data Container

This section discusses about list, set, and dictionary.

### Container Creation

Create a dictionary, list, set:

```py
import typing

# dictionary
my_dict1 = {"k1": "v1", "k2": "v2", "k3": "v3"}
my_dict2 = dict()
my_dict3 = typing.OrderedDict()

# list
my_list1 = ["v1", "v2", "v3"]
my_list2 = list()
my_list3 = [0] * 4  # [0, 0, 0, 0]

# set
my_set1 = {"k1", "k2", "k3"}
my_set2 = set()
```

### Container Iteration

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

Iterate item in a list:

```py
for item in my_list:
    print(item)
```

Iterate index and item in a list:

```py
for i, item in enumerate(my_list):
    print(i, item)
```

### List Comprehension

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

### Container Insertion

Append an element into list:

```py
my_list.append(e)
```

Add an element into set:

```py
my_set.add(e)
```

Add a new entry into dictionary:

```py
my_dict["my_key"] = "my_value"
```

### Container Functions

Function | Sample | Description
:--- | :--- | :---
`len` | `len(my_list)` | The length of the container.
`enumerate` | `enumerate(my_list)` | Add counter to the iterable.
`max` | `max(my_list)` | The maximal value among the given items.
`min` | `min(my_list)` | The minimal value among the given items.
`reversed` | `reversed(my_list)` | Create a reverse-iterator for a given list.

## If Statement

Ternary operator:

<figure class="highlight">
<pre>
<code class="language-python" data-lang="python"><span class="s"><i>TrueExpression</i></span> <span class="k">if</span> <span class="s"><i>Condition</i></span> <span class="k">else</span> <span class="s"><i>FalseExpression</i></span></code>
</pre>
</figure>

```py
>>> l = []
>>> 'not empty' if l else 'empty'
'empty'
```

## Math

Function | Sample | Description
:--- | :--- | :---
Floor division, integer division (`//`) | `7 // 2` | 3
Float division (`/`) | `7 / 2` | 3.5

## References

- GeeksforGeeks, ["Python – List
  Comprehension"](https://www.geeksforgeeks.org/python-list-comprehension/),
  _GeeksforGeeks_, 2021.
- Python, ["collections - Container datatypes - Python
  3.10.0"](https://docs.python.org/3/library/collections.html),
  _Python Documentation_, 2021.
