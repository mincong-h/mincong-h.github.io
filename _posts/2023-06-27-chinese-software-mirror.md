---
article_num:         211
layout:              post
type:                classic
title:               Set Up Chinese Software Mirrors
subtitle:            >
    How to download libraries, containers, or softwares in China?

lang:                en
date:                2023-06-27 01:40:43 +0800
categories:          [java-core]
tags:                [docker]
comments:            true
excerpt:             >
    TODO

image:               /assets/2023-06-27_chinese-software-mirrors/jamie-street-zhiQORykuwQ-unsplash.jpg
cover:               /assets/2023-06-27_chinese-software-mirrors/jamie-street-zhiQORykuwQ-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

This article helps you set up mirrors for your software projects in China. There are important network restrictions in China (GFW) which block the access to selected foreign websites and slows down cross-border internet traffic. Therefore, when you want to expand your business to China or simply travel to China, you will need to find solutions for various apsects of your software project, to be compliant and to accelerate the process of your development and operations. Setting up mirrors is an obvious choice: it allows you to work in mainland China without VPN, and the solution will work for any server hosted in China, either in the CI or in your production in any Chinese cloud providers.

In this article, we are going to discuss the choices of mirrors at different levels: container, programming language, operating system (OS); the different sources of mirrors; the limitations of using mirrors; and some useful websites to go further.

