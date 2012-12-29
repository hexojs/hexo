---
layout: page
title: Tag Plugins
date: 2012-11-01 18:13:30
---

A tag plugin is different from a tag in an article. A tag plugin is used to insert specific content to the article quickly.

## Contents

- [Block Quote](#blockquote)
- [Code Block](#codeblock)
- [Pull Quote](#pullquote)
- [jsFiddle](#jsfiddle)
- [Gist](#gist)
- [Image Tag](#image-tag)
- [Youtube](#youtube)
- [Vimeo](#vimeo)

<a id="blockquote"></a>
## Block Quote

{% raw %}
<pre><code>{% blockquote [author[, source]] [link] [source_link_title] %}
content
{% endblockquote %}
</code></pre>
{% endraw %}

**Alias：**`quote`

<a id="codeblock"></a>
## Code Block

{% raw %}
<pre><code>{% codeblock [title] [lang:language] [url] [link text] %}
content
{% endcodeblock %}
</code></pre>
{% endraw %}

**Alias：**`code`

<a id="pullquote"></a>
## Pull Quote

{% raw %}
<pre><code>{% pullquote [class_name] %}
content
{% endpullquote %}
</code></pre>
{% endraw %}

<a id="jsfiddle"></a>
## jsFiddle

{% raw %}
<pre><code>{% jsfiddle shorttag [tabs] [skin] [width] [height] %}
</code></pre>
{% endraw %}

<a id="gist"></a>
## Gist

{% raw %}
<pre><code>{% gist gist_id [filename] %}
</code></pre>
{% endraw %}

<a id="image-tag"></a>
## Image Tag

{% raw %}
<pre><code>{% img [class names] /path/to/image [width] [height] [title text [alt text]] %}
</code></pre>
{% endraw %}

<a id="youtube"></a>
## Youtube

{% raw %}
<pre><code>{% youtube video_id %}
</code></pre>
{% endraw %}

<a id="vimeo"></a>
## Vimeo

{% raw %}
<pre><code>{% vimeo video_id %}
</code></pre>
{% endraw %}