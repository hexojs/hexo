title: Configuration
prev: setup
next: commands
---
You can modify most of options in `_config.yml`.

## Configuration

### Site

Setting | Description
--- | ---
`title` | The title of your website
`subtitle` | The subtitle of your website
`description` | The description of your website
`author` | Your name
`email` | Your email address
`language` | The language used in your website. Use [IETF format](http://www.w3.org/International/articles/language-tags/). (e.g. Traditional Chinese: `zh-TW`)

### URL

Setting | Description | Default
--- | --- | ---
`url` | The URL of your website | 
`root` | The root directory of your website | 
`permalink` | The [permalink](permalinks.html) format of articles | :year/:month/:day/:title/
`tag_dir` | Tag directory | tags
`archive_dir` | Archive directory | archives
`category_dir` | Category directory | categories
`code_dir` | Include code directory | downloads/code

{% note info Website in subdirectory %}
If your website is put in subdirectory such as `http://yoursite.com/blog`.   Set `url` as `http://yoursite.com/blog` and `root` as `/blog/`.
{% endnote %}

### Writing

Setting | Description | Default
--- | --- | ---
`new_post_name` | The filename of the new post | :title.md
`default_layout` | Default layout | post
`auto_spacing` | Add a space between eastern and western characters | false
`titlecase` | Transform title into proper title case | false
`external_link` | Open external links in new tab | true
`max_open_file` | Maximum synchronous I/O when generating files | 100
`multi_thread` | Enable multi-thread generating | true
`filename_case` | Transform filename into (1) lower case or (2) upper case | 0
`highlight` | Code block settings | 

### Category & Tag

Setting | Description | Default
--- | --- | ---
`default_category` | Default category | uncategorized
`category_map` | Category slugs | 
`tag_map` | Tag slugs | 

### Archives

Setting | Description | Default
--- | --- | ---
`archive` | 2: Enable pagination, 1: Disable pagination, 0: Fully disable | 2
`category` | 2: Enable pagination, 1: Disable pagination, 0: Fully disable | 2
`tag` | 2: Enable pagination, 1: Disable pagination, 0: Fully disable | 2

### Server

Setting | Description | Default
--- | --- | ---
`port` | Server port | 4000
`logger` | Display request info on the console. Always enabled in debug mode. | false
`logger_format` | Logger format | 

### Date / Time format

Hexo uses [Moment.js](http://momentjs.com/) to parse and display date.

Setting | Description | Default
--- | --- | ---
`date_format` | Date format | MMM D YYYY
`time_format` | Time format | H:mm:ss

### Pagination

Setting | Description | Default
--- | --- | ---
`per_page` | The amount of the posts displayed in a single page (0 = Disable pagination) | 10
`pagination_dir` | Pagination directory | page

### Comment

Setting | Description
--- | ---
`disqus_shortname` | [Disqus](http://disqus.com/) shortname

### Extensions

Setting | Description
--- | ---
`theme` | Current theme
`exclude_generator` | Disabled generators (archive, category, home, page, post, tag)

{% note warn YAML format %}
Don't use tabs in configuration files, use spaces instead. Also, add a space after colons. Configuration files parsing error may cause Hexo can't run properly.
{% endnote %}

## Default Configuration

``` yaml
title: Hexo
subtitle:
description:
author: John Doe
email:
language:

url: http://yoursite.com
root: /
permalink: :year/:month/:day/:title/
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code

new_post_name: :title.md
default_layout: post
auto_spacing: false
titlecase: false
max_open_file: 100
multi_thread: true
filename_case: 0
highlight:
  enable: true
  line_number: true
  tab_replace:

default_category: uncategorized
category_map:
tag_map:

archive: 2
category: 2
tag: 2

port: 4000
logger: false
logger_format:

date_format: MMM D YYYY
time_format: H:mm:ss

per_page: 10
pagination_dir: page

disqus_shortname:

theme: light
exclude_generator:

deploy:
  type:
```