---
layout:      post
title:       "Web App Security - Review 1"
lang:                en
date:        "2017-07-20 14:07:30 +0200"
categories:  [tech]
tags:        [security, web]
excerpt:     >
  My review note about book "Web Application Security: A Beginner's Guide",
  written by Bryan Sullivan and Vincent Liu.
comments:    true
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

I'm reading the book _"Web Application Security: A Beginner's Guide"_, written
by Bryan Sullivan and Vincent Liu. Here's the review of the part 1: Primer.

In this part, the book covers the following subjects:

- Misplaced priorities and the need for a new focus
- Network security versus application security: The parable of the wizard and
  the magic fruit trees
- Thinking like a defender
- The OWASP Top Ten List
- Secure features, not just security features
- Input validation
- Attack surface reduction

According to security survey from Fortune 1000 companies, the IT security spends
lots of money on network firewall, but actually 70% of attacks come through web
applications: vulnerabilities in web applications have been responsible for some
of the most damaging, high-profile breaches. Through the book, we can see that
it's necessary to use network-level defenses like firewalls to avoid network
threats, **but network-level defenses alone are not sufficient: you also need
to secure your web application.** Web application needs a lot of privileges on
the server, so that it can access to database, file system—that's where the
vulnerabilities come it.

Think like a defender. It's good to know how to appropriately encode HTML output
to prevent cross-site scripting attacks, but it's even better to know that
mixing code and data can lead the application to interpret user input as command
instructions.

The [OWASP Top Ten Project][top10] is a project which lists the top 10 most
critical web application security risks. Here's the list of 2010 (when the book
is written):

1. **Injection.** Find a way to run his own code on your web server.
2. **Cross-Site Scripting (XSS).** A specific type of injection, in which the
   attacker injects his own script code (such as JavaScript) or HTML into a web
   page.
3. **Broken Authentication and Session Management.** Usually, the way to do
   authentication and session management is to generate a unique token (a
   session ID). Any insecure way of implementing the session ID leads to
   vulnerability, e.g. auto-incrementation for ID (1, 2, 3, ...).
4. **Insecure Direct Object References.** There's usually no good reason for a
   web application to reveal any internal resource names such as data file
   names, e.g. `http://www.myapp.cxx/page?file=123.txt`.
5. **Cross-Site Request Forgery (CSRF)**. It takes the advantage of the
   stateless HTTP, where a web browser will automatically send any cookies it's
   holding for a web site back to that web site every time it makes a request
   there. Every website using cookies to identify its users is vulnerable to
   CSRF attack by default.
6. **Security misconfiguration.** When development settings are accidentally
   carried over into production environments.
7. **Insecure Cryptographic Storage.** Sensitive data should never be stored
   unencrypted in plaintext on the server. Use a one-way cryptographic hash
   instead. Adding a "salt", a random value, before hashing is every better.
8. **Failure to Restrict URL Access.**
9. **Insufficient Transport Layer Protection.** Use Secure Sockets Layer (SSL)
   protocol, or Transport Layer Security (TLS) to protect HTTP.
10. **Unvalidated Redirects and Forwards.** For example,
   `www.site.cxx/login?page=www.evilsite.cxx`

Now, let's talk about input validation. Blacklist validation is never successful
because it's very difficult to list all the possibilities. Indeed, we need to
use whitelist validation, which means any input that does not match an
explicit allow-list or allow-pattern is rejected. Using regular expressions is
one very good way of handling more complicated whitelist validation logic.
Another aspect that we need to know is, validation should not be only on the
client, it should be validated in both client and server side. There's also
debate about validate-early versus validate-late, and the best approach might be
validate-both. If not possible, then validate it right before you use it. This
way, you don't have to rely on another module that might have failed or changed.

Like input validation, attack surface reduction is both an effective defense
against the known attacks of today, and a hedge against any new attacks that you
might face tomorrow. We need to keep in mind that whenever we add a new feature
to our application, we're adding a potential point of vulnerability. An
effective solution is to reduce the attack surface: allow the user to activate
features, but do not install them by default. When designing your own web
applications, go for an opt-in approach when possible.

As a newbie in web application security, I found this book very interesting as
it covers many fundamental knowledge about the field. If you want to buy it,
you can check it on Amazon:
<https://www.amazon.com/Web-Application-Security-Beginners-Guide/dp/0071776168/>

[top10]: https://www.owasp.org/index.php/Category:OWASP_Top_Ten_Project
