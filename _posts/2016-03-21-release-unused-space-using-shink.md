---
layout: post
title:  "Release unused space using Shrink"
date:   2016-03-21 09:46:00 +0100
categories: sql-server
---

Database's size can be optimized using Shrink command. It helps to release
unused space. There're 2 ways to do it : by GUI or by T-SQL.

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
