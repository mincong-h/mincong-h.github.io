---
article_num: 175
layout:              post
title:               GitHub Actions持续集成阿里云容器镜像服务（ACR）
subtitle:            >
    如何通过GitHub Actions创建Docker image，并且持续集成到阿里云容器镜像服务（Aliyun Container Registry）？

lang:                zh
date:                2021-05-15 11:50:13 +0200
categories:          [build]
tags:                [docker, github-actions, aliyun]
comments:            true
excerpt:             >
    如何通过GitHub Actions创建Docker image，并且持续集成到阿里云容器镜像服务（Aliyun Container Registry）？

image:               /assets/bg-parsoa-khorsand-GPwBgILMy3M-unsplash.jpg
cover:               /assets/bg-parsoa-khorsand-GPwBgILMy3M-unsplash.jpg
redirect_from:
  - /2021/05/15/github-actions-acr/
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
---

## 前言

最近我在给我妈做一个公益网站，是关于特殊教育的。目的是为了整合国内外的特教教学资源，让国内的特教老师有一个更好的平台去学习关于特殊教育的知识，从而更好地教育和培养他们的学生。根据[维基百科](https://zh.wikipedia.org/zh-tw/%E7%89%B9%E6%AE%8A%E6%95%99%E8%82%B2)，特殊教育针对的群体的主要障碍有：脑力障碍、视力障碍、听力障碍、肢体障碍、脑性麻痹障碍、身体病弱障碍、情绪行为障碍、学习功能障碍、多重功能障碍、自闭障碍、发展迟缓障碍、认知障碍等。当然这篇文章不是为了介绍特殊教育的哈，这篇文章主要讲述如何将 GitHub Actions 和阿里云容器镜像服务（Aliyun Container Registry）结合使用，将新的 Docker images 自动地 release 到阿里云中，减少人为操作。

写这篇文章的目的很简单，就是想跟大家分享一下我在搭建过程的经验，希望可以给你们带来一些思考和启发。读完本文后，你会明白：

- 如何创建镜像仓库命名空间和仓库？
- 如何创建 Docker 镜像？
- 如何发布 Docker 镜像？
- 如何接入 Github Actions？

事不宜迟，那让我们马上开始吧！

## 创建 ACR 命名空间和仓库

搭建第一步是在阿里云容器镜像服务（Aliyun Container Registry）中创建命名空间（namespace）和镜像仓库（repository）。在开始之前，我想先解释一下这个镜像服务地址、命名空间、以及仓库名字的含义。因为明白它们的含义有助于理解下文，理解现在做到哪一步。在下载 Docker image 的时候，一个仓库的全称可能长成下面这样：

```
registry.cn-shenzhen.aliyuncs.com/sunnyspec-prod/sunny-frontend
```

也就是：

```sh
${REGISTRY}/${NAMESPACE}/${REPOSITORY}
```

具体来说，

- `REGISTRY` 对应的是阿里云容器镜像服务的网站。这里网站地址可以是不同城市的分站。无论选那个好像都行，阿里云自己会将镜像复制到别的分站。
- `NAMESPACE` 对应的是我们的命名空间。这里我选择 sunnyspec-prod 这个名字。这是通过网站和环境来命名的，这样做不容易混淆不同的网站，也不容易混淆不同的环境（producion/staging/...）
- `REPOSITORY` 对应的是我们的镜像仓库。这里我选择 sunny-frontend 这个名字。这是我的 app 的名字。因为在命名空间中已经包含了网站和环境的名字，所以在这里就不需要再重复了，只要保留 app 的名字就可以了。

再贴几张申请过程的截图吧！

选择容器镜像服务：

![选择容器镜像服务](/assets/20210513-acr-introduction.png)

我自己的情况选择的是创建个人版实例（免费）：

![创建个人版实例](/assets/20210513-acr-type-choice.png)

那个人版跟企业版有什么不同呢？阿里云给出了它们的比较，截图如下。比较完还是选择个人版，因为没有比省钱更重要的事情了。哈哈，对不起了，阿里的程序员：

![个人版实例与企业版比较](/assets/20210513-acr-type-choice-detail.png)

下一步应该是创建命名空间（namespace）和镜像仓库（repository）。镜像空间的名字应该是对于整个阿里云来说唯一的，跟所选区域无关。所以要选用比较有标志性的名字。我的话选择了 sunnyspec-staging 和 sunnyspec-prod 这两个名字，分别作为阳光特教网（sunnyspec）的 staging 和
production 的仓库名字。这样不容易混淆 staging 和 prod 的镜像。创建完命名空间以后，要创建镜像仓库，这个时候我选择了使用 service 或者说 app 本身的名字，这样每个服务都有自己的容器。个人版可以免费创建 300 个仓库，估计也用不完。具体信息截图：

![创建镜像仓库之仓库信息](/assets/20210513-acr-step-1.png)

第二步选择代码源。这里我选择了本地仓库而没有选 GitHub，因为我不想阿里云绑定我的 GitHub 账户。而且选择本地仓库的话，这样在自己机器（localhost）上测试也方便：

![创建镜像仓库之输入代码源](/assets/20210513-acr-step-2.png)

最后仓库创建成功！鼠标放在“...”上面，可以看到相关的仓库链接：

![仓库创建成功](/assets/20210513-acr-repository-url.png)

## 创建镜像

在上一篇文章中，我跟大家介绍过[如何用 Docker 和 Nginx 打包一个 Vue.js 项目](/2021/05/14/packing-a-vue-js-project-using-docker-and-nginx/)。这里就照搬代码了。没看过前文的朋友们不要紧，我把概要贴在这里。创建 Docker 镜像大概需要这么几个步骤：

1. 写 Dockerfile
2. 选择 Docker 标签（tag）
3. 创建 Docker 镜像（image）

第一步的 Dockerfile 非常简单：

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/
```

第二步的标签，我选择一下的命名方式：

```sh
v${pipeline}-${commit}
```

比如说：

```sh
v844326557-3de63ce
```

第三步用 Bash 脚本进行打包：

```sh
docker build \
  --tag "sunny-frontend:${tag}" \
  --tag "registry.cn-shenzhen.aliyuncs.com/sunnyspec-prod/sunny-frontend:${tag}" \
  "${docker_dir}/sunny-frontend"
```

这里要注意的是，build image 的时候要加上一个以阿里云的容器镜像服务为开头的标签（tag），不然无法把容器镜像上传到阿里云的容器镜像服务中。大家如果有兴趣了解更多细节，欢迎查看我的上一篇文章：[如何用 Docker 和 Nginx 打包一个 Vue.js 项目？](/2021/05/14/packing-a-vue-js-project-using-docker-and-nginx/)

## 发布镜像

发布镜像只需要一行命令，就是 docker-push。命令中需要明确具体的仓库地址，包括阿里云的镜像服务网站、命名空间以及镜像仓库三个部分：

```sh
docker push "registry.cn-shenzhen.aliyuncs.com/sunnyspec-prod/sunny-frontend:${tag}"
```

但是要注意：在发布前，Docker 引擎需要先登录到相应的镜像服务网站。不同地方有不同地登录方法（localhost 和 GitHub Actions 不一样）。这里我们先看看在 localhost 用 docker 命令行怎么登录。登录只需要一行命令，就是 docker-login：

```sh
# Usage:
#   docker login [OPTIONS] [SERVER] [flags]
#   docker login [command]
docker login registry.cn-shenzhen.aliyuncs.com
```

命令执行后，命令行提示输入用户名和密码，按要求输入即可。

## GitHub Actions

这些都做好以后，下一步就是把上述步骤整合到 GitHub Actions，让整个操作流程可以自动运行起来。也就是说，每次当有新的 commit 被 merge 到 production 的时候，让 CI 自动打包生成新的 Docker image 并且发布到阿里云里面。我们先不说具体步骤，先看看最终结果，这样可能有助理解：

![GitHub Action 持续集成工作流程](/assets/20210516-github-workflow.png)

在上面这个图中，我们可以看到：当 commit `3de63ce`被 push 到分支 `prod` 的时候，GitHub Actions 自动运行，包含测试和发布两个步骤。这两个步骤有依赖关系，测试成功才会发布，否则跳过执行。发布过程的具体步骤：

![GitHub Action 发布步骤](/assets/202105160-github-action-release-steps.png)

这里的步骤都很好理解，我就不解释了。唯一有点特别的是阿里云容器镜像服务（ACR）登录部分用了阿里云自己提供的 GitHub Action：`aliyun/acr-login`。因为它把一些细节打包了，我就不用管了，只要提供用户名和密码就行。

另外一个很重要的步骤是要把 secrets 放在 GitHub 项目的配置里面，这样 CI 运行的时候才能读得到：

![GitHub Action secrets配置](/assets/20210513-github-action-secrets.png)

GitHub Actions 的具体代码如下：

```yaml
name: actions

on: [push, pull_request]

jobs:
  sunny-front-test: ...
  sunny-front-release:
    if: {% raw %}${{ github.ref == 'refs/heads/prod' || github.ref == 'refs/heads/docker' }}{% endraw %}  # 1
    runs-on: ubuntu-latest
    needs: sunny-front-test  # 2
    steps:
    - uses: actions/checkout@v2
    - run: npm --prefix sunny-front install
    - run: npm --prefix sunny-front run build
    - name: Login to Aliyun Container Registry (ACR)
      uses: aliyun/acr-login@v1
      with:
        login-server: https://registry.cn-shenzhen.aliyuncs.com
        region-id: cn-shenzhen  # 3
        username: "{% raw %}${{ secrets.ACR_USERNAME }}{% endraw %}"
        password: "{% raw %}${{ secrets.ACR_PASSWORD }}{% endraw %}"
    - name: Build Docker Image
      run: bash docker/build-docker-image-sunny-frontend.sh
    - name: Push Docker Image
      run: bash docker/push-docker-image-sunny-frontend.sh
```

这里想提一下几个细节：

1. 这个步骤不是在任何情况下都运行的，只有在两个 branches 里面会运行，一个是 prod，另一个是 docker。主要是给发布正式镜像和测试发布流程使用。
2. sunny-front-release 跟 sunny-front-test 有依赖关系，测试成功才会发布，否则跳过执行。
3. 镜像发布在深圳区的容器镜像服务中。选择哪个国内的区域估计都行，阿里云应该会自己同步到别的地方。境外的区域不知道行不行，没有试过。个人版 ACR 没有“制品分发 - 全球同步加速”功能，所以如果网站在国内，我就不建议首发国际服务器了（比如中国香港）。

那如何验证发布成功呢？在 localhost 或者在阿里云服务器下载 docker 镜像并运行即可。

## 扩展

如何从这篇文章中拓展出去？

- 如果你想要了解更多关于 Github Actions 的信息，建议访问官方文档 [GitHub Actions - Reference](https://docs.github.com/en/actions/reference)
- 如果你想要了解更多关于 Docker CLI 的信息，建议访问官方文档 [Docker CLI](https://docs.github.com/en/actions/reference) 或者直接在命令行输入以下命令来显示相关的帮助信息：

  ```
  docker [COMMAND] --help
  ```

## 结论

在本文中，我们探讨了如何在阿里云创建镜像仓库命名空间和镜像仓库、如何创建 Docker 镜像、如何发布 Docker 镜像、如何接入 GitHub Actions 达到持续集成的效果，使得每一个新的 commit 被 pushed 到 prod 分支的时候都会自动生成新的 Docker 镜像。最后，我们还看到了一些帮助拓展的资源。希望这篇文章能够给你带来一些思考，让你的 CI/CI 变得更加高效，能让你腾出宝贵的时间，处理别的更重要事情。谢谢大家！
