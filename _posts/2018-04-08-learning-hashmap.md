---
layout:      post
title:       "Learning HashMap"
date:        "2018-04-08 09:42:26 +0200"
categories:  [java, study-note]
comments:    true
---

> This post is not finished. Update is ongoing...

Today I'm learning the implementation of `java.util.HashMap` in Java. Here're
some study notes. The source code I'm reading is on Oracle JDK 10.

## Constants

The default initial capacity is initialized as follows.

{% highlight java %}
/**
 * The default initial capacity - MUST be a power of two.
 */
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
{% endhighlight %}

The Java programming language provides operators that perform bitwise and bit
shift operations on integral types. The signed left shift operator "\<\<"
shifts a bit pattern to the left. So the expression above shifts a bit pattern 4
times:

Bit Pattern | Integer Value | Explanation
:---------: | :-----------: | :---------:
00000001    | 1             | 2^0
00000010    | 2             | 2^1
00000100    | 4             | 2^2
00001000    | 8             | 2^3
00010000    | 16            | 2^4

## Storage

Key-value paires are stored in a table. This table is
initialized on first use, and resized as necessary. When allocated, length is
_always_ a power of two. The table is accessible via hash value of the key K.
The keyword "transient" is declared, because as a class member, `table` is
unnecessary to reconstruct the object from its serialized form.

{% highlight java %}
transient Node<K,V>[] table;
{% endhighlight %}

Here's a figure illustrating the internal table structure:

<figure align="center">
  <img src="{{ site.url }}/assets/2018-04-08-hashmap-storage.png"
       alt="HashMap Storage" />
  <figcaption>
    <a href="http://www.itcuties.com/java/hashmap-hashtable/">
      HashMap vs. Hashtable, ITCuties.com
    </a>
  </figcaption>
</figure>

## Put Operation

What happens when a new entry (key-value pair) is put into the HashMap?
According to the Javadoc of method `#put(K key, V value)`, _it associates
the specified value with the specified key in this map. If the map previously
contained a mapping for the key, the old value is replaced._

{% highlight java %}
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
{% endhighlight %}

The internal operation `putValue` takes 5 arguments:

- `int hash`: the hash value for the key, computed by the utility method hash().
- `K key`: the key to put
- `V value`: the value to put
- `boolean onlyIfAbsent`: decision about changing the existing value or not.
  Here, it is set to _false_, so the if the key is present, the existing value
  will be overwritten.
- `boolean evict`: set to _false_, meaning the table is not in the creation
  mode.

Now take a look into the `putValue` method. Firstly, it does a validation on the
node table. If the table does not exist or its length is 0, then the table will
be resized; Then, it checks if value exists in the target index: if not exist,
construct a new node and insert to table, else handle it in a more complex way.

{% highlight java %}
Node<K,V>[] tab; Node<K,V> p; int n, i;
if ((tab = table) == null || (n = tab.length) == 0)
    n = (tab = resize()).length;
if ((p = tab[i = (n - 1) & hash]) == null)
    tab[i] = newNode(hash, key, value, null);
else {
    ...
}
{% endhighlight %}

The target index is calculated by the follow expression:

{% highlight java %}
i = (n - 1) & hash;
{% endhighlight %}

In this expression, variable `n` refers to the length of the table, and `hash`
refers to the hash of the key. Since `hash` might be out of range, a check is
required. The canonical way is to calculate the modulo of the hash with n.
However, this operation might be expensive. In this implementation, authors take
the fact that the length of the table is always a power of two, to replace the
modulo operation by a bitwise AND. So

```
i = hash % n;
```

becomes

```
i = (n - 1) & hash;
```

This can be done because n is always a power of two, thus n - 1 is always a bit
pattern having 1 at each position. A concrete example is as follows:

