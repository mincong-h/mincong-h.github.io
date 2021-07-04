---
layout:            post
title:             Create Systemd Unit File for Java
lang:                en
date:              2018-07-03 21:33:29 +0200
date_modified:     2020-05-08 09:10:39 +0200
categories:        [tech]
tags:              [java, systemd, raspberry-pi]
comments:          true
image:             /assets/bg-coffee-2242213_1280.jpg
cover:             /assets/bg-coffee-2242213_1280.jpg
excerpt:           >
    This post explains how to create a systemd unit file for Java, so that you
    can run your Java application as a service in Linux. It also explains the
    structure of a service file, and tells your the useful commands after
    service's creation.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

Recently I created a Systemd unit file to manage a Java program in Raspberry Pi.
Today, I want to share about the structure of a service file and some
commands useful after the service's creation. This article is written under
Raspbian GNU/Linux 10 (buster) and systemd 241.

## Unit File Structure

Unit files typically consist of three sections:

- \[Unit\] — contains generic options that are not dependent on the type of the
  unit. These options provide unit description, specify the unit's behavior,
  and set dependencies to other units.
- \[_unit type_\] — if a unit has type-specific directives, these are grouped
  under a section named after the unit type. For example, service unit files
  contain the \[Service\] section.
- \[Install\] — contains information about unit installation used by `systemctl`
  enable and disable commands.

## Service Unit File Sample

Here's the Systemd unit file `my-server.service` that I've created:

```ini
[Unit]
Description=My Server

[Service]
ExecStart=/usr/bin/java \
  -Dmyserver.basePath='/opt/my-server/repositories' \
  -Dmyserver.bindAddr='0.0.0.0' \
  -Dmyserver.bindPort='18080' \
  -Dmyserver.hostName='A pretty name' \
  -jar '/opt/my-server/my-server.jar'
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

In this sample, several options are defined. Let's take a look together:

- `Description` is a meaningful description of the unit. This text is
  displayed for example in the output of the `systemctl status` command.
- `ExecStart` specifies commands or scripts to be executed when the unit
  is started. `ExecStartPre` and `ExecStartPost` specify custom commands to be
  executed before and after `ExecStart`. Note that execution requires an absolute
  path for command, you need to specify **/usr/bin/java** instead of **java**.
- `ExecStop` specifies commands or scripts to be executed when the unit
  is stopped. If not specified, the basic way for systemd to stop a running
  service is by sending the `SIGTERM` signal (a regular `kill`) to the process
  control group of the service, and after a configurable timeout, a `SIGKILL` to
  make things really go away if not responding. As for Java application, the JVM
  process is set up so that it gracefully shuts down the service upon reception of
  the `SIGTERM` signal using shutdown hooks. However, the JVM will still exit with
  code `143` in the end due to receiving `SIGTERM`. 143 = 128 + 15 (SIGTERM).
  Therefore, we need to modify systemd success exit status (`SuccessExitStatus`)
  to 143.
- `WantedBy` is a list of units that weakly depend on the unit. When this
  unit is enabled, the units listed in `WantedBy` gain a `Want` dependency on the
  unit.

## Create the Systemd Unit File

The systemd unit file `my-server.service` needs to be created in
directory **/etc/systemd/system** and has 644 permission as root. Note that
it does not need to be executable. Fill the file with the options mentioned in
the previous section.

Once done, notify systemd that a new `my-server.service` file is
created by reloading the daemon as root:

    systemctl daemon-reload

After that, you can start, enable, stop a service, or check its status using the
following command:

    systemctl start my-server
    systemctl enable my-server
    systemctl status my-server
    systemctl stop my-server

## Trouble Shooting

### Service Failed to Start

1. Use `jps` - JVM Process Status Tool to check whether the process is started.
2. See the log in `journalctl`, to understand what happened
3. See the status of target service <code>systemctl status
   <i>name</i>.service</code>. Understand its status, its exit-code, the
   environment variables, the related log trace etc.

### Symbolic Link

Using symbolic link for Systemd unit file might cause problem during the
service enabling. I suggest to use regular file directly.

## Going Further

- To know more about Systemctl, read "How to Use Systemctl to Manage Systemd
  Services and Units" by Justin Ellingwood.<br>
  <https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units>
- To understand how JVM reacts to various kill signals, read "JVMs and kill
  signals" written by Tobias Lindaaker.<br>
  <http://journal.thobe.org/2013/02/jvms-and-kill-signals.html>
- To understand signals, a limited form of inter-process communication (IPC),
  read wikipedia page "Signal (IPC)".<br>
  <https://en.wikipedia.org/wiki/Signal_(IPC)>

## Conclusion

Today we saw about how to create a systemd unit file to manage a Java program
in Raspberry Pi by exploring the basic structure of a unit file
(Unit, Service, Install) and the particularity about exit code 143. We also
checked to basic `systemctl` commands to manage the service (start, enable,
status, stop). Interested to know more? You can
subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Øyvind Stegard, "Gracefully killing a Java process managed by systemd",
  _stegard.net_, 2016.
  <https://stegard.net/2016/08/gracefully-killing-a-java-process-managed-by-systemd/>
- RedHat, "System Administrator's Guide: §10.6. Creating and Modifying systemd
  Unit Files", _RedHat_.
  <https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-managing_services_with_systemd-unit_files>
