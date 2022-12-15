---
article_num: 3
layout: post
title:  "Run SSIS package using 32-bit drivers"
lang:                en
date:   2016-04-05 13:13:00 +0100
categories: [tech]
tags:       [sql-server]
coments:    false
permalink:  /2016/04/05/run-ssis-package-using-32-bit-drivers/
redirect_from:
  - /sql-server/2016/04/05/run-ssis-package-using-32-bit-drivers/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today, when I used an OLD DB source to connect a MS Access database, I met the 
following message error during debug :

> [Connection manager "\\DVDSIB46\d$\DVI_Datas\Source\Dise\EXTRACTION DONNEES 
MOBILITE.accdb"] Error: The requested OLE DB provider Microsoft.ACE.OLEDB.12.0 
is not registered. If the 64-bit driver is not installed, run the package in 
32-bit mode. Error code: 0x00000000.
An OLE DB record is available.  Source: "Microsoft OLE DB Service Components"  
Hresult: 0x80040154  Description: "Class not registered".

The message suggests me to use 32-bit driver because the driver of 64-bit is not 
available. This is caused by the MS Access provider. 

In order to resolve this problem, I configured the SSIS pakcages to run by
referencing the 32-bit dlls : 

<!--more-->

* Right click on _Project solution_
* Click _Properties_
* Go to _Configuration Properties_ > _Debugging_
* Set `Run64BitRunTime` to `False`

<img src="{{ site.url }}/assets/20160405-solution-properties.png" width="500" alt="SSIS package properties">

Here's the result :

<img src="{{ site.url }}/assets/20160405-result.png" width="500" alt="SSIS execution result in Visual Studio">

The above configuration does make SSIS run in 32 bit runtime in debug mode, but for production environment, we need 
to configure the execution step in 32-bit in Job Step Properties:

<img src="{{ site.url }}/assets/20160405-solution-properties-2.png" width="500" alt="SSIS execution result in SQL Server">

However, I doubt whether we should set the whole project to run under 32-bit or
should we just install the MS Access driver in 64-bit ? But is it available for 
SSDT ?
