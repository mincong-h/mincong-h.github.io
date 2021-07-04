---
layout:            post
title:             Speed Up The Maven Build
lang:                en
date:              2018-11-01 12:13:55 +0100
categories:        [build]
tags:              [maven, java, javascript, macos]
comments:          true
excerpt:           >
    How to speed up a Maven project by using different tips.
image:             /assets/bg-dog-2785074_1280.jpg
cover:             /assets/bg-dog-2785074_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

In our team, we have a big codebase with hundred of thousands of lines of code.
Building it locally is a huge pain. It contains Java, Scala, JavaScript code
which use different technologies. And the main tool is Maven. In this post,
we'll try to understand why the build is slow, which are the real pain points
and, how to speed it up using better Maven commands.

## Actual Build Time Without Tests

Module | Type | Time
:---: | :---: | ---:
M1 | POM | 0.218 s
M2 | POM | 1.830 s
M3 | Java | 0.132 s
M4| Java|2.225 s
M5| Java | 0.686 s
M6| Java|6.206 s
M7| JavaScript| **01:15 min**
M8| JavaScript| **07:00 min**
M9| Java|0.489 s
M10| Java| 0.543 s
M11| Java / GWT |**15.426 s**
M12| POM| 0.522 s
M13|Java| 4.127 s
M14| Java|3.109 s
M15|Java|1.691 s
M16|Java| 2.255 s
M17| Java|0.475 s
M18| JavaScript| **27.649 s**
M19| Java|1.760 s
M20| Ant|**25.601 s**
M21| Java|1.922 s
M22| Java|0.709 s
M23| Java|0.586 s
M24| Java / GWT| **47.177 s**
M25| Java |0.880 s
M26| Ant| **35.509 s**
M27| Java|2.012 s
M28| Scala|16.455 s
M29| Java|0.576 s
M30| Java|3.213 s
M31 |Java / GWT | 0.579 s
**Total** | - | **11:42 min**

## Skip JavaScript Modules

As you can see, the JavaScript modules are using much more time than any other
Java modules. So skipping them will make the build much faster:

    mvn clean install -DskipTests -pl '!m7,!m8,!m18'

The build is now done in 2:48 min.

## Skip GWT Modules

The GWT modules are taking 1 minute from the build (15.4 + 47.1), if the changes
were not related to these modules, they can be skipped too.

    mvn clean install -nsu -DskipTests -pl '!m7,!m8,!m18,!m11,!m24'

Combined with skipping JavaScript, the build is now done in 1:41 min.

## Parallel Builds

For now, I think the most painful parts are addressed: JavaScript modules and GWT
modules are no longer built. But there're still places
for smaller optimization. For example, using parallel builds. It allows to use
more threads for building Maven. Be careful when using this option for running
tests—not all the tests support parallel executions. The test results might not
be reliable. So if there're no tests, we can do:

    mvn -T 1C clean install -nsu -DskipTests -pl '!m7,!m8,!m18,!m11,!m24'

Which means Maven uses 1 thread per core for the build. The multiple-thread
build is available since Maven 3. When running the project, you can see the
message in the console (right after the _Reactor Build Order_):

```
[INFO] Reactor Build Order:
[INFO]
[INFO] ...
[INFO]
[INFO] Using the MultiThreadedBuilder implementation with a thread count of 8
```

Maven uses 8 threads because my machine has 8 logical CPU. Actually, the
CPU is an Intel Core i7 2.9 GHz, which has [Hyper-Theading Technology][htt] and
makes one physical core appears as two processors to the operating system. So
there're 4 physical CPUs and appears as 8 logical CPUs.

```
$ sysctl hw.physicalcpu hw.logicalcpu
hw.physicalcpu: 4
hw.logicalcpu: 8
```

Here's the result of execution:

Module | Time
:---: | ---:
M1| 0.142 s
M2| 1.435 s
M3| 0.274 s
M4| 3.034 s
M5| 0.469 s
M6| 5.034 s
M7| -
M8| -
M9| 3.271 s
M10| 2.751 s
M11| -
M12| 0.959 s
M13| 5.452 s
M14| 4.961 s
M15| 3.857 s
M16| 3.336 s
M17| 3.752 s
M18| -
M19| 4.178 s
M20| 26.841 s
M21| 3.344 s
M22| 1.100 s
M23| 3.741 s
M24| -
M25| 1.637 s
M26| 44.211 s
M27| 1.941 s
M28 | 29.441 s
M29| 3.305 s
M30| 6.453 s
M31 | 3.553 s
**Total** | **1:01 min (Wall Clock)**

