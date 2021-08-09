---
layout:              post
title:               如何防止 Elasticsearch 中的数据丢失？
subtitle:            >
    六个提高数据可靠性的实战方案。

lang:                zh
date:                2021-07-31 09:50:49 +0200
categories:          [elasticsearch]
tags:                [elasticsearch, java, system-design, reliability]
comments:            true
excerpt:             >
    六个提高数据可靠性的实战方案：提高副本分片、快照与恢复、RAID、MQ等

image:               /assets/bg-chase-charaba-uRHzV3ca2fk-unsplash.jpg
cover:               /assets/bg-chase-charaba-uRHzV3ca2fk-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
ads:                 none
---

<!--
  Replace asset link with following on Chinese Platforms:
  https://github.com/mincong-h/mincong-h.github.io/raw/master/
 -->

## 前言

在当下，数据可靠性（data reliability）对于每个企业来说都是至关重要的事情。只有当具备可靠的数据，我们才可以依赖数据创造出高效好用的软件。在数据实时化、智能化、全球化的应用场景下，保证数据的可靠性则更为重要。今天，我想跟大家讨论一下，我对于如何在 Elasticsearch 中避免数据丢失这个问题的一些看法。

阅读本文后，你会明白：

- 数据什么时候会丢失？
- 提高副本分片数
- 快照与恢复
- 使用 RAID 磁盘阵列
- 数据队列（message queue）整合
- 主副分片存在不同节点
- 避免使用单一可用区

事不宜迟，让我们马上开始吧！

## 数据什么时候会丢失？

Elasticsearch 集群的健康状态分为三个等级（颜色）：绿色、黄色、红色。

在分片层面下：

- 红色的状态意味着此分片无法被分配到集群内
- 黄色的状态意味着主分片已经被分配，但是一个或多个副本分片并没有被分配
- 绿色的状态意味着所有的分片都已经被成功地分配

在索引的层面下，它的健康状态由最差的分片状态决定。而在集群的层面下，它的健康状态由最差的索引状态决定。

所以当集群在红色状态下，这意味着某些分片数据没有能够被正常初始化或者已有数据存在损坏或者丢失的情况。这篇文章的重点就是避免黄色或者红色的状态出现，让集群尽量处于绿色状态。

## 提高副本分片数

提高副本分片数是一个简单的提高数据可靠性的办法。当一个分片被放在集群的多台机器时，如果单台机器出现硬盘损坏，其他机器受到影响的可能性不大。我们依然有 N - 1 个可用的分片。副本分片数越高，那么丢失数据的可能性也就越低。通过 [Update index settings API (7.x)](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-update-settings.html "Update index settings API (7.x)") 可以调整副本分片数。比如，如果需要一个主分片和两个副本分片的话，可以使用发送以下的 HTTP 请求到集群：

```
PUT /my-index-000001/_settings

{
  "index" : {
    "number_of_replicas" : 2
  }
}
```

提高分片数这个方法虽然好用，但是它也有明显的不足。那就是。。。贵！比如说我们总共有 6TB 的集群储存空间，一主一副的方案可以储存 6TB / 2 = 3TB 的数据，而一主二副的方案则只能储存 6TB / 3 = 2TB 的数据，利用率降低 33% 成本提高 50%。

## 快照与恢复

使用无论哪个存储数据的软件，定期备份你的数据都是很重要的。上文提到的 Elasticsearch 副本提供了高可靠性；它们让你可以容忍零星的节点丢失而不会中断服务。但是，副本并不提供对灾难性故障的保护。对这种情况，你需要的是对集群真正的备份 — 在某些东西确实出问题的时候有一个完整的拷贝。Elasticsearch 的快照与恢复功能（Snapshot And Restore）是避免数据丢失的很好的方法。Elasticsearch 将当前集群的状态和数据备份到一个仓库里。这个过程是增量的：第一个快照是全量快照，后续快照则会保留已有快照和新数据之间的差异。

快照支持不同类型的仓库，它们通过在集群中安装插件的方式实现。在 Elasticsearch 7 中官方支持的插件有：

- [Amazon S3 仓库插件](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-s3.html "Amazon S3 仓库插件")
- [Azure 仓库插件](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-azure.html "Azure 仓库插件")
- [Hadoop HDFS 仓库插件](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-hdfs.html "Hadoop HDFS 仓库插件")
- [Google Cloud Storage 仓库插件](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-gcs.html "Google Cloud Storage 仓库插件")

