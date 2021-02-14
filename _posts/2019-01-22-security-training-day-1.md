---
layout:            post
title:             Security Training Day 1
date:              2019-01-22 21:04:37 +0100
categories:        [tech]
tags:              [security, java, http]
comments:          true
excerpt:           >
    My study notes of security training (Day 1), including web thread landscape
    (Java in particular), security tools, and some Juice shop training answers.
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

This post is mainly a review of what have been done during the security
training. It aims to share knowledge and make us aware of the importance of
security. After reading this article, you will understand:

- Web threat landscape
- Security tools
- Think as an attacker
- Juice Shop training

## Web Threat Landscape

**Security threat is everywhere.** Many industries suffer from security threats,
such as aviation industry, automotive industry, assurances, banks, websites,
IoT. Famous examples demonstrate that security flaws have important damage on
the business: not only the amount can be huge, but the value of the brand can be
impacted. We saw security flaw of Yahoo!, jQuery, Mercedes, Microsoft, finance,
Dropbox.

**Security in web apps**. Different statistics show that software represents the
majority of security issues. According to the U.S. Department of Homeland
Security (DHS), 90% of security incidents result from exploits against defects
in software. Also, 30% of companies never scan for vulnerabilities during code
development.

**Cost of security flaws.** Fixing the vulnerabilities need time and resources.
According to National Institute of Standards and Technology (NIST), the cost
changes dramatically depending on the steps: requirements / architecture,
coding, integration / component testing, system / acceptance testing, production
/ post-release. We also saw the example of Microsoft, which needs to stop
developing new features for more than 1 year in 2005 to implement their new
security measurement.

<p align="center">
  <img src="/assets/20190122-NIST-relative-cost-to-fix-a-flaw.png"
       style="max-width: 500px"
       alt="NIST: The relative cost of fixing a flaw at different stages of the SLDC">
  Image from
  <a href="https://www.nowsecure.com/blog/2017/05/10/level-up-mobile-app-security-metrics-to-measure-success/">
    NowSecure - Level up: Mobile app security metrics to measure success
  </a>
</p>

**Security in Java.** In Java application, we use Java archive (JAR) to include
dependencies. A simple project can include hundreds of JARs easily when using
frameworks (libraries), because the frameworks themselves include other
third-party frameworks too. Many vulnerabilities can come from there. In Maven,
you can use Maven Dependency Plugin to analyse the project dependency tree, via
goal [`dependency:tree`](https://maven.apache.org/plugins/maven-dependency-plugin/tree-mojo.html):

```sh
mvn dependency:tree \
    -DappendOutput=true \
    -DoutputFile=dependency-tree.txt
```

**Framework is not 100% reliable.** If we take the example of Hibernate, a
famous ORM framework in Java, it prevents SQL Injection successfully. However,
when using it with NoSQL (Hibernate OGM), the framework won't escape the NoSQL
queries for you—you're exposed to security treats and need extra carefulness in
this case.

**Priority.** There's no perfect solution for fixing security flaws. We need to
measure the impact and timing for fixing them. Impact can be measured by
different dimensions: customer (credit cards, email, password, address),
security reference (OWASP, CVE, CWE, CERT, SANS), business model, etc.

**Top OWASP 10.** The top 10 list of OWASP remains similar year over year. It
means that many best practices are still valid and worth to be implemented
correctly in your application. Don't think some are "outdated" and will never
happen again. In 2017, the top 10 risks are:

1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

**Data encryption != safe.** It is possible to decrypt the encrypted data.
The encryption method might be known by the hackers, the computation capacity
of computers (servers) change every year. The state-of-the-art encryption
technology will no longer be in 3 years, 5 years... It's just a question of
timing.

## Security Tools

Open-source or commercial, many tools exist for scanning security flaws. For
example, at network level, we can use [nmap](https://en.wikipedia.org/wiki/Nmap)
to discover hosts and services on a
computer network. For web scanner, there're w3AF, Zap Proxy, ... And there're
also many tools for static, dynamic or hybrid analysis. See
[mre/awesome-static-analysis](https://github.com/mre/awesome-static-analysis)
and
[mre/awesome-dynamic-analysis](https://github.com/mre/awesome-dynamic-analysis).

**SonarQube.** At Java level, there're also many of them. They
provide the context of vulnerability, the impact, potential solution, etc. Some
are possible to be integrated in the CI chain and provide analysis continuously.
One example is [SonarQube](https://www.sonarqube.org). SonarQube can detect
security issues and tag them as `cwe`, `cert`, `owasp-*`, `sans-top25-risky`.
If you're not familiar with these abbreviations, here's the explanation:

- CWE: Common Weakness Enumeration
- CERT: Computer Emergency Response Team
- OWASP: Open Web Application Security Project
- SANS: SysAdmin, Audit, Network, Security

Sonar also provides a security report, where security issues are grouped by
OWASP Top 10, or SANS Top 25. Other tools exist, such as
[Codacy](https://www.codacy.com/), [Checkstyle](https://checkstyle.org/),
[SpotBugs](https://spotbugs.github.io/). They position differently in the
software development lifecycle. It's also important to understand that tools
provide only a subset of vulnerabilities. Many other vulnerabilities are not
found due to the capacity of analysis tool. In particular, for dynamic languages
such as JavaScript and Python.

**ZAP Proxy.** OWASP ZAP (short for Zed Attack Proxy) is an open-source web
application security scanner. It is intended to be used by both those new to
application security as well as professional penetration testers. It is one of
the most active OWASP projects. When used as a proxy server it allows the user
to manipulate all of the traffic that passes through it, including traffic
using https. This tool is used during all the training.

## Think as an Attacker

Different layers have different security vulnerabilities. An attacker can find
fingerprints of all layers to understand the environment. According to results,
such as OS, web server, programming language, software architecture, database
type, cloud infrastructure, they can adjust their inputs and target a specific
goal.

## Juice Shop Training

In the following section, we used the famous [OWASP Juice
Shop](https://github.com/bkimminich/juice-shop) for security training. Here're
some of the challenges solved in the day.

**Find score board and admin page.** The score-board is hidden in the
application main page. But when inspecting resources in browser console, we
can see the its path in several places in the `main.js` file:

```js
re.n.forRoot([{
  path: 'administration',
  component: U
},
...
{
  path: 'score-board',
  component: Xt
},
```

Therefore, the link to Score Board is <http://localhost:3000/#/score-board>
and the link to Administration is <http://localhost:3000/#/administration>. This
is the starting point of resolving more challenges.

**Access a confidential document.** When continuing to inspect the `main.js`, we
can find something related to File Transfer Protocol (FTP), a standard network
protocol used for the transfer of computer files between a client and server on
a computer network. Here's the code block:

```js
(l() (), t['ɵeld'](13, 0, null, null, 2, 'a', [
  ['href',
  '/ftp/legal.md?md_debug=true'],
  [
    'translate',
    ''
  ]
]
```

It means that we are able to download the markdown file `legal.md` from the
server via URL <http://localhost:3000/ftp/legal.md>. Moreover, files can be
accessed from the following URL pattern, where variable `filepath` refers to the
actual filepath. It will be useful to explore more file-related vulnerabilities
in the future:

    http://localhost:3000/ftp/${filepath}

For example, a secret file is stored as `acquisitions.md`.

## Conclusion

In this article, we took a look in the web treat landscape including the
historical security flaws, the security in web applications (Java in
particular), the common errors. Then we saw some useful security tools
(SonarQube, ZAP Proxy) and how to think as an attacker. Finally, some answers of
the Juice Shop training. Hope you enjoy this article, see you the next time!

