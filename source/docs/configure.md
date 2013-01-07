---
layout: page
title: Configure
date: 2012-11-01 18:13:30
---

The global configuration file is saved at `_config.yml` in the root directory of the website.

## Configure

### Basics

- **title** - Website title
- **subtitle** - Website subtitle
- **description** - Website description
- **url** - Website URL
- **author** - The author of the website
- **email** - Email address of the author
- **language** - The language used in the website ([IETF format][1]. e.g. Traditional Chinese is `zh-TW`)

### Permalink

- **root** - The root directory of the website. For example, given `url` is `http://yoursite.com/child`, then `root` is `/child/`.
- **permalink** - The URL format of articles ([Configure][2])
- **tag_dir** - Tag directory
- **archive_dir** - Archive directory
- **category_dir** - The default name of category
- **new_post_name** - Filename of new post

#### new_post_name

- `:title` - Post title and default URL of the post
- `:year` - Published year of the post (4-digit)
- `:month` - Published month of the post (2-digit)
- `:day` - Published date of the post (2-digit)

e.g. Octopress style file name: `:year-:month-:day-:title.md`

### Archive

`2` - Enable pagination
`1` - Disable pagination

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

- **plugins** - The plugins to enable
- **themes** - Current theme
- **exclude_generator** - The generators to disable(archive, category, home, page, post, tag)

### Enhancements

- **auto_spacing** - Add spacing between Chinese, Japanese and western language, number, punctuation
- **titlecase** - Transform title into proper title capitalization

### Deployment

- **type** - Deployment type

Configure settings according to the deployment plugin you used.

## Default

``` yaml
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
```

[1]: http://www.w3.org/International/articles/language-tags/
[2]: permalink.html
[3]: http://www.senchalabs.org/connect/logger.html
[4]: http://momentjs.com/docs/#/displaying/format/
[5]: http://disqus.com/