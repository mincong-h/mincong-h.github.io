---
layout: post
title:  "Add listener to Android ListView"
date:   2016-03-20 17:56:15 +0100
categories: [tech]
tags:       [java, android]
excerpt:    >
  How to add listener to Android ListView.
redirect_from:
  - /android/2016/03/20/listview-onclicklistner/
---

In a recent Android project, I work with `ListView` component. At the beginning,
it was static and that was enough for the project. But now, the list view's item
need to be dynamic in order to increase the interactive ability with user.
Therefore, the implementation of a listner in the activity.

{% highlight java %}
public class MainActivity extends AppCompatActivity {

    private ListView mListView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        // ...

        // set onclick listener for list view
        mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            public void onItemClick(AdapterView<?> parent, View view, 
                    int position, long id) {

                // get the item in position N from list view,
                // then convert it into your POJO
                Animal animal = (Animal) mListView.getItemAtPosition(position);

                // give a toast
                Toast.makeText(
                    getApplicationContext(),
                    animal.getWord(),
                    Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    // ...
}
{% endhighlight %}

Let's check the result :

<img src="{{ site.url }}/assets/20160320-165100-screenshot.png" width="300" alt="OnClick screenshot"/>
