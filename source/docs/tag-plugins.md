---
layout: page
title: Tag Plugins
date: 2012-11-01 18:13:30
---

Tag plugins are different from tags in posts. Tag plugins are used for inserting specific contents in posts.

## Block Quote

Insert a block quote.

{% raw %}
<pre><code>{% blockquote [author[, source]] [link] [source_link_title] %}
content
{% endblockquote %}
</code></pre>
{% endraw %}

**Alias:**`quote`

[Reference][1]

## Code Block

Inserts a code block.

{% raw %}
<pre><code>{% codeblock [title] [lang:language] [url] [link text] %}
content
{% endcodeblock %}
</code></pre>
{% endraw %}

**Alias:**`code`

[Reference][2]

## Backtick Code Block

Inserts a code block.

	``` [language] [title] [url] [link text]
	content
	```

[Reference][3]

## Pull Quote

Inserts a pull quote.

{% raw %}
<pre><code>{% pullquote [class_name] %}
content
{% endpullquote %}
</code></pre>
{% endraw %}

[Reference][4]

## jsFiddle

Embeds jsFiddle.

{% raw %}
<pre><code>{% jsfiddle shorttag [tabs] [skin] [width] [height] %}
</code></pre>
{% endraw %}

[Reference][5]

## Gist

Embeds Gist.

{% raw %}
<pre><code>{% gist gist_id [filename] %}
</code></pre>
{% endraw %}

[Reference][6]

## Image Tag

Inserts a picture.

{% raw %}
<pre><code>{% img [class names] /path/to/image [width] [height] [title text [alt text]] %}
</code></pre>
{% endraw %}

[Reference][7]

## Youtube

Inserts a Youtube video.

{% raw %}
<pre><code>{% youtube video_id %}
</code></pre>
{% endraw %}

## Vimeo

Inserts a Vimeo video.

{% raw %}
<pre><code>{% vimeo video_id %}
</code></pre>
{% endraw %}

## Raw

Escapes contents. (Please delete the backslash)

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