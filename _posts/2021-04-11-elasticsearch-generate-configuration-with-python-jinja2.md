---
layout:              post
title:               "Elasticsearch: Generate Configuration With Python Jinja 2"
subtitle:            >
     Making your Elasticsearch configuration safe and consistent.

lang:                en
date:                2021-04-11 08:31:10 +0800
categories:          [elasticsearch, python]
tags:                [elasticsearch, python, jinja]
comments:            true
excerpt:             >
    This article explains how to generate the configuration for Elasticsearch using
    Python templating engine Jinja 2 by going through a basic use-case. It also
    explains features about Jinja2, testing, and more.

image:               /assets/bg-heiman-ip-iFk8n8ntVDU-unsplash.jpg
cover:               /assets/bg-heiman-ip-iFk8n8ntVDU-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
ads:                 none
---

## Introduction

When hosting multiple Elasticsearch clusters in production, you will
probably face a problem about cluster provisioning: how can we generate the
configuration for Elasticsearch in a consistent way? There are many factors to
be taken into account: the cloud providers, the instance types, the network
settings, the products or the customers for which the cluster is running, the
version of Elasticsearch, the architecture of Elasticsearch (hot/warm/cold),
etc. Therefore, it's important to have a tool that helps you and avoid spending
time doing this manually. It is not only about spending time, it is also
about reducing human errors and being consistent for different settings.

Choosing a templating engine is a good solution. It allows you to have an
automated solution at a reasonable cost. You can start small and add more
complex logic in the future. In this article, we are going to explore one
popular templating engine in Python: Jinja 2. We will see how easy it is to use
and explore some more advanced use-cases. After reading this article, you will
understand:

* What is Jinja?
* How to use it to generate configuration, such as for `elasticsearch.yml`?
* How to use Python class for more complex logic?
* Going further into Jinja: understanding its core features
* Testing
* How to go further from here?

Now, let's get started!

## What is Jinja?

Jinja is a modern and designer-friendly templating language for Python.
Jinja is designed to be flexible, fast, and secure. To use Jinja, you can declare
the following requirement in your `requirements.txt` file:

```
Jinja2 == 2.11.3
```

or declare the following requirement in your `Pipfile`:

```ini
[packages]
Jinja2 = "==2.11.3"
```

I recommend using a fixed version to avoid potential issues with the
requirements. But you can remove it if you don't feel that it is necessary.

## Generating Configuration

In our case, if we want to generate the configuration for Elasticsearch, such as for
`elasticsearch.yml`, it can be as easy as:

```yml
{% raw %}# template: elasticsearch.yml.j2
cluster.name: {{ cluster_name }}
node.name: {{ node_name }}
network.host: 0.0.0.0{% endraw %}
```

... where we inject two variables `cluster_name` and `node_name` to the template
`elasticsearch.yml.j2`. But having a template is not enough, we also need the
Python code which injects the variables into the template to render the actual
result. In my demo, I am using the following structure, where the templates are
stored in a separated directory called `templates`:

```
➜  jinja2 git:(jinja2 u=) tree .
.
├── es_config_generator.py
└── templates
    └── elasticsearch.yml.j2
```

On the generator side, the code is simple as well. It accepts the two
variables: `cluster_name` and `node_name` as input. Then, it locates the
template directory from relative path `./templates` and creates a Jinja
environment for it. Finally, it locates the template and renders it by
passing all the variables as input parameters:

```py
import os

from jinja2 import FileSystemLoader, Environment


def render_config(cluster_name: str, node_name: str) -> str:
    template_dir = os.path.join(os.path.dirname(__file__), "templates")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template("elasticsearch.yml.j2")
    return template.render(cluster_name=cluster_name, node_name=node_name)
```

Thanks to this method, we can generate an Elasticsearch configuration file like
this:

```yml
cluster.name: es-demo
node.name: es-demo-data-1
network.host: 0.0.0.0
```

