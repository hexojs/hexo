---
layout: page
title: Writing
date: 2012-11-01 18:13:30
---

## Basic

### Create

Execute the following command.

``` bash
hexo new [layout] <title>
```

`layout` is optional. Default is `default_layout` setting in [global configuration][2].

The title will be transform into lower case. Spaces will be replaced with dash. If the target file exists, adding number after the filename. For example:

```
hexo new "New Post" -> source/_posts/new-post.md
hexo new page "New Page" -> source/new-page/index.md
hexo new draft "New Draft" -> source/_drafts/new-draft.md
```

### Filename

You can configure the name of new files by editing `new_post_name` setting in [global configuration][2]. Default is `:title.md`.

- `:title` - Article title (Default URL of the article)
- `:year` - Published year (4-digit)
- `:month` - Published month (2-digit)
- `:day` - Published date (2-digit)

To make files sorted by date, you can set it to `:year-:month-:day-:title.md`.

### Configure

The beginning of article is a block wrapped with `---`, called [YAML Front Matter][1]. You can use YAML to configure posts.

- **layout** - Layout (Optional)
- **title** - Title
- **date** - Published date
- **updated** - Last updated date (Optional)
- **comments** - Whether to enable comment (Optional. Enabled by default)
- **tags** - Tags (Optional. Not availiable for page)
- **categories** - Categories (Optional. Not availiable for page)
- **permalink** - Override default URL (Optional)

### Categories

Category is the relative path to `source/_posts`. It's hierarchical. You can add `categories` property in the file. Its content will be added after the original categories. For example:

For example:

- `source/_posts/title.md` - Uncategorized
- `source/_posts/Fruits/title.md` - Fruit
- `source/_posts/Fruits/Apple/title.md` - Fruit, Apple

Categories settings:

``` yaml
# Single category
categories: Fruits

# Multiple categories
categories: Fruits/Apple

categories: [Fruits, Apple]

categories:
- Fruits
- Apple
```

### Tags

``` yaml
# Single tag
tags: Apple

# Multiple tags
tags: [Apple, Banana]

tags:
- Apple
- Banana
```

## Scaffolds

A scaffold is the default template of articles. Hexo will create articles based on the scaffolds.

### Example

Create `photo.md` in `scaffolds` folder.

{% raw %}
<pre><code>---
layout: {{ layout }}
title: {{ title }}
date: {{ date }}
tags:
---
</code></pre>
{% endraw %}

And execute the following:

```
hexo new photo "New Gallery"
```

Hexo will create a new file based on the content above.

### Usage

A scaffold is processed by Swig. Variables are wrapped by double curly brackets. The following are the variables:

- **layout** - Layout name
- **title** - Article title
- **date** - Published date

[1]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[2]: configure.html