As you can see, the time for building each module is longer, but the Wall-Clock
time is shorter now: -39%. This option is very useful when you only want to
ensure your code compiles.

What is "Wall-Clock" time in Maven? Here's an answer from [Stack Overflow][1]:

> By default (without `-T`), Maven builds all modules sequentially rather than
> in parallel. So you only have one process, which (in your example) takes 40s.
>
> You start the build with 4 threads, so the total time of 40s gets divided by
> 4 threads, so each thread runs for 10s.
>
> The total CPU time stays the same (40s), but the time that passed for YOU is
> only 10s + some overhead for parallelization.
> <span style="text-decoration: underline">It's the time that you see when
> you look on your clock on the wall, therefore it's called Wall-Clock
> time.</span>

## Only Build The New Changes

If you want the build to be even faster, you shoud build just the project
specified in option `-pl` and all the dependent ones (flag `-amd`). For example, if I change
a class called `Foo.java`, and rebuild the Maven as mentioned before, the
command is (without parallel):

    mvn clean install -DskipTests -nsu -pl 'm7' -amd

which takes 02:44 min to complete.

Now, run the same command again in parallel:

    mvn clean install -DskipTests -nsu -pl 'm7' -amd -T 1C

which takes 01:55 min to complete.

## Only Compile

The build is still not very optimal because of the Ant tasks which take too long
to complete. If you don't need to build the packages in localhost, skip them.
This will make the build much faster. So here we will only compile the source
code without packaging, and let CI to run the tests and package the software:

    mvn clean -nsu compiler:compile compiler:testCompiler

which takes 35.123 seconds to complete.

Now, try again with parallel build:

    mvn clean -nsu compiler:compile compiler:testCompiler -T 1C

which takes 18.499 seconds to complete.

What about building only the changes?

    mvn clean -nsu compiler:compile compiler:testCompiler -T 1C -amd -pl 'm7'

still taking 18.404 seconds to complete. So I think we reach our limit now :)

## Summary

I make the summary as Bash alias, so that they can be executed easily in your
terminal:

{% highlight bash %}
# Maven CC (src compile + test compile)
#
#   Double compilation for both source code
#   and test code running in parallel.
#
#   Estimate: 18s
#
alias mvncc='mvn clean compiler:compile compiler:testCompile -nsu -T 1C'

# Maven NSU (no snapshot update)
#
#   Maven full build without snapshot update
#   running in parallel. Useful for the 1st
#   build.
#
#   Estimate: 8m33
#
alias mvnnsu='mvn clean install -DskipTests -nsu -T 1C'

# Maven NJS (non JavaScript)
#
#   Maven full build without JavaScript
#   modules. Useful when no changes on JS
#   code, and need to build the full project
#   locally.
#
#   Estimate: 2m01
#
alias mvnnjs='mvn clean install -DskipTests -nsu -T 1C -pl "!js1,js2,js3"'

# Maven NGWT (non GWT)
#
#   Maven full build without GWT (Google Web
#   Kit) modules. Useful when no changes on
#   GWT side, and need to build the full
#   project locally.
#
#   Estimate: 7m25 
#
alias mvnngwt='mvn clean install -DskipTests -nsu -T 1C -pl "!gwt1,!gwt2"'

# Maven Java (Java only)
#
#   Maven full build without GWT and
#   JavaScript, therefore Java only.
#
#   Estimate: 1m02
#
alias mvnjava='mvn clean install -DskipTests -nsu -T 1C -pl "!js,!gwt"'
{% endhighlight %}

## Conclusion

There're several ways to speed up a Maven project.

1. Only build the necessary part of the project
2. Use parallel execution if possible
3. Execute the right goals, e.g. compilation, rather than all goals
4. Build only the changes
5. Split into multiple projects :)

Hope you enjoy this article, see you the next time!

## References

- [StackOverflow: What is Wall clock in Maven build][1]
- [Wikipedia: Hyper-threading][htt]
- [Your Maven build is slow. Speed it up!][2]

[2]: https://zeroturnaround.com/rebellabs/your-maven-build-is-slow-speed-it-up/
[1]: https://stackoverflow.com/questions/36643975/what-is-wall-clock-in-maven-build
[htt]: https://en.wikipedia.org/wiki/Hyper-threading
