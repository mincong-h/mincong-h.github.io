---
layout:            post
title:             Java Server on Raspberry Pi
lang:                en
date:              2018-07-06 05:51:00 +0200
date_modified:     2018-07-22 15:19:16 +0200
categories:        [tech]
tags:              [java, raspberry-pi, systemd]
comments:          true
excerpt:           >
    A step-by-step guide for installing Java server on Raspberry Pi: install
    Raspbian OS, install JRE, configure SSH, transfer data, and setup Java
    server with Systemd.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Today I'll talk about how to install a Java server on Raspberry Pi. We'll
go through the following steps: Raspbian installation, Java installation, SSH
configuration, data transfer and Java server setup.

## Install Raspbian on Raspberry Pi

<br>
<p align="center">
  <img src="{{ site.url }}/assets/logo-raspbian.png" alt="Logo Raspbian">
</p>

There're several ways to install Raspbian on Raspberry Pi, the official website
[raspberrypi.org][3] has very simple [guides][1] for installation.
As a beginners, I start with NOOBS (New Out Of Box Software), which gives
the user a choice of operating system from the standard distributions. Note that
Raspbian and NOOBS contain Java SE Platform Products, which is exactly what we
want here. Check here to see the complete [NOOBS installation guide][2]. When
the installation is finished, you can connect as user `pi`.

## Install Java

Java Runtime Environment (JRE) is included by default in Raspbian
distribution, so there's no need to install Java. However, you should know that
the JRE shipped with Raspbian is Oracle JRE, not Open JRE — you need to install
the alternative manually if you need to switch the vendor.

```
pi@raspberrypi:~ $ java -XshowSettings:properties -version
Property settings:
    java.vendor = Oracle Corporation
    ...

java version "1.8.0_65"
Java(TM) SE Runtime Environment (build 1.8.0_65-b17)
Java HotSpot(TM) Client VM (build 25.65-b01, mixed mode)
```

## Enable SSH

Now, we need to transfer the Java server and configuration files to
Raspberry Pi. It requires the following steps:

- Find the IP address of Raspberry Pi
- Establish a SSH connection with Raspberry Pi
- Transfer files over SSH

There're many ways to find the IP address of Raspberry Pi, from the [official
documentation][6], or [this post][7] in Stack Exchange. I'm using `nmap` on Mac
(for unknown reasons, Raspberry Pi is only discovered when using _sudo_):

```
mincong@mbp:~ $ sudo nmap -sn 192.168.1.0/24 | grep raspberrypi
Nmap scan report for raspberrypi.home (192.168.1.12)
```

The next step is to connection to Raspberry Pi via SSH. Since release
2.1, NOOBS has [_"disabled by default"_][8] SSH, so you need to enable it
yourself — change it using `sudo raspi-config`. Once done, you can access
Raspberry Pi via SSH:

```
mincong@mbp:~ $ ssh pi@192.168.1.12
```

## Transfer Data and Configure Java Server

In my case, I need to transfer 2 files to Raspberry Pi: the JAR file and the
system unit file. Firstly, transfer them to Raspberry Pi. Then,
move them to the target directories. Finally, start the server.

```
mincong@mbp:~ $ scp app.jar pi@192.168.1.12:app.jar
mincong@mbp:~ $ scp app.service pi@192.168.1.12:app.service
mincong@mbp:~ $ ssh pi@192.168.1.12
...
pi@raspberrypi:~ $ sudo mkdir /opt/app/
pi@raspberrypi:~ $ sudo mv app.jar /opt/app/
pi@raspberrypi:~ $ sudo mv app.service /etc/systemd/system/
pi@raspberrypi:~ $ sudo systemctl daemon-reload
pi@raspberrypi:~ $ sudo systemctl start app.service
pi@raspberrypi:~ $ sudo systemctl status app
● app.service - App Server
   Loaded: loaded (/etc/systemd/system/app.service; disabled; vendor preset: enabled)
   Active: active (running) since Fri 2018-07-06 16:00:50 EDT; 9s ago
 Main PID: 3545 (java)
   CGroup: /system.slice/app.service
           └─3545 /usr/bin/java -jar /opt/app/app.jar

Jul 06 16:00:52 raspberrypi java[3545]: [main] INFO org.eclipse.jetty.server.Server - jetty-9.4.z-SNAPSHOT; built: 2018-05-03T15:56:21.710Z; git: daa59876e6f384329b122929e70a80934569428c; jvm 1.8.0_65-b17
Jul 06 16:00:53 raspberrypi java[3545]: [main] INFO org.eclipse.jetty.server.session - DefaultSessionIdManager workerName=node0
Jul 06 16:00:53 raspberrypi java[3545]: [main] INFO org.eclipse.jetty.server.session - No SessionScavenger set, using defaults
Jul 06 16:00:53 raspberrypi java[3545]: [main] INFO org.eclipse.jetty.server.session - node0 Scavenging every 660000ms
...
```

