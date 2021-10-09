---
layout:              post
title:               Error Retries in Temporal Workflow
subtitle:            >
    Retry or not retry?

lang:                en
date:                2021-10-09 22:08:20 +0200
categories:          [temporal]
tags:                [temporal, go]
comments:            true
excerpt:             >
    This article discusses the error retries in workflow engine Temporal,
    including retryable and non-retryable application errors,
    error types in retry policy, retry policy usage in different levels,
    maximum attempts, and more.

image:               /assets/bg-pablo-garcia-saldana-lPQIndZz8Mo-unsplash.jpg
cover:               /assets/bg-pablo-garcia-saldana-lPQIndZz8Mo-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              false
ads:                 none
---

## Introduction

When working with Temporal to build workflows, you will have to face to error
handling at some point because workflow and activity can fail for different
reasons. Temporal Go SDK defines its [error
handling](https://docs.temporal.io/docs/go/error-handling/) logic and [activity
and workflow retries](https://docs.temporal.io/docs/go/retries/) in the official
documentation. But whenever I visit those pages, I always feel that
it's missing something that I need as a developer. So I decide to write this
article, to share my understanding of error retries in Temporal in Go SDK, as a
complementary to the official documents. And hopefully, it will clarify
different situations and give you a clearer picture of how errors are retried.
This article is written with Temporal Go SDK v1.10.0 (15 Sept 2021).

After reading this article, you will understand:

* The difference between retryable and non-retryable error at acvitity level
* Non-retryable error types in retry policy
* How to use retry policy?
* The maximum attempts when retrying
* How to write unit tests?

If you don't have time to read the entire article, here is a table for
summarizing the difference.

Scope    | Error Type       | Methods | Retryable (Default) | Retryable (Override)
:------: | :--------------- | :------ |:------------------- | :-------------------
Activity | `ApplicationError` | `temporal.NewNonRetryableApplicationError()` | No | -
Activity | `ApplicationError` | `temporal.NewApplicationError()` | Yes | -
Activity | Other errors | `fmt.Errorf()`, `errors.New()` | Yes | Retry policy (activity options)
Top-level workflow | All | - | No | Retry policy (start workflow options)
Child workflow | All | - | No | Retry policy (child workflow options)

## Retryable and Non-Retryable Application Error

By default, Temporal retries activities, but not workflows. According to
official documentation [Error Handling in
Go](https://docs.temporal.io/docs/go/error-handling/), if the activity returns
an error as `errors.New()` or `fmt.Errorf()`, that error will be converted to
`*temporal.ApplicationError`, which is retryable. If you don't want the error to
be retried, you can return a non-retryable application error from the activity.

```go
func MyActivity(ctx context.Context, name string) (string, error) {
	...
	// retryable
	return "", fmt.Errorf("oops")
}
```

```go
func MyActivity(ctx context.Context, name string) (string, error) {
	...
	// retryable
	return "", temporal.NewApplicationError("oops", "test")
}
```

```go
func MyActivity(ctx context.Context, name string) (string, error) {
	...
	// non-retryable
	return "", temporal.NewNonRetryableApplicationError("oops", "test", err)
}
```

This is easy to understand: Temporal wants to provide a fault-tolerant system so
that it can retry automatically when thing goes wrong. So at activity-level,
error are retried by default, unless user asks Temporal to not retry explicitly via wrapper
method `temporal.NewNonRetryableApplicationError(...)`.

If we dive into the source code, you can see that
`ApplicationError` determines the retry-ability of an error using its internal
boolean attribute `nonRetryable`:

```go
// go.temporal.io/sdk@v1.10.0/internal/error.go
type (
	// ApplicationError returned from activity implementations with message and optional details.
	ApplicationError struct {
		temporalError
		msg          string
		errType      string
		nonRetryable bool  // HERE
		cause        error
		details      converter.EncodedValues
	}
	...
}
```

One possible usecase for `temporal.NewNonRetryableApplicationError(...)` is when
interacting with a third-party service. When that service returns a
deterministic error indicating that required action cannot be performed, you may
not want to retry. For example, when a resource deletion request is rejected by
the third party service because it is still in used, you probably
don't want to retry. Therefore, calling
`temporal.NewNonRetryableApplicationError(...)` is a good choice.

## Non-Retryable Error Types in Retry Policy

Another way to define non-retryable error types for activity is to provide a
custom `RetryPolicy` as part of the `ActivityOptions` or `ChildWorkflowOptions`.
For example, to avoid retrying errors of type `MyError`, we can make it as
non-retryable as follows:

```go
func MyWorkflowWithRetryPolicy(ctx workflow.Context, name string) (string, error) {
	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    1 * time.Second,
			BackoffCoefficient: 2,
			MaximumInterval:    1 * time.Minute,
			MaximumAttempts:    5,
			NonRetryableErrorTypes: []string{"MyError"},  // HERE
		},
	})
	...
}
```

But, why Temporal has `NonRetryableErrorTypes` in Retry Policy? In my opionion,
there are several reasons:

* **`temporal.NewNonRetryableApplicationError(...)` is not enough.**
  It does not fit all the usecases.
  Sometime users already know the error types that they don't want to retry, but
  they don't want to determine the error types themselves for each activity and
  fire a non-retryable applicaton error, since it makes the activity verbose.
* **Bringing the control at workflow level.** An activity can be used for multiple
  workflows, e.g. primitive activities for GitHub, Slack, Build, Kubernetes, etc.
  Depending on the case of each workflow, some may want to retry while others
  don't.
* **Retry policy is not only used by activity.** It can be used as part of
  the activity options, child workflow options, or event the top-level workflow
  options. Since the policy controls the retry activitation, having
  `NonRetryableErrorTypes` allows to refine the activiations on different
  types of error.

## Using Retry Policy

Now, let's see how to use retry policy in different cases.

### Activity Options

Enable custom retry policy as activity options:

```go
func MyWorkflowWithRetryPolicy(ctx workflow.Context, name string) (string, error) {
	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
		RetryPolicy:         &retryPolicy,
	})
	...
}
```

In this case, failed activities will be retried, more precisely:

- Errors having type defined in `NonRetryableErrorTypes` won't be retried
- Errors wrapped into non-retryable application error won't be retried
- Other application errors will be retried

### Child Workflow Options

Enable custom retry policy as child workflow options:

```go
func MyWorkflowWithChildWorkflowRetryPolicy(ctx workflow.Context, name string) (string, error) {
	ctx = workflow.WithChildOptions(ctx, workflow.ChildWorkflowOptions{
		WorkflowRunTimeout: 10 * time.Second,
		RetryPolicy:        &retryPolicy,
	})
	...
}
```

In this case, failed child workflow will be retried (which is not the case by
default). The child workflow will be retried on all types of errors, except the ones
defined in `NonRetryableErrorTypes` in the retry policy.

### Top-Level Workflow Options

Enable custom retry policy as top-level workflow options:

```go
startOptions := client.StartWorkflowOptions{
	ID:                  id,
	TaskQueue:           ts.taskQueueName,
	WorkflowRunTimeout:  20 * time.Second,
	WorkflowTaskTimeout: 3 * time.Second,
	RetryPolicy:         &retryPolicy,
}
err := ts.executeWorkflowWithOption(startOptions, workflowFn, nil)
```

In this case, top-level workflow will be retried by the server on all types of
errors, except the ones defined in `NonRetryableErrorTypes` in the retry policy.

## Maximum Attempts

_For how many times is the server going to retry?_

When the custom retry policy is defined, the answer is obvious: the server is
going to retry `MaximumAttempts` times, defined in the policy. If the policy is
defined, but `MaximumAttempts` is not set or set to 0, it means unlimited, and
we rely on activity `ScheduleToCloseTimeout` to stop.

When the custom retry policy is not defined, for activities, it means using the
default retry policy. The default RetryPolicy provided by the server specifies
([v1.10.0](https://github.com/temporalio/sdk-go/blob/9d143aa8634807e523b3ac199a0447b9cf147e72/internal/activity.go#L127-L131)):

- InitialInterval of 1 second
- BackoffCoefficient of 2.0
- MaximumInterval of 100 x InitialInterval
- MaximumAttempts of 0 (unlimited)

For top-level workflow or child workflow, it means that there are no
retry because by default, Temporal retries activies, but not workflows
([doc](https://docs.temporal.io/docs/go/retries/)).

## Writing Unit Tests

Now we understand how the error retries mechanism works, it's time to write some
tests. Yes, writing tests because we need it: we need it to assert the retry
behavior, to assert the number of retry attempts, to assert the completion and
the result of the workflow, etc.

Here is an example for demonstrating that an applicaton error "oops" is
retryable and the activity is being executed twice: the first time failed and
the second time succeed.

```go
func (ts *WorkflowTestSuite) TestActivityError_ExplicitRetryableError() {
	// Given
	executionCount := 0
	ts.env.OnActivity(MyActivity, mock.Anything, mock.Anything).Return(func(ctx context.Context, msg string) (string, error) {
		executionCount++
		if executionCount == 1 {
			return "", temporal.NewApplicationError("oops", "test")
		} else {
			return "Hello, UnitTest!", nil
		}
	})

	// When
	ts.env.ExecuteWorkflow(MyWorkflow, "UnitTest")

	// Then
	ts.True(ts.env.IsWorkflowCompleted())

	var result string
	ts.NoError(ts.env.GetWorkflowResult(&result))
	ts.Equal("Hello, UnitTest!", result)
	ts.Equal(2, executionCount, "1st execution failed and 2nd execution succeed")
}
```

See <https://github.com/mincong-h/learning-go/pull/15> for more samples.

## Conclusion

In this article, we saw the retryable and non-retryable application errors in
Temporal; we saw the non-retryable error tpes defined by `RetryPolicy`; we saw
how to use retry policy as activity options, child workflow options, and
start workflow options for top-level workflows; and we also discuss the maximum
attempts for retries in different cases.

I hope that this article gives you more insights about how error retries is done
in Temporal workflow. The source code of this article is also available on
[GitHub](https://github.com/mincong-h/learning-go/pull/15).
You can subscribe to the [feed of my blog](/feed.xml), follow me on [Twitter](https://twitter.com/mincong_h) or [GitHub](https://github.com/mincong-h/). Hope you enjoy this article, see you the next time!

## References

- Temporal, "Activity and Workflow Retries", _Temporal Documentation_, 2021.
  <https://docs.temporal.io/docs/go/retries/>
- Temporal, "Error Handling in Go", _Temporal Documentation_, 2021.
  <https://docs.temporal.io/docs/go/error-handling/>
- Temporal, "Testing and Debugging", _Temporal Documentation_, 2021.
  <https://docs.temporal.io/docs/go/testing/>
- Temporal, "Temporal Go SDK", _GitHub_, 2021.
  <https://github.com/temporalio/sdk-go>
- Temporal, "Temporal Go SDK Samples", _GitHub_, 2021.
  <https://github.com/temporalio/samples-go>
