---
layout: post
title:  "How to use the public dataset Twilio Wigle.net Street Vector in Amazon AWS"
lang:                en
date:   2016-05-05 11:00:00 +0100
categories: [tech]
tags:       [open-data]
excerpt:    >
  The Twilio/Wigle.net Street Vector data set provides a complete database of
  US street names and address ranges mapped to zip codes and latitude/longitude
  ranges, with DTMF key mappings for all street names. The complete description
  about this data set can be found on Amazon Web Service. This article will
  mainly focus on how to use the install and this data set in Amazon AWS.
redirect_from:
  - /open-data/2016/05/05/how-to-use-the-public-dataset-twilio-wigle-net-street-vector-in-amazon-aws/
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

The Twilio/Wigle.net Street Vector data set provides a complete database of US 
street names and address ranges mapped to zip codes and latitude/longitude 
ranges, with DTMF key mappings for all street names. The complete description 
about this data set can be found on Amazon Web Service. This article will 
mainly focus on how to use the install and this data set in Amazon AWS. Here’s 
an overview before getting started : 

1. Create an AWS account, or use an existing one
2. Create a public dataset volume
3. Create a Linux instance
4. Install MySQL database
5. Mount the public dataset volume to Linux instance
6. Copy the data into MySQL server
7. Use it via any MySQL client

<!--more-->

## Create an AWS account

Go to aws.amazon.com and click Create an AWS Account. Your personal information 
will be required including the credit card number by Amazon AWS. So if you 
don’t want your information to be used or you don’t want to be charged for any 
potential fee, this article is not suitable for you. This part is not specified 
to the public data set, but it is due to the usage of Amazon Web Service.

If you’ve created your account or have an existing one, please sign in and 
connect to the AWS console via your web browser.

<img src="{{ site.url }}/assets/20160505-aws-console.png" alt="AWS console overview">


## Create a public dataset volume

On the left side of your AWS console, click _Compute_ > _EC2_
 
<img src="{{ site.url }}/assets/20160505-aws-console-EC2.png" alt="AWS console overview, focus EC2">

Then look at the left navigation panel, click _ELASTIC BLOCK STORE_ > _Volumes_. 
Create Volume. The Twillio / Wigle.net Street Vector data set is only avaible 
on the zone `us-east-*`, so please pay attention and do not use another zone, 
such as `us-nord-*`. You can see the zone in your URL. Otherwise, the Snapshot 
ID `snap-5eaf5537` won’t be show in the available Snapshot ID list. It doesn’t 
matter if you’re using `us-east-1`, `us-east-2` or else, but I recommend you to 
use the same zone for your volume and your Linux server for better performance.

 <img src="{{ site.url }}/assets/20160505-aws-console-EC2-volume-create.png" alt="AWS console EC2, create volume">

Once the create button is clicked, your volume will be created and available in 
a few minutes. Rename the volume, such as 
`Twilio/Wigle.net Street Vector Data Set`.
 

## Create a Linux instance

Now, we need a Linux instance to use the public dataset. The volume created 
previously is a block of data without OS, like an USB device. So it cannot be 
used directly. That’s why we need to create a linux instance and install MySQL 
database.

On the navigation bar on the left side, there’s an option called Instances. 
Click _INSTANCES_ > _Instances_ to create an new instance :

<img src="{{ site.url }}/assets/20160505-aws-console-EC2-instance-step0.png" alt="AWS console EC2, create instance step 0">

### Step 1: Choose an Amazon Machine Image (AMI)

An AMI is a template that contains the software configuration (operating 
system, application server, and applications) required to launch your instance. 
You can select an AMI provided by AWS, our user community, or the AWS 
Marketplace; or you can select one of your own AMIs. Here we use the 
_Ubuntu Server 14.04 LTS (HVM), SSD Volume Type_.

### Step 2: Choose an Instance Type

Amazon EC2 provides a wide selection of instance types optimized to fit 
different use cases. Instances are virtual servers that can run applications. 
They have varying combinations of CPU, memory, storage, and networking 
capacity, and give you the flexibility to choose the appropriate mix of 
resources for your applications. 

In this tutorial, the `t2.micro` type is used, because it is eligible to 
free tier. Once finished, click _Review and Launch_.

<img src="{{ site.url }}/assets/20160505-aws-console-EC2-instance-step2.png" alt="AWS console EC2, create instance step 2">

### Step 7: Review instance Launch

We’ve skipped all the steps by keeping the default configuration. You can 
always check the details information to know whether they conform to your usage.
Once finished, click _Launch_.

