---
layout:              post
type:                classic
title:               Internal Working of GitLab API Go Client
subtitle:            >
    How does this SDK work and what can we learn from it?

lang:                en
date:                2022-12-04 10:23:14 +0100
categories:          [java-rest]
tags:                [go, api, system-design]
ads_tags:            [ci, test]
comments:            true
excerpt:             >
    The internal working of the GitLab API Go Client (xanzy/go-gitlab),
    including domain sub-clients, serialization, error mapping, testing, CI,
    advanced features, and more.

image:               /assets/bg-drmakete-lab-hsg538WrP0Y-unsplash.jpg
cover:               /assets/bg-drmakete-lab-hsg538WrP0Y-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

During my daily work at Datadog, I had the chance to use the GitLab Go API
client ([xanzy/go-gitlab](https://github.com/xanzy/go-gitlab)) to interact with
our GitLab server. I feel like that the library is well written and I want to learn
how to write a library in the same way. That's why I spent some time to study
its source code and I would like to share with you today. After reading this
article, you will understand:

- How to use this package
- The structure of the Go package
- The HTTP request and response
- Its dependencies
- The CI pipeline
- Its advanced features
- Publishing the documentation

Now, let's get started!

## Usage

Using the GitLab library is very simple, you need to create a new client with a
token and then use the domain-specific sub-client to access certain resources.
For example, this is the code for listing users, provided by the official
documentation:

```go
import "github.com/xanzy/go-gitlab"

// ...

git, err := gitlab.NewClient("yourtokengoeshere")
if err != nil {
  log.Fatalf("Failed to create client: %v", err)
}
users, _, err := git.Users.ListUsers(&gitlab.ListUsersOptions{})
```

There are a few `With...` option functions that can be used to customize the API
client. For example, to set a custom base URL:

```go
git, err := gitlab.NewClient("yourtokengoeshere", gitlab.WithBaseURL("https://git.mydomain.com/api/v4"))
if err != nil {
  log.Fatalf("Failed to create client: %v", err)
}
users, _, err := git.Users.ListUsers(&gitlab.ListUsersOptions{})
```

We will discuss more into details in the following sections.

## Package Structure

The structure of this package is pretty simple, most of the files are located
directly in the root directory of the Git repository. The Go files are grouped
by domain: each domain has 2 files, one for the source code and the other for
the test code, e.g. `access_requests.go` and `access_requests_test.go`.

```
➜  go-gitlab git:(master|u=) tree | head
.
├── LICENSE
├── README.md
├── access_requests.go
├── access_requests_test.go
├── applications.go
├── applications_test.go
├── audit_events.go
├── audit_events_test.go
├── avatar.go
```

Inside each domain, we can find the sub-client of this domain, the Go structues
representing the HTTP requests and responses related to the current domain, and
the methods related to this domain. For example, for the domain "jobs"
(`jobs.go`), we can find `JobsService` is the sub-client of the domain "jobs",
the structures `Job`, `Bridge` which are related to jobs in the file. Also, we
can see the methods for listing project jobs, pipeline jobs, pipeline bridges,
and other related functions.
## Section 3

## Going Further

How to go further from here?

## Conclusion

What did we talk in this article? Take notes from introduction again.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References
