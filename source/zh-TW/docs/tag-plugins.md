---
layout: page
title: 標籤外掛
lang: zh-TW
date: 2012-11-01 18:13:30
---

標籤外掛（Tag Plugin）與文章中的標籤（Tag）不同，標籤外掛用於在文章內快速加入特定內容。

## 目錄

- [Block Quote](#blockquote)
- [Code Block](#codeblock)
- [Pull Quote](#pullquote)
- [jsFiddle](#jsfiddle)
- [Gist](#gist)
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

**別名：**`quote`

<a id="codeblock"></a>
## Code Block

{% raw %}
<pre><code>{% codeblock [title] [lang:language] [url] [link text] %}
content
{% endcodeblock %}
</code></pre>
{% endraw %}

**別名：**`code`

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