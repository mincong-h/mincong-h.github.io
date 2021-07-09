---
layout:     page
title:      Categories
permalink:  /cn/categories/
---

<div class="layout--articles">
  <section class="my-5">
    {% include article-list.html
               articles=site.displayed_en_categories
               type='grid'
               size='md'
               cover_type='background'
    %}
  </section>
</div>
