---
layout:            post
title:             "Feature Flag: Making Your Application More Reliable"
lang:                en
date:              2020-11-11 14:35:10 +0100
categories:        [reliability]
tags:              [java, reliability]
permalink:         /2020/11/11/feature-flag/
comments:          true
excerpt:           >
    How to make your web application more reliable with feature flags?
image:             /assets/bg-lance-grandahl-hF6TtT-xz80-unsplash.jpg
cover:             /assets/bg-lance-grandahl-hF6TtT-xz80-unsplash.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Introduction

When running software as a service (SaaS), we keep deploying new features to
adapt to the business requirements and satisfy customers' needs. However, it's
challenging to do everything right and ensure everything deployment has zero
regression. In this article, we are going to take a look at feature flags
and see how they can make a SaaS application more reliable.

After reading this article, you will understand:

- What is a feature flag?
- How to write a feature flag?
- How to use a feature flag?
- How to test a feature flag?
- Other actions related to feature flags
- How to go further from this article?

Now, let's get started!

## Overview

_What is a feature flag and why should we use it?_

A feature flag is a technique in software development that provides an
alternative among multiple branches in the source code. It is used to enable or
disable a feature during runtime. This is valuable for your SaaS application
because it allows controlling features without a new release or a new deployment, which
makes recovery faster when regression happens. Also, it makes it possible to
deliver multiple features in the same deployment, since each of them can be
controlled by an individual flag. Globally, it makes the delivery faster and safer.

We can use feature flag in many situations, we can use it to switch the logic of
a method; we can use it to switch the implementation of an interface; we can use
it to enable a beta program, and much more. If you want a more complete view of
feature flags, I recommend LaunchDarly's blog: ["What Are Feature
Flags?"](https://launchdarkly.com/blog/what-are-feature-flags/) written by Dawn
Parzych. In the following sections, we are going to focus more on how to make
the feature flag works.

## Implementing Feature Flags

Actually, a feature flag is as simple as a decision object in your code to
determine which branch of the logic should be executed. In Java, it looks like:

```java
if (isNewFeatureEnabled) {
  // use new implementation
} else {
  // use old implementation
}
```

When the new feature is enabled, the new implementation will be executed. Else
the old implementation will be executed. The feature flag itself can be provided
in many different ways: it can be provided statically via an environment variable, Java system
properties, configuration file, etc. It can also be provided dynamically via
JMX, database, or RESTful API, etc. Depending on your business requirements, the
complexity of the system, expertise of the team, the number of programming
languages used, your choice may change. For example, for stateless applications,
changing configuration statically via configuration files or environment
variables is not a problem, because we can restart the JVM without too many
concerns. It is probably not true for stateful applications that need to
remember the state before shutdown and restart. It's even worst for cluster-like
stateful application because changing the state needs to be done
cluster-wise to take primary and replicas into consideration. Therefore, there
is no standard answer about how to provide a feature flag, you need to find what
fits you.

Here is a simple example using system property:

```java
var isNewFeatureEnabled = Boolean.getBoolean("NEW_FEATURE_ENABLED");
if (isNewFeatureEnabled) {
  values.add("new");
} else {
  values.add("old");
}
```

In broader terms, I think feature flags should not be limited at a boolean
branch switching. We can use it in other aspects:

- **Regex feature flag.** We can define a list of regular expressions and use them as
  a feature flag. Any resources matching one of these patterns will be handled
  by the new implementation, while other resources will be handled by the
  old implementation. In this way, we can enable a new feature progressively in
  production, such as starting from internal resources and ending with
  customer resources; starting from low-traffic resources and ending with
  high-traffic resources; start from the non-critical path and ending with the
  critical path, etc. This technique makes switching safer.
- **Time-based feature flag.** Enabling a new feature at a predefined instant,
  usually in the future. Therefore, we have time reference to keep track of the
  changes and ensure that multiple things will be changed in the same instant
  and make it easier to keep things idempotent.

## Testing

Testing itself is not the goal. The goal is to bring confidence and ensure
things work as expected before the code delivery. So depending on the confidence
you have, the importance of the new feature, the potential customer impact, you
may want to do more or less testing. Here are some of my thoughts:

**Testing the feature flag retrievement.** You may want the test the feature flag
retrievement. For example, how to retrieve the value from an environment variable.
Ensure the behavior is expected when the property is enabled, the property is
disabled, and the property is absent. Another example is the test the regular
expressions mentioned above and ensure they work as expected.

