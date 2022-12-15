---
article_num: 205
layout:              post
type:                classic
title:               How to write technical documentation
subtitle:            >
    5 tips for writing documentation as a software engineer.

lang:                en
date:                2022-10-16 10:04:02 +0200
categories:          [documentation]
tags:                [doc]
ads_tags:            []
comments:            true
excerpt:             >
    Define the types of documentation, your audience, improve page content,
    write less, organize the relationship between pages, and more.

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

I have contributed a lot to the company's internal documentation. I also wrote 210
blog posts on this website and gained about 1 million page
views. Therefore, I want to share my
experience with you about how to write technical documentation.

Writing technical documentation has many benefits: it allows users to understand
how to use your framework without jumping into the source code; it clarifies the
needs and the goals of your project; it helps teammates to understand the system
and succeed in their missions.

After reading this article, you will understand:

* What are the different types of documentation?
* Who are your readers?
* How to improve each page?
* How to write fewer documents?
* How to organize multiple pages?
* How to go further from this article?

Before continuing, I want you to let know that I am a backend software engineer
and a site reliability engineer (SRE). My primary tool for writing
documentation these days is
[Confluence](https://www.atlassian.com/software/confluence). Because of the
differences in our backgrounds, my experience may not apply to your cases.
Leave me a comment if you have any suggestions :) Now, let's get started!

## Types of documentation

