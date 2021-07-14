---
layout:     post
title:      "Release unused space using Shrink"
lang:       en
date:       2016-03-21 09:46:00 +0100
categories: [tech]
tags:       [sql-server]
excerpt:    >
  Database's size can be optimized using Shrink command. It helps to release
  unused space. There're 2 ways to do it: via GUI or via T-SQL.
redirect_from:
  - /sql-server/2016/03/21/release-unused-space-using-shink/
comments:   false
permalink:  /2016/03/21/release-unused-space-using-shink/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Database's size can be optimized using Shrink command. It helps to release
unused space. There're 2 ways to do it: via GUI or via T-SQL.

__By GUI__

* Connect to SSMS
* Select target database
* Right click > Tasks > Shrink > Files (or Database)

__By T-SQL__

{% highlight sql %}
USE [your_database]
GO
DBCC SHRINKDATABASE(N'your_database')
GO
{% endhighlight %}

Sometimes SSMS estimates that there's only few avaible free space (less than 1%)
and the shrink is not interesting. However, it might be a doubtful estimation.
I've gained more than 500 Mb instead of 1 Mb. So just take a try.
