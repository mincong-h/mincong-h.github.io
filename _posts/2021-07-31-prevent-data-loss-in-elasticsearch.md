---
layout:              post
title:               How to prevent data loss in Elasticsearch?
subtitle:            >
    Six practical solutions to improve data reliability.

lang:                en
date:                2021-07-31 09:50:49 +0200
series:              [es-admin]
categories:          [elasticsearch]
tags:                [elasticsearch, java, system-design, reliability]
comments:            true
excerpt:             >
    Six practical solutions to improve data reliability: improve number of replicas, snapshot and restore, RAID, MQ, etc.

image:               /assets/bg-chase-charaba-uRHzV3ca2fk-unsplash.jpg
cover:               /assets/bg-chase-charaba-uRHzV3ca2fk-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

This article is translated with Google Translate and reviewed by Mincong.
{:.info}

## Introduction

Nowadays, data reliability is a very important thing for every enterprise. Only when we have reliable data can we rely on data to create efficient and easy-to-use software. In the real-time, intelligent, and globalized application scenarios of data, ensuring the reliability of data is even more important. Today, I want to discuss with you some of my views on how to avoid data loss in Elasticsearch.

After reading this article, you will understand:

- When will the data be lost?
- Increase the number of replica shards
- Snapshot and restore
- Use RAID disk array
- Data queue (message queue) integration
- The primary and secondary shards have different nodes
- Avoid using a single availability zone

Without further ado, let's get started right away!

## When Will The Data Be Lost?

The health status of the Elasticsearch cluster is divided into three levels (colors): green, yellow, and red.

At the shard level:

- The red status means that this shard cannot be allocated to the cluster
- Yellow status means that the primary shard has been allocated, but one or more replica shards have not been allocated
- The green status means that all shards have been successfully allocated

At the index level, its health status is determined by the worst shard status. At the cluster level, its health status is determined by the worst index status.

So when the cluster is in the red state, it means that some shards have not been initialized normally or the existing data has been corrupted or lost. The focus of this article is to avoid the yellow or red state and make the cluster stay in the green state as much as possible. 

## Increase The Number Of Replica Shards

Increasing the number of replicas is a simple way to improve data reliability. When a shard is placed on multiple machines in the cluster, if a single machine is damaged, the other machines are unlikely to be affected. We still have N-1 shards available. The higher the number of replica shards, the lower the possibility of data loss. Through [Update index settings API (7.x)](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/indices-update-settings.html "Update index settings API (7. x)") You can adjust the number of copy fragments. For example, if you need one primary shard and two replica shards, you can send the following HTTP request to the cluster:

```
PUT /my-index-000001/_settings

{
  "index": {
    "number_of_replicas": 2
  }
}
```

Although the method of increasing the number of shards is easy to use, it also has obvious shortcomings. That is ... expensive! For example, we have a total of 6TB of cluster storage space. The one-primary and one-replica plan can store 6TB / 2 = 3TB of data, while the one-primary and two-replicas plan can only store 6TB / 3 = 2TB of data, which reduces the utilization rate by 33 % and increases the cost by 50%.

## Snapshot And Restore

Regardless of the data storage software, it is important to back up your data regularly. The Elasticsearch replicas mentioned above provide high reliability; they allow you to tolerate sporadic node loss without interrupting service. However, the copy does not provide protection against disaster. In this case, what you need is a real backup of the cluster — a complete copy when something does go wrong. Elasticsearch's Snapshot And Restore feature is a good way to avoid data loss. Elasticsearch backs up the current cluster state and data to a snapshot repository. This process is incremental: the first snapshot is a full snapshot, and subsequent snapshots retain the difference between the existing snapshot and the new data.

Snapshots support different types of repository, which are implemented by installing plugins in the cluster. The officially supported plugins in Elasticsearch 7 are:

- [Amazon S3 Repository Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-s3.html "Amazon S3 Warehouse Plugin")
- [Azure Repository Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-azure.html "Azure Warehouse Plugin")
- [Hadoop HDFS Repository Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-hdfs.html "Hadoop HDFS Warehouse Plugin")
- [Google Cloud Storage Repository Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository-gcs.html "Google Cloud Storage Warehouse Plugin")

