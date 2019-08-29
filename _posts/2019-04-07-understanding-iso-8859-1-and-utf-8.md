---
layout:            post
title:             Understanding ISO-8859-1 / UTF-8
date:              2019-04-07 17:22:30 +0200
categories:        [tech]
tags:              [java, python, encoding]
comments:          true
excerpt:           >
    Character mapping between ISO-8859-1 / UTF-8, decode and encode data between
    string and bytes, and file I/O operations including MIME encoding detection.
    All examples are written in Java and Python 3.
image:             /assets/bg-single-file-1534558_1280.jpg
---

## Overview

Encoding is always a pain for developers. Without being extra careful, it is
easy to end up with incorrect characters in the software. I thought that using
UTF-8 everywhere in the codebase can avoid such cases. It works fine for most of
the time, but when integrating files from another system, we need more
skills. This happened to me when writing my finance script: I need to read
csv files downloaded from banks, which are all encoded as ISO-8859-1. That's why
I want to write this post.

After reading this article, you will understand:

- What is ISO-8859-1?
- Text editor and IDE support
- Character mapping between ISO-8859-1 and UTF-8
- Decode bytes to string
- Encode string to bytes
- Detect file encoding and read content

Examples are written in Python 3.7 and Java 8.

## ISO-8859-1

[ISO/IEC 8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) is part of the
ISO/IEC 8859 series of ASCII-based standard character encodings, first edition
published in 1987. ISO 8859-1 encodes what it refers to as "Latin alphabet no.
1," consisting of 191 characters from the Latin script. This character-encoding
scheme is used throughout the Americas, Western Europe, Oceania, and much of
Africa. It is also commonly used in most standard romanizations of East-Asian
languages. It is the basis for most popular 8-bit character sets and the first
block of characters in Unicode. -- From Wikipedia

Who uses ISO-8859-1? From my own experience, industries like bank and telecom
use this encoding. I suppose that it is because the databases were created when
ISO-8859-1 was popular, and the migration to UTF-8 is difficult.

When reading an ISO-8859-1 encoded content as UTF-8, you will often see �, the
replacement character (`U+FFFD`) for an unknown, unrecognized or unrepresentable
character.

## Text Editor / IDE Support

Different text editors and IDEs have support for encoding: both for the display
encoding, and changing the file encoding itself. Here're two examples from
Visual Code and IntelliJ IDEA.

Visual Code:

<img src="/assets/20190407-visual-code-encoding.png" alt="Visual Code encoding">

IntelliJ IDEA:

<img src="/assets/20190407-intellij-encoding.png" alt="IntelliJ IDEA encoding">

## Character Mapping

The characters in string is encoded in different manners in ISO-8859-1 and
UTF-8. Behind the screen, string is encoded as byte array, where each character
is represented by a char sequence. In ISO-8859-1, each character uses one byte;
in UTF-8, each character uses multiple bytes (1-4). Here, I would like to show
you an excerpt of character mapping via a simple Python script:

```py
for s in 'àáâãäåæçèéêëìíîï':
    i = ' '.join(['0x{:X}'.format(b) for b in s.encode('iso-8859-1')])
    u = ' '.join(['0x{:X}'.format(b) for b in s.encode('utf-8')])
    print('%s | `%s` | `%s`' % (s, i, u))
```

Character | ISO-8895-1 | UTF-8
:--- | :--- | :---
à | `0xE0` | `0xC3 0xA0`
á | `0xE1` | `0xC3 0xA1`
â | `0xE2` | `0xC3 0xA2`
ã | `0xE3` | `0xC3 0xA3`
ä | `0xE4` | `0xC3 0xA4`
å | `0xE5` | `0xC3 0xA5`
æ | `0xE6` | `0xC3 0xA6`
ç | `0xE7` | `0xC3 0xA7`
è | `0xE8` | `0xC3 0xA8`
é | `0xE9` | `0xC3 0xA9`
ê | `0xEA` | `0xC3 0xAA`
ë | `0xEB` | `0xC3 0xAB`
ì | `0xEC` | `0xC3 0xAC`
í | `0xED` | `0xC3 0xAD`
î | `0xEE` | `0xC3 0xAE`
ï | `0xEF` | `0xC3 0xAF`

Why should you care about this mapping? This mapping helps you to understand which
encoding should be used for decode. If you see byte `0xEF` (`ï`), you should
probably consider using ISO-8859-1.

## Decode Bytes to String

In the following sections, we will talk about decode and encode byte array.
Before going further, let's take a look how it works. When performing "decode"
operation to a byte array using a given (or default) encoding, we create a
string. When performing "encode" operation to a string using a given (or
default) encoding, we create a byte array. Here's the flow:

             decode
    byte[] ---------> string
           <---------
             encode

### Decode in Python 3

Decode byte array in Python 3 (Python Shell 3.7.2):

```py
>>> bytes([0xE0]).decode('iso-8859-1')
'à'
>>> b'\xe0'.decode('iso-8859-1')
'à'
>>> bytes([0xC3, 0xA0]).decode('utf-8')
'à'
>>> b'\xc3\xa0'.decode('utf-8')
'à'
>>> b'\xc3\xa0'.decode()
'à'
```

```py
# Summary (b -> str)
byte_array.decode('iso-8859-1')
byte_array.decode('utf-8')
byte_array.decode() # UTF-8
```

