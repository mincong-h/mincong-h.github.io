---
layout:              post
type:                classic
title:               How to write technical documentation?
subtitle:            >
    Given one sentence to expand the title or explain why this article may interest your readers.

lang:                en
date:                2022-10-16 10:04:02 +0200
categories:          [documentation]
tags:                [doc]
ads_tags:            []
comments:            true
excerpt:             >
    TODO
image:               /assets/bg-dmitrij-paskevic-YjVa-F9P9kk-unsplash.jpg
cover:               /assets/bg-dmitrij-paskevic-YjVa-F9P9kk-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

I have contributed a lot to company's internal documenatations and also wrote 210
blog posts in this website in the past 6 years. Therefore, I want to share my
experience about how to write technical documentations.

Writing technical documentation has many benefits: it allows users to understand
how to use the framework without jumping into the source code; it clarifies the
needs and the goals of your project; it helps teammates to understand the system
and success in their job.

After reading this article, you will understand:

* What are the different types of documentation?
* Who are your readers?
* How to improve each page?
* How to write less documentations?
* How to ensure that they are up-to-date?
* How to organize multiple pages?
* How to go further from this article?

Before continuing, I want you to know that I am a backend software enginer
and site reliability engineer (SRE). And my primary tool for writting
documentation these days is
[Confluence](https://www.atlassian.com/software/confluence). So my experience may not apply to your
domain. Leave me a comment if you have suggestion :) Now, let's get started!

## Types Of Documentation

The first thing to clarify is that there isn't just one type of
documentation: there are multiple ones. In this
[article](https://www.writethedocs.org/videos/eu/2017/the-four-kinds-of-documentation-and-why-you-need-to-understand-what-they-are-daniele-procida/),
Daniele Procida explained that there are 4 kinds of documentation:

1. learning-oriented tutorials
2. goal-oriented how-to guides
4. information-oriented reference material
3. understanding-oriented explanations

Structuring documentation according to its four distinct functions helps ensure
that each of them is adequately served. It also makes it far easier to write
and maintain.


**Tutorials** are designed for newcomers and beginners. They are learning-oriented.
Your users are
new to your framework and don't know much about it. You need to ensure that the
documentation explains the terminologies, highlights the architecture of the
framework, and avoid dive deep into implemtation of the framework. The primary
goal of these documents is to let your readers to achieve something with your
framework. It does not matter than much if you cover all the details, the most
important is that your readers find it enjoyable and learn something from your
documentation.

**How-to** guides target more intermediate users. They are goal-oriented. Your
readers know the basic
concepts of your framework, but they need to know more to solve a specific
problem. The key difference between tutorials and how-to guides is that now your
users know exactly what their problem is. Therefore, your document should focus
on their problem and tries to solve that. Solving the problem means describing the
problem properly, the context around the problem (upstream, downstream,
timeline, ...), the relationship between this component and other components in
the architecture, scenarios, etc.

**Reference materials** are detailed documentation about the
specification and implementation about your framework. They dive deep into
technical details and describe the behavior of certain components, functions,
etc. They are information-oriented.

**Explanations** are discussions that illuminates and clarifies a particular topic.
They are oriented understanding. It provides different kinds of background
knowledge of the topic, explain why it was done this way, and provides
alternatives of considering things.

## Who are your readers?

Once we know the types of documentation, it's time to understand who are your
readers. How your documentation can help them? In my working environment, my
readers can be my teammates, managers, leaderships, engineers in other teams,
etc. Depending on the readers, they have different goals when reading the
documentation and it's important to write the documentation to serve the
purpose. 

* For your teammates, they are probably the contributors of the framework. They
  care both the theoritical and the partical part of the framework. You
  can write documentation to explain the concept and decisions about the system
  design; write reference guide to describe technical details; write
  troubleshooting articles to debug some problems happened in production; etc.
* For managers and leaderships (big bosses), they don't care much about the
  practical side of the project, but more focus on the high-level overview of
  the project so we should emphasize the connections between component, impact,
  and other aspects which can give the indention of the project.
* For engineers in other teams, they are probably users of your framework. You
  need to write tutorials, how-to guides to help them to use your framework.

It's important to think about your audience before writing a new documentation.
It makes the intention much clearer.

## Section 3

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
