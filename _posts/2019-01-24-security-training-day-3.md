---
layout:            post
title:             Security Training Day 3
date:              2019-01-24 18:26:27 +0100
categories:        [tech]
tags:              [security, http]
comments:          true
excerpt:           >
    My study notes of security training (day 3), including insecure direct
    references, broken access control, improper input validation, and software
    best practices.
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
training in day 3. It aims to share knowledge and make us aware of the
importance of security. After reading this article, you will understand:

- Insecure Direct References
- Broken Access Control
- Improper Input Validation
- Software Best Practices

Reminder: the security tools used here are [ZAP
Proxy](https://github.com/zaproxy/zaproxy) and [Juice
Shop](https://github.com/bkimminich/juice-shop) -- probably the most modern and
sophisticated insecure web application.

## Insecure Direct Object References

[Insecure Direct Object Reference][1] (called IDOR from here) occurs when a
application exposes a reference to an internal implementation object. Using
this way, it reveals the real identifier and format/pattern used of the element
in the storage backend side. The most common example of it (although is not
limited to this one) is a record identifier in a storage system (database,
filesystem and so on). IDOR is referenced in element A4 of the [OWASP Top 10 in
the 2013
edition](https://www.owasp.org/index.php/Top_10_2013-A4-Insecure_Direct_Object_References).

Preventing insecure direct object references requires selecting an approach for
protecting each user accessible object (e.g., object number, filename):

- **Use per user or session indirect object references.** This prevents attackers
  from directly targeting unauthorized resources. For example, instead of using
  the resource’s database key, a drop down list of six resources authorized for
  the current user could use the numbers 1 to 6 to indicate which value the
  user selected. The application has to map the per-user indirect reference
  back to the actual database key on the server. OWASP’s ESAPI includes both
  sequential and random access reference maps that developers can use to
  eliminate direct object references.
- **Check access.** Each use of a direct object reference from an untrusted source
  must include an access control check to ensure the user is authorized for the
  requested object.

## Access Control

[Access Control / authorization](https://www.owasp.org/index.php/Access_Control_Cheat_Sheet)
is the process where requests to access a particular resource should be granted
or denied. It should be noted that authorization is not equivalent to
authentication - as these terms and their definitions are frequently confused.
Authentication is providing and validating identity. Authorization includes the
execution rules that determines what functionality and data the user (or
Principal) may access, ensuring the proper allocation of access rights after
authentication is successful.

Web applications need access controls to allow users (with varying privileges)
to use the application. They also need administrators to manage the applications
access control rules and the granting of permissions or entitlements to users
and other entities. Various access control design methodologies are available.
To choose the most appropriate one, a risk assessment needs to be performed to
identify threats and vulnerabilities specific to your application, so that the
proper access control methodology is appropriate for your application.

This section contains exercises related to access control / authorization in
Juice Shop.

**Basket Access Tier 1.** View another user's shopping basket. When visiting
page « Your Basket », you can see that the API is
<http://localhost:3000/rest/basket/4>. So, it means the API pattern is:

    http://localhost:3000/rest/basket/${id}

By changing the basket id, you will be able to see other's basket. For example,
asking <http://localhost:3000/rest/basket/3> returns:

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "coupon": null,
    "createdAt": "2019-01-24T20:22:03.098Z",
    "updatedAt": "2019-01-24T20:22:03.098Z",
    "UserId": 3,
    "Products": [
      {
        "id": 5,
        "name": "Lemon Juice (500ml)",
        "description": "Sour but full of vitamins.",
        "price": 2.99,
        "image": "lemon_juice.jpg",
        "createdAt": "2019-01-24T20:22:03.042Z",
        "updatedAt": "2019-01-24T20:22:03.042Z",
        "deletedAt": null,
        "BasketItem": {
          "id": 5,
          "quantity": 1,
          "createdAt": "2019-01-24T20:22:03.098Z",
          "updatedAt": "2019-01-24T20:22:03.098Z",
          "BasketId": 3,
          "ProductId": 5
        }
      }
    ]
  }
}
```

**Forged Feedback.** Assume that you're user 13, after sending your own
feedback from url <http://localhost:3000/#/contact>, inspect and modify the
POST request with another user id (such as user 13) and resend with the
modified content as follows:

```json
{
  "UserId": 13,
  "captchaId": 0,
  "captcha": "-1",
  "comment": "123",
  "rating": 4
}
```

## Improper Input Validation

[Input validation](https://www.owasp.org/index.php/Input_Validation_Cheat_Sheet)
is performed to ensure only properly formed data is entering the workflow in an
information system, preventing malformed data from persisting in the database
and triggering malfunction of various downstream components. Input validation
should happen as early as possible in the data flow, preferably as soon as the
data is received from the external party.

Data from all potentially untrusted sources should be subject to input
validation, including not only Internet-facing web clients but also backend
feeds over extranets, from suppliers, partners, vendors or regulators, each of
which may be compromised on their own and start sending malformed data.

This section contains exercises related to improper input validation in Juice
Shop.

**Payback Time.** Place an order that makes you rich. Observe the basket item
API (PUT <http://localhost:3000/api/BasketItems/itemId>), where quantity is sent.
Then, replay the request with negative value:

```json
{
  "quantity": -2
}
```

```json
{
  "status": "success",
  "data": {
    "id": 8,
    "quantity": -2,
    "createdAt": "2019-01-24T20:48:15.132Z",
    "updatedAt": "2019-01-24T21:10:46.113Z",
    "BasketId": 4,
    "ProductId": 1
  }
}
```

## Software Best Practices

- Architecture: do you think about security?
- Think about security in the entire development lifecycle: design, coding,
  test, ops.
- A passing penetration test does not mean the application is secure, it only
  means the application is not easy to be hacked.
- Defensive coding: training, code review, CI code analysis, etc.
- [OWASP Secure Coding Practices - Quick Reference Guide](https://www.owasp.org/index.php/OWASP_Secure_Coding_Practices_-_Quick_Reference_Guide)

## Conclusion

In this article, we saw briefly the following topics: insecure direct
references, broken access control, improper input validation and software best
practices. Hope you enjoy this article, see you the next time!

[1]: https://www.owasp.org/index.php/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet
