---
article_num: 178
layout:              post
title:               三个排除故障必备的 Git 命令
subtitle:            >
    让你的值班之旅更轻松高效。

lang:                zh
date:                2021-06-05 09:33:30 +0200
categories:          [git]
tags:                [git]
comments:            true
excerpt:             >
    让你的值班之旅更轻松高效。

image:               /assets/bg-jonnica-hill-V5nq6u-Ce_U-unsplash.jpg
cover:               /assets/bg-jonnica-hill-V5nq6u-Ce_U-unsplash.jpg
redirect_from:
  - /2021/06/05/oncall-git-commands/
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
---

## 前言

现在的软件开发，代码通常都是用 Git 仓库储存的。当软件上线以后，我们时常需要回到 Git 仓库里面排查异常情况。在这篇文章，我想跟大家分享一下排除故障用到的一些 Git 命令。之前在 GitHub 上面接触过一个比较热门的项目，我打算用它作为本文的例子跟大家分享。它是有 15.9k 个赞的 [linlinjava/litemall](https://github.com/linlinjava/litemall/) 又一个小商城。使用它的原因是它的项目架构比较接近在公司使用的真实代码，举起例子来比较好理解。

阅读本文后，你会明白：

- 如何使用 git-log 查看历史
- 如何使用 git-diff 比较代码区别
- 如何使用 git-revert 撤销变化

事不宜迟，让我们马上开始吧！

## 查看历史

使用 [git-log](https://git-scm.com/docs/git-log) 可以查看历史

### 查看全部历史

查看 v1.7.0 跟 v1.8.0 之间的所有历史：

```sh
$ git log v1.7.0..v1.8.0
```

```
commit 97338d20928527485650def8e7681816cc7e19f4 (tag: v1.8.0)
Author: linlinjava <linlinjavaer@gmail.com>
Date:   Sun Jan 10 18:04:52 2021 +0800

    [release]: v1.8.0

commit 18510318a16d95a9806b9de793d85f3bd012d280
Author: linlinjava <linlinjavaer@gmail.com>
Date:   Sun Jan 10 18:01:46 2021 +0800

    chore

...
```

Commit 信息太啰嗦，信息量太大？试试 `--oneline` 用让每个 commit 只用一行显示：

```sh
$ git log v1.7.0..v1.8.0 --oneline
```

```
97338d20 (tag: v1.8.0) [release]: v1.8.0
18510318 chore
c733a28a chore
5f054220 build(deps): bump axios from 0.19.2 to 0.21.1 in /litemall-vue (#452)
...
```

历史太多？试试只取最近 10 个：

```sh
$ git log v1.7.0..v1.8.0 --oneline -10
```

```
97338d20 (tag: v1.8.0) [release]: v1.8.0
18510318 chore
c733a28a chore
5f054220 build(deps): bump axios from 0.19.2 to 0.21.1 in /litemall-vue (#452)
d9070cba chore[litemall-admin]: revert update
17b4d280 chore[litemall-admin]: update
cd32740e Merge branch 'master' of https://gitee.com/linlinjava/litemall
679117d5 feat: 支持验证码
d2c79cee !54 修复编辑优惠券看不到 商品或类目列表的问题 Merge pull request !54 from 滑稽刘/N/A
747a3e7f 修复编辑优惠券看不到 商品或类目列表的问题
```

另外可以只取最近的历史。比如说，

只取昨天以后的历史（不含昨天）：

```sh
$ git log v1.7.0..v1.8.0 --since yesterday
$ git log v1.7.0..v1.8.0 --after yesterday
```

只取某个日期以后：

```sh
$ git log v1.7.0..v1.8.0 --since 2021-05-31
$ git log v1.7.0..v1.8.0 --after 2021-05-31
```

过滤掉 merge commits，因为通常问题都不在这里：

```sh
$ git log v1.7.0..v1.8.0 --oneline --no-merges
```

不比较两个标签，比较两个 commits 也非常有用。因为通常 SaaS 服务都是持续集成，不会每次都生成新标签的：

```sh
$ git log 519d7b15..cd32740e --oneline
```

```
cd32740e Merge branch 'master' of https://gitee.com/linlinjava/litemall
679117d5 feat: 支持验证码
d2c79cee !54 修复编辑优惠券看不到 商品或类目列表的问题 Merge pull request !54 from 滑稽刘/N/A
747a3e7f 修复编辑优惠券看不到 商品或类目列表的问题
```

### 查看特定模块历史

有时候我们并不想知道所有的 Git 历史，因为一个 Git 仓库里面有很多的模块。如果每个文件夹对应一个模块的话，可以只关注现在生产线出问题的模块，比如 litemall-core 这个模块：

```sh
$ git log v1.7.0..v1.8.0 --oneline -- litemall-core
```

```
679117d5 feat: 支持验证码
2b69527d 阿里云发送短信优化，在返回错误后记录日志以及返回发送失败状态 (#429)
e1dfa1e4 chore
```

也可以选择多个模块。因为可能好几个模块同时出问题，或者是一个服务依赖几个代码模块：

```sh
$ git log v1.7.0..v1.8.0 --oneline -- litemall-core litemall-admin
```

```
c733a28a chore
cd32740e Merge branch 'master' of https://gitee.com/linlinjava/litemall
679117d5 feat: 支持验证码
747a3e7f 修复编辑优惠券看不到 商品或类目列表的问题
35bf2e54 feat[litemall-admin,litemall-admin-api]:订单收款
c0541fde chore
d4dde95b fix[litemall-admin]: gitee #I1X232
d8f59965 fix[litemall-admin]: gitee #I1X21W
...
```

搜索 commit message 带有某个关键词的所有历史，比如某个 JIRA 的 ID 号：

```sh
git log --oneline --grep JIRA-123
```

```
fb67d981 JIRA-123 Update README
```

### 查看某个文件的历史

知道文件路径的话，可以查询某个文件的历史，比如说 Maven 项目的打包文件 `pom.xml`：

```sh
$ git log v1.7.0..v1.8.0 --oneline -- litemall-core/pom.xml
```

```
e1dfa1e4 chore
```

查询支持 glob 表达式，比如各个模块的 `pom.xml` 文件：

```sh
$ git log v1.7.0..v1.8.0 --oneline -- **/pom.xml
```

```
679117d5 feat: 支持验证码
c4da8fb5 chore: druid升级1.2.1
aabc2617 chore: shiro升级版本1.6.0
fa189cdc build(deps): bump mysql-connector-java from 5.1.46 to 8.0.16 (#410)
25518ade build(deps): bump mysql-connector-java in /litemall-db (#411)
...
```

有些时候你可能找不到你想要的文件，因为文件的路径修改了、重命名了或者是删除了。比如说下面这个例子，我在 test 分支加了一个新的文件叫做 important.txt，然后又把它移到了 doc 文件夹。整个历史长成下面这样：

```sh
$ git log -5 --graph --oneline --decorate
```

```
*   ed098e37 (HEAD -> master) Merge branch 'test'
|\
| * 5719e55f (test) Move to doc
| * 76a6c164 Add important note
* | 3821fb3f Update README.md
|/
* ce2720b5 (linlinjava/master, linlinjava/HEAD) fix[litemall-wx]: #473
```

这个时候搜索 important.txt 就找不到了：

```sh
$ git log -- important.txt
```

```
（结果为空）
```

如果加入 `--full-history` 会找到，因为 Git 会从 merge commit 所有的 parents 分支中寻找这个路径的修改记录：

```sh
$ git log --full-history --oneline -- important.txt
```

```
5719e55f Move to doc
76a6c164 Add important note
```

那么到底是什么文件这么重要呢？？打开看看：

```sh
git show 76a6c164:important.txt
```

```
关注微信号：码农小黄！
```

好了，我想你们知道要怎么做了（微笑脸）

## 比较代码区别

使用 [git-diff](https://git-scm.com/docs/git-diff) 命令可以比较代码区别。

比较在 v1.7.0 与 v1.8.0 之间所有的变化：

```sh
$ git diff v1.7.0..v1.8.0
```

比较在 v1.7.0 跟 v1.8.0 中，一个文件的变化：

```sh
$ git diff v1.7.0..v1.8.0 -- litemall-core/pom.xml
```

```diff
diff --git a/litemall-core/pom.xml b/litemall-core/pom.xml
index 9062827c..b0e51ad2 100644
--- a/litemall-core/pom.xml
+++ b/litemall-core/pom.xml
@@ -19,7 +19,6 @@
         <dependency>
             <groupId>com.aliyun</groupId>
             <artifactId>aliyun-java-sdk-core</artifactId>
-            <version>4.0.3</version>
         </dependency>

         <dependency>
```

查看一个分支从 master 出来以后跟 master 所有的变化：

```sh
$ git diff master...test
```

```diff
diff --git a/doc/important.txt b/doc/important.txt
new file mode 100644
index 00000000..6a19c964
--- /dev/null
+++ b/doc/important.txt
@@ -0,0 +1 @@
+关注微信号：码农小黄！
```

相比于 `master..test`，使用 `master...test` 只显示分支 test 单边出现的变动，忽略另一边分支 master 出现的变动。如果没有听懂的话也没有关系，就打开 GitHub 或者 GitLab，通过 pull-request 或者 merge-request 看代码变化吧，可能更好用。

## 撤销变更

使用 [git-revert](https://git-scm.com/docs/git-revert) 可以撤销变更。这一个段落主要讨论对于 GitHub 下三种不同的 merge 选项合并代码后的撤销。这三个选项是：create-a-merge-commit / squash-and-merge / rebase-and-merge。

![GitHub Merge Options](/assets/20210605-git-merge-options.png)

### 撤销单一 commit

撤销单一 commit。适合 GitHub 中通过 squash-and-merge 选项合并的撤销。

```sh
$ git revert fb67d981
```

```
[master be5a0576] Revert "JIRA-123 Update README"
 1 file changed, 1 insertion(+), 2 deletions(-)
```

### 撤销多个 commits

撤销多个 commits，从新到旧、倒序地把 commits 逐一撤销。适合 GitHub 中通过 rebase-and-merge 选项合并的撤销：

```sh
$ git revert <commit3>
$ git revert <commit2>
$ git revert <commit1>
```

### 撤销一个 merge commit

撤销一个 merge commit。这个时候要选择回到哪个父分支（parent branch），比如之前把 test 分支的代码合并到了 master：这个时候 parent 1 是 master，parent 2 是 test。撤销时不明确父分支会报错。这个方法适合 GitHub 中通过 create-a-merge-commit 选项合并的撤销：

```
error: commit 20245201b27dcb2d1001dd21b35a95c76c7b2e0c is a merge but no -m option was given.
fatal: revert failed
```

从 commit message 观察有哪些 parents：

```sh
$ git show 20245201
```

```
commit 20245201b27dcb2d1001dd21b35a95c76c7b2e0c
Merge: 76a5d305 5719e55f                         // <- CHECK HERE
Author: Mincong HUANG <mincong.h@gmail.com>
Date:   Sat Jun 5 13:54:10 2021 +0200

    Merge branch 'test'

```

明确想要回到的父分支，通常是第 1 分支（最小从 1 开始，不是从 0 开始）：

```
$ git revert 20245201 -m 1
```

```
Removing doc/important.txt
[master 4c75c129] Revert "Merge branch 'test'"
 1 file changed, 1 deletion(-)
 delete mode 100644 doc/important.txt
```

## 扩展

如果不记得这些 Git 命令，不要怕，通过 `-h,--help` 可以看看命令的说明：

```sh
git <cmd> -h
# 举例：
git log -h
git diff -h
git revert -h
```

阅读官网 `git-scm.com` 的文档也是很好的解决方法。

## 结论

在本文中，我们看到了如何使用 git-log 来浏览两个版本代码中的全部历史、模块历史、文件历史；看到了如何使用 git-diff 比较同一文件不同版本的区别、不同分支的所有区别；最后，看到了如何使用 git-revert 来取消变更。希望这篇文章能够给你带来一些思考，让你的排除故障更加顺利。如果你们感兴趣的话，还可以访问浏览我的博客的[其他 Git 的文章](/categories/git)，以前写过 17 篇这方面的英语文章。谢谢大家！

## 参考文献

- <https://github.com/linlinjava/litemall/>
- <https://git-scm.com/docs/git-log>
- <https://git-scm.com/docs/git-diff>

写作不易，希望大家点个赞、点个在看支持一下，谢谢(花)
