---
layout: page
title: 樣板資料
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 全域

- **[site](#site)** - 網站全域資料，由 [Processor][1] 所控制
- **[page](#page)** - 目前頁面的資料，內容根據不同頁面而有所差異，由 [Generator][2] 所控制
- **config** - [全域設定][3]，即`_config.yml`的內容
- **theme** - 主題設定，即主題資料夾內`_config.yml`的內容，根據不同主題而有所差異

<a id="site"></a>
## site

網站全域資料，在沒有掛載其他擴充套件的情況下，site擁有以下內容：

- **posts** - 所有文章，根據發表日期降冪排列
- **pages** - 所有分頁，根據發表日期降冪排列
- **categories** - 所有分類，根據字母順序排列
- **tags** - 所有標籤，根據字母順序排列

**posts**, **pages** 為 [Collection 類別][4]

**categories**, **tags** 為 [Taxonomy 類別][5]

<a id="page"></a>
## page

目前頁面的資料，內容根據不同頁面而有所差異，以下僅列舉內建Generator所擁有的page內容。

#### page, post

- **layout** - 文章佈局
- **title** - 文章標題
- **date** - 文章的發佈日期（[Moment.js][7] 物件）
- **updated** - 文章的更新日期（[Moment.js][7] 物件）
- **comments** - 開啟此文章的留言功能
- **permalink** - 文章的永久連結
- **stats** - 文章的檔案狀態（[fs.Stats][8] 類別）
- **content** - 文章內文
- **excerpt** - 文章摘要（內文中 `<!-- more -->` 之前的內容）
- **source** - 原始檔案路徑
- **path** - 文章的相對路徑

以及使用者在文章設定中所設定的其他變數。

page和post的差別不大，僅在於page沒有`categories`和`tags`變數。

#### index

- 啟用分頁功能：[Paginator 類別][6]
- 關閉分頁功能：[Taxonomy 類別][5]

#### archive

- 啟用分頁功能：[Paginator 類別][6]
- 關閉分頁功能：[Taxonomy 類別][5]

以及以下變數：

- **archive** - 恆為`true`
- **year** - 彙整年份（僅出現於年彙整）
- **month** - 彙整月份（僅出現於月彙整）

#### category

- 啟用分頁功能：[Paginator 類別][6]
- 關閉分頁功能：[Taxonomy 類別][5]

以及以下變數：

- **category** - 分類名稱

#### tag

- 啟用分頁功能：[Paginator 類別][6]
- 關閉分頁功能：[Taxonomy 類別][5]

以及以下變數：

- **tag** - 標籤名稱

[1]: plugin-development.html#processor
[2]: plugin-development.html#generator
[3]: configure.html
[4]: collection.html#collection
[5]: collection.html#taxonomy
[6]: collection.html#paginator
[7]: http://momentjs.com/
[8]: http://nodejs.org/api/fs.html#fs_class_fs_stats