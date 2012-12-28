---
layout: page
title: 設定
lang: zh-TW
date: 2012-11-01 18:13:30
---

全域設定檔案儲存於網站根目錄下的`_config.yml`。

## 設定

### 基礎

- **title** - 網站標題
- **subtitle** - 網站副標題
- **description** - 網站描述
- **url** - 網站網址
- **author** - 網站作者
- **email** - 網站作者的電子信箱位址
- **language** - 網站使用的語言（[IETF 格式][1]，例如正體中文為 `zh-TW`）

### 永久連結

- **root** - 網站的根目錄。假設 `url` 為 `http://yoursite.com/child`，則 `root` 為 `/child/`。
- **permalink** - 文章的網址格式（[設定][2]）
- **tag_dir** - 標籤資料夾
- **archive_dir** - 網誌彙整資料夾
- **category_dir** - 分類的預設名稱
- **new_post_name** - 新文章的檔案名稱

#### new_post_name

- `:title` - 文章的預設網址
- `:year` - 文章的發佈年份（4位數）
- `:month` - 文章的發佈月份（2位數）
- `:day` - 文章的發佈日期（2位數）

例：Octopress式的檔案名稱：`:year-:month-:day-:title.md`

### 網誌彙整

`2` - 開啟彙整的分頁功能  
`1` - 關閉彙整的分頁功能

- **archive**
- **category**
- **tag**

### 伺服器

- **port** - 伺服器連接埠
- **logger** - 啟用伺服器記錄
- **logger_format** - 伺服器記錄的格式（[Connect][3]）

### 日期 / 時間格式

Hexo 使用 Moment.js 解析和顯示日期。（[Moment.js][4]）

- **date_format** - 日期格式
- **time_format** - 時間格式

### 分頁

- **per_page** - 每頁顯示的文章數量（0 代表關閉分頁功能）
- **pagination_dir** - 分頁資料夾

### Disqus

- **disqus_shortname** - [Disqus][5] 的 Shortname

### 擴充套件

- **plugins** - 要開啟的外掛
- **themes** - 目前使用的主題
- **exclude_generator** - 要關閉的 Generator（archive, category, home, page, post, tag）

### 增強套件

- **auto_spacing** - 在中文、日文與西文、數字、符號之間插入空白
- **titlecase** - 將標題轉為合適的大小寫

### 佈署

- **type** - 佈署類型

其他設定請依照各個佈署套件調整設定。

## 預設值

	# Basic
	title: Hexo
	subtitle: Node.js blog framework
	description:
	url: http://yoursite.com
	author: John Doe
	email:
	language:

	# Permalink
	root: /
	permalink: :year/:month/:day/:title/
	tag_dir: tags
	archive_dir: archives
	category_dir: posts
	new_post_name: :title.md

	# Archives
	archive: 2
	category: 2
	tag: 2

	# Server
	port: 4000
	logger: false
	logger_format:

	# Date / Time format
	date_format: MMM D, YYYY
	time_format: H:mm:ss

	# Pagination
	per_page: 10
	pagination_dir: page

	# Disqus
	disqus_shortname:

	# Extensions
	plugins:
	theme: light
	exclude_generator:

	# Enhancement
	auto_spacing: false
	titlecase: false

	# Deploy
	deploy:
		type:
		
[1]: http://www.w3.org/International/articles/language-tags/
[2]: permalink.html
[3]: http://www.senchalabs.org/connect/logger.html
[4]: http://momentjs.com/docs/#/displaying/format/
[5]: http://disqus.com/