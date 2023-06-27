---
article_num:         211
layout:              post
type:                classic
title:               chinese software mirror
subtitle:            >
    Given one sentence to expand the title or explain why this article may interest your readers.

lang:                en
date:                2023-06-27 01:40:43 +0800
categories:          [java-core]
tags:                []
comments:            true
excerpt:             >
    TODO
image:               /assets/2023-06-27_chinese-software-mirrors/20230627-ping-google.com.png
cover:               /assets/2023-06-27_chinese-software-mirrors/20230627-ping-google.com.png
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

Explain context here to attract people's attention... like:
- topic: what you want to talk about?
- audience: who are you targeting?
- motiviation: why is it interesting for them? Or why is it important to understand this topic?

After reading this article, you will understand:

(choose one of the following structures)

dive deep:

* Some prequisites
* Some general concepts
* Some specific concepts to dig deeper
* How to go further from this article

different dimensions (broad):

* section 1
* section 2
* section 3
* How to go further from this article

... then specify some information about the context, such as framework version, language version.

This article is written in Guangzhou, China using China 

Now, let's get started!

## Motivation

- China Great Firewall

<!--
## DNS

Check your DNS before going to China. Don't use

* CloudFlare DNS `1.1.1.1` => Use `1.0.0.1`, version for China
* Google DNS `8.8.8.8`, (todo) => Use something else
-->

## Docker

Using the default Docker registry is a bit slow, but it is working:

```
➜  docker pull nginx
Using default tag: latest
latest: Pulling from library/nginx
5b5fe70539cd: Pull complete
441a1b465367: Pull complete
3b9543f2b500: Pull complete
ca89ed5461a9: Pull complete
b0e1283145af: Pull complete
4b98867cde79: Pull complete
4a85ce26214d: Pull complete
Digest: sha256:593dac25b7733ffb7afe1a72649a43e574778bf025ad60514ef40f6b5d606247
Status: Downloaded newer image for nginx:latest
docker.io/library/nginx:latest
```

<https://www.cnblogs.com/boonya/p/15954368.html>

## Python

Python works without any problem. You can install from the default Python
Package Index (<https://pypi.org/>) without changing.

## Brew

```
brew update --verbose --debug
```

which is quite slow understand the following section (it tooks seconds to
minutes):

```
+ git fetch --tags --force origin refs/heads/master:refs/remotes/origin/master
+ UPSTREAM_SHA_HTTP_CODE=200
+ [[ -f /usr/local/Homebrew/.git/FETCH_HEAD ]]
+ touch /usr/local/Homebrew/.git/FETCH_HEAD
+ UPSTREAM_SHA_HTTP_CODE=304
+ [[ -f /usr/local/Homebrew/Library/Taps/ktr0731/homebrew-evans/.git/FETCH_HEAD ]]
+ touch /usr/local/Homebrew/Library/Taps/ktr0731/homebrew-evans/.git/FETCH_HEAD
+ [[ -z '' ]]
+ [[ 200 == \3\0\4 ]]
+ [[ -n 1 ]]
+ echo 'Fetching /usr/local/Homebrew...'
Fetching /usr/local/Homebrew...
+ local tmp_failure_file=/usr/local/Homebrew/.git/TMP_FETCH_FAILURES
+ rm -f /usr/local/Homebrew/.git/TMP_FETCH_FAILURES
+ [[ -z '' ]]
+ [[ 304 == \3\0\4 ]]
+ exit
+ [[ -n '' ]]
+ git fetch --tags --force origin refs/heads/master:refs/remotes/origin/master
```

This is because brew uses GitHub by default and the access to GitHub is slow in
China:

```
host github.com
github.com has address 192.30.255.113
github.com mail is handled by 1 aspmx.l.google.com.
github.com mail is handled by 10 alt3.aspmx.l.google.com.
github.com mail is handled by 10 alt4.aspmx.l.google.com.
github.com mail is handled by 5 alt1.aspmx.l.google.com.
github.com mail is handled by 5 alt2.aspmx.l.google.com.
```

```
ping github.com
PING github.com (192.30.255.113): 56 data bytes
64 bytes from 192.30.255.113: icmp_seq=0 ttl=49 time=235.683 ms
Request timeout for icmp_seq 1
64 bytes from 192.30.255.113: icmp_seq=2 ttl=49 time=232.373 ms
64 bytes from 192.30.255.113: icmp_seq=3 ttl=49 time=247.802 ms
64 bytes from 192.30.255.113: icmp_seq=4 ttl=49 time=233.777 ms
64 bytes from 192.30.255.113: icmp_seq=5 ttl=49 time=390.340 ms
64 bytes from 192.30.255.113: icmp_seq=6 ttl=49 time=308.513 ms
Request timeout for icmp_seq 7
Request timeout for icmp_seq 8
64 bytes from 192.30.255.113: icmp_seq=9 ttl=49 time=233.143 ms
Request timeout for icmp_seq 10
64 bytes from 192.30.255.113: icmp_seq=11 ttl=49 time=229.434 ms
^C
--- github.com ping statistics ---
13 packets transmitted, 8 packets received, 38.5% packet loss
round-trip min/avg/max/stddev = 229.434/263.883/390.340/53.698 ms
```

You can replace them by setting the remote to a Chinese mirror:

```
git remote set-url origin https://mirrors.aliyun.com/Homebrew/brew.git
```

## Ruby

```
./docker-serve.sh
version: v0-0f7edc15
ruby 2.6.3p62 (2019-04-16 revision 67580) [x86_64-linux-musl]
Could not find concurrent-ruby-1.2.0 in any of the sources
Run `bundle install` to install missing gems.
```

## Mirror Choices

<https://developer.aliyun.com/mirror/>


docker国内镜像源Azure 中国(最快镜像源)


```
sudo vim /etc/docker/daemon.json
```


```json
{
  "registry-mirrors": [
    "https://dockerhub.azk8s.cn",
    "http://hub-mirror.c.163.com"
  ]
}
```


* Azure的`*.azk8s.cn` 镜像源在2020年4月3日凌晨开始，只允许【Azure中国IP】访问，其他公网IP访问azk8s.cn都会返回403!
  项目原文如下 ACR does not provide public anonymous access functionality on Azure China, this feature is in public preview on global Azure.
* 相关issue  <https://github.com/Azure/container-service-for-azure-china/issues/60>


Tsinghua EDU 
<https://mirrors.tuna.tsinghua.edu.cn/>

USTC (中国科学技术大学)
<http://mirrors.ustc.edu.cn/>

AWS 似乎没有提供对外镜像服务，需要自己搭建[在 AWS 中国区方便安全的使用海外公开容器镜像](https://aws.amazon.com/cn/blogs/china/convenient-and-safe-use-of-overseas-public-container-images-in-aws-china/)

163 网易镜像
<https://mirrors.163.com/>

华为镜像
<https://mirrors.huaweicloud.com/home>

## Feature

公网
内网
删除包列表


## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- <https://www.cnblogs.com/aric2016/p/12423226.html>
- <https://developer.aliyun.com/mirror/pypi>
- <https://luanlengli.github.io/2019/12/16/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8Azure%E4%B8%AD%E5%9B%BD%E6%8F%90%E4%BE%9B%E7%9A%84Docker%E9%95%9C%E5%83%8F%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1.html>
- [Homebrew brew update 长时间没反应（或卡在 Updating Homebrew...）](https://blog.csdn.net/zz00008888/article/details/113880633)
- [DNS 1.1.1.1——不仅仅是速度第一](https://zhuanlan.zhihu.com/p/135319565)

