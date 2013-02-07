---
layout: page
title: Configure
date: 2012-11-01 18:13:30
---

The global configuration file is saved at `_config.yml` in the root directory of the website.

## Configure

### Site

- **title** - Website title
- **subtitle** - Website subtitle
- **description** - Website description
- **author** - The author of the website
- **email** - Email address of the author
- **language** - The language used in the website ([IETF format][1]. e.g. Traditional Chinese is `zh-TW`)

### URL

- **url** - Website URL
- **root** - The root directory of the website. For example, given `url` is `http://yoursite.com/child`, then `root` is `/child/`.
- **permalink** - The URL format of articles ([Configure][2])
- **tag_dir** - Tag directory
- **archive_dir** - Archive directory
- **category_dir** - Category directory

### Writing

- **new_post_name** - Filename of new post ([Configure][7])
- **default_layout** - Default layout
- **auto_spacing** - Add spaces between eastern and wastern characters
- **titlecase** - Transform title into title case
- **max_open_file** - Synchronous I/O maximum
- **filename_case** - Transform file name into (1) lower case (2) uppercase
- **highlight** - Code block settings
  - **enable** - Enable code highlight
  - **backtick_code_block** - Enable [Backtick Code Block][6]
  - **line_number** - Display line numbers
  - **tab_replace** - Tab replacement
  
### Category & Tag

- **default_category** - Default category
- **category_map** - Category slugs
- **tag_map** - Tag slugs

### Archive

`2` - Enable pagination  
`1` - Disable pagination  
`0` - Fully disable

- **archive**
- **category**
- **tag**

### Server

- **port** - Server port
- **logger** - Enable logger for server
- **logger_format** - The format of logger ([Connect][3])

### Date / Time Format

Hexo uses Moment.js to parse and display date. ([Moment.js][4])

- **date_format** - Date format
- **time_format** - Time format

### Pagination

- **per_page** - The amount of the posts displayed in a single page(0 = Disable)
- **pagination_dir** - Pagination directory

### Disqus

- **disqus_shortname** - [Disqus][5] shortname

### Extensions

- **themes** - Current theme
- **exclude_generator** - The generators to disable(archive, category, home, page, post, tag)

### Deployment

- **type** - Deployment type

Configure settings according to the deployment plugin you used.

## Default

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
  type:```

[1]: http://www.w3.org/International/articles/language-tags/
[2]: permalink.html
[3]: http://www.senchalabs.org/connect/logger.html
[4]: http://momentjs.com/docs/#/displaying/format/
[5]: http://disqus.com/
[6]: tag-plugins.html
[7]: writing.html