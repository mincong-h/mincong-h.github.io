---
layout:     page
title:      关于作者
lang:       zh
permalink:  /cn/about/
---

<p align="center">
  <img
    src="https://www.gravatar.com/avatar/e9760ae831cb65cf1b7453c98701aae1?s=100"
    alt="Mincong Huang's Gravatar" />
</p>

你好，欢迎来到我的博客！我是一名软件工程师，目前任职于 [Datadog](https://www.datadoghq.com/)。我在工作之余写点博客，记录技术路途上的点点滴滴。主要关注 Elasticsearch 与 Java 后端开发。希望你喜欢它们！我的文章仅代表我自己的观点，并不代表公司。该博客由 [Jekyll](https://jekyllrb.com/) 提供支持，一个简单的、可识别博客的静态站点解决方案。

<div class="layout--articles">
  <section class="my-5">
    <header><h2 id="categories">文章类别</h2></header>
    {% include article-list.html
               articles=site.displayed_cn_categories
               type='grid'
               size='sm'
               cover_type='background'
    %}
  </section>
</div>