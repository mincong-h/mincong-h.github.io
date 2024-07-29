---
layout: page
title: Mincong HUANG
show_title: true
subtitle: >
  Software Engineer working on data engineering, with a strong background in Java, Elasticsearch, and DevOps.

# hack for home path
baseurl: '/'

image:               /assets/patterns/pawel-czerwinski-dQuNjCvy9uc-unsplash.jpg
cover:               /assets/patterns/pawel-czerwinski-dQuNjCvy9uc-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

{%- assign _highlighted_categories = 'temporal:Automation, elasticsearch:Elasticsearch, java-core:Java, java-testing:Testing, java-concurrency:Concurrency, rest:RESTful APIs, git:Git' | split: ', ' -%}

{%- for _category in _highlighted_categories -%}
  {%- assign _kv = _category | split: ':' -%}
  {%- assign _category_id = _kv.first -%}
  {%- assign _category_title = _kv.last -%}

  <div class="article__content">
    <h2>{{ _category_title }}</h2>
  </div>

  <div class="layout--articles">
    <section class="my-5">
      {% assign _articles = site.categories[_category_id] %}
      {%- include article-list.html
            articles=_articles
            type='grid'
            size='md'
            cover_type='background'
            limit='6'
            with_date='true'
      -%}
      <p>
        <a href="/en/categories/{{ _category_id }}/">Read more...</a> ({{ site.categories[_category_id] | size }} articles)
      </p>
    </section>
  </div>
{%- endfor -%}


<div class="article__content">
  <h2>All Categories</h2>
  <p>If you didn't find what you want in the highlighted categories above, here are more categories to discover :D</p>
</div>

<div class="layout--articles">
  <section class="my-5">
    {%- include article-list.html articles=site.displayed_en_categories type='grid' size='sm' cover_type='background' -%}
  </section>
</div>
