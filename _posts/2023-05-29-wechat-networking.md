---
article_num:         210
layout:              post
type:                classic
title:               What happens in networking when using WeChat?
subtitle:            >
    Given one sentence to expand the title or explain why this article may interest your readers.

lang:                en
date:                2023-05-29 22:04:53 +0200
categories:          [java-core]
tags:                [network]
ads_tags:            []
comments:            true
excerpt:             >
    TODO
image:               /assets/bg-giulia-may-hclMkLbYE_M-unsplash.jpg
cover:               /assets/bg-giulia-may-hclMkLbYE_M-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

If you are born in China or live there, you must be familiar with WeChat.
WeChat (微信) is a Chinese instant messaging, social media, and mobile payment
app developed by Tencent. But do you ever wonder: what happens when you use
WeChat? What kinds of interactions it has with the server? What are the
information stored in your device? Why sometime is it slow to use WeChat as an
overseas Chinese? In this article, we are going to explore these questions, with
a main focus on the networking part. I am going to use my personal account as a
test, and see what happens. Note that I am currently living in Paris, France. So
the interactions may be different from yours.

After reading this article, you will understand what are the main websites used
by WeChat, how is a typical route of an HTTP request, how does WeChat store the
information in MacOS, etc. Hopefully, it will allow you to learn a bit more
about network troubleshooting and Tencent Cloud as well. Now, let's get started!

## Environment

The test is made with the following hardware and software:

Item | Comment
:--- | :---
Apple MacBook Pro (13-inch, 2019) | The machine running the test.
WeChat MacOS (3.8.0) | The target application to be tested.
OWASP Zed Attack Proxy (2.12.0) | Mainly used for intercepting HTTP traffic
Wireshark - Network Protocol Analyzer (4.0.6) | Mainly used for intercepting non-HTTP traffic, especially the mmTLS protocol
`traceroute` (1.4a12+Darwin) | Mainly used for tracing the routes between two hosts, the client and the server
`host` (9.10.6) | Mainly used for understand the DNS settings of a given domain name
Ip2Location (<https://www.ip2location.com>) | Mainly used for understand the information of the server for a given IP address

## Set Up ZAP

To understand what kinds of interactions it has with the server, we need to intercept the traffic. Here, I am using the popular OWASP Zed Attack Proxy (ZAP) to do that. I am doing it by connecting my WeChat application to the ZAP proxy running in localhost on port 8080.

ZAP is what is known as a "man-in-the-middle proxy", which stands between the client and the server so that it can intercept and inspect the messages sent between the client and the server. The relationship can be expressed as follows.

```mermaid
flowchart LR
  WeChat-->ZAP
  ZAP-->Server
```

 However, by default, it only intercepts HTTP traffic and does not intercept the HTTPS request because HTTPS is designed to provide secure communication between both sides. When a client establises an HTTPS connection with a server, it initiates the SSL/TLS handshake directly and establish an encrypted connection. Therefore, the proxy cannot intercept or modify the traffic. To make it possible to intercept HTTPS traffic, I configured ZAP as a TLS termination proxy by generating a root CA and importing it into the system keychain of MacOS. Then, I configured the proxies at system level so that all traffic will be intercepted by ZAP, including WeChat.

 ![Set up HTTP proxy and HTTPS proxy](/assets/2023-05-29_wechat-networking/system-network-proxies.png)

Now if I perform some actions in WeChat, such as refreshing the moments (朋友圈), visiting articles in the Official Accounts (公众号), or searching some keywords in the search bar (搜一搜), etc. I can see many requests being intercepted:

<img src="/assets/2023-05-29_wechat-networking/wechat-domains.png" alt="WeChat domains" style="max-width: 400px"/>

You can guess the purpose of some of those domains: the ones having the keyword "mp" probably means WeChat Mini Program (小程序), those having the keyword "channels" probably means WeChat Channels (视频号). Also, I think `qpic` means "QQ Picture" and `qlogo` means "QQ Logo", which stores the pictures and logos as part of the Tencent Group (formerly QQ). There are many others to explore, but since it's not the purpose of the article to understand all the domains, I am going to just stop here.

## Traceroute

Now we know the global landscape of all the domains. Let's focus on one HTTP request, and see how it reaches to the destination. Currently, I live in Paris, so I want to see how WeChat sends my request to the server, where are the servers, how complex the networking is. To answer these questions, I am going to use the `traceroute` command. This is a computer network diagnostic command for displaying posible routes (paths) and measure transit delays of packets across an Intern Protocol (IP) network.

Below is a `traceroute` command that I made to connect to the `vweixinthumb.tc.qq.com` website.

```
➜  ~ traceroute vweixinthumb.tc.qq.com
traceroute: Warning: vweixinthumb.tc.qq.com has multiple addresses; using 101.33.110.25
traceroute to socwxsns.video.qq.com (101.33.110.25), 64 hops max, 52 byte packets
 1  192.168.1.1 (192.168.1.1)  4.393 ms  3.348 ms  4.066 ms
 2  80.10.253.29 (80.10.253.29)  8.648 ms  5.384 ms  4.795 ms
 3  lag-10.nenly00z.rbci.orange.net (80.10.154.194)  8.486 ms  4.518 ms  4.631 ms
 4  ae91-0.ncidf304.rbci.orange.net (193.253.82.102)  5.663 ms  7.221 ms  5.479 ms
 5  ae42-0.niidf302.rbci.orange.net (193.252.159.153)  5.117 ms  6.203 ms  4.632 ms
 6  ae40-0.niidf301.rbci.orange.net (193.252.103.37)  5.207 ms  5.828 ms  5.379 ms
 7  81.253.184.6 (81.253.184.6)  5.208 ms  5.443 ms  5.148 ms
 8  * tatateleglobe-8.gw.opentransit.net (193.251.251.20)  6.442 ms *
 9  * * if-ae-39-2.tcore1.pvu-paris.as6453.net (80.231.246.6)  239.959 ms
10  * * *
11  if-be-7-2.ecore1.emrs2-marseille.as6453.net (195.219.174.8)  329.872 ms  296.726 ms *
12  * * *
13  if-ae-2-2.tcore2.svw-singapore.as6453.net (180.87.12.2)  364.041 ms
	if-be-45-2.ecore2.esin4-singapore.as6453.net (180.87.108.4)  236.217 ms  308.058 ms
14  11.28.188.149 (11.28.188.149)  306.029 ms
	11.28.189.87 (11.28.189.87)  333.742 ms
	11.28.189.85 (11.28.189.85)  377.984 ms
15  * * *
16  * * *
17  * * *
```

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
