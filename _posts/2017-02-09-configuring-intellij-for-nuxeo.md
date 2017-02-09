---
layout: post
title:  "Configuring IntelliJ for Nuxeo"
date:   2017-02-09 20:00:00 +0100
categories: nuxeo, idea, weekly
---

<p align="center">
  <img
    src="{{ site.url }}/assets/logo-intellij.png"
    alt="IntelliJ Logo"
    width="200" />
</p>

Do you want to develop Nuxeo Platform with you favorite IDE IntelliJ? Today, I'd
like to share with you the IntelliJ configuration for Nuxeo.<!--more--> After
reading this blog, you'll understand how to:

1. [Download and Install IntelliJ](#download-and-install-intellij)
2. [Getting The Nuxeo Source Code](#getting-the-nuxeo-source-code)
3. [Import Nuxeo Source Code Into IntelliJ](#import-nuxeo-source-code-into-intellij)
4. [Configure Nuxeo Code Style](#configure-nuxeo-code-style)

## Download and Install IntelliJ

You can [download][idea-download] the latest version of IntelliJ IDEA from Jet
Brains, the official website. It supports all the platforms including Mac OS,
Windows and Linux. There're two editions of IntelliJ: Community Edition and
Ultimate Edition. Nuxeo sources code work with both of them. Once downloaded,
install IntelliJ IDEA with your own preferences.

## Getting The Nuxeo Source Code

The next step is to get the Nuxeo source code. Before continuing, please ensure
you've Git and Python 2.7 installed in your computer. We need to clone manually
the Nuxeo principal repository and all the other repositories using Python
script `clone.py`:

    git clone git://github.com/nuxeo/nuxeo.git  # read-only
    git clone git@github.com:nuxeo/nuxeo.git    # read write
    cd nuxeo
    python clone.py master -a

## Import Nuxeo Source Code Into IntelliJ

Before importing Nuxeo source code, you need to configure the VM options for
importer to increase the importation capacity. Open IntelliJ, a welcome menu
will be shown. On the right bottom of menu, click _Configure_ > _Preferences_.
Then search `VM options for importer` and set it to:

    -Xmx4096m -Xms1024m

<img
  src="{{ site.url }}/assets/20170209-vm-options-for-importer.png"
  alt="IntelliJ - VM options for importer" />

Now import Nuxeo source code as Maven project. In the default welcome menu,
choose _Import Project_, then find the Nuxeo root folder and select the POM file
in `$NX_HOME/pom.xml`. Afterwards, set up the Maven import options as the
following screenshot:

<img
  src="{{ site.url }}/assets/20170209-import-project-from-maven.png"
  alt="IntelliJ - Import project from Maven" />

Later, you will need to:

- Choose Maven profiles: default
- Choose Project SDK: use JDK 8
- Edit name to create a new IntelliJ project: default

After that, the configuraiton is finished. IntelliJ will create a project for
you, the entire process (Maven import) will take a few minutes, please be
patient. Here's the final view:

<img
  src="{{ site.url }}/assets/20170209-final-view.png"
  alt="IntelliJ - Final view" />

This part is optional. If you want to improve the performance of IntelliJ, you
can customize the VM options. Click _Help_ > _Edit Custom VM Options..._. If
there's no existing configuration file, IntelliJ will help you to create one.
Then edit the content with your preferred values:

```
# custom IntelliJ IDEA VM options

-Xms1g
-Xmx4g
...
```

## Configure Nuxeo Code Style

Download and install plugin *Eclipse Code Formatter*. Import the tools provided
by Nuxeo as shown below. Tools are located in path `$NX_HOME/tools`.

<img
  src="{{ site.url }}/assets/20170209-eclipse-code-formatter.png"
  alt="IntelliJ - Plugin 'Eclipse Code Formatter'" />

Congratulations! Now everything is done. Enjoy IntelliJ IDEA, your capable and
ergonomic IDE!

[idea-download]: https://www.jetbrains.com/idea/download/
