---
layout:              post
title:               M 语言是什么鬼？
subtitle:            >
    法国人：为了收税，冲鸭！

lang:                zh
date:                2021-06-01 18:33:07 +0200
categories:          []
tags:                [mlang]
comments:            true
excerpt:             >
    法国人：为了收税，冲鸭！

image:               /assets/bg-ben-white-qDY9ahp0Mto-unsplash.jpg
cover:               /assets/bg-ben-white-qDY9ahp0Mto-unsplash.jpg
redirect_from:
  - /2021/06/01/lang-m/
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

不知不觉中又到了每年五六月，报税的日子。。。在法国生活的你，对报税一定不陌生。可是你知道 M 语言吗？让我们从 GitHub 的项目[MLanguage/mlang - M 语言编译器](https://github.com/MLanguage/mlang)看看 M 语言到底是什么鬼：

> The M language has been invented by the French Direction Générale des Finances Publiques (DGFiP), equivalent to the IRS, to transcribe the tax code into machine-readable instructions. It is a small Domain Specific Language based on variable declarations and arithmetic operations. This work is based on a retro-engineering of the syntax and the semantics of M, from the codebase released by the DGFiP.

M 语言是由法国财政部 DGFiP（相当于美国税务局 IRS）创造的编程语言，用于把税务代号转录成机器可读命令。它是基于变量声明和算术预算开发的一个小的领域专用语言（DSL）。（M 语言编译器）是从已发布的法国财政部代码中，对语义和语法进行逆向工程研发的。

哦，原来是为了税收研发的，这也是够拼啊！这不，源代码都在著名的开源社区 GitHub 开源了：

![etalab / calculette-impots-m-source-code](/assets/20210601-repo.png)

那我们看看它的源代码长什么样吧。。。

## 源码分析

哇，84.6%代码都是由 M 语言写的，剩下的部分有 MATLAB、Objective-C 等：

![代码行数和贡献者](/assets/20210601-contributions.png)

仓库的 README 上面说了，这个代码库的代码不是由 UTF-8 编码存储的，而是由 latin1 编码存储的。如果要用 UTF-8 显示，请使用 `convert_encoding.py` 这个 Python 脚本。好吧。。。仓库的 README 还说，代码已经不再 GitHub 更新了，转移到 https://framagit.org/dgfip/ir-calcul 上面了。不过 framagit 上面的仓库是闭源的，没有权限进不去。算了，还是在 GitHub 看吧。

那我们随便找个文件看看，比如这个用来 2013 申报 2012 年个人所得税的第四章节的文件 chap-4.m 的[第 1398 行到 1400 行](https://github.com/etalab/calculette-impots-m-source-code/blob/master/sources-utf8/sources2012m_3_13/chap-4.m#L1398-L1400)：

```
NRCELJOQR = (max( min(RCEL_JOQR , RRI1-NRLOGDOM-NRRI2-NRCELRREDLA-NRCELRREDLB-NRCELRREDLE-NRCELRREDLC-NRCELRREDLD-NRCELRREDLF-NRCELREPHS-NRCELREPHR-NRCELREPHU
			          -NRCELREPHT-NRCELREPHZ-NRCELREPHX-NRCELREPHW-NRCELREPHV-NRCELREPHF-NRCELREPHE-NRCELREPHD-NRCELREPHH-NRCELREPHG-NRCELREPHB-NRCELREPHA
			          -NRCELHM-NRCELHL-NRCELHNO-NRCELHJK-NRCELNQ-NRCELNBGL-NRCELCOM-NRCEL-NRCELJP-NRCELJBGL) , 0)) ;
```

完全不知道在写什么，只看懂了 max 和 min 两个函数。。。好吧，仔细看看发现好多变量都是以 NRCELRREDL 开头的。可能财政部的程序员自己也看不下去了，他们在下一年，也就是 2014 年申报 2013 年个人所得税的时候。把代码改了一下，改成的下面这样，也就是文件中的[第 3490 行到 3493 行](https://github.com/etalab/calculette-impots-m-source-code/blob/master/sources-utf8/sources2013m_3_8/chap-4.m#L3490-L3494)。他们把 NRCELRREDL 提取出来，最后一位以 i 表示，然后 i 可以等于 A,B,E,M,C,D,S,F,Z，然后求和（somme）：

```
NRCELJOQR = (max( min(RCEL_JOQR , RRI1-NRLOGDOM-NRRI2-somme(i=A,B,E,M,C,D,S,F,Z : NRCELRREDLi)-NRCELRREDMG
                                                       -somme (i=S,R,U,T,Z,X,W,V,F,E,D,H,G,B,A : NRCELREPHi )
                                                       -somme (i=U,X,T,S,W,P,L,V,K,J : NRCELREPGi )
                                                       -NRCELHM-NRCELHL-NRCELHNO-NRCELHJK-NRCELNQ-NRCELNBGL
                                                       -NRCELCOM-NRCEL-NRCELJP-NRCELJBGL) , 0)) ;
```

呵呵，好复杂。。。

那写一个税务系统到底需要多少行代码呢？我们一起来看看 2013 年的版本，一共 45 个文件 56424 行代码，其中我给大家展示的第四章 chap-4.m 有 7315 行。它还不是最长的，最长的是 tgvH.m 有 15274 行：

```
➜  sources2013m_3_8 git:(master u=) find . -type f -exec wc -l {} +
     336 ./coi2.m
     475 ./chap-plaf.m
     546 ./coc1.m
     336 ./coc5.m
      57 ./horizoi.m
      52 ./horizoc.m
     291 ./chap-84.m
    3065 ./chap-inr.m
     102 ./chap-52.m
      48 ./chap-thr.m
    7345 ./chap-4.m
      88 ./chap-83.m
     159 ./chap-tl.m
    1393 ./coc2.m
    1634 ./chap-ini.m
    1135 ./coi1.m
    2191 ./chap-majo.m
     364 ./errH.m
    2190 ./chap-cmajo.m
     244 ./chap-87.m
    1499 ./chap-3.m
    1060 ./chap-51.m
    1094 ./chap-7.m
     200 ./chap-88.m
     577 ./coc3.m
     711 ./chap-perp.m
     315 ./chap-82.m
      99 ./chap-ctl.m
     271 ./chap-86.m
    3576 ./res-ser2.m
     381 ./coc7.m
     810 ./chap-teff.m
     276 ./chap-2.m
     247 ./chap-isf.m
     123 ./chap-6.m
     921 ./chap-cinr.m
     757 ./chap-cor.m
    3486 ./chap-aff.m
     163 ./coi3.m
   15274 ./tgvH.m
     290 ./chap-81.m
     661 ./res-ser1.m
     682 ./chap-85.m
     433 ./coc4.m
     467 ./chap-1.m
   56424 total
```

那这个 tgvH.m 又是什么鬼呢？根据[openfisca/calculette-impots-m-source-code](https://framagit.org/openfisca/calculette-impots-m-source-code)，这个文件是算 2042 号表单用的：

> tgvH.m : Tableau général des variables qui assure la correspondance entre les codes issus de la 2042 et les variables internes au calcul, les variables de calcul et les variables restituées par la calculette IR

文件 tgvH.m 是一个通用表格，它申明了 2042 号表单中出现的代号对应的变量、用于计算的变量、计算内部需要的变量、以及计算结果展示的变量。OK，明白了，声明了一万多个变量。。。

## 2042

那 2042 表单（Formulaire Nº2042）又是什么呢？在法国税务局的官网的[Formulaire 2042](https://www.impots.gouv.fr/portail/node/8889.)这一页，我们可以看到：

![Formulaire 2042](/assets/20210601-2042.png)

“2042 号收入申报表让你可以申报一户人所有成员的收入。它是用来计算所得税的。2042 RICI 表单则是让你申报税收减免以及税收优惠的表单”。原来如此。。。

话说我的同事发现，这个系统好像。。。没有测试？？程序员：就几万行代码和一些数学公式而已，不写也罢（微笑脸）

## 错误代号

看到了这么工整的代码、这么整齐的变量申明、还有一个额外的 M 语言编译器，那代码肯定能正常运行，绝对不会多收纳税人的钱。如果有什么错，那肯定是填写的人的错，对吧？那我们下面看看填写可以出什么错（微笑脸）

这些错都总结在 [errH.m](https://framagit.org/openfisca/calculette-impots-m-source-code/-/blob/master/src/errH.m) 文件里面了。比如说：

```
A00107:anomalie :"A":"001":"07":"LES MONTANTS DECLARES A L'ISF NE PEUVENT EXCEDER 8 CARACTERES":"O";
```

在申报巨富税（ISF），输入的金额不要超过 8 位数，不然系统支持不了（微笑脸）。不过大家也不用太担心，财富不超过 130 万欧元，不用交巨富税（链接：[Calcul de l'ISF](https://www.impots.gouv.fr/portail/particulier/calcul-de-lisf)）。

当然，也不是所有的错误都这么好理解的，比如 A01010 这个错误，你看懂了吗：

```
A01001:anomalie :"A":"010":"01":"INCOHERENCE ENTRE LA SITUATION M ET LES CODES G, N, W, L":"N";
```

反正我没有看懂。。。

最近国内开放三胎，那我们也看看关于生育政策的错误吧！

```
DD17:discordance :"D":"D17":"00":"ACCROISSEMENT DU NOMBRE DE PARTS > 4 PAR RAPPORT A N-1":"N";
```

如果你在过去一年内生了超过 4 个孩子，那么你会把报税系统搞崩溃。（微笑脸）

## M 语言

在上文我们大概看了 calculette-impots-m-source-code 的代码。下面我们来关注一下 M 语言本身吧。M 语言的 REAME 上面的“已知局限（Knonw Limitations）“里面说：

> The code released by the DGFiP is not complete as of September 2020. Indeed, in order to correctly compute the amount of taxes for a fiscal household, the DGFiP executes the M program several times, each time changing the values of some variables to enable or disable parts of the computation.

至少在 2020 年 9 月来说，法国财政部发布的代码是不完整的。实际上，为了正确地计算出一户人的税务金额，法国财政部需要执行好几遍 M 程序，每次修改一些变量，从而启用或禁用部分功能。小编：。。。

> The DGFiP has not published the source code of this iterative computation. However, the authors of Mlang have come up with a new DSL called M++, used for describing the logic of this iterative computation. Currently, the authors have transcribed the unpublished source code into the mpp_specs/2018_6_7.mpp file, which has been tested only for the computation of taxes for the 2018 income.

法国财政部没有公布这个迭代计算的代码。不过，M 语言的作者们创造出了一个新的领域专用语言（DSL）：M++，以用于描述这个迭代的逻辑。目前，M 语言的作者们已将未公布的源代码转录成 mpp_specs/2018_6_7.mpp 这个文件，但仅在计算 2018 年收入的计算中被测试过。

如果你觉得脑洞不够大，我们再来看看这个 M 语言编译器的大体架构：

![M语言编译器的大体架构](/assets/20210601-mlang-architecture.png)

首先，代码被解析成抽象语法树 AST（包括 M 和 M++）。然后，AST 被解构成 M 和 M++的中间表示法（IR：Intermedia Representation）。BIR 代表后端 IR（Backend IR），它收集了 M++内联 M 代码的结果。OIR 是优化 IR（Optimization IR），它是 BIR 的一个 CFG 形式。

## 结论

在本文中，我们看到了法国财政部 DGFiP 为了税务系统创造出来的语言，它奇妙的语法结构以及数以万计的变量申明。。。我们明白了报完税能够不出错，可能不是一件容易的事情。不要赚太多钱或者不要一年生太多娃，不然可能会搞垮法国的报税系统。最后，我们还简要讨论了 M 语言、M++语言和它的语法树转录过程。希望这篇文章能够给你带来一些思考，让你的报税变得更加放心。。。谢谢大家！

## 参考文献

- <https://github.com/MLanguage/mlang>
- <https://framagit.org/openfisca/calculette-impots-m-source-code>
- <https://www.impots.gouv.fr/portail/node/8889.>