And starting an Elasticsearch node with this custom configuration will work (you
can see the entry `name` and `cluster_name` in the HTTP response:

```sh
docker run \
  --rm \
  -e discovery.type=single-node \
  -p 9200:9200 \
  -v "${HOME}/custom.elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml" \
  docker.elastic.co/elasticsearch/elasticsearch:7.12.0
```

```
GET localhost:9200
```

```json
{
  "name" : "es-demo-data-1",
  "cluster_name" : "es-demo",
  "cluster_uuid" : "2qiANXx0SIO4HTG9FD_QPg",
  "version" : {
    "number" : "7.12.0",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "78722783c38caa25a70982b5b042074cde5d3b3a",
    "build_date" : "2021-03-18T06:17:15.410153305Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

In the sample above, we saw how to handle the logic in a simple way. That is, to
pass all the variables one after another into the template to render the result.
It works well for small projects. But when the project grows and you need to
accept more and more complex logic, you will need a better solution. In this
case, it comes to two choices:

1. Using more complex logic in the template: for-loops, if-statements, filters,
   etc.
2. Using more complex logic in Python scripts and keep the templating part simple.

I prefer the second choice because I do not like having complex logic in a
template file. It makes things hard to read and hard to test. The structure of
the file can become unclear when the logic grows. On the other side, using
more complex logic in Python scripts is easy to test because we can extract a
function, where the outputs are the template variables. It
splits the processing and the rendering into two parts. In the following
sections, I am going to explain how to use Python class to represent more
complex logic. Then, I will also represent more features about Jinja 2, just in
case you think choice 1 is better or you already have templates like
this and have to deal with them.

## Using Python Class

One effective way to manage the complexity is to group several variables
together as a class. Or a class nested into another. Therefore, you need to pass
one object (one instance of that class) rather than passing multiple variables
for the template rendering. For example, we can modify the variable from
`cluster_name` to `cluster.name` so that we only need to pass the object
`cluster`. And the same for `node`. The new template can look like this:

```yml
{% raw %}cluster.name: {{ cluster.name }}
node.name: {{ node.name }}
network.host: 0.0.0.0{% endraw %}
```

And the associated data classes in Python:

```py
from dataclasses import dataclass


@dataclass
class ClusterConfig:
    name: str


@dataclass
class NodeConfig:
    name: str
```

Then, the generator is changed a bit. You can see that we create the named
tuples `cluster` and `node` before passing them to the template rendering.

```py
def render_config(cluster_name: str, node_id: int) -> str:
    template_dir = os.path.join(os.path.dirname(__file__), "templates")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template("elasticsearch.yml.v2.j2")

    # create data classes before rendering
    cluster = ClusterConfig(name=cluster_name)
    node = NodeConfig(name=f"{cluster_name}-data-{node_id}")

    return template.render(cluster=cluster, node=node)
```

Here my example is almost useless. But imagine a situation where you need to add
if-statements, compute multiple fields, add validation, etc. It will make more
sense in those situations.

You may also ask: why do we use data class? Because it implements
`__hash__()`, `__eq__()`, and `__repr__()`. Also, you don't need to create the
`__init__()` function anymore. So I believe it is much better than a regular
class. You can see more information in [PEP 557 -- Data Classes](https://www.python.org/dev/peps/pep-0557/).

## Basic Features of Jinja 2

Here are some basic features of Jinja 2 that are useful for many templates. But
of course, Jinja is much more powerful than that. I will explain that later on.

If statement:

```yml
{% raw %}{% if node_name %}
node.name: {{ node_name }}
{% endif %}{% endraw %}
```

For loop:

```yml
discovery.seed_hosts:
{% raw %}{% for seed_host in seed_hosts %}
- {{ seed_host }}
{% endfor %}{% endraw %}
```

Comment:

```
{% raw %}{# Comment goes here #}{% endraw %}
```

Comparison:

Operator | Description
:---: | :---
`==` | Compares two objects for equality.
`!=` | Compares two objects for inequality.
`>`  | true if the left hand side is greater than the right hand side.
`>=` | true if the left hand side is greater or equal to the right hand side.
`<`  | true if the left hand side is lower than the right hand side.
`<=` | true if the left hand side is lower or equal to the right hand side.

Logic:

Operator | Description
:---: | :---
`and` | Return true if the left and the right operand are true.
`or`  | Return true if the left or the right operand are true.
`not` | negate a statement.

If you want to know more about Jinja 2, I suggest you visit to following
documents:

1. [Jinja - Template Designer Documentation
   (v2.11)](https://jinja.palletsprojects.com/en/2.11.x/templates/). Not only you can
   find all the expressions listed above, but much more than that, such as
   variables, white space control, template inheritance, HTML escaping, filters.
2. [Jinja - API (v2.11)](https://jinja.palletsprojects.com/en/2.11.x/api/).
   Here you will find different APIs in Python. You will need them to integrate
   Jinja into your Python scripts.

## Testing

I believe testing is an important part of the generation. It is an effective way
to ensure the correctness of the results. There are two ways to test:

* Testing the data classes
* Testing the final rendered result

The first way, testing the data class, is useful when the data models are
present in the Python scripts and when you have complex processing logic there:
validation, computed fields, etc. But testing it does not verify the actual
rendering in the templates.

The second way, testing the final rendered result, is an end-to-end approach. It
is useful for any scenario. It asserts the correctness of the final result, such
as string or file. Going this way at the beginning is good, but may become
harder to maintain when the template rendering becomes more complex.
Here is a simple demo of the assertions:

```py
def test_render_app():
    yml = generator.render_config(cluster_name="es-demo", node_id=1)
    assert yml == """\
cluster.name: es-demo
node.name: es-demo-data-1
network.host: 0.0.0.0"""
```

I believe there are no perfect solutions for testing. Ultimately, testing is
to provide safety to your product and avoid unexpected results later on. As far
as you feel safe for the generated configuration, maybe that's the most
important.

## Going Further

How to go further from here?

- To know more about how to configure Elasticsearch, visit official
  documentation ["Configuring
Elasticsearch"](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/settings.html).
- To see the initial template of `elasticsearch.yml`, visit the source code on
  GitHub (here the link is for Elastcsearch v7.12.0):
  <https://github.com/elastic/elasticsearch/blob/v7.12.0/distribution/src/config/elasticsearch.yml>
- To learn more about templating engine Jinja, visit the official website
  <https://jinja.palletsprojects.com/>.

You can also see the source code of this article on GitHub under repository
[mincong-h/learning-python](https://github.com/mincong-h/learning-python/tree/blog/elasticsearch-jinja2/src/jinja2).

## Conclusion

In this article, we saw what is templating engine Jinja 2, how to use it to
generate the configuration for Elasticsearch clusters, such as `elasticsearch.yml`,
how to use Python data classes to represent more complex logic, the basic
features of Jinja 2, how to test the generation, and finally how to go further
from here.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Eric V. Smith, "PEP 557 -- Data Classes", _python.org_, 2017.
  <https://www.python.org/dev/peps/pep-0557/>
- Miguel Brito, "Everything You Need to Know About Python's Namedtuples",
  _dev.to_, 2020. <https://dev.to/miguendes/everything-you-need-to-know-about-python-s-namedtuples-1l12>
- 卡拉先生, "Elasticsearch配置yaml中文教程", _kalasearch.cn_, 2020.
  <https://kalasearch.cn/community/tutorials/how-to-configure-yaml-file-for-elastic-search/>
