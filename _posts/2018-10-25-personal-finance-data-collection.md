---
layout:            post
title:             "Personal Finance: Data Collection"
date:              2018-10-25 19:58:38 +0200
categories:        [tech]
tags:              [personal-finance, python, data-processing]
comments:          true
excerpt:           >
    A step-by-step guide sharing how I build my data collection tool in Python
    for personal finance, and why it might also fit your needs.
image:             /assets/bg-money-2724241_1280.jpg
---

## Overview

Today I'd like to talk about a new topic: Personal Finance.
This is something really important during our whole life. Many decisions
are directly related to money. Having a management tool allows you to better
budget, save, and spend money over time, taking into financial risks and future
life events.

This article mainly shares how I built my own data collection script using
Python, which powers the data analysis. It covers the following sections:

- Downloading history from your bank 
- Storing them as archives
- Merging them into a single file
- Export data to external tool (Google Sheet)
- The importance of having backup(s)

## Download Account History

Before getting started to build a personal finance tool, you need to have data
from your bank. I'm using BNP Paribas, their website provides an option to
download the recent history (the last 30 days) as CSV file. If you've multiple
accounts, you need to download all of them. In my case, the downloaded
files look like:

```
E123.csv
E234.csv
E345.csv
...
```

Once downloaded, you need to rename the files so that they are aligned to your
naming convention. This is because the original name might not be
meaningful, or even it is, there will be probably differences in different
banks. Having your own convention can avoid this problem. In my case, I rename
files with username (`$USER`) and account name (`$ACCOUNT`):

{% highlight shell %}
$USER-$ACCOUNT.csv
{% endhighlight %}

This solution is scalable because it can be applied to any situation. Your
situation might change over the
time—you might be single for now, but in love and married later on. So it's
better to have the username involved in the naming. Then, every member of this
system will have at least one accounts, therefore we need the account name.

## Archiving The Downloaded Files

The second step is to archive the downloaded files. Storing them as raw data
makes us save to do any transformation in the future: no matter what you'll
do and which failure will be, as far as the original files are archived, it is
possible to start again from the very beginning.

In my case, I split the downloaded files by lines: each line (except the header)
is considered as a transaction, and appended to an existing monthly archive
file of the target account. If that file does not exist, it will be created by
the Python script. The archive files have their convention. They start with the
month (`YYYY-MM`), followed by dot (`.`) as separator, followed by the
account naming `$USER-$ACCOUNT`, and ends with suffix `.csv`.

{% highlight shell %}
$MONTH.$USER-$ACCOUNT.csv
{% endhighlight %}

For example,

```
2018-04.paul-A.csv
2018-04.paul-B.csv
2018-04.anne-A.csv
2018-04.anne-B.csv

2018-05.paul-A.csv
2018-05.paul-B.csv
2018-05.anne-A.csv
2018-05.anne-B.csv

2018-06.paul-A.csv
2018-06.paul-B.csv
...
```

Now, go back to the archive problem. How can we ensure that each line is
inserted properly in the target CSV file without creating duplicate? My solution
is to construct a [Set][set], add each line of the existing file into the set,
and then the new lines. Since [Set][set] does not allowed duplicate,
each value is unique. Then, sort them and write to the file again. (However,
this is a simplified version, in reality, I use [Dictionary][dict], because I need to store
more data in each row)

{% highlight python %}
def append_tx_file(lines, csv):
    rows = set()
    if os.path.exists(csv):
        with open(csv, 'r') as f:
            for line in f:
                rows.add(line)

    with open(csv, 'w') as f:
        for row in sorted(rows):
            line = row + '\n'
            f.write(line)
{% endhighlight %}

## Create a Merged File

Once the archive files are done, the next step is to create a merged file which
contains all the transactions. The goal is provide a single file for data
analysis. This step is very simple. The logic is almost the same as the previous
step. The only changes are to transform a French date (`DD/MM/YYYY`) to ISO
format (`YYYY-MM-DD`), and add a new column for the account name.

{% highlight python %}
def merge_tx(paths):
    lines = set()

    for path in paths:
        account = re.findall(r'.([a-zA-Z0-9-]+)\.csv$', path)[0]
        with open(path, 'r') as f:
            for line in f:
                left, right = line.split(';', 1)
                d, m, y = left.split('/')
                left = '%s-%s-%s' % (y, m, d)
                lines.add('%s;%s;%s' % (left, account, right))

    with open(FILES['total'], 'w') as f:
        header = 'Date;Account;ShortType;LongType;Label;Amount;'
        header += 'Type;Category;SubCategory;IsRegular\n'
        f.write(header)
        for line in sorted(lines):
            f.write(line)
{% endhighlight %}

## Export Data to Google Sheet

For now, all the data collection steps are done. But, we still did not talk about
any data analysis! Actually, analysis is not done in Python, but in
Google Sheet. I'll talk about it in another article. You might also want to use
Microsoft Excel, or any other tool.
**The key point is, data processing should be separated from data analysis**,
which makes things much simpler, especially for automation.

For Google Sheet, it has its own preference for CSV files. If you want to import
the CSV file in one click, you should change your data to make Google happy,
such as:

- Use comma `,` as delimiter (BNP Paribas uses semi-colon `;`)
- Use dot `.` as decimal point (BNP Paribas uses comma `,`)
- Use nothing as thousands separator (BNP Paribas uses space <code>&nbsp;</code>)

And the destination files should prefixed by `google.*`. For example, we've 2
files to export to Google Sheet, respectively called `transactions.csv` and
`accounts.csv`. Then the Google-ready ones should be:

- `google.transactions.csv` (transactions.csv)
- `google.accounts.csv` (accounts.csv)

## Backup

It's important to backup your data. For me, I choose [Git][git] as a solution.
There're many advantages of using Git, such as:

- Keep all the modification history, including author
- Show the diff when adding new data
- Transport data via HTTP protocol
- Possibility to revert when things go wrong
- Easy to mirror (multiple backups)

OK, OK, actually I use Git because I'm familiar with it. You can use whatever
you want, but you must do the backup, trust me :)

## Conclusion

Let's summary what we discussed in the post. In order to build your own personal
tool, you need to:

1. Collect data from your bank (usually CSV files)
2. Archive them separately (e.g. per month per account)
3. Merge data into a single file
4. Adapt the format for data visualization
5. Backup your files
6. Analyse the data (not covered in this post)

Hope you enjoy this article, see you the next time!

[git]: https://git-scm.com/
[dict]: https://docs.python.org/3/tutorial/datastructures.html#dictionaries
[set]: https://docs.python.org/3/tutorial/datastructures.html#sets
