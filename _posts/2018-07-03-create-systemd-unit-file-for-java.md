---
layout:      post
title:       "Create Systemd Unit File for Java"
date:        "2018-07-03 21:33:29 +0200"
categories:  [java, systemd]
tags:        [java, systemd]
comments:    true
---

Today, I want to talk about how to create a Systemd unit file for Java program.

<!--more-->
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

Here's the Systemd unit file `gitty.service` that I've created:

```
[Unit]
Description=Gitty Server

[Service]
ExecStart=/usr/bin/java \
  -Dgitty.basePath='/opt/gitty/repositories' \
  -Dgitty.bindAddr='0.0.0.0' \
  -Dgitty.bindPort='18080' \
  -Dgitty.hostName='kira' \
  -jar '/opt/gitty/gitty-server.jar'
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

In this sample, several options are defined. Let's take a look together:

- `Description` is a meaningful description of the unit. This text is
  displayed for example in the output of the `systemctl status` command.

- `ExecStart` specifies commands or scripts to be executed when the unit
  is started. `ExecStartPre` and `ExecStartPost` specify custom commands to be
  executed before and after `ExecStart`. Note that execution requires absolute
  path for command, you need to specify **/usr/bin/java** instead of **java**.

- `ExecStop` specifies commands or scripts to be executed when the unit
  is stopped. If not specified, the basic way for systemd to stop a running
  service is by sending the `SIGTERM` signal (a regular `kill`) to the process
  control group of the service, and after a configurable timeout, a `SIGKILL` to
  make things really go away if not responding. As for Java application, the JVM
  process is setup so that it gracefully shuts down the service upon reception of
  the `SIGTERM` signal using shutdown hooks. However, the JVM will still exit with
  code `143` in the end due to receiving `SIGTERM`. Modify systemd success status
  to `SuccessExitStatus=143`.

- `WantedBy` is a list of units that weakly depend on the unit. When this
  unit is enabled, the units listed in `WantedBy` gain a `Want` dependency on the
  unit.

## Create the Systemd Unit File

The systemd unit file <code><i>name</i>.service</code> needs to be created in
directory **/etc/systemd/system** and have 644 permission as root. Note that
it does not need to be executable. You need to fill options as I did in the
previous section.

Once done, notify systemd that a new <code><i>name</i>.service</code> file is
created by reloading the daemon as root:

    systemctl daemon-reload

After that, you can either testing the service startup using command <code>
systemctl start <i>name</i>.service</code> (the suffix `.service` can be
omitted), or enable the service startup using command <code>systemctl enable
<i>name</i>.service</code>. You can also check the status of the service using
command <code>systemctl status <i>name</i>.service</code>.

    systemctl start name.service
    systemctl enable name.service
    systemctl status name.service

## Trouble Shooting

### JAR File Accessibility

> Jul 03 21:29:00 mincong-KIRA-102 java[934]: Error: Unable to access jarfile /home/mincong/.m2/repository/gitty/gitty-server/1.0-SNAPSHOT/gitty-server-1.0-SNAPSHOT-jar-with-dependencies.jar

The JAR file is not accessible from Systemd as `root`. Move the JAR file to
another directory owned by `root`, such as `/opt`.

### Service Failed to Start

1. Use `jps` - JVM Process Status Tool to check whether the process is started.
2. See the log in `journalctl`, to understand what happened
3. See the status of target service <code>systemctl status
   <i>name</i>.service</code>. Understand its status, its exit-code, the
   environment variables, the related log trace etc.

### Symbolic Link

Using symbolic link for Systemd unit file might cause problem during the
service enabling. I suggest to use regular file directly.

## References

- [Øyvind Stegard: Gracefully killing a Java process managed by systemd][2]
- [RedHat - System Administrator's Guide: §10.6. Creating and Modifying systemd Unit Files][1]

[1]: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-managing_services_with_systemd-unit_files]
[2]: https://stegard.net/2016/08/gracefully-killing-a-java-process-managed-by-systemd/
