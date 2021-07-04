---
layout:      post
title:       "Testing Haskell"
lang:                en
date:        "2018-04-28 07:19:14 +0200"
categories:  [tech]
tags:        [haskell, testing, ci, travis-ci]
excerpt:     >
  This post explains how to configure your Haskell project for testing, using
  Cabal and Travis CI.
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

This post explains how to configure your Haskell project for testing, using
Cabal and Travis CI.

<!-- more -->

I'd like to learn Haskell, but I had a really hard time yesterday to setup the
testing environment correctly. So I want to share my experience with you, to
make life easier. In this post, we'll go through the following steps:

- Adapt project structure to Cabal
- Configure test
- Enable Travis CI

## Adapt Project Structure to Cabal

[Cabal][cabal] is a system for building and packaging Haskell libraries and
programs. Before this blog post, I didn't know about Cabal and my project have
only 2 Haskell files on the top level folder. You can initialize the Cabal
structure and generate related files using interactive command line tool
[`cabal init`][cabal-init]. Once done, editing the `<project>.cabal` file to
add or modify the content.

Then you need to move the Haskell source files \*.hs into the `src` folder.

```
$ find src -type f
src/factorial.hs
src/Mathematics.hs
src/catalan.hs
```

If everything works, try configuring and building the package:

```
$ cabal configure
$ cabal build
```

Install if it works:

```
$ cabal install
```

## Configure Tests

For the testing part, I followed Cabal's documentation: [§3.3.2.6 Test
suites][test]. It's very simple, just declare an additional section in your
project's `<project>.cabal`, as _test-suite_. (Note: replace _test-suite_ by
_test_ won't work):

```
test-suite Mathematics
  type:                exitcode-stdio-1.0
  main-is:             test-mathematics.hs
  hs-source-dirs:      src, test
  build-depends:       base
  other-modules:       Mathematics
  default-language:    Haskell2010
```

In the above section, multiple fields have been declared:

- The `type` field indicates the type of test-suite is _exitcode-stdio-1.0_. It
  means test suite can indicate test failure with a non-zero exit code when run.
  It may also provide human-readable log information through the standard output
  and error channels. The _exitcode-stdio-1.0_ type requires the `main-is`
  field.
- The `main-is` field indicates the main program to run.
- The `hs-source-dirs` field indicates the haskell source directories are _src_
  and _test_.
- The `build-depends` field indicates the dependencies when building this
  module.
- The `other-modules` field indicates a list of modules used by the component
  but not exposed to users.
- The `default-language` field indicates the default language version. It should
  be aligned with the Library section.

Note: you must run `cabal install --enable-tests`, then you can run `cabal test`
to run your tests.

## Travis CI

Travis CI has a complet documentation page about [Building a Haskell
Project][travis-doc]. In my case, I need to precise the language as _Haskell_,
since Travis CI didn't detect it correctly (without precision, it used Java and
Gradle mistakenly). And I also flatten GHC versions list into oneline. Here's
the result:

{% highlight yml %}
language: haskell
ghc: 8.2
{% endhighlight %}

## References

- [StackOverflow: How can I set up a simple test with Cabal?][so1044555]
- [Cabal: Package Concepts and Development][quick-start]

[so1044555]: https://stackoverflow.com/questions/1044555/how-can-i-set-up-a-simple-test-with-cabal
[quick-start]: https://www.haskell.org/cabal/users-guide/developing-packages.html
[cabal]: https://www.haskell.org/cabal/
[cabal-init]: https://www.haskell.org/cabal/users-guide/developing-packages.html#using-cabal-init
[test]: https://www.haskell.org/cabal/users-guide/developing-packages.html#test-suites
[travis-doc]: https://docs.travis-ci.com/user/languages/haskell/
