---
layout: post
title:  "Move a table into a schema in T-SQL"
date:   2016-03-24 10:11:00 +0100
categories: [sql-server]
tags:       [sql-server]
redirect_from:
  - /sql-server/2016/03/24/move-table-into-schema/
---

{% highlight sql %}
ALTER SCHEMA TargetSchema 
    TRANSFER SourceSchema.TableName;
{% endhighlight %}
