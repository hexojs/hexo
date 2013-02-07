---
layout: page
title: 設定
lang: zh-TW
date: 2012-11-01 18:13:30
---

全域設定檔案儲存於網站根目錄下的`_config.yml`。

## 設定

### 網站

- **title** - 網站標題
- **subtitle** - 網站副標題
- **description** - 網站描述
- **author** - 網站作者
- **email** - 網站作者的電子信箱位址
- **language** - 網站使用的語言（[IETF 格式][1]，例如正體中文為 `zh-TW`）

### 網址

- **url** - 網站網址
- **root** - 網站的根目錄。假設 `url` 為 `http://yoursite.com/child`，則 `root` 為 `/child/`。
- **permalink** - 文章的網址格式（[設定][2]）
- **tag_dir** - 標籤資料夾
- **archive_dir** - 網誌彙整資料夾
- **category_dir** - 分類資料夾

### 寫作

- **new_post_name** - 新文章的檔案名- 稱（[設定][7]）
- **default_layout** - 預設布局
- **auto_spacing** - 在東方文字與西方文字之間插入空白
- **titlecase** - 將標題轉為合適的大小寫
- **max_open_file** - 最大同時處理檔案數量
- **filename_case** - 轉換檔案名稱為 (1) 小寫 (2) 大寫
- **highlight** - 程式碼區塊設定
  - **enable** - 啟用程式碼 Highlight
  - **backtick_code_block** - 啟用 [Backtick Code Block][6]
  - **line_number** - 顯示行號
  - **tab_replace** - 取代 Tab
  
### 分類 & 標籤

- **default_category** - 預設分類
- **category_map** - 分類別名
- **tag_map** - 標籤別名

### 網誌彙整

`2` - 開啟彙整的分頁功能  
`1` - 關閉彙整的分頁功能  
`0` - 完全關閉

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

- **themes** - 目前使用的主題
- **exclude_generator** - 要關閉的 Generator（archive, category, home, page, post, tag）

### 佈署

- **type** - 佈署類型

其他設定請依照各個佈署套件調整設定。

## 預設值

``` yaml
# Hexo Configuration
## Docs: http://zespia.tw/hexo/docs/configure.html
## Source: https://github.com/tommy351/hexo/

# Site
title: Hexo
subtitle:
description:
author: John Doe
email:
language:

# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
url: http://yoursite.com
root: /
permalink: :year/:month/:day/:title/
tag_dir: tags
archive_dir: archives
category_dir: categories

# Writing
new_post_name: :title.md # File name of new posts
default_layout: post
auto_spacing: false # Add spaces between asian characters and western characters
titlecase: false # Transform title into titlecase
max_open_file: 100
filename_case: 0
highlight:
  enable: true
  backtick_code_block: true
  line_number: true
  tab_replace:

# Category & Tag
default_category: uncategorized
category_map:
tag_map:

# Archives
## 2: Enable pagination
## 1: Disable pagination
## 0: Fully Disable
archive: 2
category: 2
tag: 2

# Server
## Hexo uses Connect as a server
## You can customize the logger format as defined in
## http://www.senchalabs.org/connect/logger.html
port: 4000
logger: false
logger_format:

# Date / Time format
## Hexo uses Moment.js to parse and display date
## You can customize the date format as defined in
## http://momentjs.com/docs/#/displaying/format/
date_format: MMM D YYYY
time_format: H:mm:ss

# Pagination
## Set per_page to 0 to disable pagination
per_page: 10
pagination_dir: page

# Disqus
disqus_shortname:

# Extensions
## Plugins: https://github.com/tommy351/hexo/wiki/Plugins
## Themes: https://github.com/tommy351/hexo/wiki/Themes
theme: light
exclude_generator:

# Deployment
## Docs: http://zespia.tw/hexo/docs/deploy.html
deploy:
  type:
```

[1]: http://www.w3.org/International/articles/language-tags/
[2]: permalink.html
[3]: http://www.senchalabs.org/connect/logger.html
[4]: http://momentjs.com/docs/#/displaying/format/
[5]: http://disqus.com/
[6]: tag-plugins.html
[7]: writing.html