Unofficial plugins are:

- [Openstack Swift Repository Plugin](https://github.com/BigDataBoutique/elasticsearch-repository-swift "Openstack Swift Repository Plugin"), developed and maintained by Wikimedia Foundation and BigData Boutique.
- [Alibaba Cloud Repository Plugin](https://github.com/aliyun/elasticsearch-repository-oss "Alibaba Cloud Repository Plugin"), developed and maintained by Alibaba Cloud.

The benefits of using snapshots are mainly to reduce the cost of backup, to protect against disaster, and to have a complete copy in the event of a problem. Another advantage is that it can be restored across clusters, so you can use the snapshot and restore feature to make customized solutions, such as a data storage system that separates hot and cold storage. The limitations of using snapshots are: 1. The entire setup process is complicated, requires a certain understanding of your cloud provider, and needs to build a storage bucket (creation, setting permissions, monitoring, etc.); 2. It can only be used on platforms that support plug-ins. That is, AWS / Google / Azure / Aliyun / Tencent, etc.; 3. Data cannot be restored without snapshots.

## Use RAID

RAID (Redundant Array of Independent Disks) stands for Redundant Array of Independent Disks, abbreviated as "disk array". In fact, it uses multiple independent disks to form a large disk system to achieve better storage than a single disk. Performance and higher reliability. Common solutions are: RAID0 / RAID1 / RAID5 / RAID6 / RAID10. Different scenarios have different expected performance in terms of data loss, performance, and downtime. Its essence is to achieve data reliability through different types of double writing or verification at the disk level of a single machine. The official Elasticsearch article [How to design your Elasticsearch data storage architecture for scale](https://www.elastic.co/blog/how-to-design-your-elasticsearch-data-storage-architecture-for-scale) written by Matt Davis discussed in detail the pros and cons of RAID0 / RAID1 / RAID5 / RAID6. Please read that article for more details.

I personally think that this solution is not suitable for enterprise use, because it is only effective for stand-alone disks. For an enterprise-level data platform, more considerations are to reduce the dependence on the reliability of a single machine, the operating price, and the fight against disaster (such as the failure of the entire availability zone).

## Message Queue Integration

Another idea is to integrate a message queue, such as the popular Apache Kafka. The general idea is: first write the message into Kafka's message queue, and then let a Kafka consumer read the data and write it to Elasticsearch. The offset is committed only after the data is successfully written. In the same way, the consumer can be required to commit offset only after the data is snapshotted. The advantage of this is to avoid data loss: when Elasticsearch refuses to accept write requests and fails to back up the data through the snapshot, the data remains in Kafka. This design transforms the data loss problem into a data delay problem, and transfers part of the problem from Elasticsearch to Kafka. It also effectively solves the above-mentioned "snapshot feature cannot restore unsnapshoted data" problem, because this part of the data can now be restored from Kafka.

In other words, this solution temporarily stores data that has not been written to ES and temporarily stores data that has not been snapshotted. It is suitable for application scenarios with a large amount of data, and is an efficient solution to problems such as ES write exceptions and unsnapshot parts. Due to the use of Kafka, its disaster tolerance is also very strong. Its shortcomings are: its complexity, it introduces a message queue and corresponding consumer logic to the system; its reliability also depends on the team's programming ability; the difficulty of operation and maintenance also increases accordingly.

## Location Of Primary And Secondary Shards

Another setting is [index.routing.allocation.total_shards_per_node](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/allocation-total-shards.html "total_shards_per_node"). It allows us to set the maximum number of shards (replicas and primaries) that an index can store in a node at the same time. The default is unbounded. By setting this value to 1, you can ensure that the shards of each index are placed on different nodes. This approach makes it acceptable to lose one node and will not cause data loss, because only one shard will be lost. The remaining shards of the index will be available and Elasticsearch will replicate it again.

The advantage of this approach is that it is easy to implement and can ensure that the cluster will not turn red when a node is lost. However, in the case of insufficient nodes, shards may not be allocated, resulting in yellow indexes.

## Avoid Using A Single Zone

Avoid using a single availability availability zone. When the cluster nodes are deployed in multiple availability zones, it can effectively reduce the possibility of data loss, especially the probability that the cluster will be affected by cloud provider availability zone accidents. Elasticsearch clusters from vendors such as AWS and Alibaba Cloud all support multi-zone deployment. For specific operations, please refer to [AWS Blog](https://aws.amazon.com/fr/blogs/database/increase-availability-for-amazon- elasticsearch-service-by-deploying-in-three-availability-zones-2/ "Increase availability for Amazon Elasticsearch Service by deploying in three Availability Zones-AWS Database Blog") and [Alibaba Cloud Documentation](https://partners- intl.aliyun.com/help/doc-detail/151655.htm "High availability-Alibaba Cloud"). Then, in the Elasticsearch cluster, you can set the cluster's shard allocation strategy through allocation awareness attributes. For example, the following configuration in the configuration file `elasticsearch.yml` of each cluster node

```yml
node.attr.availabilityzone: az1
cluster.routing.allocation.awareness.attributes: availabilityzone
```

You can set the node in the available zone az1 / az2 / az3 and so on. For specific operations, please refer to Opster's article [Setting Up Zone Awareness for Shard Allocation in Elasticsearch](https://opster.com/elasticsearch-glossary/elasticsearch-zone-awareness/ "Setting Up Zone Awareness for Shard Allocation in Elasticsearch") .

## Comparison

Let us compare the advantages and disadvantages of each of the following options.

Solution | Benefits | Disadvantages/Insufficiency
:--- | :--- | :---
Increase replicas | Simple and fast operation | Reduce cluster utilization and increase operating costs.
Snapshots and restore | Strong disaster tolerance, cost efficient | The initial setup is complex, can only be used on specific cloud providers, and data without snapshots cannot be restored.
RAID | Effectively prevent disk damage | Only effective for single machine. Reduce cluster utilization and increase operating costs. Unable to cope with non-disk failures and catastrophic failures in the computer room.
MQ integration | strong disaster tolerance, temporary storage of data that has not been written to ES, temporary storage of unsnapshot data, suitable for big data scenarios | high system complexity, high operation and maintenance costs
Primary and secondary shards are stored on different nodes | Simple and fast operation | May not be suitable for small clusters, resulting in shards that cannot be allocated
Multi availability zone | Strong disaster tolerance | Need to combine cloud provider configuration

## Going Further

How to go futher from this article?

The focus of this article is on ways to prevent data loss, not troubleshooting after a problem occurs. But troubleshooting is also a very important part. If you are interested in this area, you can read Ming yi tian xia’s blog post (in Chinese) [Elasticsearch 集群故障排查及修复指南 (Elasticsearch cluster troubleshooting and repair guide)](https://blog.csdn.net/laoyang360/article/details/109699085 "Elasticsearch Cluster Troubleshooting and Repair Guide") or Elastic official blog post written by Ali Beyad [RED Elasticsearch Cluster? Panic no longer](https://www.elastic.co/blog/red-elasticsearch-cluster-panic-no-longer).

## Conclusion

In this article, we have seen several practical solutions to improve data reliability in Elasticsearch, including: increasing the number of replica shards, snapshots and restore, using RAID, MQ integration such as Kafka, storing primary and secondary shards of an index in different nodes, and avoid using one single availability zone. Finally, the article compares their pros and cons, and also shares some resources to go further. I hope this article can give you some thoughts and make your Elasticsearch cluster more efficient and usable. If you are interested in knowing more information, please follow my GitHub account [mincong-h](https://github.com/mincong-h "GitHub") or subscribe to this blog.

## References

- Elastic, ["Elasticsearch: The Definitive Guide"](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html "Elasticsearch: The Definitive Guide"), 2021.
- Elastic, ["Snapshot/Restore Repository Plugins"](https://www.elastic.co/guide/en/elasticsearch/plugins/7.x/repository.html), 2021.
- 慕课网, [RAID磁盘阵列是什么（一看就懂）](https://zhuanlan.zhihu.com/p/51170719), 2018.
