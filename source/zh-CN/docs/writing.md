---
layout: page
title: 写作
lang: zh-CN
date: 2012-11-01 18:13:30
---

## 基础

### 建立

执行以下指令。

``` bash
hexo new [layout] <title>
```

`layout` 参数可忽略，预设为 [全局设定][2] 的 `default_layout` 设定。

标题会被转为小写，空白会被转为连字号(-)，若目标文件名重复则会在后面加上数字。例如：

```
hexo new "New Post" -> source/_posts/new-post.md
hexo new page "New Page" -> source/new-page/index.md
hexo new draft "New Draft" -> source/_drafts/new-draft.md
```

### 文件名称

你可在 [全局设定][2] 的 `new_post_name` 设定调整新建文件的名称，预设为 `:title.md`。

- `:title` - 文章标题（文章的预设网址）
- `:year` - 发表年份（4位数）
- `:month` - 发表月份（2位数）
- `:day` - 发表日期（2位数）

如果你想要让文章依日期排列，可设定为 `:year-:month-:day-:title.md`。

### 设定

文章最前面有一段用 `---` 包裹的区块，称为 [YAML Front Matter][1]。你可使用 YAML 格式设定文章。以下是预设内容，你可随自己喜好增减内容。

- **layout** - 布局（选填）
- **title** - 标题
- **date** - 发表日期
- **updated** - 更新日期（选填）
- **comments** - 留言功能（选填，预设开启）
- **tags** - 标签（选填，不适用于分页）
- **categories** - 分类（选填，不适用于分页）
- **permalink** - 覆写预设网址（选填）

### 分类

分类为文章与 `source/_posts` 的相对位置，具有阶层性。你也可在文件内设定 `categories` 属性，该属性的内容会加入至原本分类的后面。例如：

- `source/_posts/title.md` - 无分类
- `source/_posts/Fruits/title.md` - Fruit
- `source/_posts/Fruits/Apple/title.md` - Fruit, Apple

分类设定：

``` yaml
# 单一分类
categories: Fruits

# 多重分类
categories: Fruits/Apple

categories: [Fruits, Apple]

categories:
- Fruits
- Apple
```

### 标签

``` yaml
# 单一标签
tags: Apple

# 多重标签
tags: [Apple, Banana]

tags:
- Apple
- Banana
```

## 骨架（Scaffold）

骨架（Scaffold）为文章的预设模版，新建文章时会根据骨架（Scaffold）内容建立文章。

### 范例

在 `scaffolds` 文件夹内建立 `photo.md`。

{% raw %}
<pre><code>layout: {{ layout }}
title: {{ title }}
date: {{ date }}
tags:
---
</code></pre>
{% endraw %}

如此一来，输入

```
hexo new photo "New Gallery"
```

就会根据上面的内容建立新文件了。

### 使用

骨架（Scaffold）使用 Swig 处理，变量以双大括号包裹。以下是变量内容：

- **layout** - 布局名称
- **title** - 文章标题
- **date** - 发表日期

[1]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[2]: configure.html