To tell systemd to start services automatically at boot, you must enable them.
To start a service at boot, use the `enable` command:

```
pi@raspberrypi:~ $ sudo systemctl enable app.service
```

If you want to know more about Systemd unit file and Java server configuration,
please check my previous post:
<a href="{{ site.url }}/2018/07/03/create-systemd-unit-file-for-java/">
how to create a system unit file for Java</a>.

## Shutdown

You can shutdown your Respberry PI via SSH command. Once connected, use command
`sudo shutdown`, the shutdown will be scheduled in 60 seconds. You can use
`shutdown -c` to cancel it.

{% highlight shell %}
sudo shutdown
{% endhighlight %}

Note that `sudo` is required. A system shutdown needs **root**/`sudo` or other
special permissions (usually handled by polkit and/or systemd). In its default
configuration, systemd allows for a root-less shutdown if the user is local (so
no SSH) and there's currently no other user loggin in.

> Failed to set wall message, ignoring: Interactive authentication required.
>
> Failed to call ScheduleShutdown in logind, proceeding with immediate
> shutdown: Interactive authentication required.

Systemd is complaining because it tries to get authentication but it can't
because you're logged in via SSH. `sudo shutdown` will do the trick.

## Conclusion

In this post, we discussed the Raspbian OS, SSH enabling, data
transfer, and Java server installation on Raspberry Pi. After
having done all the steps, your Java server should be able to start at boot
automatically. Hope you enjoy this one, see you the next time.

## References

- [Raspberry Pi: Installation][1]
- [Raspberry Pi: NOOBS][1]
- [Raspberry Pi: A security update for Raspbian Pixel][8]
- [Reddit: Getting errors whenever I try to reboot or shutdown through
  terminal][9]

[1]: https://www.raspberrypi.org/documentation/installation
[2]: https://www.raspberrypi.org/documentation/installation/noobs.md
[3]: https://www.raspberrypi.org
[4]: https://www.sdcard.org/downloads/formatter_4/
[5]: https://www.raspberrypi.org/documentation/remote-access/ssh/unix.md
[6]: https://www.raspberrypi.org/documentation/remote-access/ip-address.md
[7]: https://raspberrypi.stackexchange.com/questions/13936/find-raspberry-pi-address-on-local-network
[8]: https://www.raspberrypi.org/blog/a-security-update-for-raspbian-pixel/
[9]: https://www.reddit.com/r/linux4noobs/comments/5vbmq8/getting_errors_whenever_i_try_to_reboot_or/

---

## Trouble Shooting

### Failed to Install Raspbian After Formatting SD Card in Windows

After formatting my SD card in Windows 10, I got an error message similar to the
following one (<https://www.raspberrypi.org/forums/viewtopic.php?t=107341>):

> Error creating file system
> ```
> mkfs.fat:warning lowercase lables might not work properly with DOS or windows
> mkfs.fat: failed whilst writing FAT
> mkfs.fat 3.0.26(2014-03-07) 
> ```

The cause is the Windows builtin formatting tool: it was used for cleaning the
SD card. I should use the SD Association's Formatting Tool, recommended by
[NOOBS installation guide][1]: _"If you are a Windows user, we recommend
formatting your SD card using the SD Association's Formatting Tool, which can
be downloaded from [sdcard.org][4]. Instructions for using the tool are
available on the same site."_


