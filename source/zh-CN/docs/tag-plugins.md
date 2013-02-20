---
layout: page
title: 标签插件
lang: zh-CN
date: 2013-02-18 19:52:12
---

标签插件（Tag Plugin）与文章中的标签（Tag）不同，标签插件用于在文章内快速加入特定内容。

## Block Quote

插入 Block Quote。

{% raw %}
<pre><code>{% blockquote [author[, source]] [link] [source_link_title] %}
content
{% endblockquote %}
</code></pre>
{% endraw %}

**别名：**`quote`

[参考][1]

## Code Block

插入代码区块。

{% raw %}
<pre><code>{% codeblock [title] [lang:language] [url] [link text] %}
content
{% endcodeblock %}
</code></pre>
{% endraw %}

**别名：**`code`

[参考][2]

## Backtick Code Block

插入代码区块。

	``` [language] [title] [url] [link text]
	content
	```

[参考][3]

## Pull Quote

插入 Pull Quote。

{% raw %}
<pre><code>{% pullquote [class_name] %}
content
{% endpullquote %}
</code></pre>
{% endraw %}

[参考][4]

## jsFiddle

插入 jsFiddle。

{% raw %}
<pre><code>{% jsfiddle shorttag [tabs] [skin] [width] [height] %}
</code></pre>
{% endraw %}

[参考][5]

## Gist

插入 Gist。

{% raw %}
<pre><code>{% gist gist_id [filename] %}
</code></pre>
{% endraw %}

[参考][6]

## Image Tag

插入图片。

{% raw %}
<pre><code>{% img [class names] /path/to/image [width] [height] [title text [alt text]] %}
</code></pre>
{% endraw %}

[参考][7]

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

逃脱处理。（请去掉反斜线）

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