N     | Hash  | Modulo    | And
:---: | :---: | :-------: | :-------------------------:
4     | 0     | 0 % 4 = 0 | 0 & 3 = 000 & 011 = 000 = 0
4     | 1     | 1 % 4 = 1 | 1 & 3 = 001 & 011 = 001 = 1
4     | 2     | 2 % 4 = 2 | 2 & 3 = 010 & 011 = 010 = 2
4     | 3     | 3 % 4 = 3 | 3 & 3 = 011 & 011 = 011 = 3
4     | 4     | 4 % 4 = 0 | 4 & 3 = 100 & 011 = 000 = 0
4     | 5     | 5 % 4 = 1 | 5 & 3 = 101 & 011 = 001 = 1

We now understand how to determine the target index using expression `(n - 1) %
hash`, and that HashMap creates a new entry when the target index is empty. In
the following paragraph, let's take a look how it replace an existing mapping
for key.

If mapping exists at target index, there're 3 cases:

1. the bucket matches the target key (regular node)
2. the bucket does not match the target key, and it is a tree node
3. the bucket does not match the target key, and it is not a tree node

In the first case, implementation tests 2 conditions: the previous hash value
must be the same as the current one; the previous key is the same as, or is
equals to the current key. Note that there's a delayed assignment for variable
`k`, because it might not need to be assigned—when the hash values are
different.

{% highlight java %}
Node<K,V> e; K k;
if (p.hash == hash &&
    ((k = p.key) == key || (key != null && key.equals(k))))
    e = p;
{% endhighlight %}

In the second case, implementation checks if p is a TreeNode. If it is, then put
the value into the tree. This is an improvement done in Java 8 coming from [JEP
180: Handle Frequent HashMap Collisions with Balanced Trees][jep180]. The
principal idea is that once the number of items in a hash bucket grows beyond a
certain threshold, that bucket will switch from using a linked list of entries
to a balanced tree. In the case of high hash collisions, this will improve
worst-case performance from O(n) to O(log n).

{% highlight java %}
else if (p instanceof TreeNode)
    e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
{% endhighlight %}

In the third case, implementation considers the bucket as a linked list. It
iterates all the bins, and acts according to different cases: 1. skip the lookup
if the target key is found; 2. add a new node at the end of list if the target
key is not found; 3. transform the list into a tree if the threshold is reached.

{% highlight java %}
for (int binCount = 0; ; ++binCount) {
    if ((e = p.next) == null) {
        p.next = newNode(hash, key, value, null);
        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
            treeifyBin(tab, hash);
        break;
    }
    if (e.hash == hash &&
        ((k = e.key) == key || (key != null && key.equals(k))))
        break;
    p = e;
}

{% endhighlight %}

In the previous operations, the existing mapping for key k is stored as
`Node<K,V> e`. If not null, it means that a mapping has been found.
Therefore, replace entry e's old value by the new one, then return the old
value. (Note that method `afterNodeAccess` is an empty method in HashMap—it is a
callback to allow LinkedHashMap post-actions.)

{% highlight java %}
if (e != null) { // existing mapping for key
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
}
{% endhighlight %}

Now the replacement operation is finished. But still another case to
consider—when the put operation is not a replacement. If not a replacement, then
we're modifying the HashMap's structure. Implementation records the number of
modifications via `modCount` and the number of entries stored in the HashMap via
`size`. Transient integer `modCount` is the number of times this HashMap has
been structurally modified, used to make iterators on Collection-views of the
HashMap fail-fast; transient integer `size` is the number of key-value mappings
contained in this map, used to determine when the map should be resized. (Note
that method `afterNodeInsertion` is an empty method an HashMap—it is a callback
to allow LinkedHashMap post-actions.)

{% highlight java %}
++modCount;
if (++size > threshold)
    resize();
afterNodeInsertion(evict);
return null;
{% endhighlight %}

## References

- [Stack Overflow: Why HashMap insert new Node on index (n - 1) & hash?](https://stackoverflow.com/questions/27230938/why-hashmap-insert-new-node-on-index-n-1-hash)
- [Oracle: Collections Framework Enhancements in Java SE 8](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/changes8.html)
- [JEP 180: Handle Frequent HashMap Collisions with Balanced Trees][jep180]
- [HashMap vs. Hashtable, ITCuties](http://www.itcuties.com/java/hashmap-hashtable/)

[jep180]: http://openjdk.java.net/jeps/180
