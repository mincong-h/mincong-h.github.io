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

<div class="article__content">
  <h1>About Me</h1>
  <p>Hi, I am a software engineer at <a href="https://vertesiahq.com/" target="_blank">Vertesia</a>, helping companies to automate and augment their business processes with LLMs. I have 11 years of experience working on different projects, mainly in France. My blog posts are bits and pieces of my tech journey. Most of them are related to software development and operations for a SaaS business. Hope you enjoy them!</p>
</div>

<div class="layout--articles">
  <section class="my-5">
    <div class="article-list grid grid--p-3">
      <div class="cell cell--12 cell--md-6 cell--lg-4">
        <div class="card card--flat">
          <div class="card__content">
            <header>
              <h2 class="card__header">Software Development</h2>
            </header>
            <p>Developing tailored software solutions that meet your unique business requirements in Java, Go, Typescript, or Python.</p>
          </div>
        </div>
      </div>
      <div class="cell cell--12 cell--md-6 cell--lg-4">
        <div class="card card--flat">
          <div class="card__content">
            <header>
              <h2 class="card__header">Database Management</h2>
            </header>
            <p>Expert management and optimization of databases, with a focus on Elasticsearch and MongoDB. I ensure your data is secure, accessible, and performant.</p>
          </div>
        </div>
      </div>
      <div class="cell cell--12 cell--md-6 cell--lg-4">
        <div class="card card--flat">
          <div class="card__content">
            <header>
              <h2 class="card__header">CI/CD</h2>
            </header>
            <p>Automate the process of software lifecycle development with GitHub, GitLab or other solutions.</p>
          </div>
        </div>
      </div>
      <div class="cell cell--12 cell--md-6 cell--lg-4">
        <div class="card card--flat">
          <div class="card__content">
            <header>
              <h2 class="card__header">Infrastructure</h2>
            </header>
            <p>Design and implement cloud-based infrastructure that scales with your business. I am a Certified Kubernetes Administrator (CKA) and have experience with AWS, GCP, Azure, and Alibaba Cloud.</p>
          </div>
        </div>
      </div>
      <div class="cell cell--12 cell--md-6 cell--lg-4">
        <div class="card card--flat">
          <div class="card__content">
            <header>
              <h2 class="card__header">SRE</h2>
            </header>
            <p>Ensure the site reliability of your system. Design and implement metrics, alerts, dashboards, logs, APM, and other technologies to observe your system. Participate in the 24/7 on-call, incident commanding, and post-mortem.</p>
          </div>
        </div>
      </div>
      <div class="cell cell--12 cell--md-6 cell--lg-4">
        <div class="card card--flat">
          <div class="card__content">
            <header>
              <h2 class="card__header">Documentation</h2>
            </header>
            <p>Design and write documentation for knowledge sharing and operational guidelines for the whole team, from newcomers, seasoned participants, and core team members.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<div class="article__content">
  <h2>Projects</h2>
  <p>Here are some projects that I participated in the past.</p>
</div>

<div class="layout--articles">
  <section class="my-5">
    {%- include article-list.html
            articles=site.en_projects
            type='grid'
            size='md'
            cover_type='background'
            limit='6'
            with_date='true'
    -%}
  </section>
</div>

{%- assign _highlighted_categories = 'elasticsearch:Elasticsearch, temporal:Automation, java-core:Java, java-testing:Testing, java-concurrency:Concurrency, rest:RESTful APIs, git:Git' | split: ', ' -%}

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
