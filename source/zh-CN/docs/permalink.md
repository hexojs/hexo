---
layout: page
title: 固定链接
lang: zh-CN
date: 2013-02-18 19:39:10
---

## 设定

在`_config.yml`中的`permalink`栏位设定文章链接，预设值为：

``` plain
permalink: :year/:month/:day/:title/
```

在固定连接中可加入以下变量，变量名称前必须拥有`:`才有效。

- **year** - 4位数的年份
- **month** - 2位数的月份
- **day** - 2位数的日期
- **title** - 文章的文件名称
- **category** - 文章的分类（对于`source/_posts`的相对路径），若文章无分类，则为`_config.yml`中的`category_dir`栏位

*（日期以文章设定中的日期为基准）*

## 举例

假设有一文章名为`title.md`，放置于`source/_posts/foo/bar`文件夹，内容为：

``` plain
---
title: Post Title
date: 2012-10-09 14:09:37
tags:
- Node.js
- JavaScript
---
```

则结果会是：

``` plain
:year/:month/:day/:title/ => /2012/10/09/title/
:year-:month-:day/:title/ => /2012-10-09/title/
:category/:title/ => /foo/bar/title/
```