The first thing to clarify is that there isn't just one type of
documentation: there are multiple ones. In this talk 
["The four kinds of documentation, and why you need to understand what they are"](https://www.writethedocs.org/videos/eu/2017/the-four-kinds-of-documentation-and-why-you-need-to-understand-what-they-are-daniele-procida/),
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
framework, and avoids dive deep into implementation. The primary
goal of these documents is to let your readers achieve something with your
framework. It does not matter if you cover all the details, the most
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
the architecture, the coverage of different scenarios, etc.

**Reference materials** are detailed documentation about the
specification and implementation of your framework. They dive deep into
technical details and describe the behavior of certain components, functions,
etc. They are information-oriented.

**Explanations** are discussions that illuminate and clarify a particular topic.
They are understanding-oriented. It provides different kinds of background
knowledge of the topic, explains why it was done this way, and provides
alternative solutions.

## Who are your readers?

Once we know the types of documentation, it's time to understand who are your
readers. How your documentation can help them? In my working environment, my
readers can be my teammates, managers, leaders (VP+), and engineers in other
teams. Depending on the readers, they have different goals when reading the
documentation and it's important to write the documentation to serve the
purpose. 

* **Your teammates** are probably the contributors of the framework. They
  care both the theoretical and the practical parts of the framework. You
  can write documentation to explain the concept and decisions about the system
  design; write a reference guide to describe technical details; write
  troubleshooting articles to debug some problems that happened in production; etc.
* **Managers and leaderships** care less about the
  practical side of the project since they don't participate actively in
  development. They are more focused on high-level things: the overview of
  the project, the progress of the work, the important decisions made, or some
  critical pieces. Therefore, we should emphasize the connections between
  components,
  the impact, the indention of the project, the reasons, or anything else that
  can be easy to read and follow.
* **Engineers in other teams** are probably users of your framework. You
  need to write tutorials, and how-to guides to help them to use your framework.

It's important to think about your audience before writing new documentation.
It makes the intention much clearer. Also, try to think about "what can I do to help
them solve their problems" rather than "what I want to write" makes it easier
for readers to understand your doc. Obviously, everyone's situation is
different but I believe that
the general concept of "thinking about your readers" remains the same.

## How to improve each page?

Now, focus on pages, how can we improve each of them? Here are some ideas that I
want to share.

**Choose the type of documentation.** In the previous section, we mentioned that
there are tutorials, how-to guides, reference material, and explanations.
Choosing the type of documentation lets you, the writer, focus on
what you want to write and drop what you don't want.

**Define your readers.** In the previous section, we mentioned that we need to
understand who are your readers and what are their goals. This also helps you
for structuring your content.

**Keep the read time under 10 minutes.** I believe that a long document is very hard
for readers. It's hard to navigate and hard to keep focus for a long time.
Depending on the type of document, it may be better to split a big one into
smaller ones, each of which serves a different purpose. For example, if an
article is mixed with high-level concepts of your framework, a detailed
explanation of some components, and a section for describing potential issues.
Then, it may be worth splitting it into 3 documents: one focus on describing the
high-level concept (tutorial); one focus on the detailed feature of some
components (reference materials); and the last one on the troubleshooting
(how-to guides). Therefore, it's easier for your readers.

**Having a common thread running through different sections.** A common thread
is an idea
or theme that is consistently present in those sections. It makes the logic easy
to follow and keeps the attention of your readers. This common thread can be in
one of these dimensions: the timeline, the project development lifecycle,
different aspects of the project, upstream and downstream, ... It is also a good
practice to write the outline before writing the whole documention.

**Using diagrams to express your idea.** A good diagram is worth a thousand
words. It allows you to better express the
relationship across multiple dimensions: time, components, exchange protocols,
system boundary, object's lifecycle, synchronization, etc. Also, it is more
visual and easy to understand. I use a lot of
diagrams in my documentation. To draw and maintain diagrams, here are two
important aspects that you need to know:

* **Types:** there are many types of diagrams, such as flow chart, sequence diagram,
  class diagram, state diagram, entity relationship diagram, and more.
  You can choose the type based on what you need.
* **Tools:** there are many tools that help you to draw diagrams. In my work, I
  mainly use GitHub and Confluence. Both of them support
  [Mermaid](https://mermaid-js.github.io/mermaid/#/): a framework to
  draw diagrams from code using a simple syntax. On GitHub, just use `mermaid` as
  the language syntax for your code blocks; on Confluence, there is a [Mermaid
Diagrams](https://marketplace.atlassian.com/apps/1226567/mermaid-diagrams-for-confluence?hosting=cloud&tab=overview)
  plugin that allows you to describe diagram in code and generate the results for you.
  For quick drawing, I also use [Excalidraw](https://excalidraw.com), a
  whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel
  to them. There are other paid tools like
  [Lucidchart](https://www.lucidchart.com/pages/).

**Using templates to structure your idea.** Using templates can help you better
structure your document without too much effort. In Confluence, there are
[Confluence Templates](https://www.atlassian.com/software/confluence/templates)
that allow you to bootstrap your document with a predefined style: how-to
article, retrospective, troubleshooting article, or product requirements, ... they
allow you to write documents faster and in a more consistent way over time (both for you
and for your team). Here, I am using Confluence as an example, but you can imagine
similar things for other documentation products.

There are probably much more details that we can discuss but I want to keep this
section concise. I can write another article about this if you are interested.
Now, let's go to the next section, where we are going to talk about how to write
less documentation.

## Write Less

Documentation can be really useful, but we don't write it for its own sake. It's
here to help people to get stuff done. And often through writing documentation,
you discover much bigger problems. Maybe the procedure you're writing is
really complicated and messy. Maybe you're building something that has a concept
that is really hard to explain, or maybe you find out that things don't work in
the way that you thought or they should. **If you find yourself documenting
around the problem, try to fix it may be a better solution.** This is what
Beth Aitman explained in her presentation [Writing effective
documentation - YouTube](https://youtu.be/R6zeikbTgVc) in the conference "Lead Dev" in
Berlin. She is a technical writer working at Google.

## Organize pages

Now you wrote some pages but it starts becoming hard for readers to find
information. So what should you do? It's time to think about the organization of the
pages.

**Structure documents into domains.** You can put pages into multiple domains,
each of them having different purposes. Therefore, when people are looking for
pages related to one domain, it's natural to go to that domain to find it. For
example, in a data engineering team, you can imagine having domains: processing,
storage, operations, etc. If the team becomes bigger, consider having sub-domains
under the top domain, such as processing (service P1, service P2, service P3),
storage (writer W1, writer W2, reader R1, reader R2, ...), CI/CD (build, release,
deployment), operations (alerting, on-call, automation), etc. You can also think
it as a file system:

```
/domain/sub-domain/.../page
```

Therefore, it helps people to understand how to find your documents. In
Confluence, you can achieve that by using child pages.

**Tags.** Sometimes you need
more ways to group pages. For example, if you want to organize your documents in
non-technical aspects (team, project, ...). You may need other tools
to help you as well. One possible way is to use tags. In Confluence, you can use
the macro ["Content by
Label"](https://confluence.atlassian.com/doc/content-by-label-macro-145566.html)
to achieve that. You need to add labels to each page that you want to be
selected and provide those labels as a query in the macro. Then, you can see them
being displayed on your page. Therefore, you can link to multiple pages easily.

**Make the title searchable.** You need to make the title of the page
comprehensible. People do not always look into your documentation
through the links that you provided. They may search the title using the search
engine (either Google, Confluence search, or anything else). Therefore, the
title of your articles plays a critical role in the documentation. People
won't be able to read the awesome content you wrote if they cannot find it in
the search engine. See [Writing technical documentation (16:00) -
YouTube](https://youtu.be/a4L9GhldTHo?t=960), made by Fredrik Christenson, for
more details.

## Going Further

If you want to go further from this article ...

* To learn more about Mermaid Diagrams and its syntax, visit the official
  documentation <https://mermaid-js.github.io/mermaid/#/>
* To learn more about the four kinds of documentation, watch Daniele Procida's
  video ["What nobody tells you about
  documentation"](https://youtu.be/p0PPtdRHG6M) on YouTube.
* To learn more about how to write effective documentation from a Google's
  technical writer's point of view, watch Beth Aitman's video ["How to write
  effective documentation"](https://www.youtube.com/watch?v=R6zeikbTgVc) on YouTube.
* This article does not mention the maintenance effort, doc versionning, doc
  generation from code, doc hosting, and more advanced topcis. But they are
  important aspects to be considered as well.

## Conclusion

In this article, we talked about how to write technical documentation,
including the 4 types of documentation, the audience, improving each page, how
to write less documentation, and how to organize multiple pages.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Beth Aitman, "Writing effective documentation", _Lead Dev Berlin_, 2019.
  <https://youtu.be/R6zeikbTgVc>
- Daniele Procida, "The four kinds of documentation, and why you need to
  understand what they are", _Write the Docs Prague_, 2017.
  <https://www.writethedocs.org/videos/eu/2017/the-four-kinds-of-documentation-and-why-you-need-to-understand-what-they-are-daniele-procida/>
- Fredrik Christenson, "Writing technical documentation", _YouTube_, 2018.
  <https://youtu.be/a4L9GhldTHo>
