---
layout:      post
title:       "Introduction to Selenium WebDriver"
lang:                en
date:        "2018-04-03 20:50:21 +0200"
categories:  [java-testing]
tags:        [java, qa, testing, study-note, selenium]
permalink:         /2018/04/03/learning-selenium-webdriver/
comments:    true
excerpt:     >
  A quick introduction to Selenium WebDriver, a practical tool for running
  functional tests and browser automation. The sample is written with Firefox 58
  and GeckoDriver 0.20.
image:       /assets/bg-board-2450236_1280.jpg
cover:       /assets/bg-board-2450236_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

Selenium is a portable software-testing
framework for web applications. Selenium WebDriver is the successor to Selenium
RC: it accepts commands
and sends them to a browser. This is implemented through a browser-specific
browser driver, which sends commands to a browser, and retrieves results. Most
browser drivers actually launch and access a browser application (such as
Firefox, Chrome, Internet Explorer, Safari, or Microsoft Edge); there is also an
HtmlUnit browser driver, which simulates a browser using the headless browser
HtmlUnit.

In this post, I'll use Selenium WebDriver 3.8 in Mac OS with Firefox 58. After
reading this post, you'll understand:

- How to install GeckoDriver (for Firefox)
- How to initialize WebDriver in Java
- How to select WebElement
- How to execute native JS command
- How to send keys to element
- How to wait
- How to use basic XPath (XML Path Language)
- Troubleshooting

## Installation

GeckoDriver is a proxy for using W3C WebDriver-compatible clients to interact
with Gecko-based browsers. GeckoDriver provides HTTP API described by the
WebDriver protocol to communicate with Gecko browsers, such as Firefox version
above 47.

Install GeckoDriver via brew, then check the version.

    $ brew install geckodriver
    $ geckodriver --version
    geckodriver 0.20.0

## Initialize WebDriver

{% highlight java %}
import org.junit.*;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;

/**
 * Integration test for an awesome page.
 */
public class AwesomePageIT {

  private static WebDriver driver;

  @BeforeClass
  public static void beforeAll() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(R.FIREFOX_SAFE_MODE, "-1");

    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);

    driver = new FirefoxDriver(options);
    driver.get(NUXEO_URL);
  }

  @AfterClass
  public static void afterAll() {
    driver.close();
  }

  // TODO Add tests here...
}
{% endhighlight %}

## WebElement Selection

Create a page for storing all the information related to a page, equivalent to
a HTML document object, but in Java.

{% highlight java %}
import org.openqa.selenium.*;

public class AwesomePage {

  private WebDriver driver;

  public AwesomePage(WebDriver driver) {
    this.driver = driver;
  }

  public WebElement getElementFoo() { ... }
}
{% endhighlight %}

Once you've created such page, you can retrieve web element in different ways:
by class name, by CSS selector, by ID, by link text, by partial link text, by
name, by tag, and by xpath. Here're some examples for querying the following
HTML content.

{% highlight html %}
<div>
  <button id="confirm-btn" name="confirm-button">Confirm</button>
  <a class="red" href="#">Cancel</a>
</div>
{% endhighlight %}

Let's take a look:

{% highlight java %}
WebElement e1 = driver.findElement(By.className("red"));
WebElement e2 = driver.findElement(By.id("btn-id"));
WebElement e3 = driver.findElement(By.linkText("Cancel"));
WebElement e4 = driver.findElement(By.name("confirm-button"));
WebElement e5 = driver.findElement(By.tag("div"));
WebElement e6 = driver.findElement(By.xpath("//a[contains(@class, 'red')]"));
{% endhighlight %}

## Execute Native JavaScript Command

You might want to execute native JavaScript code in Java via WebDriver. For
example, scrolling the document so that the target element in on the top of the
viewport. You can achieve it by doing:

{% highlight java %}
WebDriver driver = ...;
WebElement element = driver.findElement(By.id("foo"));
JavascriptExecutor executor = (JavascriptExecutor) driver;
executor.executeScript("arguments[0].scrollIntoView(true);", element);
{% endhighlight %}

This can be simplified if you're using a remote web driver. No cast is required:

{% highlight java %}
RemoteWebDriver driver = ...;
WebElement element = driver.findElement(By.id("foo"));
driver.executeScript("arguments[0].scrollIntoView(true);", element);
{% endhighlight %}

## Send Keys to Element

You can send keys to input HTML elements, e.g. \<input\> and \<textarea\>.

{% highlight java %}
WebElement input = ...;
input.sendKeys(Keys.BACK_SPACE);
input.sendKeys(Keys.ESCAPE);
{% endhighlight %}

## Wait WebElement

Use `FluentWait` to wait a web element, until a predicate is satisfied. The
generic type `<F>` is the input type for each condition used with this instance.

{% highlight java %}
Wait<WebDriver> wait = new FluentWait<>(driver);
wait.until(ExpectedConditions.visibilityOf(myElement));
{% endhighlight %}

## XPath

Here's a list of XPath that I used frequently.

Expression | Description
:--- | :---
`//*[@id='foo']` | Select any tag having id "foo".
`//a[text()='foo']` | Select tag \<a\> having text "foo".
`//a[contains(@class, 'red')]` | Select tag \<a\> having "red" in its attribute _class_.
`//a[contains(text(), 'foo')]` | Select tag \<a\> having "foo" in its text.

You can test the xpath expression in your browsers. First, open the console via
shortcut:

- <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>C</kbd> for Firefox
- <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>C</kbd> for Chrome

Then write the xpath expression. If the browser returns a non-empty results,
then the xpath works:

{% highlight javascript %}
$x("//*[@id='logo']");
{% endhighlight %}

## Trouble Shooting

Some points that need to be careful.

### Scrolling

If you need to scroll the document before clicking an element, do not scroll the
element directly, scroll its container:

{% highlight java %}
public void clickButton(WebElement container, WebElement button) {
  driver.executeScript("arguments[0].scrollIntoView(true);", container);
  button.click();
}
{% endhighlight %}

Method [Element.scrollIntoView()][element-scrollIntoView] scrolls the element
on which it's called into the visible area of the browser window. If set to
true, the element will be scrolled and be aligned to the top of the viewport.

### Other Points

Question/answer available on StackOverflow:

- [Element \<xxx\> could not be scrolled into view](https://stackoverflow.com/questions/22588096/selenium-web-driver-cannot-be-scrolled-into-view)
- [How to test blur?](https://stackoverflow.com/questions/12337046/selenium-driver-how-to-test-blur)

## References

- [MDN: Element.scrollIntoView()][element-scrollIntoView]
- [How to wait until an element is present in Selenium?](https://stackoverflow.com/questions/20903231/how-to-wait-until-an-element-is-present-in-selenium)

[element-scrollIntoView]: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
