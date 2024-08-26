---
layout:         page
title:          Projects
subtitle: >
  Here are some projects that I participated in the past.

image:               /assets/patterns/pawel-czerwinski-fPN1w7bIuNU-unsplash.jpg
cover:               /assets/patterns/pawel-czerwinski-fPN1w7bIuNU-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

<div class="layout--articles">
  <section class="my-5">
    {%- include article-list.html
            articles=site.en_projects
            type='grid'
            size='md'
            cover_type='background'
            with_date='true'
    -%}
  </section>
</div>
