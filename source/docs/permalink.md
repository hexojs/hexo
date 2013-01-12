---
layout: page
title: Permalink
date: 2012-11-01 18:13:30
---

## Configure

Edit `permalink` in `_config.yml`. Here is the default:

``` plain
permalink: :year/:month/:day/:title/
```

You can add the following variables in the permalink. Only the variables started with `:` is valid.

- **year** - 4-digit year
- **month** - 2-digit month
- **day** - 2-digit date
- **title** - The filename of the post
- **category** - The category of the post. (Relative path to `source/_posts`) If the post is uncategorized, it will be `category_dir` in `_config.yml`.

*(The date is based on the date set in the post)*

## Example

Given a post named `title.md` in `source/_posts/foo/bar` directory with the following content:

``` plain
---
title: Post Title
date: 2012-10-09 14:09:37
tags:
- Node.js
- JavaScript
---
```

And here is the result:

``` plain
:year/:month/:day/:title/ => /2012/10/09/title/
:year-:month-:day/:title/ => /2012-10-09/title/
:category/:title/ => /foo/bar/title/
```