---
layout: page
title: 寫作
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 基礎

### 建立

執行以下指令。

``` bash
hexo new [layout] <title>
```

`layout` 參數可忽略，預設為 [全域設定][2] 的 `default_layout` 設定。

標題會被轉為小寫，空白會被轉為連字號，若目標檔名若重複則會在後面加上數字。例如：

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

### 設定

文章最前面有一段用 `---` 包裹的區塊，稱為 [YAML Front Matter][1]。你可使用 YAML 格式設定文章。以下是預設內容，你可隨自己喜好增減內容。

- **layout** - 布局（選填）
- **title** - 標題
- **date** - 發表日期
- **updated** - 更新日期（選填）
- **comments** - 留言功能（選填，預設開啟）
- **tags** - 標籤（選填，不適用於分頁）
- **categories** - 分類（選填，不適用於分頁）
- **permalink** - 覆寫預設網址（選填）

### 分類

分類為文章與 `source/_posts` 的相對位址，具有階層性。你也可在檔案內設定 `categories` 屬性，該屬性的內容會加入至原本分類的後面。例如：

- `source/_posts/title.md` - 無分類
- `source/_posts/Fruits/title.md` - Fruit
- `source/_posts/Fruits/Apple/title.md` - Fruit, Apple

分類設定：

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

## 骨架（Scaffold）

骨架（Scaffold）為文章的預設模版，新建文章時會根據骨架（Scaffold）內容建立文章。

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

如此一來，輸入

```
hexo new photo "New Gallery"
```

就會根據上面的內容建立新檔案了。

### 使用

骨架（Scaffold）使用 Swig 處理，變數以雙大括號包裹。以下是變數內容：

- **layout** - 布局名稱
- **title** - 文章標題
- **date** - 發表日期

[1]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[2]: configure.html