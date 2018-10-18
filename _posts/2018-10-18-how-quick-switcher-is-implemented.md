---
layout:            post
title:             How Quick Switcher is implemented?
date:              2018-10-18 20:39:47 +0200
categories:        [tech]
tags:              [polymer, javascript, nuxeo]
comments:          true
excerpt:           >
    The internal mechanism of Quick Switcher, a Polymer element allowing you to
    jump into any feature, layout, or menu option in Nuxeo Studio.
img_url:           /assets/20181018-kapture-quick-switcher.jpg
img_width:         1200
img_height:        780
img_excerptOnly:   true
---

<p align="center">
  <img src="/assets/20181018-kapture-quick-switcher.gif"
       style="max-width: 350px"
       alt="QuickSwitcher Demo">
</p>

## Overview

Today, I'd like to talk about « Quick Switcher », a new feature that we
developed for Nuxeo Online Services. It allows you to jump into any Nuxeo Studio
feature or menu option in a snap by typing its name. The action can be triggered
by clicking the button, or using shortcut « <kbd>CTRL</kbd> + <kbd>K</kbd> » in
Windows/Linux or « <kbd>CMD</kbd> + <kbd>K</kbd> » in Mac.

<p align="center">
  <img src="/assets/20181018-quick-switcher-diagram.png"
       alt="Event Diagram of Quick Switcher">
</p>

## Display Mechanism

Quick Switcher provides suggestions for all the features and layouts in Studio,
including feature types (Modeler), feature configurations (Modeler), layouts
(Designer). Suggestions are fetched each time Quick Switcher is opened, they are
fetched via REST API. Then, the results are stored as in-memory data on the
client side as JavaScript objects. There's no persistence or caching mechanism
in client's browser—each time the dialog is opened, new XHR will be created.
Elastic Search or any other server side indexation technologies are not used.

Quick Switcher displays two types of items:

1. Latest 5 history items (before search)
2. Suggestions matched user's search query (during search)

For the history part, data are persisted in user's browser as
[LocalStorage][LocalStorage]. We maintain one item per project in local storage.
Each item has at most 5 entries containing the search query and the timestamp.
We also guarantee that the search queries are unique. If keyword _"foo"_ has been
searched twice, only the most recent one will be persisted. The key of the local
storage matches the following naming convention:

    nos.studio.searchHistory.$PROJECT_ID

History is persisted only when user is about to visit a selected item. Canceling
Quick Switcher (quit normally) won't change search history.

## Navigation

Both keyboard and mouse are used for suggestions navigation.

- Key « <kbd>UP</kbd> » will navigate to the previous item
- Key « <kbd>DOWN</kbd> » will navigate to the next item
- Key « <kbd>ENTER</kbd> » will let browser visit the current selected item
- Mouse click will let browser visit the hand-over them (`:hover`)

## Contextual Help

There're two types of contextual help in Quick Switcher: keyboard tips and
general tips. Keyboard tips are ONLY displayed when Quick Switcher is opened
via button. General tips are always displayed.

## Conclusion

This article is originally published as the
[technical specification](https://jira.nuxeo.com/browse/NXS-4769) of Quick
Switcher in Nuxeo Studio's JIRA, I wrote it
sometime ago. Since this feature is now available in Studio, I share it with
you via my blog too. If you find any bug about Quick Switcher, feel free to
leave me a comment, or create a JIRA ticket—it's more preferable.

Hope you enjoy this article, see you the next time!

## References

- [MDN: LocalStorage][LocalStorage]

[LocalStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage
