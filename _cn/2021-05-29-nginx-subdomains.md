---
layout:              post
title:               在 Nginx 中配置二级域名
subtitle:            >
    如何在一台机器上部署多个网站？

lang:                zh
date:                2021-05-29 09:46:04 +0200
date_modified:       2021-07-04 09:00:00 +0200
categories:          [devops]
tags:                [nginx]
comments:            true
excerpt:             >
    如何在一台机器上部署多个网站？

image:               /assets/bg-aaron-burden-GFpxQ2ZyNc0-unsplash.jpg
cover:               /assets/bg-aaron-burden-GFpxQ2ZyNc0-unsplash.jpg
redirect_from:
  - /2021/05/29/nginx-subdomains/
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

这两天在研究如何通过 Nginx 来配置二级域名（subdomains），觉得挺有意思的，想跟大家分享一下。我在一个机器部署多个子域名的原因很简单，就是因为：穷。。。没钱买服务器，于是想把多个服务部署在同一台机器上面，通过 Nginx 来实现。阅读本文后，你会明白：

- 如何在阿里云配置关于 DNS 的“域名解析”
- 如何在 Nginx 中配置 HTTP 的重定向（redirection）
- 如何在 Nginx 中配置部署多个子域名（subdomains）
- 如何在后续阶段，部署新的子域名

在开始之前，先明确一下目的。文章的目的是造出三个关于吉米数据（<https://jimidata.fr>）的子域名，然后让它们都指向同一个服务器：

| URL                        | IP 地址         | 描述         |
| :------------------------- | :-------------- | :----------- |
| <https://www.jimidata.fr>  | `47.243.61.237` | 静态网页服务 |
| <https://api.jimidata.fr>  | `47.243.61.237` | API 服务     |
| <https://blog.jimidata.fr> | `47.243.61.237` | 博客服务     |

吉米数据是一个没什么实质内容的网站，只是为了练手用的。下面就让我们开始吧！

## 配置域名解析

第一步在阿里云的“云解析 DNS / 域名解析 / 解析设置”中添加新的记录。这里以`api.jimidata.fr`为例：我们选择一个 A 记录，也就是将域名指向一个 IPV4 地址；它的解析路线根据阿里云默认线路实现；记录值是我的机器的名字；缓存最长存活时间十分钟。具体配置如下：

![阿里云：在解析设置中添加记录](/assets/20210529-add-new-record.png)

用同样的方法配置其他的几个记录，最后生成结果如下：

![阿里云：解析列表](/assets/20210529-record-list.png)

可以看到，除了 HTTPS 的证书验证以外，其他的主机记录全部指向同一台机器，也就是我的服务器`47.243.61.237`。

## 配置 HTTP 重定向

第二步是 HTTP 重定向（redireciton）。当用户以 HTTP 协议访问的时候，自动导向 HTTPS 保证安全。

```conf
server {
    listen       80;
    server_name  _;
    return       301 https://$host$request_uri;
}
```

解释一下上面的配置：

- `listen 80` 这个命令告诉 Nginx 要监听 80 号端口。所有 HTTP 都是通过 80 号端口抵达的。
- `server_name _` 这个命令告诉 Nginx 无论什么 hostname 都会被匹配，无论是 `www.jimidata.fr`、`api.jimidata.fr`、`blog.jimidata.fr` 还是别的 host。
- `return 301 https://$host$request_uri` 把用户的 HTTP 请求永久重定向（[301 Moved Permanently](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)）到 HTTPS 那边，并且保证链接的剩余部分不变：host 以及 URI 部分都是一样的。唯一改变的就是把 HTTP 变成了 HTTPS。

整个 Nginx 只需要这一个服务器（Server block）监听 80 号端口就可以了。因为它对所有的 hostname 都是匹配的。

## 配置子域名

下一步就是在 Nginx 中配置三个子域名相对应的服务器：

```conf
ssl_certificate      /path/to/fullchain.cer;
ssl_certificate_key  /path/to/cert.key;

server {
    listen       443 ssl;
    server_name  www.jimidata.fr;
    root         /app/jimi/www.jimidata.fr;
    index        index.html;
}

server {
    listen       443 ssl;
    server_name  api.jimidata.fr;
    root         /app/jimi/api.jimidata.fr;
    index        index.html;
}

server {
    listen       443 ssl;
    server_name  blog.jimidata.fr;
    root         /app/jimi/blog.jimidata.fr;
    index        index.html;
}
```

解释一下上面的配置：

- `ssl_certificate /path/to/fullchain.cer` 是 SSL 证书存放的地址。
- `ssl_certificate_key /path/to/cert.key` 是 SSL 密匙存放的地址。
- `listen 443 ssl` 监听 443 号端口，也就是 HTTPS 端口。
- `server_name` 填写相应的子域名，不需要加 `https://` 的前缀。填写这个使得 Nginx 可以正确匹配不同子域的请求。
- `root /app/jimi/blog.jimidata.fr` 指示这个子域名所对应的文件夹根目录的位置。
- `index index.html` 指示显示主页时所使用的文件名。

下一个问题是：上面所说的配置，它应该放在哪里呢？其实它的存放位置有很多选择，你可以：

- 放在主配置文件 `/etc/nginx/nginx.conf` 里面的 `http` block
- 放在配置文件夹 `/etc/nginx/conf.d/` 里面，但是我觉得这个文件夹主要是放公共的配置文件的，放这里虽然方便，但似乎不太妥当。
- 放在文件夹 `/etc/nginx/sites-available/` 里面。每一个子域网站用一个独立的文件存储，然后再文件夹 `/etc/nginx/site-enabled` 创建快捷方式（symlink）激活这些子域网站。

