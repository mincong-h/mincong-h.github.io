---
layout:      page
title:       项目总结
menu_label:  Projects（中文）
permalink:   /projects-cn/
comments:    true
---

Hi，大家好，我是小聪。这里是一些我做过的个人项目与公司项目。

对于项目规模，我的定义是：
- 小：20小时以下
- 中：20小时至100小时
- 大：100小时以上

## 个人博客搜索优化

从开始写博客到现在有两年了，点击量却一直很低。为了提高博客的知名度以及每篇博文的点击率，我决定对我的个人博客进行Google搜索排名优化。其中涉及到对Jekyll的理解、添加robots.txt和sitemap等网络蜘蛛文件、收集用户的搜索关键词、改善文章标题与内容、添加schemas等。详情见我的博文：[SEO:
Improve Blog Ranking in Google
Search](https://mincong-h.github.io/2018/07/21/improve-the-search-presence/)

&#35;  | 描述
:----- | :----------
日期   | 2018年7月
规模   | 小
类型   | 个人项目
标签   | `jekyll`, `seo`, `google-search-console`

## Gitty服务器

Gitty服务器是一个基于Java的轻量级Git服务器。它的两大优点是快速和稳定：开机速度小于1秒，能轻松托管1000个以上的Git仓库。它由两个组件构成：Git和RESTful
API。Git组件是基于[JGit HTTP Server](https://github.com/eclipse/jgit/tree/master/org.eclipse.jgit.http.server)实现的、API组件是基于Jersey 1.0（JAX-RS
1.0）实现的，两个组件都存放在Jetty服务器内。作为Git服务器，Gitty支持所有的Git操作，还具有特定的检测功能。

&#35;  | 描述
:----- | :----------
日期   | 2018三月至2018六月
规模   | 中
类型   | 公司项目
标签   | `git`, `java`, `jgit`, `jax-rs`, `jersey`
