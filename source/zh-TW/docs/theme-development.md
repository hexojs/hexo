---
layout: page
title: 主題開發
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 目錄

- [結構](#structure)
- [變數](#variable)
- [類別 (Class)](#class)
- [Helper](#helper)
- [原始碼](#source)

<a id="structure"></a>
## 結構

``` plain
|-- _config.yml
|-- layout
|-- source
```

### _config.yml

主題的設定檔案。

### layout

模版資料夾。你可使用 [EJS] 或 [Swig] 處理模版檔案，或安裝 [Renderer 外掛] 以使用你喜愛的模版引擎。

基礎模版：

- **archive** - 網誌彙整
- **category** - 分類彙整
- **index** - 首頁
- **page** - 分頁
- **post** - 文章
- **tag** - 標籤彙整

### source

原始檔資料夾，CSS、JavaScript等檔案（*Asset*）應放置於此資料夾。此資料夾內的檔案在經過處理後會被複製至`public`資料夾，檔案或資料夾名稱開頭為`.`或`_`的會被忽略。

Hexo 內建 [Stylus] 及 [nib] 支援，你可安裝 [Renderer 外掛] 讓 Hexo 支援更多檔案格式。

<a id="variable"></a>
## 變數

### site

網站全域資料。

- **posts** - 所有文章，根據文章日期降冪排列。
- **pages** - 所有分頁，根據文章日期降冪排列。
- **categories** - 所有分類，根據字母順序排列。
- **tags** - 所有標籤，根據字母順序排列。

`posts`, `pages`使用 [Collection 類別]。

`categories`, `tags`使用 [Taxonomy 類別]。

### page

目前頁面的資料。內容根據不同頁面而有所差異。

**page, post:**

- **layout** - 文章佈局
- **title** - 文章標題
- **date** - 文章的發佈日期（[Moment.js] 物件）
- **updated** - 文章的更新日期（[Moment.js] 物件）
- **comments** - 開啟此文章的留言功能
- **permalink** - 文章的永久連結
- **stats** - 文章的檔案狀態（[fs.Stats] 類別）
- **content** - 文章內文
- **excerpt** - 文章摘要（內文中 `<!-- more -->` 之前的內容）
- **source** - 原始檔案路徑
- **path** - 文章的相對路徑

以及使用者在文章設定中所設定的其他變數。

page和post的差別不大，僅在於page沒有`categories`和`tags`變數。

**index:**

- 啟用分頁功能：[Paginator 類別]
- 關閉分頁功能：[Taxonomy 類別]

**archive:**

- 啟用分頁功能：[Paginator 類別]
- 關閉分頁功能：[Taxonomy 類別]

以及以下變數：

- **archive** - 恆為`true`
- **year** - 彙整年份（僅出現於年彙整）
- **month** - 彙整月份（僅出現於月彙整）

**category:**

- 啟用分頁功能：[Paginator 類別]
- 關閉分頁功能：[Taxonomy 類別]

以及以下變數：

- **category** - 分類名稱

**tag:**

- 啟用分頁功能：[Paginator 類別]
- 關閉分頁功能：[Taxonomy 類別]

以及以下變數：

- **tag** - 標籤名稱

### config

全域 [設定](config.html)。

### theme

主題設定。

<a id="class"></a>
## 類別 (Class)

<a id="collection"></a>
### Collection

- **each(iterator)**

	執行迴圈`iterator(item, i)`，`item`為迴圈目前的項目，`i`為迴圈執行的次數（從0開始）。
	
	**別名：**forEach
	
- **map(iterator)**

	執行迴圈`iterator(item, i)`，並用其回傳值代替原項目的值，`item`為迴圈目前的項目，`i`為迴圈執行的次數（從0開始）。

- **filter(iterator)**

	執行迴圈`iterator(item, i)`，若其回傳值為真，則保留其值，`item`為迴圈目前的項目，`i`為迴圈執行的次數（從0開始）。

	**別名：**select
	
- **toArray**

	將物件轉換為陣列（Array）。

- **slice(start, [end])**

	取出物件中的特定部分。`start`, `end`的值可為負數。

- **skip(num)**

	忽略物件中最前的指定段落。

- **limit(num)**

	限制傳回的物件數量。

- **set(item)**

	在物件中新增項目。

	**別名：**push
	
- **sort(orderby, [order])**

	排列物件。`order`為`1`, `asc`時為升冪排列（預設），`-1`, `desc`時為降冪排列。

- **reverse**

	反轉物件順序。

- **random**

	隨機排列物件。

	**別名：**shuffle

<a id="taxonomy"></a>
### Taxonomy

Taxonomy 類別是 [Collection 類別] 的繼承，大部分的方法都與 [Collection 類別] 類似，僅有下列方法有所差異。

- **get(name)**

	取得物件中的指定項目。
	
- **set(name, item)**

	在物件中新增一個名為`name`的項目。

	**別名：**push
	
- **each(iterator)**

	執行迴圈`iterator(value, key, i)`，`value`為迴圈目前的項目數值，`key`為迴圈目前的項目名稱，`i`為迴圈執行的次數（從0開始）。
	
	**別名：**forEach
	
- **map(iterator)**

	執行迴圈`iterator(value, key, i)`，並用其回傳值代替原項目的值，`value`為迴圈目前的項目數值，`key`為迴圈目前的項目名稱，`i`為迴圈執行的次數（從0開始）。

- **filter(iterator)**

	執行迴圈`iterator(value, key, i)`，若其回傳值為真，則保留其值，`value`為迴圈目前的項目數值，`key`為迴圈目前的項目名稱，`i`為迴圈執行的次數（從0開始）。

	**別名：**select

<a id="paginator"></a>
### Paginator

Paginator 類別是原類別的繼承，僅增加下列屬性。

- **per_page** - 每頁顯示的文章數量
- **total** - 文章總數量
- **current** - 目前頁數
- **current_url** - 目前頁數的網址
- **posts** - [Collection 類別]
- **prev** - 上一頁的頁數
- **prev_link** - 上一頁的連結
- **next** - 下一頁的頁數
- **next_link** - 下一頁的連結

<a id="helper"></a>
## Helper

Helper可幫助你在模版檔案中快速加入程式碼，以下是Hexo內建的Helper，你可安裝 [Helper 外掛] 讓主題開發更加方便。（以下語法以EJS為範例）

### css

載入CSS檔案。

```
<%- css(path) %>
```

### js

載入JavaScript檔案。

```
<%- js(path) %>
```

### trim

清除字串中的空白。

```
<%- trim(string) %>
```

### strip_html

清除字串中的所有 HTML 標籤。

```
<%- strip_html(string) %>
```

### titlecase

將字串轉為合適的標題大寫。

```
<%- titlecase(string) %>
```

### partial

載入其他模版，可使用`locals`指定模版內的變數。（使用方法與 [express-partials] 相同）

```
<%- partial(layout, [locals]) %>
```

### tagcloud

插入標籤雲（Tag Cloud）。

```
<%- tagcloud(tags, [options]) %>
```

**選項：**

- **min_font** - 最小的字體大小
- **max_font** - 最大的字體大小
- **unit** - 字體單位
- **amount** - 標籤數量
- **orderby** - 排列順序
- **order** - 排列方式。`1`, `asc`代表升冪排列，`-1`, `desc`代表降冪排列，`rand`, `random`代表隨機排列。

**預設值：**

```
{
	min_font: 10,
	max_font: 20,
	unit: 'px',
	amount: 40,
	orderby: 'name',
	order: 1
}
```

<a id="source"></a>
## 原始碼

你可參考預設主題Light的 [原始碼](https://github.com/tommy351/hexo-theme-light) 來製作主題。

[EJS]: https://github.com/visionmedia/ejs
[Swig]: http://paularmstrong.github.com/swig/
[Stylus]: http://learnboost.github.com/stylus/
[nib]: http://visionmedia.github.com/nib/
[Renderer 外掛]: ../plugins/#renderer
[Helper 外掛]: ../plugins/#helper
[express-partials]: https://github.com/publicclass/express-partials
[Moment.js]: http://momentjs.com/
[fs.Stats]: http://nodejs.org/api/fs.html#fs_class_fs_stats
[Collection 類別]: #collection
[Taxonomy 類別]: #taxonomy
[Paginator 類別]: #paginator