没准还有别的配置方法，希望大家留言分享哈。配置完成后，重启 Nginx 服务器来激活这些配置：

```sh
nginx -s reload
```

## 验证结果

打开网站来验证一下结果：

![Home Service](/assets/20210529-www.png)

![API Service](/assets/20210529-api.png)

![Blog Service](/assets/20210529-blog.png)

再检查一下 HTTP 到 HTTPS 的重定向：

```
➜  ~ curl -iL http://jimidata.fr
HTTP/1.1 301 Moved Permanently
Server: nginx/1.20.0
Date: Sat, 29 May 2021 14:13:46 GMT
Content-Type: text/html
Content-Length: 169
Connection: keep-alive
Location: https://jimidata.fr/

HTTP/1.1 200 OK
Server: nginx/1.20.0
Date: Sat, 29 May 2021 14:13:48 GMT
Content-Type: text/html
Content-Length: 111
Last-Modified: Sat, 29 May 2021 07:30:14 GMT
Connection: keep-alive
ETag: "60b1ed86-6f"
Accept-Ranges: bytes

<!DOCTYPE html>
<html>
<head>
    <title>Jimi</title>
</head>
<body>
    <h1>Home Service</h1>
</body>
</html>
```

你可以看见 curl 一共发送了两个请求：第一个请求被永久地重导向（301 Moved Permanently）到 HTTPS 版的网页；然后第二个请求成功（200 OK）并显示网页。

## 增加新的子域名

当业务增长的时候，你可能需要在后续阶段部署新的子域名。如果你使用阿里云的话，后续部署需要以下几个步骤：

1. 部署你的应用
2. 修改 Nginx 配置
3. 添加新的子域名到阿里云的云解析 DNS
4. 更新 SSL 证书

这里用另一个网站“阳光特教”举例。

第一步部署新的应用，比如：

```sh
docker run \
    --name sunny-static \
    --publish 18000:80 \
    --rm \
    --detach \
    --volume "${SUNNY_STATIC_PATH}:/usr/share/nginx/html:ro" \
    "$image"
```

第二步，修改 Nginx 配置。把新的应用注册到反向代理（reverse proxy）：

```conf
server {
    listen               443 ssl;
    server_name          static.sunnytj.info;

    location / {
        proxy_pass       http://localhost:18000;
        # ...
    }
    # ...
}
```

第三步像上文一样在阿里云平台上增加新的子域名。填写记录类型、主机记录、解析线路、记录值、以及缓存有效期（TTL）。

![增加新的子域名到阿里云的云解析DNS](/assets/20210529-create-subdomain-aliyun-DNS.png)

第四步更新 SSL 证书。如果使用 Certbot 管理 SSL 证书的话，推荐使用它的命令行来操作。Certbot 会自动检测你已经部署在 Nginx 的域名，并请求你确认哪个域名需要激活 HTTPS：

```sh
sudo certbot --nginx
```

```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: sunnytj.info
2: admin.sunnytj.info
3: api.sunnytj.info
4: static.sunnytj.info
5: www.sunnytj.info
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 4
```

这里我选择激活第 4 个域名 `static.sunnytj.info`。确认以后 Certbot 向 Let's Encrypt 申请新的证书。

```
Requesting a certificate for static.sunnytj.info
...
```

结束以后，新的域名就成功地被添加以及可以安全地通过 HTTPS 访问了。下面测试一下：

```
curl https://static.sunnytj.info/index.txt
Welcome to Sunny!
```

成功了，oh yeah！

## 扩展

如何从这篇文章中扩展出去？

- 如果想知道关于给 Nginx 配置 HTTPS 服务器的更多详情，访问官网页面：[NGINX SSL Termination](https://docs.nginx.com/nginx/admin-guide/security-controls/terminating-ssl-http/)
- 看完了这篇文章还是不懂怎么配置二级域名？可以翻墙看看 Coding with Glove 的 YouTube 视频 [Using Nginx to Host Multiple Websites on One Server](https://youtu.be/b6YKx72XXQM)

## 结论

在本文中，我们看到了如何通过 Nginx 来配置二级域名：如何在阿里云配置关于 DNS 的域名解析；如何在 Nginx 中配置 HTTP 到 HTTPS 的重定向；如何在 Nginx 中配置多个子域名；如何在后续阶段添加新的子域名。最后，我们还分享了一些资源，让大家可以从这篇文章拓展出去。希望这篇文章能够解决你关于 Nginx 的配置问题，并且给你带来一些额外的思考。如果你有兴趣了解更多的咨询，欢迎关注我的 GitHub [mincong-h](https://github.com/mincong-h) 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

- Phoenix NAP, "How to Redirect HTTP to HTTPS in Nginx", _phoenixnap.com_, 2020. <https://phoenixnap.com/kb/redirect-http-to-https-nginx>
- Andrew B, "Difference in sites-available vs sites-enabled vs conf.d directories (Nginx)?", _Server Fault_, 2013. <https://serverfault.com/questions/527630/>
- sativaware, "Include HTTP headers in Curl response", 2019. <https://coderwall.com/p/f3avyq/include-http-headers-in-curl-response>
- Santosh Venkatraman, "Configure nginx to host multiple subdomains", _dev.to_, 2019. <https://dev.to/on_stash/configure-nginx-to-host-multiple-subdomains-2g0b>