This article is written in Guangzhou, China using [China Mobile
(中国移动)](https://www.chinamobileltd.com/en/global/home.php) using an Apple Macbook Pro. So my setup may be different from yours.

Now, let's get started!

<!--
## DNS

Check your DNS before going to China. Don't use

* CloudFlare DNS `1.1.1.1` => Use `1.0.0.1`, version for China
* Google DNS `8.8.8.8`, (todo) => Use something else
-->

## Docker

Docker can be used directly in China with the default registry (<https://docker.io>). It is a bit slow, but it is working:

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

You can also set up the mirrors using Chinese sources. There are multiple choices: Aliyun 阿里云 (<https://registry.cn-hangzhou.aliyuncs.com>), Tencent cloud 腾讯云 (<https://mirror.ccs.tencentyun.com>), Wangyi cloud 网易云 (<https://mirrors.163.com>), Azure cloud (<https://dockerhub.azk8s.cn>), etc. Note that ACR does not provide public anonymous access functionality on Azure China, this feature is in public preview on global Azure ([link](https://github.com/Azure/container-service-for-azure-china/issues/60)).

If you were using the Docker Desktop, you can find the settings in the preferences under "Docker Engine":

![Settings in Docker Desktop for changing the registry mirrors](/assets/2023-06-27_chinese-software-mirrors/20230627-docker-settings.png)

Once you successfully added the registry mirrors to the Docker Engine, you should
also find the mirror using the command `docker info` as shown below:

```
docker info
[...]
 Registry Mirrors:
  https://registry.cn-hangzhou.aliyuncs.com/
```

In Linux, you may need to modify the settings under path `/etc/docker/daemon.json` (Docker version ≥ 1.10) according to [this article](https://www.cnblogs.com/boonya/p/15954368.html):

```json
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com/"
  ]
}
```

and restart the service:

```
systemctl daemon-reload
systemctl restart docker
```

## Python

Python works without any problem. You can install from the default Python Package Index (<https://pypi.org>) without changing. For example, downloading the `black` formatter took me 8.46 seconds, which is an acceptable speed.

```
(venv) ➜  ~ time brew install black
==> Downloading https://formulae.brew.sh/api/cask.jws.json
######################################################################## 100.0%
==> Fetching dependencies for black: openssl@3
==> Fetching openssl@3
==> Downloading https://ghcr.io/v2/homebrew/core/openssl/3/manifests/3.1.1_1
######################################################################## 100.0%
...
==> Summary
🍺  /usr/local/Cellar/black/23.3.0: 1,124 files, 13.9MB
==> Running `brew cleanup black`...
Disable this behaviour by setting HOMEBREW_NO_INSTALL_CLEANUP.
Hide these hints with HOMEBREW_NO_ENV_HINTS (see `man brew`).
==> Caveats
==> black
To start black now and restart at login:
  brew services start black
brew install black  8.46s user 7.04s system 33% cpu 46.080 total
```

If you encountered any performance issues, you can also consider switching the package index to a Chinese index. There are multiple ones available coming from different universities or cloud providers, such as [Aliyun PyPI Mirror (阿里云PyPI镜像)](https://developer.aliyun.com/mirror/pypi), [Tsinghua PyPI Mirror (清华大学PyPI镜像)](https://mirror.tuna.tsinghua.edu.cn/help/pypi/), [Cernet PyPI Mirror (校园网PyPI镜像)](https://mirrors.cernet.edu.cn/list/pypi), etc.

According to [Aliyun's documentation](https://developer.aliyun.com/mirror/pypi), you can set up PyPI by changing the setting as shown below:

Find out the file:

```
~/.pip/pip.conf
```

Add or modify the content below:

```toml
[global]
index-url = https://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host=mirrors.aliyun.com
```

This can also be done using the `pip` command:

```bash
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip config set install.trusted-host mirrors.aliyun.com
```

## Brew

If you use MacOS, you are probably using `brew` as well. If you update the brew index, you will find out that it's a bit slow:

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

```bash
# homebrew.git
git -C "$(brew --repo)" remote set-url origin https://mirrors.aliyun.com/Homebrew/brew.git

# homebrew-core
git -C "$(brew --repo)/Library/Taps/homebrew/homebrew-core" remote set-url origin https://mirrors.aliyun.com/homebrew/homebrew-core.git

brew update

# bash
echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile
```

Reset

```bash
# reset homebrew
git -C "$(brew --repo)" remote set-url origin https://github.com/Homebrew/brew.git

# reset homebrew-core
git -C "$(brew --repo)/Library/Taps/homebrew/homebrew-core" remote set-url origin https://github.com/Homebrew/homebrew-core.git
```

and then remove `HOMEBREW_BOTTLE_DOMAIN` from bash profile or `.zshrc` and `source` it.

## Ruby

When you use Ruby, you need to use a mirror because by default, Ruby use <https://rubygems.org>, which is not accessible in mainland China.

> Could not fetch specs from https://rubygems.org/

The changes can be made at multiple level: via the `bundle` command line, in the `gem` sources, and the `Gemfile`:

In the bundler, replace all the calls to <https://rubygems.org> to a mirror, such as <https://mirrors.aliyun.com/rubygems/>

```
bundle config mirror.https://rubygems.org https://mirrors.aliyun.com/rubygems/
```

In the gem command line, change the gem sources:

```
gem sources -r https://rubygems.org -a https://mirrors.aliyun.com/rubygems/
```

and list the gem sources again to ensure that the changes have been taken into account:

```bash
gem sources
# *** CURRENT SOURCES ***
#
# https://mirrors.aliyun.com/rubygems/
```

You can also modify the source in the `Gemfile`

```diff
- source "https://rubygems.org"
+ source "https://mirrors.aliyun.com/rubygems/"
```

There are at least 3 pupoluar choices: Ruby China Gems (<https://gems.ruby-china.com/>), Aliyun Gems (<https://mirrors.aliyun.com/rubygems/>) and Tsinghua Gems (<https://mirrors.tuna.tsinghua.edu.cn/rubygems/>).

## Mirror Choices

<https://developer.aliyun.com/mirror/>


docker国内镜像源Azure 中国(最快镜像源)


```
sudo vim /etc/docker/daemon.json
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

## Problem

language

google translate

cleanup when leaving China

### Missing Package

Some packages may not be available.

```
Retrying fetcher due to error (2/4): Bundler::HTTPError Could not fetch specs from https://mirrors.aliyun.com/rubygems/
Gem::RemoteFetcher::UnknownHostError: timed out (https://mirrors.aliyun.com/rubygems/specs.4.8.gz)
/usr/local/lib/ruby/site_ruby/2.6.0/rubygems/remote_fetcher.rb:277:in `rescue in fetch_path'
  /usr/local/lib/ruby/site_ruby/2.6.0/rubygems/remote_fetcher.rb:254:in `fetch_path'
  /usr/local/lib/ruby/gems/2.6.0/gems/bundler-2.0.2/lib/bundler/rubygems_integration.rb:758:in `fetch_specs'
  /usr/local/lib/ruby/gems/2.6.0/gems/bundler-2.0.2/lib/bundler/rubygems_integration.rb:768:in `fetch_all_remote_specs'
  /usr/local/lib/ruby/gems/2.6.0/gems/bundler-2.0.2/lib/bundler/fetcher/index.rb:10:in `specs'
```

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
- [Docker必备六大国内镜像](https://www.cnblogs.com/boonya/p/15954368.html)
- [Homebrew镜像](https://developer.aliyun.com/mirror/homebrew)