Then you need to configure a secure key pair for the connection. I’ve named it 
as `aws-ubuntu-data`. Download it when finished. And then launch the instance.

<img src="{{ site.url }}/assets/20160505-aws-console-EC2-instance-step7b.png" alt="AWS console EC2, create instance step 7b">


## Connect to this instance

Move the key pair to a more secure folder, such as `~/.ssh` and change the 
accessibility of this file. I’m doing this in Mac. The command line should be 
very similar in Linux, but not sure how to work in windows.

{% highlight bash %}
$ mv ~/Downloads/aws-ubuntu-data.pem ~/.ssh
$ chmod 400 ~/.ssh/aws-ubuntu-data.pem 
{% endhighlight %}

Then come back to the EC2 console and try to connect to the server using the 
connection information provided by Amazon AWS. Select the Linux instance 
launched previously, click _connect_ button on the top of the page. Then it 
will show you how to connect.

<img src="{{ site.url }}/assets/20160505-aws-console-EC2-instance-connect.png" alt="AWS console EC2, connect to instance">

As described in this page, the following command can be used to connect 
(password is not required) :

{% highlight bash %}
$ ssh -i ~/.ssh/aws-ubuntu-data.pem ubuntu@ec2-54-152-4-88.compute-1.amazonaws.com
{% endhighlight %}

If everything goes right, you’re now connected to the server. Please maintain 
the connection and go to the next step : Install MySQL database.


## Install MySQL database

Once connected to the Linux server, we can install the MySQL Database using 
the following command line (in Ubuntu) :

{% highlight bash %}
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install mysql-server
{% endhighlight %}

More detail can be see here : [Install MySQL on Ubuntu 14.04][install-mysql]


## Make the public dataset volume available for use

Go to EC2 console, select _ELASTIC BLOCK STORE_ > _Volumes_. Choose the 
`Twilio/Wigle.net dataset`. Click the _actions_ > _Attach Volume_. Attach this 
volume to the Linux Ubuntu 14.04 instance. Click _Attach_.

rc="{{ site.url }}/assets/20160505-aws-console-EC2-volume-attach.png" alt="AWS console EC2, attach volume">

Once finished, use the following guide to make the volume available : 

<http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html>

Assume that you’re connected to the Linux Ubuntu 14.04, here’s an recap of all 
the command lines in the above guide:

{% highlight bash %}
ubuntu@ip-172-31-48-60:~$ lsblk
NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk 
`-xvda1 202:1    0   8G  0 part /
xvdf    202:80   0  10G  0 disk 
ubuntu@ip-172-31-48-60:~$ sudo mkdir /data-us-street
ubuntu@ip-172-31-48-60:~$ sudo mount /dev/xvdf /data-us-street
{% endhighlight %}

## Copy the data into MySQL Database

Find out the mysql configuration file `my.cnf`. 

{% highlight bash %}
ubuntu@ip-172-31-48-60:/usr/sbin$ sudo find / -name my.cnf
/etc/mysql/my.cnf
{% endhighlight %}

Find the data storage directory definition in the configuration file `my.cnf`.

{% highlight bash %}
datadir         = /var/lib/mysql
{% endhighlight %}

So, it is located in `/var/lib/mysql`. Now copy the directory 
`/data-us-street/addresses` into MySQL data directory. We do this because the
``/data-us-street/addresses` contains all information about the database 
`addresses`.

{% highlight bash %}
ubuntu@ip-172-31-48-60:/usr/sbin$ sudo cp -r /data-us-street/addresses /var/lib/mysql
{% endhighlight %}


## Use it via any MySQL client

Now, you can use it in your mysql database. For example:

{% highlight bash %}
ubuntu@ip-172-31-48-60:/usr/sbin$ mysql -u root -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 42
Server version: 5.5.49-0ubuntu0.14.04.1 (Ubuntu)

Copyright (c) 2000, 2016, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| addresses          |
| mysql              |
| performance_schema |
+--------------------+
4 rows in set (0.00 sec)
{% endhighlight %}

## References

* [Making an Amazon EBS Volume Available for Use][aws-vol]
* [How to import aws public dataset into mysql instance?][stackoverflow-36753349]
* [Twilio/Wigle.net Street Vector Data Set][aws-us-street]

[stackoverflow-36753349]: http://stackoverflow.com/questions/36753349/how-to-import-aws-public-dataset-into-mysql-instance
[aws-vol]: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html
[aws-us-street]: https://aws.amazon.com/fr/datasets/twilio-wigle-net-street-vector-data-set/
[install-mysql]: https://www.linode.com/docs/databases/mysql/install-mysql-on-ubuntu-14-04
