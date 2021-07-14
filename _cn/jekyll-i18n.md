---
layout:              post
title:               自定义 Jekyll 国际化实践
subtitle:            >
    一个博客两种语言：给读者带来更好的阅读体验！

lang:                zh
date:                2021-07-11 22:02:53 +0200
categories:          [java-core]
tags:                [jekyll, i18n]
comments:            true
excerpt:             >
    一个博客两种语言！这篇文章跟大家分享我是如何把个人博客 https://mincong.io 国际化，以此带给读者更好的阅读体验。

image:               /assets/bg-chuttersnap-aku7Zlj_x_o-unsplash.jpg
cover:               /assets/bg-chuttersnap-aku7Zlj_x_o-unsplash.jpg
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

在今年四月份回国探亲的期间，由于查找资料的缘故，接触到了很多中文的技术资料，但也发现国内好的资源不是很多。于是，我开始在自己的博客写起了中文的文章，希望给中国程序员社区也贡献自己的一份力量。具体来说，就是中文、英语，两种语言一起写。可是在实践中发现，一个博客两种语言，其实体验并不好。

开始写中文以后，好几次有同事在谷歌搜到了我的热点英语文章，点进来开始阅读。这件事情让我很尴尬，因为从四月开始，我的文章都是中文的。我在他们的角度想想：假如阅读结束后，好奇想阅读更多文章，点到首页。结果出乎意料地看见一堆中文博客，懵了，感觉走错了地方。对于不了解另一门语言的人来说，体验会很差。相反也成立：当一个中国朋友看见我的博客，看见一堆英语文章，感觉也很难提起兴趣看下去。如果能够用母语写，肯定亲切很多。

这也就是为什么我想做国际化（internationalization）的原因：我想给每一位读者提供一个舒适的阅读体验。我想在博客中不同的语言之间有明确的区分，让大家在访问的时候，无论点击到哪个页面，都能以自己熟悉的语言去阅读内容。然后博客本身也能够提供选择，让大家可以切换到别的语言去。

这篇文章就跟大家分享我博客的国际化。

## 候选方案

我觉得这个国际化这件事大概有几个方案，下面讨论一下它们的好坏以及可行性。

1. 提供翻译功能。在文章中嵌入翻译键，点击翻译键时，使用第三方翻译器翻译（必应、谷歌、DeepL等）。
2. 中英文章互连。中文文章里面嵌入英文文章的链接，英文文章里面嵌入中文文章的链接。
3. 引入page key概念。中英文文章共享同一page key。
4. 使用两个collections这个概念。

<mark>最终选择方案四：使用两个 collections 这个概念。</mark>

### 方案一：提供翻译功能

在文章里面嵌入翻译键，点击翻译键时，使用第三方翻译器翻译（必应、谷歌、DeepL等）。考虑因素是我的博客访问量并不大，月访客约1.8万人。而且我并不是一个职业作家，纯粹写写玩玩，不赚钱。其实没有必要那么认真。这个功能的灵感来自于 Chrome 浏览器的翻译键，你可以在非常用语言的网页下，点击 URL 输入栏的翻译按钮，或者在页面中点击右键，对页面进行翻译。

这样的好处是：

- 实现简单

这样的坏处是：

- 没有属于自己的两篇文章，实际只有一篇文章。
- 无法较正翻译结果
- 没有文章，就没法通过文章吸引读者

### 方案二：中英文章互连

在每篇文章的开头加入相对应的另一篇文章的链接，以达到切换语言的目的。也就是，在中文文章里嵌入英文文章的链接，在英文文章里面嵌入中文文章的链接。在网页，添加一个按钮或者一个图标实现语言准换。这样，读者在阅读的时候，可以通过点击这个按钮或者这个图标，访问该文章的另一个语言版本。