**Testing the switching.** Maybe you are refactoring a logic which should be a
no-op change. So changing from old implementation to new implementation should
not have any customer impact. However, you want to be extra safe because you are
changing a mission-critical component. In this case, I suggest using JUnit 5
parameterized testing, where you can test both the old implementation and the
new implementation as two parameterized inputs. Therefore, both of them must
satisfy the same specification. Some additional testing can be done separately
to the new implementation to meet additional requirements.

**Testing the new implementation.** As the existing one is already in production
and probably working for days, weeks, or months, you may just want to test the
new implementation to minimize the testing effort.

**Testing in staging.** This sounds obvious but please don't forget to do it.
It's important to test it manually in staging to ensure it works as expected.
Ideally, you
should take a screenshot or write the key information in your issue-tracking
system to prove that. It can serve as a reference to compare the changes if
things go wrong after deploying in production. Several things to consider: 1)
observe the behavior of the system before the change of
the feature flag, such as logs, metrics, traces, database; 2) observe the
behavior of the system after the change of the feature flag; 3) the possibility
to revert and its impact, especially for stateful applications; 4) the order of
deployment if that matters.

## Other Actions

We talked a lot about coding in the previous sections, but there are also some
other actions that we should think about.

Plan before merging and deploying your changes. Write down the deployment plan
(the order of services to deploy) and try to justify if you think it's a bit
confusing. This is important when you have multiple services to deploy because
feature flag can be applied to multiple of them; or feature flag can impact
their interactions: producer/consumer, server/client, ... Also, think about the
revert scenario: what can happen if the rollout fails, can we revert
successfully? Reverting a feature is not just reverting the feature flag, but
also ensuring that the data models are backward compatible, ensuring that
dependent services (downstream) work well, etc. Usually, it's not that complex,
but having a checklist gives you more choices and reduces the potential risk.

Improve observability. I believe it's a good practice to improve the
observability when adding a feature flag because it gives more visibility to the
changes and makes decision-making easier. Improving observability means adding
metrics, traces, logs to the code. Some concrete examples are: adding metric to
record usage of the old implementation and the new implementation, then compute
the ratio — it shows the progress of the feature switching; adding traces to
your application, so that you know the spans (steps) executed; adding logs to
record the key events and decision in the code, e.g what is the value of the
feature flag, it's executing in the new implementation or the old one, etc. You
can also improve observability by adding metrics in some dashboards or alerting
system so that on-call people can find them out or be notified.

Keeping your teammates informed about the changes, especially the ones handling
operations in the coming hours after deployment. Place more emphasis on the
impact of the changes, observability of the system behavior. And tell them how
to change the feature flag back.

Clean up old implementation and feature flags. This can be easily forgotten, but
it's important since it simplifies the code and reduces the risk of going back to an
outdated logic.

## Going Further

How to go further from here?

- To learn more about the definition and the benefits of using feature flags,
  read the blog post "What Are Feature Flags?" of LaunchDarkly, written by Dawn
  Parzych. <https://launchdarkly.com/blog/what-are-feature-flags/>
- To continue exploring more about how to work with feature flags, different
  types of them, coding them, and more, read this blog post on Medium "Coding
  with Feature Flags: how to Guide and Best Practices", written by Tim Hysniu.
  <https://medium.com/@thysniu/coding-with-feature-flags-how-to-guide-and-best-practices-3f9637f51265>
- To learn more about parameterized tests in JUnit 5, read the official web page
  "JUnit 5 User Guide", section "Parameterized Tests". <https://junit.org/junit5/docs/current/user-guide/>
- To learn how to use Datadog to improve your observability, you can visit
  ["Metrics"](https://docs.datadoghq.com/metrics/introduction/),
  ["APM & Distributed Tracing"](https://docs.datadoghq.com/tracing/),
  ["Log Management"](https://docs.datadoghq.com/logs/).

You can see the source code of this blog post on GitHub
([source](https://github.com/mincong-h/java-examples/blob/blog/feature-flag/reliability/src/main/java/io/mincong/reliability/featureflag/MyJob.java),
[test](https://github.com/mincong-h/java-examples/blob/blog/feature-flag/reliability/src/test/java/io/mincong/reliability/featureflag/MyJobTest.java)).

## Conclusion

In this article, we saw the definition of feature flags, the motivation of using
them, a small demo in Java, the testing of feature flags, and some other actions
related. I hope that thanks to this technique, your feature can be delivered
safer and faster.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Wikipedia, "Feature toggle", _Wikipedia_, 2020. <https://en.wikipedia.org/wiki/Feature_toggle>
