---
layout: page
title: 樣板資料
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 全域

- **[site](#site)** - 網站全域資料
- **[page](#page)** - 目前頁面的資料，內容根據不同頁面而有所差異
- **config** - [全域設定][3]，即`_config.yml`的內容
- **theme** - 主題設定，即主題資料夾內`_config.yml`的內容，根據不同主題而有所差異
- **__**（雙底線） - 取得 [國際化（i18n）][9] 字串
- **layout** - 布局
- **cache** - 快取

<a name="site"></a>
## site

網站全域資料，在沒有掛載其他擴充套件的情況下，**site** 擁有以下內容：

- **posts** - 所有文章
- **pages** - 所有分頁
- **categories** - 所有分類
- **tags** - 所有標籤

<a name="page"></a>
## page

目前頁面的資料，內容根據不同頁面而有所差異。

### 文章（post, page, …）

- **title** - 標題
- **date** - 發表日期（[Moment.js][7] 物件）
- **updated** - 更新日期（[Moment.js][7] 物件）
- **categories** - 分類（[Model][5] 物件）
- **tags** - 標籤（[Model][5] 物件）
- **comments** - 是否開啟留言功能
- **layout** - 布局
- **content** - 內文
- **excerpt** - 摘要（內文中`<!--more-->`之前的內容）
- **source** - 檔案原始位置
- **path** - 路徑
- **ctime** - 檔案建立時間（[Moment.js][7] 物件）
- **mtime** - 檔案修改時間（[Moment.js][7] 物件）
- **prev** - 前一篇文章
- **next** - 後一篇文章

以及使用者在文章設定中所設定的其他變數。**page** 和 **post** 的差別不大，在於 **page** 沒有 `categories`, `tags`, `prev` 和 `next` 屬性。

<a name="index"></a>
### 首頁（index）

**啟用分頁功能**：

- **per_page** - 每頁顯示的文章數量
- **total** - 文章總數量
- **current** - 目前頁碼
- **current_url** - 目前頁的連結
- **posts** - 文章（[Model][5] 物件）
- **prev** - 上頁頁碼
- **prev_link** - 上頁連結
- **next** - 下頁頁碼
- **next_link** - 下頁連結

**關閉分頁功能**：

[Model][5] 物件。

### 彙整（archive）

與 [首頁布局](#index) 相同，僅增加下列變數：

- **archive** - 恆為 `true`
- **year** - 彙整年份
- **month** - 彙整月份

### 分類（category）

與 [首頁布局](#index) 相同，僅增加下列變數：

- **category** - 分類名稱

### 標籤（tag）

與 [首頁布局](#index) 相同，僅增加下列變數：

- **tag** - 標籤名稱

[3]: configure.html
[5]: collection.html#model
[7]: http://momentjs.com/
[9]: global-variables.html#i18n