---
layout: page
title: 寫作
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 建立

執行以下指令。

	hexo new [layout] <title>

`layout` 參數可忽略，預設為 [全域設定][2] 的 `default_layout` 設定。

```
hexo new "New Post" -> source/_posts/new-post.md
hexo new page "New Page" -> source/new-page/index.md
hexo new draft "New Draft" -> source/_drafts/new-draft.md
```

### 檔案名稱

你可在 [全域設定][2] 的 `new_post_name` 設定調整新建檔案的名稱，預設為 `:title.md`。

- `:title` - 文章標題（文章的預設網址）
- `:year` - 發表年份（4位數）
- `:month` - 發表月份（2位數）
- `:day` - 發表日期（2位數）

如果你想要讓文章依日期排列，可設定為 `:year-:month-:day-:title.md`。

## 設定

文章最前面有一段用 `---` 包裹的區塊，稱為 [YAML Front Matter][1]。你可使用 YAML 格式設定文章。以下是預設內容，你可隨自己喜好增減內容。

- **layout** - 布局（選填）
- **title** - 標題
- **date** - 發表日期（預設為檔案建立日期）
- **updated** - 更新日期（選填，預設為檔案最後修改日期）
- **comments** - 留言功能（選填，預設開啟）
- **tags** - 標籤（選填，不適用於分頁）
- **categories** - 分類（選填，不適用於分頁）
- **permalink** - 覆寫預設網址（選填）

## 分類

分類為文章與 `source/_posts` 的相對位址，具有階層性。你也可在檔案內設定 `categories` 屬性，該屬性的內容會加入至原本分類的後面。例如：

- `source/_posts/title.md` - 無分類
- `source/_posts/Fruits/title.md` - Fruit
- `source/_posts/Fruits/Apple/title.md` - Fruit, Apple

``` yaml
# 單一分類
categories: Fruits

# 多重分類
categories: Fruits/Apple

categories: [Fruits, Apple]

categories:
- Fruits
- Apple
```

### 分類別名

你可在 [全域設定][2] 的 `categories_map` 設定調整分類別名，例如：

- `categories/遊戲/` - categories/games/
- `categories/日記/` - categories/diary/

``` yaml
categories_map:
	遊戲: games
	日記: diary
```

## 標籤

``` yaml
# 單一標籤
tags: Apple

# 多重標籤
tags: [Apple, Banana]

tags:
- Apple
- Banana
```

### 標籤別名

你可在 [全域設定][2] 的 `tags_map` 設定調整標籤別名，例如：

- `tags/遊戲/` - tags/games/
- `tags/日記/` - tags/diary/

``` yaml
tags_map:
	遊戲: games
	日記: diary
```

## 骨架

骨架是文章建立時的預設模版，建立文章時會根據骨架（Scaffold）的內容建立文章。

### 範例

在 `scaffolds` 資料夾內建立 `photo.md`。

{% raw %}
<pre><code>layout: {{ layout }}
title: {{ title }}
date: {{ date }}
tags:
---
</code></pre>
{% endraw %}

並執行以下命令：

```
hexo new photo "New Gallery"
```

Hexo 即會依照以上內容建立新檔案。

### 使用

骨架（Scaffold）使用 Swig 處理，變數以雙大括號包裹。以下是變數內容：

- **layout** - 布局名稱
- **title** - 文章標題
- **date** - 發表日期

[1]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[2]: configure.html