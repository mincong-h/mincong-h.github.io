---
layout:            post
title:             "Git: Communication over HTTP"
date:              2018-05-04 17:31:59 +0200
last_modified_at:  2018-08-12 10:34:35 +0200
categories:        [git]
tags:              [git, http]
comments:          true
excerpt:           >
    What happens when Git communicates over HTTP protocol? In this post, I'll
    intercept the HTTP traffic to discover git-receive-pack, git-upload-pack and
    more.
article_header:
  type: overlay
  theme: dark
  background_color: "#203028"
  background_image:
    gradient: "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
---

This post aims to answer a question: _"What happens when Git communicates over
HTTP protocol?"_. In order to understand the internal mechanism,
we need to use a proxy to intercept HTTP data sent/received by Git.

## Prerequisites

- Download and configure ZA Proxy. See
  <{{ site.url }}/2018/05/04/za-proxy/>.
- Download and install Git
- Download and install GitLab, running on `http://localhost` in a docker
  container. See
  <{{ site.url }}/2017/03/10/setup-gitlab-server-locally/>
- Install Python 3 (used for understand HTTP content)

## Configuration

Create a new project on GitLab localhost, called `app`:

    http://localhost/root/app.git

In localhost, create a new Git repository with a README file, and ensure the
its HTTP traffic go through a proxy:

```
~ $ mkdir app
~ $ cd app
app $ git init
Initialized empty Git repository in /Users/mincong/app/.git/
app (master #) $ echo Hello > README.md
app (master #%) $ git add README.md
app (master +) $ git commit -m 'Initial commit'
[master (root-commit) fac36d4] Initial commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
app (master) $ git remote add origin http://root@localhost/root/app.git
app (master) $ git push -u origin master
```

Open ZA Proxy and ensure it's running on port `:18080`. Once done, configure the
HTTP proxy for Git repository:

```
app (master) $ git config http.proxy http://localhost:18080
```

## Git Fetch

Now, let's take a look what happens when you do a `git-fetch`.

    $ git fetch

**Request Header**

```
GET http://root@localhost/root/app.git/info/refs?service=git-upload-pack HTTP/1.1
User-Agent: git/2.13.0
Accept: */*
Proxy-Connection: Keep-Alive
Pragma: no-cache
Host: localhost
```

**Request Body** (empty)

```

```

**Response Header**

```
HTTP/1.1 200 OK
Server: nginx
Date: Sat, 05 May 2018 07:38:11 GMT
Content-Type: application/x-git-upload-pack-advertisement
Content-Length: 351
Connection: keep-alive
Cache-Control: no-cache
Strict-Transport-Security: max-age=31536000
```

**Response Body**

```
001e# service=git-upload-pack\n
000000fafac36d407e123c2499149fcc8c1fc8ebe5ecd301 HEADmulti_ack thin-pack side-band side-band-64k ofs-delta shallow deepen-since deepen-not deepen-relative no-progress include-tag multi_ack_detailed no-done symref=HEAD:refs/heads/master agent=git/2.11.1
003ffac36d407e123c2499149fcc8c1fc8ebe5ecd301 refs/heads/master
0000
```

Command `git fetch` is a higher level wrapper of command `git fetch-pack`.
Invokes `git-upload-pack` on a possibly remote repository and asks it to send
objects missing from this repository, to update the named heads. The list of
commits available locally is found out by scanning the local `refs/` hierarchy
and sent to `git-upload-pack` running on the other end.

According to [Git documentation: HTTP][4], the response returned by the smart
Git server has the following format:

```
S: 200 OK
S: Content-Type: application/x-git-upload-pack-advertisement
S: Cache-Control: no-cache
S:
S: 001e# service=git-upload-pack\n
S: 0000
S: 004895dcfa3633004da0049d3d0fa03f80589cbcaf31 refs/heads/maint\0multi_ack\n
S: 0042d049f6c27a2244e12041955e262a404c7faba355 refs/heads/master\n
S: 003c2cb58b79488a98d2721cea644875a8dd0026b115 refs/tags/v1.0\n
S: 003fa3c2e2402b99163d1d59756e5f207ae21cccba4c refs/tags/v1.0^{}\n
S: 0000
```

The returned content is a UNIX formatted text file describing each ref and its
known value. The file is sorted by name according to the C locale ordering. 
The file does not include the default ref named `HEAD`.

In our case, hex value `001E` marks the length of the 1st _pkt-line_, which is
30 characters. It is called _pkt-length_. Test it in Python REPL:

```
>>> len('001e# service=git-upload-pack\n')
30
>>> 0x001E
30
```

Next line is `0000`, a pkt-line with a length field of 0. It is called
_flush-pkt_, a special case and MUST be handled differently than an empty
pkt-line (`0004`).

Then, we enter into _data-pkt_. A data-pkt consists a 4-digit hexidecimal value
for the pkt length and a pkt payload:

    data-pkt     =  pkt-len pkt-payload
    pkt-len      =  4*(HEXDIG)
    pkt-payload  =  (pkt-len - 4)*(OCTET)

The 2nd pkt-line is a 250 characters data-pkt (`0x00FA`) with payload:

    fac36d4...agent=git/2.11.1

The 3rd pkt-line is a 63 characters data-pkt (`0x003F`) with payload:

    fac36d4...refs/heads/master

Both 2nd and 3rd pkt-line contain the SHA-1 value of the current master commit
`fac36d4`, which means the local repository is up-to-date. The last pkt-line is
another flush-pkt (`0x0000`), marks the end of the returned content.

## Git Push

Now, try to create a commit on local machine and do a git-push.

```
app (master u=) $ git co -b topic
Switched to a new branch 'topic'
app (topic) $ echo World >> README.md
app (topic *) $ git commit -a -m 'Update README'
[topic 0bf02cc] Update README
 1 file changed, 1 insertion(+)
app (topic) $ git push -u origin topic
Counting objects: 3, done.
Writing objects: 100% (3/3), 917 bytes | 0 bytes/s, done.
Total 3 (delta 0), reused 0 (delta 0)
remote:
remote: To create a merge request for topic, visit:
remote:   http://e6c60aa44dfe/root/app/merge_requests/new?merge_request%5Bsource_branch%5D=topic
remote:
To http://localhost/root/app.git
 * [new branch]      topic -> topic
Branch topic set up to track remote branch topic from origin.
```

Intercept HTTP traffic in ZA Proxy, 4 requests were sent:

Method | Link | Code
:----: | :--- | :--:
GET    | <http://root@localhost/root/app.git/info/refs?service=git-receive-pack> | 401
GET    | <http://root@localhost/root/app.git/info/refs?service=git-receive-pack> | 401
GET    | <http://root@localhost/root/app.git/info/refs?service=git-receive-pack> | 200
POST   | <http://root@localhost/root/app.git/git-receive-pack> | 200

To upload data to a remote process, Git uses the `send-pack` and `receive-pack`
processes. The `send-pack` process runs on the client and connects to a
`receive-pack` process on the remote side.

- Request 1: Attempt without username and password. The first HTTP request
  connects to GitLab's `receive-pack` without username and password. The request
  is refused as 401 unauthorized.

- Request 2: Attempt with username but without password. After the 1st failure,
  the 2nd HTTP request connects to GitLab's `receive-pack` with username, but
  without password. The request is still refused as 401 unauthorized.

      Authorization: Basic cm9vdDo=

- Request 3: Attempt with username and password. After the 2nd failure, the 3rd
  HTTP request connects to GitLab's `receive-pack` with username and password.
  The request is OK this time.

      Authorization: Basic cm9vdDpsb2NhbGhvc3Q=

- Request 4: Send data to remote server.

In the following paragraphs, we'll take a deeper look into request 3 and 4.

## Request 4: Git Receive Pack

Request 4 Header and (empty) body:

```
GET http://root@localhost/root/app.git/info/refs?service=git-receive-pack HTTP/1.1
Authorization: Basic cm9vdDpsb2NhbGhvc3Q=
User-Agent: git/2.13.0
Accept: */*
Proxy-Connection: Keep-Alive
Pragma: no-cache
Host: localhost


```

Response 4 Header and body:

```
HTTP/1.1 200 OK
Server: nginx
Date: Sat, 05 May 2018 20:14:32 GMT
Content-Type: application/x-git-receive-pack-advertisement
Content-Length: 182
Connection: keep-alive
Cache-Control: no-cache
Strict-Transport-Security: max-age=31536000

001f# service=git-receive-pack
0000008ffac36d407e123c2499149fcc8c1fc8ebe5ecd301 refs/heads/master\0report-status delete-refs side-band-64k quiet atomic ofs-delta agent=git/2.11.1
0000
```

Response 4 contains 4 pkt-lines:

- `001F`... for identify the git-receive-pack.
- `0000`, a flush-pkt starts the content.
- `008F`..., a data-pkt for the reference `refs/heads/master`.
- `0000`, a flush-pkt ends the content.

## Request 5: Git Receive Pack Request and Result

Request 5 Header:

```
POST http://root@localhost/root/app.git/git-receive-pack HTTP/1.1
Authorization: Basic cm9vdDpsb2NhbGhvc3Q=
User-Agent: git/2.13.0
Proxy-Connection: Keep-Alive
Content-Type: application/x-git-receive-pack-request
Accept: application/x-git-receive-pack-result
Content-Length: 1069
Host: localhost
```

Request 5 Body (hex):

```
00000000: 3030 3934 3030 3030 3030 3030 3030 3030  0094000000000000
00000010: 3030 3030 3030 3030 3030 3030 3030 3030  0000000000000000
00000020: 3030 3030 3030 3030 3030 3030 2030 6266  000000000000 0bf
00000030: 3032 6363 6534 3534 6266 3231 3266 3439  02cce454bf212f49
00000040: 3038 3930 3264 6661 3031 3538 3864 3430  08902dfa01588d40
00000050: 3933 3034 3020 7265 6673 2f68 6561 6473  93040 refs/heads
00000060: 2f74 6f70 6963 2072 6570 6f72 742d 7374  /topic report-st
00000070: 6174 7573 2073 6964 652d 6261 6e64 2d36  atus side-band-6
00000080: 346b 2061 6765 6e74 3d67 6974 2f32 2e31  4k agent=git/2.1
00000090: 332e 3030 3030 3050 4143 4bc2 9f43 78c2  3.00000PACK..Cx.
000000a0: 9cc2 9dc2 9349 c2aa 46c2 85c3 b7c3 bcc2  .....I..F.......
...
00000580: c2bd c29f c2a3 c2b0 5ac2 9bc3 bd0a       ........Z.....
```

This request body contains several information:

- Unknown
  ```
  00000000: 3030 3934 3030 3030 3030 3030 3030 3030  0094000000000000
  00000010: 3030 3030 3030 3030 3030 3030 3030 3030  0000000000000000
  00000020: 3030 3030 3030 3030 3030 3030 2030 6266  000000000000 0bf
  ```

- 160 bits for commit SHA-1:

  ```
  hex: 3062 6630 3263 6365 3435
       3462 6632 3132 6634 3930
       3839 3032 6466 6130 3135
       3838 6434 3039 3330 3430
  ```

  The matched commit is `0bf02cce454bf212f4908902dfa01588d4093040`. Try to
  translate in Python:

  ```
  >>> bytearray.fromhex('30626630326363653435346266323132663439303839303264666130313538386434303933303430').decode()
  '0bf02cce454bf212f4908902dfa01588d4093040'
  ```

- Unknown
  ```
  00000080: 346b 2061 6765 6e74 3d67 6974 2f32 2e31  4k agent=git/2.1
  00000090: 332e 3030 3030 3050 4143 4bc2 9f43 78c2  3.00000PACK..Cx.
  000000a0: 9cc2 9dc2 9349 c2aa 46c2 85c3 b7c3 bcc2  .....I..F.......
  ...
  00000580: c2bd c29f c2a3 c2b0 5ac2 9bc3 bd0a       ........Z.....
  ```
  TODO

Response 5 header:

```
HTTP/1.1 200 OK
Server: nginx
Date: Sat, 05 May 2018 20:14:34 GMT
Content-Type: application/x-git-receive-pack-result
Content-Length: 196
Connection: keep-alive
Cache-Control: no-cache
Strict-Transport-Security: max-age=31536000
```

Response 5 body:

```
002f000eunpack ok
0018ok refs/heads/topic
00000085
To create a merge request for topic, visit:
  http://e6c60aa44dfe/root/app/merge_requests/new?merge_request%5Bsource_branch%5D=000ctopic

0000
```

The response contains N pkt-lines with 47 characters (`0x002F`) in total:

- `0x000E` 14 chars, 4 for the pkt-len, 10 for `unpack ok\n`
- `0x0018` 24 chars, 4 for the pkt-len, 20 for `ok refs/heads/topic\n`
- `0x0000` 4 chars for flush-pkt
- `0x0085` 133 chars, 4 for the pkt-len, 129 for the merge-request
- `0x0000` 4 chars for flush-pkt

{% include book-git-pro.html %}

## References

- [Stack Overflow: Getting git to work with a proxy server][2]
- [Git Documentation: git-upload-pack][1]
- [Git Documentation: git-fetch-pack][3]
- [Git Documentation: protocol-common][5]
- [Git Documentation: http-protocol][4]
- [Git Documentation: pack-protocol][7]
- [Git Pro v2: 10.6 Git Internals - Transfer Protocols][8]
- [MDN: HTTP Messages][6]

[8]: https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols
[7]: https://github.com/git/git/blob/master/Documentation/technical/pack-protocol.txt
[6]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
[5]: https://github.com/git/git/blob/master/Documentation/technical/protocol-common.txt
[4]: https://github.com/git/git/blob/master/Documentation/technical/http-protocol.txt
[3]: https://git-scm.com/docs/git-fetch-pack
[2]: https://stackoverflow.com/questions/783811/getting-git-to-work-with-a-proxy-server
[1]: https://git-scm.com/docs/git-upload-pack