If the decode operation is called using an incorrect encoding, an error is
raised:

```py
>>> b'\xe0'.decode('utf-8')
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe0 in position 0: unexpected end of data
```

### Decode in Java 8

Decode byte array in Java 8 (Java Shell 11.0.2):

```java
jshell> import static java.nio.charset.StandardCharsets.*

jshell> byte[] bytes = {(byte) 0xE0}
bytes ==> byte[1] { -32 }

jshell> new String(bytes, UTF_8)
$3 ==> "�"

jshell> new String(bytes, ISO_8859_1)
$4 ==> "à"

jshell> byte[] bytes = {(byte) 0xC3, (byte) 0xA0}
bytes ==> byte[2] { -61, -96 }

jshell> new String(bytes, UTF_8)
$5 ==> "à"

jshell> new String(bytes)
$6 ==> "à"
```

```java
// Summary (byte[] -> String)
new String(bytes); // UTF-8
new String(bytes, StandardCharsets.UTF_8);
new String(bytes, StandardCharsets.ISO_8859_1);
```

## Encode String to Bytes

When performing "encode" operation to a string, we create a byte array:

             encode
    byte[] <--------- string

### Encode in Python 3

Encode string to byte array in Python 3 (Python Shell 3.7.2):

```py
>>> 'à'.encode('utf-8')
b'\xc3\xa0'

>>> 'à'.encode('iso-8859-1')
b'\xe0'
```

### Encode in Java 8

Encode string to byte array in Java 8 (Java Shell 11.0.2):

```java
jshell> import static java.nio.charset.StandardCharsets.*

jshell> "à".getBytes(UTF_8)
$2 ==> byte[2] { -61, -96 }

jshell> "à".getBytes(ISO_8859_1)
$3 ==> byte[1] { -32 }
```

## File I/O

File operations is literally the same as bytes-string conversion. Because file
content are bytes. Therefore, the flow that we saw previously is still valid:

               decode
     File    ---------> string
    (byte[]) <---------
               encode

Before specifying the encoding for file I/O operations, it's important to
understand how to file is encoded. It's seems obvious, but sometime we might
forget to do it. There're several ways to "detect" it:

1. Use utility `file` with option MIME encoding (`--mime-encoding`)
2. Use `cat` to print the content in terminal, see if replace
  character � (`U+FFFD`) is
  printed. If yes, you probably need to specify the encoding for file I/O.
3. Use `xxd` to make a hex dump of this file.

For example, I have a txt file called `iso-8859-1.txt`. I can check its encoding
using the tricks mentioned above.

```
$ file iso-8859-1.txt --mime-encoding
iso-8859-1.txt: iso-8859-1
```

```
$ cat iso-8859-1.txt
re�u
```

```
$ xxd iso-8859-1.txt
00000000: 7265 e775 0a                             re.u.
```

Note that when using `xxd`, the hexadecimal presentation is shown. For example,
character 'ç' from word "reçu" is shown as `e7`.

### File I/O in Python 3

You can use the optional parameter "encoding" to precise the encoding that you
need to do I/O operations to the file.

```py
with open(path, 'r', encoding='ISO-8859-1') as f:
    for line in f:
        # ...
```

If not given, it defaults to a platform dependent value. According to
`bultins.py`:

> `encoding` is the name of the encoding used to decode or encode the
> file. This should only be used in text mode. The default encoding is
> platform dependent, but any encoding supported by Python can be
> passed.  See the codecs module for the list of supported encodings.

### File I/O in Java 8

I often use the utility methods available in class [java.nio.file.Files](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html).
For example, reading all lines from a txt file `txt` can be done as follows.
If the charset is not given, method `Files#readAllLines(Path)` use UTF-8 as the
default charset.

```java
List<String> lines = Files.readAllLines(txt); // UTF-8
```

```java
List<String> lines = Files.readAllLines(txt, StandardCharsets.ISO_8859_1);
```

Read content as bytes is possible, too. In this case, we read the file without
precising the encoding. Then, you can chose the charset when converting byte
array to string, as mentioned in the previous section.

```java
byte[] bytes = Files.readAllBytes(txt);
String content = new String(bytes, StandardCharsets.ISO_8859_1);
```

## Conclusion

In this article, we saw the character mapping between ISO-8859-1 and UTF-8; the
encoding option in some editors; decode bytes to string; encode string to bytes;
and some file I/O operations in Python and Java.
Hope you enjoy this article, see you the next time!

## References

- "ISO/IEC 8859-1", Wikipedia, 2019.
  <https://en.wikipedia.org/wiki/ISO/IEC_8859-1>
- "Specials (Unicode block)", Wikipedia, 2019.
  <https://en.wikipedia.org/wiki/Specials_(Unicode_block)>
- "UTF-8", Wikipedia, 2019.
  <https://en.wikipedia.org/wiki/UTF-8>
- Erickson, "How do I convert between ISO-8859-1 and UTF-8 in Java?",
  Stack Overflow, 2009.
  <https://stackoverflow.com/a/652368>
- Fedor Gogolev, "Print s string as hex bytes?", Stack Overflow, 2012.
  <https://stackoverflow.com/a/12214880>
- TheWebGuy, "Get encoding of a file in Windows", Stack Overflow, 2010.
  <https://stackoverflow.com/q/3710374>
- "Class Files (Java Platform SE 8)", Oracle, 2018.
  <https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html>
