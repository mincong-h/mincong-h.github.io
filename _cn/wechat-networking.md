---
article_num:         210
layout:              post
type:                classic
title:               微信背后的网络运作
subtitle:            >
    探索路由、DNS、ICP 许可证等等

lang:                zh
date:                2023-05-29 22:04:54 +0200
categories:          [java-core]
tags:                [network]
ads_tags:            []
comments:            true
excerpt:             >
    Try to limit at 140 character, two lines: (80-4) *2 = 152

image:               /assets/bg-giulia-may-hclMkLbYE_M-unsplash.jpg
cover:               /assets/bg-giulia-may-hclMkLbYE_M-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
ads:                 none
---

<!--
  Replace asset link with following on Chinese Platforms:
  https://github.com/mincong-h/mincong-h.github.io/raw/master/
 -->

## 前言

如果你在中国出生或居住，那么你对微信一定不陌生。微信是一款由腾讯开发的中国即时通讯、社交媒体和移动支付应用。但你是否曾经想过：使用微信时，网络层面会发生什么？它与服务器之间有哪些交互？为什么作为海外华人，使用微信有时会很慢？在本文中，我们将探讨这些问题，重点关注网络部分。在这篇文章中，我将使用我的个人账户进行测试，并记录观察到的现象。

阅读本文后，你将了解到微信使用的主要网站，HTTP 请求的典型路由是怎样的，中国大陆和海外的 DNS 配置差异，腾讯的 ICP 许可证以及他们的专有协议 mmTLS。希望这能帮助你更多地了解网络故障排除和更多地了解腾讯云。需要注意的是，我目前居住在法国巴黎，因此观察到的情况可能与你的情况有所不同。现在，让我们开始吧！

## 环境

测试使用以下硬件和软件进行：

软件/硬件 | 评论
:--- | :---
Apple MacBook Pro (13-inch, 2019) | 运行测试的计算机
WeChat MacOS (3.8.0) | 待测试的目标应用程序
OWASP Zed Attack Proxy (2.12.0) | 主要用于拦截 HTTP 流量
Wireshark - Network Protocol Analyzer (4.0.6) | 主要用于拦截非 HTTP 流量，特别是 mmTLS 协议
`traceroute` (1.4a12+Darwin) | 主要用于追踪客户端和服务器之间的路由
`host` (9.10.6) | 主要用于了解域名的 DNS 设置
Ip2Location (<https://www.ip2location.com>) | 主要用于了解 IP 地址的服务器信息

## 结论

在本文中，我们看到了。。。最后，我们还简要讨论了其他的场景，并且分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你的系统变得。。。如果你有兴趣了解更多的资讯，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h "GitHub") 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

<!--
 WeChat:
   原创不易，希望大家点个赞、点个在看支持一下，谢谢！
   ![](https://mincong.io/assets/wechat-QR-code.jpg)

 CSDN:
   ![扫码关注](https://img-blog.csdnimg.cn/img_convert/f07c6cc9272c721180bad20c599e4ff7.png#pic_center =600x333)
-->
