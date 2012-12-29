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

新文章會儲存於 `source/_posts/name.md`，內容為：

``` plain
---
layout: post
title: title
date: YYYY-MM-DD HH:mm:ss
comments: true
tags:
---
```

檔案名稱根據 `_config.yml` 中的 `new_post_name` 設定和 `title` 參數命名，標題會被轉成小寫，空白會被轉成連字號。例如：

```
hexo new_post Test Post => source/_posts/test-post.md
```

### 設定

文章最前面有一段用`---`包裹的區塊，稱為 [YAML Front Matter][1]。你可使用 YAML 格式設定文章。

以下是預設的設定內容，你可隨自己喜好增減內容。

- **layout** - 布局
- **title** - 標題
- **date** - 發表日期（`YYYY-MM-DD HH:mm:ss`）
- **comments** - 留言功能
- **tags** - 標籤
- **permalink** - 覆寫預設網址（選填）

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

新分頁會儲存於網站根目錄的`source/name/index.md`，內容為：

``` plain
---
layout: page
title: title
date: YYYY-MM-DD HH:mm:ss
comments: true
---
```

檔案名稱根據 `title` 參數命名，標題會被轉成小寫，空白會被轉成連字號。例如：

```
hexo new_page Test Page => source/test-page/index.md
```

### 設定

文章最前面有一段用`---`包裹的區塊，稱為 [YAML Front Matter][1]。你可使用 YAML 格式設定文章。

以下是預設的設定內容，你可隨自己喜好增減內容。

- **layout** - 布局
- **title** - 標題
- **date** - 發佈日期（`YYYY-MM-DD HH:mm:ss`）
- **comments** - 留言功能
- **permalink** - 覆寫預設網址（選填）

## 生成靜態檔案

執行下列指令，即可將文章轉換成靜態檔案。

``` bash
hexo generate
```
往後，若你想要加快檔案生成速度，可以加入`-t`或`--theme`來忽略主題安裝。

``` bash
hexo generate -t
hexo generate --theme
```

[1]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter