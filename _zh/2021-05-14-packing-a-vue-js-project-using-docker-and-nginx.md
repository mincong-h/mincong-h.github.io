---
layout:              post
title:               用Docker和Nginx打包一个Vue.js项目
subtitle:            >
    如题

lang:                en
date:                2021-05-14 21:28:46 +0200
categories:          [build]
tags:                [docker, vue.js, nginx, npm, bash]
comments:            true
excerpt:             >
    如何用Docker打包一个Vue.js并且在Nginx上面运行？
image:               /assets/bg-victoire-joncheray-XsP7GCLMWjM-unsplash.jpg
cover:               /assets/bg-victoire-joncheray-XsP7GCLMWjM-unsplash.jpg
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

最近我在给我妈做一个公益网站，是关于特殊教育的。目的是为了整合国内外的特教教学资源，让国内的特教老师有一个更好的平台去学习关于特殊教育的知识，从而更好地教育和培养他们的学生。根据[维基百科](https://zh.wikipedia.org/zh-tw/%E7%89%B9%E6%AE%8A%E6%95%99%E8%82%B2)，特殊教育针对的群体的主要障碍有：脑力障碍、视力障碍、听力障碍、肢体障碍、脑性麻痹障碍、身体病弱障碍、情绪行为障碍、学习功能障碍、多重功能障碍、自闭障碍、发展迟缓障碍、认知障碍等。当然这篇文章不是为了介绍特殊教育的哈，大家如果感兴趣可以去网上搜索相关的资源。

为了做这个网站，我需要搭一个前端。由于我对 Vue.js 比较熟悉，所以最后就选择了这个框架。这篇文章主要跟大家分享我在搭建过程中，关于 Vue.js 打包的这个部分。读完这篇文章，你会明白：

- 如何用 npm 来生成 production 需要的文件？
- 如何创建 Dockerfile？
- 如何给 Docker image 的标签命名？
- 如何创建 Docker image？
- 如何从这篇文章扩展出去？

事不宜迟，让我们马上开始吧！

## 用 npm 打包

打包前端的第一步是让 npm 生成可以被打包的文件。所以我们先来看看 Vue.js 跟 npm 这一块。由于我是个前端白痴，对具体配置一窍不通，所以这里的代码全部是用[Vue CLI](https://cli.vuejs.org/)自动生成的。这样保证代码能运行，不用操心避免踩坑。最开始生成项目的时候，用了下面的命令安装 Vue CLI 和生成代码：

```sh
$ npm install -g @vue/cli
$ npm install -g @vue/cli-init
$ vue init webpack my_project
```

项目初始化以后就可以根据自己的需求进行开发了。开发结束后，可以通过 npm 打包，打包命令很简单：

```sh
$ npm run build
```

这个命令会生成一个`dist/`文件夹，所有运行需要的文件都在里面了。打包时候的 logs 大概是：

```
Run npm --prefix sunny-front run build

> sunny-front@1.0.0 build /home/runner/work/sunny/sunny/sunny-front
> node build/build.js

...

Hash: 23a93dd511b8f4c513b5
Version: webpack 3.6.0
Time: 8917ms
                                                  Asset       Size  Chunks             Chunk Names
               static/js/vendor.ededf5cb2d714a9a835d.js     125 kB       0  [emitted]  vendor
                  static/js/app.8dadffc6d3bd990f7496.js    10.9 kB       1  [emitted]  app
             static/js/manifest.3d7fd0d72b769ee50219.js    1.49 kB       2  [emitted]  manifest
    static/css/app.ddaff86b099ad5f0420b6bea10a2fb43.css     156 kB       1  [emitted]  app
static/css/app.ddaff86b099ad5f0420b6bea10a2fb43.css.map     231 kB          [emitted]
           static/js/vendor.ededf5cb2d714a9a835d.js.map     613 kB       0  [emitted]  vendor
              static/js/app.8dadffc6d3bd990f7496.js.map    41.7 kB       1  [emitted]  app
         static/js/manifest.3d7fd0d72b769ee50219.js.map    7.79 kB       2  [emitted]  manifest
                                             index.html  507 bytes          [emitted]

  Build complete.

  Tip: built files are meant to be served over an HTTP server.
  Opening index.html over file:// won't work.
```

然后把这些文件放在一个 web server 里面就可以运行了。Vue.js 的官方[部署](https://cli.vuejs.org/zh/guide/deployment.html)文档提供了好多种部署方案，比如云开发 CloudBase、混合部署、GitHub Pages、GitLab Pages 等十多种方案。这里我选择的是通过 Docker 和 Nginx 部署，因为感觉用 Docker 比较方便，可以在不同的环境运行。用 Nginx 的原因主要是它比较热门而且有被 Vue.js 官方文档提到。

## Dockerfile

创建 Docker Image 非常简单，只需要把下面几行代码放在 Dockerfile 里面就可以了：

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/
```

在这个文件里面，我们做了下面几件事：

1. 我们用了 Nginx 的 Docker image 作为 base image。
2. 把 npm 生成的文件夹`dist/`的全部内容放进 Nginx Docker 的默认 HTML 文件夹，也就是`/usr/share/nginx/html/`里面。
3. 把自定义的 Nginx 配置文件`nginx.conf`放进 Nginx Docker 的配置文件夹`/etc/nginx/conf.d/`。

通过这短短的几行代码，我们可以造出一个 Docker image 了。再继续讨论之前，我想先对上面的点再拓展一下。

为什么选择 Alpine？Nginx 的 Docker image 默认是使用 Debian 的，这里选择的是 Alpine 因为 Alpine 比 Debian 更加的轻量。Alpine 本身只有 5MB 左右。这使得 CI 运行速度快了很多。通过下面的截图你可以看到，从 Debian 转到 Alpine 以后，最终 image 的大小从 135.5MB 降低到了 24.97MB。那有什么不好的地方呢？[Nginx Docker 官方文档](https://hub.docker.com/_/nginx/)提到 Alpine 使用[musl libc](https://musl.libc.org/)作为 C/POSIX standard library，而不使用[glibc 或者其他的 libc](https://www.etalabs.net/compare_libcs.html)。这个似乎对我们没有什么影响，所以我暂时不考虑回去用 Debian。反正切换的成本很低，只要换一个单词就行了。

![基于debian和alpine的Nginx Docker images的实际大小比较](/assets/20210513-docker-size-comparison.png)

为什么把`nginx.conf`的文件放在路径`/etc/nginx/conf.d/`而不是路径`/etc/nginx/nginx.conf`？这是因为`/etc/nginx/nginx.conf`是 Nginx 的首要配置路径（primary）。在首要配置路径下的配置必须遵守 Nginx 的要求，比如必须把 SERVER BLOCK 放在 HTTP 或者 HTTPS BLOCK 下面。不遵循这个规则的话，Nginx 无法启动并且会抛出异常：_["nginx: \[emerg\] "server" directive is not allowed here"](https://stackoverflow.com/questions/41766195/)_。在其他路径，比如`/etc/nginx/conf.d/`则没有这样的局限，这使得配置简单一点。我的 Nginx 配置写的很简单（不过估计也不是很完善，后期再根据需求修改）：

```conf
server {
    server_name         sunny_frontend;
    location / {
        root            /usr/share/nginx/html;
        index           index.html;
        try_files       $uri $uri/ /index.html;
    }
    error_page          500 502 503 504  /50x.html;
    location = /50x.html {
        root            /usr/share/nginx/html;
    }
}
```

## Docker 标签的命名

每个人对 Docker 标签（tag）命名方式可能都不一样。我选择的命名方式是：

```sh
v${pipeline}-${commit}
```

比如说：

```
v844326557-3de63ce
```

这里 pipeline 指的是 CI pipeline 的 ID。我选用 GitHub Actions 作为 CI，所以具体来说指的是`GITHUN_RUN_ID`。选用这样的命名方式主要是因为：

- 它显示了代码版本（Git 里面 commit 的缩写），出问题的时候可以快速切换到那个代码版本
- 它显示了 CI 的版本，出问题的时候可以快速切换到那个 pipeline
- 这样的命名也避免了标签重复的问题，因为一方面 GitHub 的 commit 是唯一的，另一方面即便重新跑 CI，标签也不重复：因为 CI 的 pipeline 的 ID 会改变。

现在我们有了 Dockerfile 和 tag，下面就可以创建 Docker image 啦！

## 创建 Docker Image

由于创建 Docker image 的时候涉及到一些具体操作，手动操作有点复杂。所以我把它们整理成 Bash 脚本，这样即使不记得操作也无所谓，只用运行脚本就可以：

```sh
#!/bin/bash

# How can I get the source directory of a Bash script from within the script itself?
# https://stackoverflow.com/questions/59895/
docker_dir="$(cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)"

short_commit=$(git rev-parse --short HEAD)
pipeline_id="${GITHUB_RUN_ID:-0}"
tag="v${pipeline_id}-${short_commit}"

source_dir=$(realpath "${docker_dir}/../sunny-front/dist/")
target_dir=$(realpath "${docker_dir}/sunny-frontend/dist/")

cp -rf "${source_dir}" "${target_dir}"

docker build \
  --tag "sunny-frontend:${tag}" \
  "${docker_dir}/sunny-frontend"
```

这个脚本应该比较好理解，它做了几件事：

- 找到脚本所在的路径
- 找到现在 Git 的 commit 缩写
- 找到现在的 GitHub action 的 RUN ID，如果没有（比如本地操作）那就默认为 0
- 生成 Docker 的标签
- 把前端代码发送到复制到目标文件夹`${docker_dir}/sunny-frontend/dist/`
- 最后用 Docker build 创建 Docker image

创建 Docker image 时，生成的 logs 长这样：

```
Sending build context to Docker daemon  1.201MB

Step 1/3 : FROM nginx:alpine
alpine: Pulling from library/nginx
540db60ca938: Already exists
...
197dc8475a23: Pull complete
39ea657007e5: Pull complete
37afbf7d4c3d: Pull complete
0c01f42c3df7: Pull complete
d590d87c9181: Pull complete
Digest: sha256:07ab71a2c8e4ecb19a5a5abcfb3a4f175946c001c8af288b1aa766d67b0d05d2
Status: Downloaded newer image for nginx:alpine
 ---> a64a6e03b055
Step 2/3 : COPY dist/ /usr/share/nginx/html/
 ---> 487e5ae65e80
Step 3/3 : COPY nginx.conf /etc/nginx/conf.d/
 ---> 34e916318e79
Successfully built 34e916318e79
Successfully tagged sunny-frontend:v844326557-3de63ce
```

## 测试 Docker Image

可以在本地运行一下这个 image，看看能不能被正常使用：

```sh
docker run -p 18080:80 sunny-frontend:v844326557-3de63ce
```

打开浏览器访问`localhost:18080`，可以正常使用。Oh yeah！

![网站本地预览](/assets/20210515-localhost-preview.png)

## 扩展

如何从这篇文章拓展出去？

- 如果你想要了解更多关于 Vue.js 部署的方法，建议访问官方文档[部署 - Vue CLI](https://cli.vuejs.org/zh/guide/deployment.html)
- 如果你想要了解更多关于 Github Actions 的环境变量，建议访问官方文档[Environment variables - Github Actions](https://docs.github.com/en/actions/reference/environment-variables)
- 如果你想要了解更多关于 Nginx 的 Docker 配置，建议访问官方文档[nginx - Docker](https://hub.docker.com/_/nginx/)

## 结论

这篇文章主要跟大家分享了在打包 Vue.js 代码到 Nginx（Docker）的一些步骤，包括如何用 npm 生成 production 需要的文件、如何写 Dockerfile、如何给标签命名、如何创建 Docker image、如何在本机预览、以及如何扩展出去。希望对大家有帮助！
