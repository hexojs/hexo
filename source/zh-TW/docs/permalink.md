---
layout: page
title: 永久連結
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 設定

在`_config.yml`中的`permalink`欄位設定文章連結，預設值為：

``` plain
permalink: :year/:month/:day/:title/
```

在永久連結中可加入以下變數，變數名稱前必須擁有`:`才有效。

- **year** - 4位數的年份
- **month** - 2位數的月份
- **day** - 2位數的日期
- **title** - 文章的檔案名稱
- **category** - 文章的分類（對於`source/_posts`的相對路徑），若文章無分類，則為`_config.yml`中的`category_dir`欄位

*（日期以文章設定中的日期為基準）*

## 舉例

假設有一文章名為`title.md`，放置於`source/_posts/foo/bar`資料夾，內容為：

``` plain
---
title: Post Title
date: 2012-10-09 14:09:37
tags:
- Node.js
- JavaScript
---
```

則結果會是：

``` plain
:year/:month/:day/:title/ => /2012/10/09/title/
:year-:month-:day/:title/ => /2012-10-09/title/
:category/:title/ => /foo/bar/title/
```