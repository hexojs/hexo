---
layout: page
title: 標籤外掛
lang: zh-TW
date: 2012-11-01 18:13:30
---

標籤外掛（Tag Plugin）與文章中的標籤（Tag）不同，標籤外掛用於在文章內快速加入特定內容。

## Block Quote

插入 Block Quote。

{% raw %}
<pre><code>{% blockquote [author[, source]] [link] [source_link_title] %}
content
{% endblockquote %}
</code></pre>
{% endraw %}

**別名：**`quote`

[參考][1]

## Code Block

插入程式碼區塊。

{% raw %}
<pre><code>{% codeblock [title] [lang:language] [url] [link text] %}
content
{% endcodeblock %}
</code></pre>
{% endraw %}

**別名：**`code`

[參考][2]

## Backtick Code Block

插入程式碼區塊。

	``` [language] [title] [url] [link text]
	content
	```

[參考][3]

## Pull Quote

插入 Pull Quote。

{% raw %}
<pre><code>{% pullquote [class_name] %}
content
{% endpullquote %}
</code></pre>
{% endraw %}

[參考][4]

## jsFiddle

插入 jsFiddle。

{% raw %}
<pre><code>{% jsfiddle shorttag [tabs] [skin] [width] [height] %}
</code></pre>
{% endraw %}

[參考][5]

## Gist

插入 Gist。

{% raw %}
<pre><code>{% gist gist_id [filename] %}
</code></pre>
{% endraw %}

[參考][6]

## Image Tag

插入圖片。

{% raw %}
<pre><code>{% img [class names] /path/to/image [width] [height] [title text [alt text]] %}
</code></pre>
{% endraw %}

[參考][7]

## Youtube

插入 Youtube 影片。

{% raw %}
<pre><code>{% youtube video_id %}
</code></pre>
{% endraw %}

## Vimeo

插入 Vimeo 影片。

{% raw %}
<pre><code>{% vimeo video_id %}
</code></pre>
{% endraw %}

## Raw

逸脫處理。（請去掉反斜線）

{% raw %}
<pre><code>{% raw %}
{% endraw /%}
</code></pre>
{% endraw %}

[1]: http://octopress.org/docs/plugins/blockquote/
[2]: http://octopress.org/docs/plugins/codeblock/
[3]: http://octopress.org/docs/plugins/backtick-codeblock/
[4]: http://octopress.org/docs/plugins/pullquote/
[5]: http://octopress.org/docs/plugins/jsfiddle-tag/
[6]: http://octopress.org/docs/plugins/gist-tag/
[7]: http://octopress.org/docs/plugins/image-tag/