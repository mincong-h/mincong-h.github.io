---
layout:            post
title:             Testing with GwtMockito
lang:                en
date:              2019-08-26 22:16:23 +0200
categories:        [java-core]
tags:              [testing, mockito, gwt]
comments:          true
excerpt:           >
    My recent bug fixing experience on Google Web Kit (GWT) with GwtMockito:
    problem understanding, code refactoring, mocking framework preparation,
    testing, and comparison between GwtMockito and GWTTestCase.
image:             /assets/bg-board-2450236_1280.jpg
cover:             /assets/bg-board-2450236_1280.jpg
ads:               None
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Recently, I fixed a front-end bug with our application written in Google Web Kit
(GWT). This is done by using [GwtMockito](https://google.github.io/gwtmockito/).
Today, I would like to share my experience about how I fixed it. After reading
this article, you will understand:

- What happened to that web page?
- How to fix it?
- How to refactor the code for testing?
- Why I tested it using GwtMockito?
- How the test is written?
- Some other improvements

Let's get started :)

## The Bug

In Nuxeo Studio, we have a Custom Chain Browser, it is an editor that should display
all the Automation Chain features for a given user for customization. However, it
displays not only Automation Chain features, but also all other types of
features that are available in the user's project model. It brings a lot of
confusion. The goal of the ticket is to fix it by displaying only the required
type: Automation Chain.

The changes in source code are pretty obvious:

```diff
 public class OpRestBindingFeatureEditor extends AbstractFeatureEditor<OpRestBindingFeature> {
     ...
     class NonUIChainsBrowser extends FeatureBrowser {
+        private static final String[] FILTER = { OpChainFeatureType.ID };

         NonUIChainsBrowser() {
             super(IDE.getActiveProject());
+            setAcceptedFeatureTypes(FILTER);
         }
      }
 }
```

I added a filter to _NonUIChainsBrowser_ to ensure
the fix is applied correctly. This is done by using the
`setAcceptedFeatureTypes(String[])` defined in parent class _FeatureBrowser_.

The question is: How to test it? 🤔

## Extract Usage for Test

Before going further, let's see how the class is used. In parent class
_FeatureBrowser_, features are read to create content. The list of
feature models go through a for-loop: if the feature model is an accepted
one, it will be put inside the target maps. Else, it will be skipped. This
approach is not test-friendly. The function has no input parameters, it depends
on the state of the dialog. The feature-filtering is split into two parts:
getting features and filtering.

```diff
 public class FeatureBrowser extends Dialog {
     ...

     @Override
     protected Widget createContent() {
         tree = new TreeEx();
         Map<String, String> itemLabels = new HashMap<>();
         Map<String, FeatureModel> featureItems = new HashMap<>();
-        List<FeatureModel> extensions = project.getFeatures();
-        for (FeatureModel xt : extensions.toArray(new FeatureModel[extensions.size()])) {
+        for (FeatureModel xt : getAcceptedFeatures()) {
             String id = xt.getId();
-            if (accept(xt) && !itemLabels.containsKey(id)) {
+            if (!itemLabels.containsKey(id)) {
                 featureItems.put(id, xt);
                 itemLabels.put(id, id);
             }
         }
         ...
     }

+    public List<FeatureModel> getAcceptedFeatures() {
+        return project.getFeatures()
+                      .stream()
+                      .filter(this::accept)
+                      .collect(Collectors.toList());
+    }
+
 }
```

In order to better test the code, I extracted the filter part into a seperacted
method called `getAcceptedFeatures()`. It use `accept()` defined in the current
class. More importantly, its behaviors change according to the filter. In other
words, `FeatureBrowser.accept()` and `NonUIChainsBrowser.accept()` have different
behaviors—their filter are different. The first one accepts all the features and
the second one only accepts specific feature having type: Automation Chain.
Therefore, we will be able to write test for filtering of the child class
_NonUIChainsBrowser_. For example:

```java
NonUIChainsBrowser browser = new NonUIChainsBrowser();
List<FeatureModel> accepted = browser.getAcceptedFeatures();
assertTrue(accepted.contains( ... ));
```

But the problem is the project model. In `getAcceptedFeatures()`, we need to
have project model configured to retrieve the results. In Nuxeo Online Services,
the construction of project model class is very complex. It requires lot of
set up: having user, subscription, etc. In order to avoid these conditions, I
would like to use mocking framework. That's how GwtMockito comes it.

## GwtMockito

Ideally, I can use Mockito to handle the mock of features as follows in my test:

```java
// Given a project with a list of features
ProjectModel project = mock(ProjectModel.class);
FeatureModel featureB = new BrandingFeature("aBranding");
FeatureModel featureC = new OpChainFeature("aChain");
FeatureModel featureS = new AutomationScriptingFeature("aScript");
List<FeatureModel> features = Arrays.asList(featureB, featureC, featureS);
when(project.getFeatures()).thenReturn(features);
```

But I cannot do that in Google Web Kit (GWT). Testing GWT applications using
[GWTTestCase][GWTTestCase] is not pure Java tests. They are transpiled into
JavaScript. Running a compiled [GWTTestCase][GWTTestCase] subclass under JUnit
launches the HtmlUnit browser which serves to emulate your application behavior
during test execution. You cannot use reflection-based tools like mocking
frameworks. According to GwtMockito, if you've tried to test widgets normal test
cases, you've probably run into this error:

> ERROR: GWT.create() is only usable in client code!  It cannot be called,
> for example, from server code. If you are running a unit test, check that 
> your test case extends GWTTestCase and that GWT.create() is not called
> from within an initializer or constructor.

GwtMockito solves this and other GWT-related testing problems by allowing you
to call `GWT.create` from JUnit tests, returning Mockito mocks.

Using GwtMockito in unit tests is pretty simple, you just need to declare the
classical JUnit annotation `RunWith` with `GwtMockitoTestRunner.class`, and GWT
Mockito will do the magic for you. There is no need to extend GWTTestCase.
Also, you can use JUnit 4 syntax (which is not the case for GWTTestCase).

```java
@RunWith(GwtMockitoTestRunner.class)
public class OpRestBindingFeatureEditorTest {
    @Test
    public void myTest { ... }
}
```

## Final Test

After switching from GWTTestCase to GwtMockito, here is the final version of my
test:

```java
@RunWith(GwtMockitoTestRunner.class)
public class OpRestBindingFeatureEditorTest {

    @Test
    public void classCustomChainBrowser_getAcceptedFeatures() {
        // Given a project with a list of features
        ProjectModel project = mock(ProjectModel.class);
        FeatureModel featureB = new BrandingFeature("aBranding");
        FeatureModel featureC = new OpChainFeature("aChain");
        FeatureModel featureS = new AutomationScriptingFeature("aScript");
        List<FeatureModel> features = Arrays.asList(featureB, featureC, featureS);
        when(project.getFeatures()).thenReturn(features);

        // When querying the accepted feature in Custom Chain Browser (Dialog)
        CustomChainBrowser browser = new CustomChainBrowser(project);
        List<FeatureModel> accepted = browser.getAcceptedFeatures();

        // Then the only accepted one belongs to Operation Chain
        assertTrue(accepted.contains(featureC));
        assertEquals(1, accepted.size());
    }

}
```

The first step of the test is to mock the project model. As I said, the project
model is too complex to configure. So I mock it with Mockito. When asking for
features in the project model, then mocking framework returns the prepared features
for the test. They have different types: branding, operation-chain,
automation-scripting. But all of them implement the interface `FeatureModel`.

```java
List<FeatureModel> features = Arrays.asList(featureB, featureC, featureS);
when(project.getFeatures()).thenReturn(features);
```

Then the second step is to construct the target "browser" (dialog). Previously,
it was called `NonUIChainsBrowser`. I renamed it to `CustomChainBrowser`, so
that it is easier to remember. Once the browser constructed, we can ask the
accepted features from this browser and check if the filtering works as
expected. Reminder: `getAcceptedFeatures()` comes from parent class
`FeatureBrowser`, added during bug-fixing.

```java
// When querying the accepted feature in Custom Chain Browser (Dialog)
CustomChainBrowser browser = new CustomChainBrowser(project);
List<FeatureModel> accepted = browser.getAcceptedFeatures();
```

Once we got the accepted features, we assert the results about the filtering.
This is done using the classic JUnit assertions. As you can see, features from
Branding and Automation Scripting are filtered correctly. Operation Chain
feature is the only one remains.

```java
// Then the only accepted one belongs to Operation Chain
assertTrue(accepted.contains(featureC));
assertEquals(1, accepted.size());
```

## Other Improvements

```diff
-    class NonUIChainsBrowser extends FeatureBrowser {
-        NonUIChainsBrowser() {
-            super(IDE.getActiveProject());
+    static class CustomChainBrowser extends FeatureBrowser {
+        private static final String[] FILTER = { OpChainFeatureType.ID };
+
+        CustomChainBrowser(ProjectModel project) {
+            super(project);
+            setAcceptedFeatureTypes(FILTER);
+        }
```

In the same commit, I also did some other improvements in the code. Let's take a
quick look together.

- The class was renamed from `NonUIChainsBrowser` to `CustomChainBrowser` to
better illustrate the purpose of the class.
- The class was changed from inner class to `static` nested class so that it can
  be instantiated independently from its outer class. It allows me to create an
  instance of this static nested class in the test.
- Avoid static usage from `IDE.getActiveProject()`. This usage is not
  test-friendly. The project model should be decoupled from the browser. Therefore,
  it is now moved to the input parameter of the constructor. This idea comes from
  [Dependency Inversion
   Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle),
  which is part of the [SOLID principles](https://en.wikipedia.org/wiki/SOLID).
  By consequence, the project model is mocked and then passed to the target object.

## More about GwtMockito

Tests written in GwtMockito are executed by [Maven Surefire
Plugin](https://maven.apache.org/surefire/maven-surefire-plugin/index.html) in
goal "surefire:test". This goal binds by default to Maven lifecycle phase:
"test". As you can see, the test is running fast, it can finish
in 0.737 second. Here is the screenshot from our build:

![Maven Surefire Plugin for GwtMockito Tests](/assets/20190827-gwtmockito.png)

On the other hand, subclasses of GWTTestCases are executed by [GWT Maven
Plugin](https://gwt-maven-plugin.github.io/gwt-maven-plugin/) in goal
"gwt:test". We don't consider GWTTestCase to be unit test as they require the
whole GWT Module to run. For this reason, the "gwt:test" goal is bound by
default to Maven lifecycle phase: "integration-test". Here is the screenshot
from our build:

![GWT Maven Plugin for GWTTestCase](/assets/20190827-gwttestcase.png)

If you want to know more about GwtMockito, take a look at
<https://github.com/google/gwtmockito>.

## Conclusion

Today, I shared with you my own experience on GWT bug-fixing using GwtMockito.
We started with a 2 lines fix, then expand it into a complete test plan. This is
done by refactoring the code, preparing the mocking framework, and writing the
actual test. Afterward, I explained a bit other improvements I did in the same
commits. Finally, we compared the difference between GwtMockito and GWTTestCase.
Hope you enjoy this article, see you the next time!

## References

- Oracle, "Nested Classes", _Java Documentation_, 2017.
  <https://docs.oracle.com/javase/tutorial/java/javaOO/nested.html>
- GWT Project, "GWTTestCase (GWT Javadoc)", _GWT Project_, 2019.
  <http://www.gwtproject.org/javadoc/latest/com/google/gwt/junit/client/GWTTestCase.html>
- GWT Project, "Testing", _GWT Project_, 2019.
  <http://www.gwtproject.org/doc/latest/DevGuideTesting.html>
- Wikipedia, "Dependency inversion principle", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/Dependency_inversion_principle>
- Wikipedia, "SOLID", _Wikipedia_, 2019.
  <https://en.wikipedia.org/wiki/SOLID>
- GWT, "Maven Plugin for GWT", _GWT Maven Plugin_, 2017.
  <https://gwt-maven-plugin.github.io/gwt-maven-plugin/>
- Maven, "Introduction to the Build Lifecycle", _Apache Maven_, 2019.
  <https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html>

[GWTTestCase]: http://www.gwtproject.org/javadoc/latest/com/google/gwt/junit/client/GWTTestCase.html
