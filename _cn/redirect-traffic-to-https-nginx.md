---
article_num: 179
layout:              post
title:               使用 Nginx 将 HTTP 重定向到 HTTPS
subtitle:            >
    实现 HTTPS，其实真的不难！

lang:                zh
date:                2021-06-21 22:03:52 +0200
categories:          [devops]
tags:                [nginx]
comments:            true
excerpt:             >
    实现 HTTPS，其实真的不难！

image:               /assets/bg-pablo-garcia-saldana-lPQIndZz8Mo-unsplash.jpg
cover:               /assets/bg-pablo-garcia-saldana-lPQIndZz8Mo-unsplash.jpg
redirect_from:
  - /2021/06/21/redirect-traffic-to-https-nginx/
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
ads:                 none
---

## 前言

保证网站的安全是一件很重要的事情，其中一个重要的手段就是将网络流量加密，把 HTTP 请求重定向到 HTTPS 去。这篇文章跟大家介绍如何在 Nginx 中实现从 HTTP 到 HTTPS 的重定向。

阅读本文后，你会明白：

- 如何配置重定向？
- 如何申请 SSL 证书？
- 如何配置 SSL 证书？
- 如何验证？

事不宜迟，让我们马上开始吧！

## 配置重定向

HTTP 流量在 80 号端口被监听。这里我们将全部 HTTP 的流量都[永久重定向](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301)到 HTTPS（301）。重定向时，保留原有的主机（host）和请求 URI。

```conf
server {
    listen       80;
    server_name  _;
    return       301 https://$host$request_uri;
}
```

注意，这里的服务器名字（server name）是个通配符`_`：也就是无论 URL 中包含什么域名，当请求到达 Nginx 服务器以后，都会被重定向到 HTTPS。比如说，无论是 <http://sunnytj.info> 还是 <http://www.sunnytj.info>，都会被重定向到它们相应的 HTTPS 链接。

## 申请 SSL 证书

这里我使用的是免费 [Let's Encrypt](https://letsencrypt.org/) 服务和 [Certbot](https://certbot.eff.org/)。Certbot 上面可以选择你使用的软件（Apache, Nginx, ...）以及操作系统（Ubuntu, Debian, ...）。选择以后网站会自动产生相应的命令，以帮助你完成 SSL 证书的申请和配置。这两个网站的介绍都非常完善，这里不再赘述。我自己的情况用的是：

```sh
# Install Certbot
sudo snap install --classic certbot

# Prepare the Certbot command
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get and install your certificates in interactive mode
sudo certbot --nginx

# Test automatic renewal
sudo certbot renew --dry-run
```

请不要照抄我的命令，务必到官网生成符合你实际情况的命令。

## 配置 SSL 证书

然后在配置中创造另一个 server block，负责监听 443 号端口，也就是 HTTPS 的流量。这个 block 要加上加密时需要的 SSL 证书存放的地址以及 SSL 密匙存放的地址。如果你选择了证书被 certbot 管理的话，配置文件应该长成这样，地址后面有 “managed by Certbot” 的注释：

```conf
server {
    listen               443 ssl;
    server_name          sunnytj.info www.sunnytj.info;
    ssl_certificate      /path/to/fullchain.pem; # managed by Certbot
    ssl_certificate_key  /path/to/privkey.pem; # managed by Certbot
    ...
}
```

## 验证

使用 curl 验证：选项 -I 只显示响应头、选项 -L 跟随重定向。我们可以看到第一个请求返回 301 因为资源被永久重定向到位置 <https://sunnytj.info/>。而第二个请求返回 200 OK 一切正常。

```
➜  ~ curl -IL http://sunnytj.info
HTTP/1.1 301 Moved Permanently
Server: nginx/1.20.0
Date: Tue, 22 Jun 2021 19:18:20 GMT
Content-Type: text/html
Content-Length: 169
Connection: keep-alive
Location: https://sunnytj.info/

HTTP/1.1 200 OK
Server: nginx/1.20.0
Date: Tue, 22 Jun 2021 19:18:21 GMT
Content-Type: text/html
Content-Length: 517
Connection: keep-alive
Last-Modified: Sun, 20 Jun 2021 15:39:07 GMT
ETag: "60cf611b-205"
Accept-Ranges: bytes
```

使用网页验证：打开网页并点击链接旁边的锁图案 🔒。

![SSL证书](/assets/20210622-certificate.png)

## 扩展

如何从这篇文章拓展出去？

- 访问 [Nginx 官方文档](https://nginx.org/en/docs/)了解更多关于 Nginx 的配置
- 访问 [Certbot 官网](https://certbot.eff.org/)了解更多关于使用它管理 SSL 证书的资料

## 结论

在本文中，我们看到了如何在 Nginx 中配置从 HTTP 到 HTTPS 的重定向、如何通过 Certbot 申请 SSL 证书、如何验证网站能够正常运行、以及如何从这篇文章扩展出去。希望这篇文章能够给你带来一些思考。如果你有兴趣了解更多的咨询，欢迎关注我的 [GitHub](https://github.com/mincong-h) 或者 [Twitter](https://twitter.com/mincong_h)。谢谢大家，下次见！

写作不易，希望大家点个赞、点个在看支持一下，谢谢(花)
