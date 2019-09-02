---
layout:            post
title:             Measure Coverage with Coverage.py
date:              2019-09-02 21:09:21 +0200
categories:        [tech]
tags:              [python, testing, code-quality]
comments:          true
excerpt:           >
    Experience sharing on code coverage measurement of Python program using
    Coverage.py.
image:             /assets/bg-snake-37585_1280.png
ads:               Ads idea
---

## Overview

Today, I would like to share my recent experience with code coverage measurement
using [Coverage.py](https://coverage.readthedocs.io/en/latest/). I used it for
my scripts about personal finance: mainly for aggregating account history from
different banks. I use Python 3.7.2 with Coverage 4.5.3 and Circle CI.

After reading this article, you will understand:
- How to setup Coverage.py in the existing Python project?
- How to run tests with test coverage measured?
- How to create a coverage report?
- Advanced options to be enabled

## Setup Coverage.py

Declare Coverage.py as a test-scoped dependency in `requirements-tests.txt`:

```diff
+coverage==4.5.3
 flak8==3.7.7
 pytest==5.0.1
```

Then, ensure the test requirements are installed during the build. In Circle CI,
you can do it as follow:

```yml
steps:
  - ...
  - run:
      name: Install Test Dependencies
      command: |
        . venv/bin/activate
        pip install -r requirements-tests.txt
```

In your local machine, you can install it using [pip](https://pypi.org/project/coverage/):

```
pip install coverage
```

## Measure Coverage

According to the official web page, you can run your program and gather data using
`coverage run`:

```bash
# if you usually do:
#
#   $ python my_program.py arg1 arg2
#
# then instead do:

$ coverage run my_program.py arg1 arg2
```

In my case, I use pytest for testing. I also enabled level 2 verbosity (`-vv`)
and strict mode (`--strict`) so that warnings become errors and make the build
fail. Combined with coverage, the command is written as follows:

```bash
$ coverage run -m pytest -vv --strict
```

Here's the screenshot of the execution on macOS:

![Coverage run example](/assets/20190902-coverage-run.png)

## Coverage Report

Use coverage-report command to report on the results. This will print the
results in terminal. In my case, I also enabled the option `-m`, `--show-missing` in my
`.coveragerc` file to show line numbers of statements in each module that
weren't executed.

```bash
$ coverage report
```

Here's the screenshot of the execution on macOS:

![Coverage report example](/assets/20190902-coverage-report-console.png)

Another way to see the result is via HTML page. You can see both the overview
and a detailed view of each file.

```bash
$ coverage html
```

Here's the screenshot of the overview page:

![Coverage report HTML (overview)](/assets/20190902-coverage-html-overview.png)

Here's the screenshot of the detail page:

![Coverage report HTML (detail)](/assets/20190902-coverage-html-detail.png)

## Advanced Options

Coverage.py options can be specified in a configuration file. This makes it
easier to re-run coverage.py with consistent settings, and also allows for
specification of options that are otherwise only available in the API.

The default name for configuration files is `.coveragerc`, in the same
directory `coverage.py` is being run in. Most of the settings in the
configuration file are tied to your source code and how it should be measured,
so it should be stored with your source, and checked into source control,
rather than put in your home directory.

In my case, for command "run", I set the source directory to `src` and enabled
the branch coverage measurement, in addition to the usual statement coverage;
for command "report", I added the show-missing option to see more detail about
what is missing directly in terminal.

```ini
[run]
source = src
branch = True

[report]
show_missing = True
```

## Conclusion

In this article, I explained the usage of coverage.py in my own Python project,
including installation, coverage meansure, coverage report generation, and
storing more options in configuration file. If you are interested in
Coverage.py, I suggest you to go to their official documentation
<https://coverage.readthedocs.io/en/latest/index.html>. There are clear and
detailed explanation about different settings. Hope you enjoy this article, see
you the next time!

## References

- Sebastian Wozny, "How to show warnings in py.test", _Stack Overflow_, 2015.
  <https://stackoverflow.com/questions/33363433>
- Coverage.py, "Configuration reference", _ReadTheDocs_, 2019.
  <https://coverage.readthedocs.io/en/latest/config.html>
- Gilles, "What does the 'rc' in `.bashrc`, etc. mean?", _Super User_, 2010.
  <https://superuser.com/questions/173165>
