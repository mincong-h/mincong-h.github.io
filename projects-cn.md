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

从开始写博客到现在有两年了，点击量却一直很低。为了提高博客的知名度以及每篇博文的点击率，我决定对我的个人博客进行 Google 搜索排名优化。其中涉及到对 Jekyll 的理解、添加 robots.txt 和 sitemap 等网络蜘蛛文件、收集用户的搜索关键词、改善文章标题与内容、添加 schemas 等。详情见我的博文：[SEO:
Improve Blog Ranking in Google
Search](https://mincong-h.github.io/2018/07/21/improve-the-search-presence/)

&#35;  | 描述
:----- | :----------
日期   | 2018年7月
规模   | 小
类型   | 个人项目
标签   | `jekyll`, `seo`, `google-search-console`

## 个人理财本

个人理财本是一个小型的 Python 理财应用：分为日常理财、房产估算两部分。对于日常理财部分，它收集你从网上银行下载的交易记录，并整合成一个迷你的数据库。整合结果通过 Matplotlib 和 Jupyter
Notebook 做数据展示。对于房产估算部分，它计算一个特定房产的回报率以及在不同升值率下未来20年价格曲线。

&#35;  | 描述
:----- | :----------
日期   | 2018年4月至今
规模   | 中
类型   | 个人项目
标签   | `finance`, `python`, `matplotlib`

## Gitty服务器

Gitty 服务器是一个基于 Java 的轻量级 Git 服务器。它的两大优点是快速和稳定：开机速度小于1秒，能轻松托管1000个以上的 Git 仓库。它由两个组件构成：Git 和 RESTful
API。Git 组件是基于 [JGit HTTP Server](https://github.com/eclipse/jgit/tree/master/org.eclipse.jgit.http.server) 实现的、API 组件是基于 Jersey 1.0（JAX-RS
1.0）实现的，两个组件都存放在 Jetty 服务器内。作为 Git 服务器，Gitty 支持所有的
Git 操作，还具有特定的检测功能。我在开发过程中写过一些关于 Git
的文章，大家有兴趣可以看一看：<https://mincong-h.github.io/tags/git/>

&#35;  | 描述
:----- | :----------
日期   | 2018年3月至2018年6月
规模   | 中
类型   | 公司项目
标签   | `git`, `java`, `jgit`, `jax-rs`, `jersey`
