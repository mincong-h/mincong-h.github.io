---
layout:     post
title:      "Setup GitLab Sever Locally"
date:       2017-03-10 21:00:00 +0100
categories: [git]
tags:       [git, docker]
comments:    true
---

Here's the guide about how to setup a GitLab server locally using Docker under
mac OS through the following steps:

1. Create folder in file system to store GitLab data.
2. Create GitLab container.
3. Setup GitLab container.
4. Setup a new user.

<!--more-->

Before continuing, please ensure Docker is installed in your machine.

## Create a GitLab Folder

Create a folder `.gitlab` and 3 sub-folders to store different data in GitLab.
You can see the table below to see their usage.

    $ mkdir -p ~/.gitlab/data ~/.gitlab/logs ~/.gitlab/config

Local Location | Container Location | Usage
:--- | :--- | :---
`~/.gitlab/data` | `/var/opt/gitlab` | For storing application data
`~/.gitlab/logs` | `/var/log/gitlab` | For storing logs
`~/.gitlab/config` | `/etc/gitlab` | For storing the GitLab configuration files

## Create GitLab Container

Create a docker container using the following command. If the image
`gitlab/gitlab-ce` does not exist locally, docker will pull it automatically
from the Docker Hub.

```console
$ docker run \
    --detach \
    --publish 443:443 --publish 80:80 --publish 22:22 \
    --name gitlab \
    --restart always \
    --volume ~/.gitlab/config:/etc/gitlab \
    --volume ~/.gitlab/logs:/var/log/gitlab \
    --volume ~/.gitlab/data:/var/opt/gitlab \
    gitlab/gitlab-ce:latest
```

Now, the GitLab container `gitlab` is created and running. Go to
<http://localhost> and reset administrator's password.

## Setup GitLab Container

In this step, we'll see how to configure GitLab properly, including SSH mapping,
and docker container external URL.

- Create a SSH key passphrase for SSH connection with GitLab. Name it as
  `gitlab_rsa`.

  ```console
  ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
  ```

- Add SSH port mapping to `localhost` in `~/.ssh/config`

  ```sh
  Host localhost
    IdentityFile ~/.ssh/gitlab_rsa
  ```

## Setup New User

- Create a new user in GitLab
- Add SSH key (public key) into this new user's GitLab account
- Create a private project
- Clone the project via SSH protocol

## See Also

- GitLab: [GitLab Docker images][gitlab]

[gitlab]: https://docs.gitlab.com/omnibus/docker/README.html