非官方的插件有：

- [Openstack Swift 仓库插件](https://github.com/BigDataBoutique/elasticsearch-repository-swift "Openstack Swift 仓库插件")，由 Wikimedia Foundation 和 BigData Boutique 开发和维护。
- [阿里云仓库插件](https://github.com/aliyun/elasticsearch-repository-oss "阿里云仓库插件")，由阿里云开发维护。

使用快照的好处主要是降低备份的成本、对灾难性故障有保护，在出问题时有完整的拷贝。另一个好处是它可以跨集群恢复，所以可以使用快照和恢复功能做出自定义的解决方案，比如冷热分离的数据储存系统。使用快照的局限性在于：1、整个设置过程比较复杂，需要对云供应商有一定的了解，需要搭建储存桶（创建、设置权限、监控等）；2、只能够在支持插件的平台使用，也就是 AWS / Google / Azure / Aliyun / Tencent 等；3、对于没有快照的数据无法恢复。

## 使用 RAID 磁盘阵列

<!--
  Use https://www.elastic.co/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale for EN
 -->

RAID（Redundant Array of Independent Disks）即独立磁盘冗余阵列，简称为「磁盘阵列」，其实就是用多个独立的磁盘组成在一起形成一个大的磁盘系统，从而实现比单块磁盘更好的存储性能和更高的可靠性。常见的方案有：RAID0 / RAID1 / RAID5 / RAID6 / RAID10。不同的方案在数据丢失、性能和停机时间方面的预期表现不一样。它的实质是在单机的磁盘层面，通过不同类型的双写或者验证，实现了数据可靠性。由 Matt Davis 写的 Elasticsearch 官方文章[如何设计可扩展的 Elasticsearch 数据存储的架构](https://www.elastic.co/cn/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale "如何设计可扩展的 Elasticsearch 数据存储的架构")详细讨论了 RAID0 / RAID1 / RAID5 / RAID6 的利弊。欢迎大家阅读那篇文章了解更多的详情。

个人认为这个解决方案不太适合企业使用，因为它只对单机磁盘有效。对于企业级的数据平台来说，更多的考量因素是降低对于单机可靠性的依赖、运行价格、对抗灾难性故障（比如整个可用区故障）等。

## 数据队列 MQ 整合

另一个思路是整合数据队列（message queue），比如当下很流行的 Apache Kafka。大致的思路是：先把消息写进 Kafka 的消息队列中，然后让一个 Kafka 的 consumer 去读取这些数据并写入 Elasticsearch 中。只有在数据被成功写入以后才 commit offset。同样道理，可以要求 consumer 只有在数据被快照以后才 commit offset。将这样的好处是避免数据丢失：当 Elasticsearch 拒绝接受写入请求、未通过快照备份数据时，数据依然保留在 Kafka 中。这样的设计将数据丢失问题转化为数据延迟问题，将一部分问题从 Elasticsearch 转移到 Kafka。它也有效地解决了上文中“快照功能无法恢复未快照数据”的问题，因为这部分数据现在可以从 Kafka 中恢复了。

换句话说，这个解决方案暂存了未写入 ES 的数据、暂存了未快照数据。它适合数据量很大的应用场景，为出现 ES 写入异常、未快照部分等问题的高效解决方案。由于使用了 Kafka，它的容灾性也很强。它的不足点在于：它的复杂度，它给系统引入了数据队列以及与相应的消费者逻辑；它的可靠性也依赖于团队的编程能力；运维难度也相应增加。

## 主副分片存放在不同节点

另一个设定是 [index.routing.allocation.total_shards_per_node](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/allocation-total-shards.html "total_shards_per_node") 。它允许我们设定一个索引在一个节点中可以同时存放的分片数。默认是无限个。通过设置这个值到 1，可以保证每个索引的分片都放在不同的节点。这个做法使得丢失任何一个节点都不是很可怕，不会引起数据丢失，因为只丢失了一个分片而已。索引的剩余分片会被重新拷贝，形成新的分片。

这个做法的好处是容易实现，能够保证在丢失一个节点时，集群不会变成红色。但在节点不足的情况下，分片可能无法被分配，导致索引黄色。

## 避免使用单一可用区

避免使用单一可用区（Availability Zone）。当集群的节点被部署在多个可用区的时候，能有效降低数据丢失的可能性，尤其是集群受到云供应商可用区事故影响的几率。在AWS、阿里云等供应商的Elasticsearch集群都支持多可用区部署，具体操作参考 [AWS 博客](https://aws.amazon.com/fr/blogs/database/increase-availability-for-amazon-elasticsearch-service-by-deploying-in-three-availability-zones-2/ "Increase availability for Amazon Elasticsearch Service by deploying in three Availability Zones - AWS Database Blog")和[阿里云文档](https://partners-intl.aliyun.com/help/doc-detail/151655.htm "High availability - Alibaba Cloud")。然后，在 Elasticsearch 的集群中，可以通过 allocation awareness attributes 设置集群的分片分配策略。比如在每个集群节点的配置文件 `elasticsearch.yml` 中以下配置

```yml
node.attr.availabilityzone: az1
cluster.routing.allocation.awareness.attributes: availabilityzone
```

可以设置节点在可用区 az1 / az2 / az3 等。具体操作可以参考 Opster 公司的文章 [Setting Up Zone Awareness for Shard Allocation in Elasticsearch](https://opster.com/elasticsearch-glossary/elasticsearch-zone-awareness/ "Setting Up Zone Awareness for Shard Allocation in Elasticsearch")。

## 比较

下面让我们比较以下每个方案的好处以及一些不足之处。

方案  | 好处 | 坏处/不足
:--- | :--- | :---
增加副本 | 操作简单快捷 | 降低集群利用率，提高运营成本高。
快照和恢复 | 容灾性强、价格实惠 | 前期设置复杂、只能在特定云平台使用、对于没有快照的数据无法恢复。
RAID 磁盘阵列 | 有效防止磁盘损坏 | 只对单机有效。降低集群利用率，提高运营成本高。无法应对非磁盘故障、机房灾难性故障。
MQ 整合 | 容灾性强、暂存未写入 ES 的数据、暂存未快照数据、适合大数据场景 | 系统复杂度高、运维成本高
主副分片存放不同节点 | 操作简单快捷 | 可能不适用于小集群，导致分片无法分配
多可用区 | 容灾性强 | 需要结合云供应商配置

## 扩展

如何从这篇文章中拓展出去？

这篇文章的重点是防止数据丢失的方式，而不是出现问题后的故障排查。但是故障排查也是很重要的部分，对这方面有兴趣的朋友可以看看铭毅天下的博文[Elasticsearch 集群故障排查及修复指南](https://blog.csdn.net/laoyang360/article/details/109699085 "Elasticsearch 集群故障排查及修复指南")或者由 Ali Beyad 写的 Elastic 官方博文 [RED Elasticsearch Cluster? Panic no longer](https://www.elastic.co/blog/red-elasticsearch-cluster-panic-no-longer)。

## 结论

在本文中，我们看到了在 Elasticsearch 中几个提高数据可靠性的实战方案，包括：提高副本分片数、快照与恢复、使用 RAID 磁盘阵列、结合 Kafka 等 MQ 技术使用、主副分片存不同节点、以及避免使用单一可用区。最后，文章比较了它们的好与坏，还分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你的 Elasticsearch 集群更加高效可用。如果你有兴趣了解更多的资讯，欢迎关注我的 GitHub 账号 [mincong-h](https://github.com/mincong-h "GitHub") 或者微信订阅号【码农小黄】。谢谢大家！

## 参考文献

- Elastic，["Elasticsearch: 权威指南"](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html "Elasticsearch: 权威指南")，2021 年。
- Elastic，["Snapshot/Restore Repository Plugins"](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository.html)，2021 年。
- 慕课网，[RAID磁盘阵列是什么（一看就懂）](https://zhuanlan.zhihu.com/p/51170719)，2018 年。

<!--
 WeChat:
   写作不易，希望大家点个赞、点个在看支持一下，谢谢！
   ![](https://mincong.io/assets/wechat-QR-code.jpg)

 CSDN:
   ![扫码关注](https://img-blog.csdnimg.cn/img_convert/f07c6cc9272c721180bad20c599e4ff7.png#pic_center =600x333)
-->
