---
layout:      post
title:       "HTTP Proxy 代理服务器"
date:        "2017-07-20 21:13:31 +0200"
categories:  [weekly, http, proxy, web, translation]
comments:    true
---

最近在看一本很有名的关于HTTP的书籍，叫 « HTTP: The Definitive Guide »，以下是第六章“网络代理”的部分翻译。

网络代理服务器是介于客户端和服务器之间的中间件，它双向地传送HTTP信息。这一章将讲述所有HTTP代理服务器的类型，对于代理服务器属性的特殊支持，以及一些当你使用HTTP代理时将会遇到的比较棘手的行为。

在这一章节里，我们：

- 解释什么是HTTP代理，对比它与网关（web gateway）的差异，展示网络代理服务器是如何被部署的。
- 展示网路代理的一些好处
- 描述网络代理在现实网络中的部署，以及traffic是如何被导入代理服务器的
- （下文没看完，略）

## Web Intermediaries 网络中间件

网络代理服务器是中间人，它在执行HTTP的过程中传达客户的要求。如果没有网络代理，HTTP客户端直接与HTTP的服务端会话。如果有网络代理，HTTP客户端实际与网络代理服务器会话，然后网络代理再将客户端的行为转述给服务端。所以客户端依然完成了HTTP Transaction，不过是通过proxy达成的。

## Why Use Proxies? 为什么使用代理

代理可以做很多有用的事情。他们可以巩固安全、提升性能、以及节省支出。而且因为代理可以看见和触及所有的HTTP traffic，代理可以监测以及修改traffic，从而提供很多增值的网络服务（web services）。以下是一些例子：

**未成年人过滤（Child Filter）。**一些学校用代理来限制某些成人网站的内容，仅将访问权限制于教学网站。

**文档访问控制器（Document access
controller）。**代理服务器可以用作集中化的访问控制中心，控制网络服务器、网络资源，以及追踪访问痕迹。这非常适合在大型企业内部，或者分布式办公室场景下使用。所有的访问控制权都集中在中央代理服务器，这样就不需要让网络服务器（web
server）不断地更新他们分布在各部门、各自独立管理的服务器的访问权限。

**安全防火墙（Security
firewall）。**网络安全工程师经常使用代理服务器来巩固安全防范。此代理服务器只要在网络中单点部署，即可定义所有进出公司的应用层级协议（application-level
protocol）进出许可。它也可以提供挂钩（hook）来仔细地检查（scrutinize）traffic中的细节，可以使用在病毒监测器和email代理里。

**网络缓存（Web
cache）。**代理服务器可以保存热门文件的副本，然后在客户需要的时候直接使用它们。这样一来，就减轻了原服务器（origin
server）的负担：加快了交流速度、减少不必要的以太网通话（Internet communication）。

**反向代理（Surrogate）。**代理服务器可以作为web
server使用，他们也因此被称作surrogates或者反向代理（reverse
procies）。它们可以接受真正的web server请求，但是它们与web
servers不同的是，它们可能会再与其他服务器建立另一个communication，以获取客户请求所需的资源。反向代理可以给web
servers提速，因为公共的资源都放在反向代理里面了（无需再询问web
servers）。在这样的环境（configuration）下，反向代理也被称作服务器加速器（server
accelerators）。反向代理也可以与content-routing
functionality协同使用，来创造一个分布式的、on-demand的replicated content网络。

**内容路由器（Content
Router）。**代理服务器也可以作为“内容路由器”，根据Internet
traffic和内容的类型，把客户请求导向特定的web
servers。内容路由器也可以被用来实现服务层级（service-level）的offerings。比如说，如果用户购买了加速服务，那么内容服务器可以把HTTP请求导向临近的replica
caches来提高加载速度；如果用户的请求是需要登陆验证的，那么内容服务器也可以把请求导向过滤型代理（filtering
proxy）来验证登陆信息。很多有趣的服务都可以通过内容路由器实现。

**转码器（Transcoder）。**代理服务器可以在消息发送到客户前，修改HTTP实体信息（body）的格式（format）。这样透明的数据格式转换称为“转码”（transcoding）。转码代理可以将途经的GIF图片转化成JPEG，以减少网络流量压力。图片也可以被压缩、降低颜色密度，使得它们能在电视上被显示。同理地，文档文件（text
files）
可以被压缩，允许Internet接入的网页可以被生成简介等。转码器甚至可以把一个语言的网页转换成另一个语言，例如它可以将英语的网页翻译成西班牙语。它也可以重新排版HTML页面，使它们能以基本的文字排版显示、正确地在手机显示等。

**匿名化代理（Anonymizer）。**匿名化代理通过动态移除HTTP信息中具有识别性的特征，从而提供高度的隐私和隐匿性，比如客户端的IP地址、“发件人”响应头（From
header）、“引用”响应头（Referer header）、Cookies、URI中的Session
ID等。具体地说，匿名化代理通过改变以下的信息来增强用户的隐私度：

- 将用户的电脑名称和操作系统型号从`User-Agent` header 中移除
- 移除`From` header来保护用户的Email不被泄漏
- 移除`Referer` header来掩盖用户已经访问过的网址
- 移除`Cookie` headers来防止网站使用其在用户cookie中植入的用户识别数据（profiling and
  identity data）。

Proxy真是个神奇的东西！希望看完我的翻译，让你对Proxy服务器也有了基本的认识。请注意本文翻译的书籍是2002年写的，至今已经有15年了，所以有些内容可能不再是现在的技术。
