---
layout: page
title: 设定
lang: zh-CN
date: 2013-02-18 18:55:29
---

全局设定文件储存于网站根目录下的`_config.yml`。

## 设定

### 网站

- **title** - 网站标题
- **subtitle** - 网站副标题
- **description** - 网站描述
- **author** - 网站作者
- **email** - 网站作者的电子信箱位址
- **language** - 网站使用的语言（[IETF 格式][1]，例如繁体中文为 `zh-TW`）

### 网址

- **url** - 网站网址
- **root** - 网站的根目录。假设 `url` 为 `http://yoursite.com/child`，则 `root` 为 `/child/`。
- **permalink** - 文章的固定连接（[设定][2]）
- **tag_dir** - 标签文件夹
- **archive_dir** - 存档列表文件夹
- **category_dir** - 分类文件夹

### 写作

- **new_post_name** - 新文章的文件名（[设定][7]）
- **default_layout** - 预设布局
- **auto_spacing** - 在东方文字与西方文字之间插入空白
- **titlecase** - 将标题转为合适的大小写
- **max_open_file** - 最大同时处理文件数量
- **filename_case** - 转换文件名称为 (1) 小写 (2) 大写
- **highlight** - 代码区块设定
  - **enable** - 启用代码 Highlight
  - **backtick_code_block** - 启用 [Backtick Code Block][6]
  - **line_number** - 显示行号
  - **tab_replace** - 取代 Tab

### 分类 & 标签

- **default_category** - 预设分类
- **category_map** - 分类别名
- **tag_map** - 标签别名

### 存档列表

`2` - 开启列表的分页功能
`1` - 关闭列表的分页功能
`0` - 完全关闭

- **archive**
- **category**
- **tag**

### 服务器

- **port** - 服务器连接端口
- **logger** - 启用服务器记录
- **logger_format** - 服务器记录的格式（[Connect][3]）

### 日期 / 时间格式

Hexo 使用 Moment.js 解析和显示日期。（[Moment.js][4]）

- **date_format** - 日期格式
- **time_format** - 时间格式

### 分页

- **per_page** - 每页显示的文章数量（0 代表关闭分页功能）
- **pagination_dir** - 分页文件夹

### Disqus

- **disqus_shortname** - [Disqus][5] 的 Shortname

### 扩充套件

- **themes** - 目前使用的主题
- **exclude_generator** - 要关闭的 Generator（archive, category, home, page, post, tag）

### 部署

- **type** - 部署类型

其他设定请依照各个布局扩展调整设定。

## 预设值

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