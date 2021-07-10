---
layout:     page
title:      分类
lang:       zh
permalink:  /cn/categories/
---

<div class="layout--articles">
  <section class="my-5">
    {% include article-list.html
               articles=site.displayed_cn_categories
               type='grid'
               size='md'
               cover_type='background'
    %}
  </section>
</div>