比如说，关于[“在MongoDB中实现向后兼容的结构（schema）变化"](/cn/mongodb-schema-compatibility/)的这篇文章，它的英语版和中文版切换可以用以下形式实现。

英文版：

```diff
  ---
  layout:              post
  title:               Making Backward-Compatible Schema Changes in MongoDB
  date:                2021-02-27 17:07:27 +0100
  categories:          [java-serialization, reliability]
  tags:                [java, mongodb, serialization, jackson, reliability]
  comments:            true
+ lang:                en
+ version:
+   zh-CN:             2021-04-30-mongodb-schema-compatibility.md
  ...
  ---
```

中文版：

```diff
  ---
  layout:              post
  title:               在MongoDB中增删字段真的这么简单？
  date:                2021-04-30 23:09:38 +0800
  categories:          [java-serialization, reliability]
  tags:                [java, mongodb, serialization, jackson, reliability]
  comments:            true
+ lang:                zh
+ version:
+   en-US:             2021-02-27-mongodb-schema-compatibility.md
  ...
  ---
```

这样的好处是：

- 已有的文章链接保留不变，不影响 SEO

这样的坏处是：

- 不能够通过文章链接，直接知道另一个版本的文章地址。
- 如果文章改链接的时候，要记住修改它在别的语言页面的引用。

### 方案三：中英共享 Page Key

在每篇文章引入 page key 这个概念。同一文章的中英文两个版本共享同一 page key。用户访问时，页面URL包含语言和 page key 两部分。具体来说，就是遵循下面的表达式：

```
https://mincong.io/{lang}/{page-key}
https://mincong.io/en/mongodb-schema-compability
https://mincong.io/cn/mongodb-schema-compability
```

英文版（理想状态）：

```diff
  ---
  layout:              post
  title:               Making Backward-Compatible Schema Changes in MongoDB
  date:                2021-02-27 17:07:27 +0100
  categories:          [java-serialization, reliability]
  tags:                [java, mongodb, serialization, jackson, reliability]
  comments:            true
+ key:                 mongodb-schema-compatibility
+ lang:                en
  ...
  ---
```

中文版（理想状态）：

```diff
  ---
  layout:              post
  title:               在MongoDB中增删字段真的这么简单？
  date:                2021-04-30 23:09:38 +0800
  categories:          [java-serialization, reliability]
  tags:                [java, mongodb, serialization, jackson, reliability]
  comments:            true
+ key:                 mongodb-schema-compatibility
+ lang:                zh
  ...
  ---
```

这样的好处是：

- 在链接显示语言，可以直接知道另一个版本的地址。
- 弱化日期的概念
- 同一文章命名方式，一天可以写两篇文章（中文+英文），以前不可以的

这样的坏处是：

- 可能影响SEO

原本这个是我的理想中的解决方案。可惜它是无法实现的。因为不是所有的变量都可以作为 Jekyll 的 permalink 的一部分。比如说，Jekyll 不支持自定义的 lang 作为链接的一部分。Permalinks 支持的变量见官方文档 [Permalinks](https://jekyllrb.com/docs/permalinks/)。

### 方案四：使用两个 collections

第一个 collection 是默认的 `posts`，第二个 collection 是 `cn`。

这样的好处是（同方案三）：

- 在链接显示语言，可以直接知道另一个版本的地址。
- 弱化日期的概念
- 同一文章命名方式，一天可以写两篇文章（中文+英文），以前不可以的

这样的坏处是：

- 默认插件 jekyll-paginate 仅支持对于默认集合 posts 的分页。如果需要对另一个集合进行分页，需要使用 jekyll-paginate-v2 插件。可是 GitHub Pages 官方并不支持 jekyll-paginate-v2 插件。唉！

### 其他考虑因素

- 目前使用的主题对于国际化的支持。比如我使用的 [Jekyll TeXt Theme](https://github.com/kitian616/jekyll-TeXt-theme)，它对于国际化本身就有一定的支持。浏览页面的页眉、页脚等信息可以根据页面语言自动调整。但是它无法直接翻译文章本身。
- 如果你使用 GitHub Pages 的话，考虑 GitHub Pages 对于插件的支持。只有一部分 Jekyll 插件是 GitHub 官方支持的，其他插件安装以后也无法使用。除非你不使用官方的自动生成程序，而是采用在本地或者在 CI 生成页面的方法。
- 考虑别的 Jekyll 国际化插件，比如 [jekyll-multiple-languages-plugin](https://github.com/kurtsson/jekyll-multiple-languages-plugin)。我当时没有仔细研究，做完了才发现有这个插件...不过这个插件也不被 GitHub Pages 支持的。

## 他山之石

他山之石，可以攻玉。别人的博客是怎么做的呢？有没有值得借鉴的地方？

### Elasticsearch Blog

Elastic 公司的博客是支持国际化的，每篇文章都有多个语言版本，比如下面这篇[如何设计可扩展的 Elasticsearch 数据存储的架构](https://www.elastic.co/cn/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale)的文章：

![Elasticsearch blog i18n](/assets/20210711-elasticsearch-blog.png)

下面列出它的三种语言：

语言 | 链接
:--- | :---
How to design your Elasticsearch data storage architecture for scale | <https://www.elastic.co/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale>
如何设计可扩展的 Elasticsearch 数据存储的架构 | <https://www.elastic.co/cn/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale>
スケーラブルなElasticsearchデータストレージを設計する | <https://www.elastic.co/jp/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale>

它的命名方式如下：

```
https://www.elastic.co/blog/{post}
https://www.elastic.co/{country}/blog/{post}
```

英语博客没有 EN 前缀，其他语言以国家缩写作为前缀，比如 CN 代表中国、JP 代表日本。

### TeXt Theme

Jekyll TeXt Theme 是针对个人或团队网站、博客、项目、文档等的一款高度可定制的 Jekyll 主题。它参考了 iOS 11 的风格，有大而突出的标题和圆润的按钮及卡片。它是由阿里巴巴的大神田琦（[kitian616](https://github.com/kitian616)）所写。这个主题支持[国际化](https://tianqi.name/jekyll-TeXt-theme/docs/zh/i18n)。实际上，这个主题的文档本身就是实现了国际化的。不信你看：

语言 | 链接
:--- | :---
Quick Start | <https://tianqi.name/jekyll-TeXt-theme/docs/en/quick-start>
快速开始 | <https://tianqi.name/jekyll-TeXt-theme/docs/zh/quick-start>

它的命名方式如下：

```
https://tianqi.name/jekyll-TeXt-theme/docs/{lang}/{post}
```

无论什么语言，都以语言缩写作为前缀，比如 zh 代表中文、en 代表英语。我比较喜欢这个设计，因为这样每种语言都是平等的关系。

## 最终方案

最终方案是方案四：使用两个集合。第一个集合是默认的 `posts`，第二个集合是 `cn`。最主要的目标是把文章链接修改成下面的格式：

```
https://mincong.io/{country}/{post}
https://mincong.io/{country}/{page}
```

这里链接的两个部分：

- `country` 是国家，EN 代表英语类国家、CN 代表中国。选择这个表达方式而不是选择 en / zh，因为这不仅是语言的选择，页面内容也会随之改变：比如中文页面会推荐微信公众号而英语不会。以后我还考虑将其他组件分成两个不一样的版本：中英页面载入不同的评论系统、不同的SEO脚本等。
- `post` 或者 `page` 是博文的 ID 或者是其他页面的 ID。

接下来，我想跟大家分享一下实现国际化时，需要完成的具体任务。

## 具体任务

这个部分详细解析需要修改的具体任务，可能有点长，主要针对有兴趣修改自己博客的朋友。如果不考虑修改的话，建议略读。

### 任务一：修改中文文章

把文章链接修改成下面的格式：

    https://mincong.io/cn/{post}

对于中文文章，由于绝大部分文章都是今年四月份以后写的，没有保留原来链接的需要。在每篇文章的开头，加入两个信息：语言和链接重导向。

```diff
+ lang:                zh
  date:                2021-04-20 11:21:16 +0800
  categories:          [java-core]
  tags:                [java, akka]
@@ -13,6 +14,8 @@ excerpt:             >
  image:               /assets/bg-ocean-ng-L0xOtAnv94Y-unsplash.jpg
  cover:               /assets/bg-ocean-ng-L0xOtAnv94Y-unsplash.jpg
+ redirect_from:
+   - /2021/04/20/exponential-backoff-in-akka/
  article_header:
```

然后创建一个新的collection，叫做 `cn`。根据 Jekyll 命名要求，存放在文件夹 `_cn`，然后将所有的中文文章放在该文件夹中，并且去掉文件名中“年月日”的部分。

文章链接的变化：

- 之前：<https://mincong.io/2021/04/30/mongodb-schema-compatibility/>
- 之后：<https://mincong.io/cn/mongodb-schema-compability/>

此外，在全局配置中（`_config.yml`）配置 `cn` 集合的相关信息，比如链接的表达式、是否需要显示目录表等。详情见：<https://github.com/mincong-h/mincong-h.github.io/pull/31>

### 任务二：修改英语文章

我的博客有 168 篇英语文章，有些文章阅读量很高。我不想它们因为转换链接而丢失任何信息，比如 Disqus 上面的评论和点赞。我觉得这是一件得不偿失的事情。所以我对英语文章的策略是：对于已有的文章不作任何改动。对于新的文章，使用新的命名方式 `https://mincong.io/en/{post}`。在下文中，让我们进一步讨论一下。

对于已有的所有文章，在文章层面的 front matter 明确标记文章语言为英语：

```sh
find _posts -type f -exec sed -i '' -E 's/date:/i lang:                en' {} +
```

并且在加入 `permalink`，使得它们不受全局配置的干扰：

```sh
#!/bin/bash
paths=($(find "${HOME}/github/mincong-h.github.io/_posts" -type f -name "*.md" | tr '\n' ' '))
i=0
for path in "${paths[@]}"
do
    filename="${path##*/}"
    year=$(echo $filename  | sed -E 's/^([[:digit:]]+)-([[:digit:]]+)-([[:digit:]]+)-(.*)\.md/\1/')
    month=$(echo $filename | sed -E 's/^([[:digit:]]+)-([[:digit:]]+)-([[:digit:]]+)-(.*)\.md/\2/')
    day=$(echo $filename   | sed -E 's/^([[:digit:]]+)-([[:digit:]]+)-([[:digit:]]+)-(.*)\.md/\3/')
    name=$(echo $filename  | sed -E 's/^([[:digit:]]+)-([[:digit:]]+)-([  [:digit:]]+)-(.*)\.md/\4/')
    permalink="/${year}/${month}/${day}/${name}/"
    echo "${i}: year=${year}, month=${month}, day=${day}, name=${name}, permalink=${permalink}"
    sed -i '' -E '/comments:/i\
permalink:         PERMALINK
' "$path"
    sed -i '' "s|PERMALINK|${permalink}|" "$path"
    i=$((i + 1))
done
```

对于新的文章，使用新的命名方式（`_config.yml`）：

```diff
- permalink: /:year/:month/:day/:title/
+ permalink: /en/:title/
```

另外需要修改文章的生成脚本 `newpost.sh`，使得它生成中文和英语两篇文章。下面是脚本的节选：我们生成中英文两篇文章的路径，确认不存在以后，添加新内容。

```sh
title="${*:1}"

if [[ -z "$title" ]]; then
    echo 'usage: newpost.sh My New Blog'
    exit 1
fi

bloghome=$(cd "$(dirname "$0")" || exit; pwd)
url=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
filename="$(date +"%Y-%m-%d")-$url.md"
filepath_en="${bloghome}/_posts/${filename}"
filepath_cn="${bloghome}/_cn/${filename}"

if [[ -f "$filepath_en" ]]; then
    echo "${filepath_en} already exists."
    exit 1
fi

if [[ -f "$filepath_cn" ]]; then
    echo "${filepath_cn} already exists."
    exit 1
fi

append_metadata_en "$filepath_en" "$title"
append_metadata_cn "$filepath_cn" "$title"

# Not for EN, because EN post is translated.
append_content "$filepath_cn"

echo "Blog posts created!"
echo "  EN: ${filepath_en}"
echo "  CN: ${filepath_cn}"
```

详情见：<https://github.com/mincong-h/mincong-h.github.io/pull/37>

### 任务三：添加中文主页

添加中文主页听起来很简单，好像只要把 `index.html` 从博客首页复制到 `cn/index.html` 并翻译几个单词即可。其实并不然。。。我的首页使用了 Jekyll 官方的插件 jekyll-paginate (v1)。但是这个插件只支持对于默认集合 `posts` 的分页，不支持对于其他集合的分页，比如 `cn`。所有添加中文主页的真正含义是：升级插件到 jekyll-paginate-v2 以支持对中文集合 `cn` 的分页。

在网站配置（`_config.yml`）中安装并使用新的插件：

```diff
- paginate: 8
- paginate_path: /page:num # don't change this unless for special need
+ pagination:
+   enabled: true
+   per_page: 8


  ## => Sources
@@ -238,7 +240,7 @@ defaults:
  ##############################
  plugins:
    - jekyll-feed
-   - jekyll-paginate
+   - jekyll-paginate-v2
```

对于 TeXt Theme 主题本身的分页器进行修改，避免直接使用 `site.posts` 作为文章的来源。并且对于主页，也加入一个特定的前缀，使得英语和中文各有自己的主页，也就是 <https://mincong.io/> 和 <https://mincong.io/cn/>。

```diff

-     {% raw %}{%- assign _post_count = site.posts | size -%}{% endraw %}
+     {% raw %}{%- assign _post_count = paginator.total_posts -%}{% endraw %}
      {% raw %}{%- assign _page_count = paginator.total_pages -%}{% endraw %}
      <p>{% raw %}{{ _locale_statistics | replace: '[POST_COUNT]', _post_count | replace: '[PAGE_COUNT]', _page_count }}{% endraw %}</p>
      <div class="pagination__menu">
@@ -51,7 +51,7 @@
              </li>

            {% raw %}{%- elsif page == 1 -%}{% endraw %}
-             {% raw %}{%- assign _home_path = site.paths.home | default: site.data.variables.default.paths.home -%}{% endraw %}
+             {% raw %}{%- assign _home_path = site.paths.home | default: site.data.variables.default.paths.home | append: include.baseurl -%}{% endraw %}
              {% raw %}{%- include snippets/prepend-baseurl.html path=_home_path -%}{% endraw %}
```

其实还有一些其他修改需要考虑，不过由于篇幅问题不再展开。最后做出来的效果：首页的中英文对比图。

![首页的中英文对比图](/assets/20210711-diff-home.png)

详情见：<https://github.com/mincong-h/mincong-h.github.io/pull/32>

### 任务四：修改构建和部署方式

由于使用了 GitHub 官方不支持的插件 jekyll-paginate-v2，不能再使用以前的自动部署方式。现在需要改成手动打包部署。也就是，不再从 master 分支进行部署。当代码合并到 `master` 以后，通过手动或者 CI 生成新的网页（核心命令：`jekyll build`）。然后，将生成的内容，也就是处于文件夹 `_site` 的内容，上传到 `gh-pages` 分支进行部署。

实现上述功能的主要步骤如下：生成一个新的、与 master 无关的独立分支 gh-pages，添加一个空的 commit 作为分支的开始，然后清空本地的 Jekyll 生成文件的文件夹 `_site` 并将它连接到新的分支 gh-pages 去：

```sh
git checkout --orphan gh-pages
git commit --allow-empty -m "Initialize gh-pages"
rm -rf _site
git worktree add _site gh-pages
# "jekyll build" or equivalent commands
```

在实现这个任务时，还需要在 GitHub 项目的设置中，把分支从 master 改成 ph-pages：

![修改部署方式：不再使用 master 分支而是 gh-pages 分支部署](/assets/20210711-deploy-via-gh-pages.png)

详情见：Sangsoo Nam，[Using Git Worktree to Deploy GitHub Pages](https://sangsoonam.github.io/2019/02/08/using-git-worktree-to-deploy-github-pages.html)，2019。

### 任务五：修改更多的页面

在上面的任务中，我们主要提到了对于中文文章和英语文章的修改。但是一个博客除了文章以外，还有很多别的页面，比如分类、系列、归档、关于等。这些页面也需要进行修改才可以被正常地使用。

总的来说，对于页面之间的浏览，要实现英语网页里面所有的链接都会导向英文页面，中文网页里面所有的链接都会导向中文页面。这样对用户来说，能够营造出一个舒适的阅读体验：因为所有页面的语言都是他们熟悉的。然后对于已经存在的页面，我们需要对它们进行重导向到新的链接。下面是不同页面的枚举和已有页面的重导向：

首页：

```
https://mincong.io/
https://mincong.io/cn/
```

分类页面：

```
https://mincong.io/en/categories/
https://mincong.io/en/categories/{category}/
https://mincong.io/cn/categories/
https://mincong.io/cn/categories/{category}/

https://mincong.io/categories/           -> https://mincong.io/en/categories/
https://mincong.io/categories/{category} -> https://mincong.io/en/categories/{category}/
```

系列页面：

```
https://mincong.io/en/series/
https://mincong.io/en/series/{serie}/
https://mincong.io/cn/series/

https://mincong.io/series/        -> https://mincong.io/en/series/
https://mincong.io/series/{serie} -> https://mincong.io/en/series/{serie}/
```

关于页面：

```
https://mincong.io/en/about/
https://mincong.io/cn/about/

https://mincong.io/about/ -> https://mincong.io/en/about/
```

归档页面：

```
https://mincong.io/en/archive/
https://mincong.io/cn/archive/

https://mincong.io/archive/ -> https://mincong.io/en/archive/
```

详情见：<https://github.com/mincong-h/mincong-h.github.io/pull/34>

### 任务六：语言切换按钮

在网站中提供语言切换的按钮，使得用户可以在不同的语言中进行切换。这里主要有两个按钮：一个在页面的右上角，以国旗形式显示；另一个按钮在文章的标题部分，红色高亮代表当前语言，白色为可选的其他语言。这两个按钮不一样的地方在于，右上角的按钮点击以后会切换到另一语言的首页，而页面中的语言按钮会使页面直接跳转到同一文章的另一个版本。我把它们叫做“全局切换”以及“文章切换”。

![英语文章页面示例](/assets/20210711-post-en.png)

![中文文章页面示例](/assets/20210711-post-cn.png)

对于全局切换功能，主要是把另一语言的国旗、链接等信息写在页面导航的配置文件中，然后在页面生成的时候调用。

注册到页面导航的数据文件（`_data/navigation.yml `）中：

```yml
site:
  ...
  # switch to the other langage
  urls2:
    en        : /cn/
    zh        : /
  urls2_src:
    en        : /assets/flag-CN.png
    zh        : /assets/flag-US.png
  urls2_alt:
    en        : "切换到中文"
    zh        : "Switch to English"
```

生成页眉（`_includes/header.html`）时调用这些信息：

```html
<li>
  <a href="{% raw %}{{ _site_root2 }}{% endraw %}">
    <img src="{% raw %}{{ _site_root2_src }}{% endraw %}"
         alt="{% raw %}{{ _site_roo2_alt }}{% endraw %}"
         class="naviation__lang_img">
  </a>
</li>
```

对于局部切换的功能，实现方法则相当不同。这个是通过在其他语言的集合中寻找同名文章实现的。这里，不同语言的文章必须使用同样的文件名，不然无法找到。具体来说，我们先拿到文章的 ID，然后提取它最后的一个斜杠 `/` 以后的字符（含斜杠`/`），然后拿这个信息去遍历别的集合，然后返回相应的链接：

```liquid
{% raw %}{% assign _id = include.article.id %}{% endraw %}
{% raw %}{% assign _filename = _id | split: "/" | last %}{% endraw %}
{% raw %}{% assign _suffix = _filename | prepend: "/" %}{% endraw %}
{% raw %}{% assign _matched = include.collection | where_exp: "item", "item.id contains _suffix" | first %}{% endraw %}

{% raw %}{% if _matched %}{% endraw %}
  {% raw %}{% assign __return = _matched.url %}{% endraw %}
{% raw %}{% else %}{% endraw %}
  {% raw %}{% assign __return = nil %}{% endraw %}
{% raw %}{% endif %}{% endraw %}
```

详情见：

- <https://github.com/mincong-h/mincong-h.github.io/pull/34>
- <https://github.com/mincong-h/mincong-h.github.io/pull/36>

### 剩余任务：未完待续

做到这里，整个国际化任务基本就全部实现了。下面记录以下未来可以继续改善的任务：

1. 实现中英文两个RSS订阅。
2. 在中文页面实现更多的中国化加载功能，比如加载微信的 SDK 有助于分享、加载百度 SDK 提高搜索率、将 Disqus 替换成别的在中国大陆可以加载的评论系统、引入其他中文开发者平台。
3. 自动化中译英程序，通过脚本直接向第三方翻译平台提出翻译请求，比如谷歌翻译、DeepL 等。
4. 自动化构建和部署过程，比如参考 MrPowerScripts 的文章 [How to get around the jekyll-pagination-v2 limitation of GitHub pages with CircleCI](https://mrpowerscripts.com/github-pages-circleci-jekyll-paginate-v2/)。
5. 修复归档中的词云功能。目前词云使用 `site.tags` 进行标签统计。但是所有 cn 集合下的文章标签并未统计在内。
6. 修复文章分类功能。目前文章分类页面能显示中文，但是实际文章列表是英语文章。

如果你有别的建议，也非常欢迎留言讨论！

## 扩展

如何从这篇文章中拓展出去？

- 如果你从来没有听说过 Jekyll，你可以访问[官网](https://jekyllrb.com/)了解以下这个很好用的博客工具。
- 如果你从来没有试过免费的 [GitHub Pages](https://pages.github.com/)，不妨访问官网，尝试搭建一个属于你自己的个人博客
- 如果你没试过田琦大神的 [Jekyll TeXt Theme](https://tianqi.name/jekyll-TeXt-theme/)，没准你会想试一下。
- 如果你想了解更多关于 [jekyll-paginate-v2](https://github.com/sverrirs/jekyll-paginate-v2) 的更多咨询，可以访问他们的 GitHub

## 结论

在本文中，我们看到了本站 <https://mincong.io> 的国际化过程，一个基于 Jekyll 和 TeXt Theme 的国际化。我们比较了四个备选方案的好与坏；我们参考了别人博客对于国际化的实现；敲定最终方案以后，梳理了其中比较重要的六个任务；以及未来对于国际化的进一步展望。最后，我还分享了一些资源，让大家可以从本文拓展出去。希望这篇文章能够给你带来一些思考。如果你有兴趣了解更多的资讯咨询，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h) 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

- Elastic, "Elastic Blog", Elastic, 2021. <https://www.elastic.co/cn/blog/>
- MrPowerScripts, "How to get around the jekyll-pagination-v2 limitation of GitHub pages with CircleCI", MrPowerScripts, 2019. <https://mrpowerscripts.com/github-pages-circleci-jekyll-paginate-v2/>
- Sangsoo Nam, "Using Git Worktree to Deploy GitHub Pages", Sangsoo Nam, 2019. <https://sangsoonam.github.io/2019/02/08/using-git-worktree-to-deploy-github-pages.html>
- Jekyll, "Jekyll Documentation", Jekyll, 2021. <https://jekyllrb.com/docs/>
- Sverrir Sigmundarson, "jekyll-paginate-v2", GitHub, 2021. <https://github.com/sverrirs/jekyll-paginate-v2>
- Tian Qi, "Internationalization", TeXt Theme, 2021.
  <https://tianqi.name/jekyll-TeXt-theme/docs/en/i18n>
- Rahul Patil, "How to insert text after a certain string in a file?", Unix & Linux - Stack Exchange, 2014. <https://unix.stackexchange.com/a/121173/220624>
- Taewoo Lee, "\[Jekyll\](EN) Make array and add element in liquid", TWpower's Tech Blog, 2020. <https://twpower.github.io/228-make-array-and-add-element-in-jekyll-liquid-en>

<!-- 写作不易，希望大家点个赞、点个在看支持一下，谢谢(花) -->