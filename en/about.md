---
layout:     page
title:      About
---

<p align="center">
  <img
    src="https://www.gravatar.com/avatar/e9760ae831cb65cf1b7453c98701aae1?s=100"
    alt="Mincong Huang's Gravatar" />
</p>

Hi, welcome to my blog! I'm a software engineer at [Datadog](https://www.datadoghq.com/). I write blog posts
in my free time. My blogs are bits and pieces of my tech journey. Most of them
are related to Java. Hope you enjoy them! My opionions are my own, not
Datadog's. This blog is powered by [Jekyll](https://jekyllrb.com/), a simple, blog-aware, static sites
solution.

<div class="layout--articles">
  <section class="my-5">
    <header><h2 id="categories">Categories</h2></header>
    {%- include article-list.html articles=site.displayed_en_categories type='grid' size='sm' cover_type='background' -%}
  </section>
</div>
