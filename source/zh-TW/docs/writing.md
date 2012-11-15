---
layout: page
title: 撰寫文章
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 文章

### 建立

執行以下指令。

``` bash
hexo new_post <title>
```

新文章會儲存於網站根目錄的 `source/_posts/title.md` 內容為：

``` plain
---
layout: post
title: title
date: YYYY-MM-DD HH:mm:ss
comments: true
tags:
---
```

### 設定

文章最前面有一段用`---`包裹的區塊，稱為 [YAML Front Matter]。你可使用 YAML 格式設定文章。

以下是預設的設定內容，你可隨自己喜好增減內容。

- **layout** - 文章布局
- **title** - 文章標題
- **date** - 文章的發佈日期（格式為 `YYYY-MM-DD HH:mm:ss`）
- **comments** - 開啟此文章的留言功能
- **tags** - 文章標籤

### 分類

分類為文章與 `source/_posts` 的相對位址，具有階層性。

舉例來說：

- `source/_posts/title.md` - 無分類
- `source/_posts/Fruits/title.md` - Fruit
- `source/_posts/Fruits/Apple/title.md` - Fruit, Apple

### 標籤

``` yaml
# 單一標籤
tags: Apple

# 多重標籤
tags: [Apple, Banana]

tags:
- Apple
- Banana
```

## 分頁

### 建立

執行以下指令。

``` bash
hexo new_page <title>
```

新分頁會儲存於網站根目錄的`source/title/index.md`，內容為：

``` plain
---
layout: page
title: title
date: YYYY-MM-DD HH:mm:ss
comments: true
---
```

### 設定

文章最前面有一段用`---`包裹的區塊，稱為 [YAML Front Matter]。你可使用 YAML 格式設定文章。

以下是預設的設定內容，你可隨自己喜好增減內容。

- **layout** - 文章布局
- **title** - 文章標題
- **date** - 文章的發佈日期（格式為 `YYYY-MM-DD HH:mm:ss`）
- **comments** - 開啟此文章的留言功能

## 生成靜態檔案

執行下列指令，即可將文章轉換成靜態檔案。

``` bash
hexo generate
```

[YAML Front Matter]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter