---
layout:              post
type:                classic
title:               Activity in Temporal
subtitle:            >
    If you want to use Temporal, you need to know about Activity.

lang:                en
date:                2022-07-30 11:28:39 +0200
categories:          [temporal]
tags:                [temporal, go]
ads_tags:            [workflow, automation, devops]
comments:            true
excerpt:             >
    This article explains the definition of an activity, execution, observability,
    testing, use-cases, and trade-offs in the workflow engine Temporal.

image:               /assets/bg-guillermo-ferla-kEEl9csCutg-unsplash.jpg
cover:               /assets/bg-guillermo-ferla-kEEl9csCutg-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
---

## Introduction

If you want to use <https://temporal.io/> as your workflow engine, you need to
know about Activity, which is one of the key concepts of the Temporal workflow
engine. After reading this article, you will understand:

* What is an activity?
* Activity execution
* Observe an activity
* Test an activity
* Use-cases
* Trade-offs

Now, let's get started!

## What is an activity?

According to the [official documentation of
Temporal](https://docs.temporal.io/concepts/what-is-an-activity), _"an Activity is
a normal function or object method that executes a single, well-defined action
(either short or long-running), such as calling another service, transcoding a
media file, or sending an email message"_. In the basic ["Hello
World"](https://github.com/temporalio/samples-go/tree/main/helloworld) sample,
we can see how the actual code looks like:

```go
// Workflow is a Hello World workflow definition.
func Workflow(ctx workflow.Context, name string) (string, error) {
	// ...
	var result string
	err := workflow.ExecuteActivity(ctx, Activity, name).Get(ctx, &result)
	if err != nil {
		logger.Error("Activity failed.", "Error", err)
		return "", err
	}

	logger.Info("HelloWorld workflow completed.", "result", result)

	return result, nil
}

func Activity(ctx context.Context, name string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Activity", "name", name)
	return "Hello " + name + "!", nil
}
```

where we have a function `Activity` for logging "Hello $name!" which is called
by the `Workflow` using `workflow.ExecuteActivity(...)`.

## Activity Execution

Now, what happens when a workflow executes an activity? Basically, it contains 3
stages in the lifecycle of the execution: scheduled, started, and completed.

1. [**ActivityTaskScheduled**](https://docs.temporal.io/references/events/#activitytaskscheduled)
  -- The activity task is sent to the Temporal server. More precisely, sent to a
  specific namespace and specific task queue inside the Temporal server via gRPC. Then,
  this activity waits to be picked up by a
  Temporal worker (client) to execute the actual logic. During this time, the
  event is persisted in the database and you can see it from the Web UI in the
  [event history](https://docs.temporal.io/concepts/what-is-an-event-history).
2. [**ActivityTaskStarted**](https://docs.temporal.io/references/events/#activitytaskstarted)
  -- The activity task is picked by a Temporal worker that is listening to that
  task queue. Therefore, the task is considered as "started". The task is
  being processed by the SDK client.
3. [**ActivityTaskCompleted**](https://docs.temporal.io/references/events/#activitytaskcompleted)
  -- The activity task is now completed. The SDK client has picked up and
  successfully completed the Activity Task.

Your best friend for better understanding these concepts is the Temporal Web UI
because it shows the execution of the workflow as event history, where all the
events are listed in chronological order. It's quite simple.

However, for advanced users, the reality is more complex than that. Here are
some details that you
may need to know if you need to run workflows in production:

* **Pending task.** When an activity task is scheduled, it won't necessarily be picked up because
  the worker may not be deployed or may not listen to that task queue.
* **Heartbeating.** When an activity task is being processed, the duration can be short or long.
  You may need to set up heartbeating for long-running activities so that
  Temporal server knows that the activity is making progress so that it won't
  abort the execution. For example, if the activity reads a large file from
  Amazon S3 or runs an ML training job on some local GPUs. For short execution,
  such as a quick API call or reading a small file from a disk, heartbeating is
  not necessary.
* **Execution retries**. You can define a retry policy in the activity options
  from the workflow context to allow retrying failed activity tasks. One
  "Activity Execution" contains multiple "Activity Task Executions". A task can
  be retried due to timeout or failure. The number of retries or other
  conditions is defined in the retry policy. You can see more details in the official
  document ["What is an Activity
  Execution?"](https://docs.temporal.io/concepts/what-is-an-activity-execution)
* **Other task results.** `ActivityTaskCompleted` isn't the only type of result
  for the execution. An activity task can also be failed (`ActivityTaskFailed`),
  timed out (`ActivityTaskTimedOut`), cancel-requested (`ActivityTaskCancelRequested`),
  or canceled (`ActivityTaskCanceled`). You can browse those events in the
  [Events reference](https://docs.temporal.io/references/events).

## Observability

Now I have a workflow running and I want to inspect the activities, what should
I do?

### Logging

When defining your activity, you may retrieve a logger from the `activity`
package as

```go
logger := activity.GetLogger(ctx)
```

Internally, the logger not only logs the message and severity but also adds
additional key-value pairs such as the namespace, the task queue, worker ID, the
workflow type, the workflow ID, the run ID, etc.

### Tracing

The Go SDK provides support for distributed tracing through OpenTracing. Tracing
allows you to view the call graph of a workflow execution along with its
activities and child workflows. See
[documentation](https://docs.temporal.io/go/tracing/). Otherwise, you can also
create a custom
interceptor by extending the
[BaseTracer](https://github.com/temporalio/sdk-go/blob/master/interceptor/tracing_interceptor.go)
and providing your own implementation. It provides functions to
intercept the activity and workflow, in particular,
extracting span from the gRPC headers and injecting it into the context or vice versa.

## Testing

To test activity, you probably cannot use a normal unit test anymore. Because
some logic assumes that the current function is located inside an activity, such
as `activity.GetLogger(ctx)`. It will panic if your test isn't inside an
activity.

Therefore, you need to prepare an activity environment or workflow environment
for it. This can be done using the testing framework provided by the Temporal Go
SDK or other language SDKs via a Temporal test suite. Once the environment is created, you will need to
register the activity into the environment so that you can execute the activity.

The test file [helloworld_test.go](https://github.com/temporalio/samples-go/blob/main/helloworld/helloworld_test.go) in the "hello world" sample very well resumed what you need to do,
either using `NewTestWorkflowEnvironment()` or `NewTestActivityEnvironment()`.

```go
package helloworld

import (
	"testing"

	"github.com/stretchr/testify/mock"

	"github.com/stretchr/testify/require"
	"go.temporal.io/sdk/testsuite"
)

func Test_Workflow(t *testing.T) {
	testSuite := &testsuite.WorkflowTestSuite{}
	env := testSuite.NewTestWorkflowEnvironment()

	// Mock activity implementation
	env.OnActivity(Activity, mock.Anything, "Temporal").Return("Hello Temporal!", nil)

	env.ExecuteWorkflow(Workflow, "Temporal")

	require.True(t, env.IsWorkflowCompleted())
	require.NoError(t, env.GetWorkflowError())
	var result string
	require.NoError(t, env.GetWorkflowResult(&result))
	require.Equal(t, "Hello Temporal!", result)
}

func Test_Activity(t *testing.T) {
	testSuite := &testsuite.WorkflowTestSuite{}
	env := testSuite.NewTestActivityEnvironment()
	env.RegisterActivity(Activity)

	val, err := env.ExecuteActivity(Activity, "World")
	require.NoError(t, err)

	var res string
	require.NoError(t, val.Get(&res))
	require.Equal(t, "Hello World!", res)
}
```

## Use-cases

_But when should I use activities?_

Using activities has multiple benefits: the logic encapsulated by the activity
can be retried based on the retry policy; you can see the input and output in
JSON format in the event history; you can rely on
`workflow.ExecuteActivity(...)` to handle asynchronous processing, etc. Given
the benefits above, I believe that you can use activities:

* when your workflow talks to an external service so that you can retry on failures
* when you need clear input and output for a section of your workflow so that
  you can inspect the event history
* when you need to execute multiple tasks concurrently or asynchronously so that
  you can combine them with [workflow selectors and
  channels](https://docs.temporal.io/go/selectors/#overview).

If other cases are not covered by this section, please let me
know, I am happy to update it! :D

## Trade-Offs

One trade-off about using activity is the risk of function signature mismatch
between the definition (e.g. `Activity(ctx context.Context, name string) (string,
error)` in the hello world sample) and the execution (e.g.
`workflow.ExecuteActivity(ctx, Activity, name)`). If you updated the activity
definition without updating the executions (callers), then your workflow
execution will probably not work anymore -- because the Temporal worker cannot find
the function in its registry... because the signature is changed. One
mitigation is to avoid using `ExecuteActivity` directly, but generate a client,
which encapsulates the logic. Therefore, you can rely on the compiler to find
out the issue.

## Going Further

How to go further from here?

* If you want to know more about activities in Temporal, you should read the
  official documentation <https://docs.temporal.io/activities>
* If you want to know more about the Go SDK, visit <https://docs.temporal.io/go/>
* If you want to know more about observability, visit
  <https://docs.temporal.io/application-development/observability>.

## Conclusion

In this article, we talk about activities in temporal: the definition of activity,
the execution of an activity, observability, testing, use-cases, trade-offs, and finally
some additional resources to go further.
Interested to know more? You can subscribe to [the feed of my blog](/feed.xml), follow me
on [Twitter](https://twitter.com/mincong_h) or
[GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

_P.S. Special thanks to [Charles Oran](https://github.com/coran) for reviewing
this post._

## References

- <https://docs.temporal.io/>
