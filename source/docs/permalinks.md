title: Permalinks
prev: deployment
next: themes
---
You can specify the permalinks for your site in `_config.yml` or in the front-matter for each post.

### Variables

Variable | Description
--- | ---
`:year` | Published year of posts (4-digit)
`:month` | Published month of posts (2-digit)
`:day` | Published day of posts (2-digit)
`:title` | Filename
`:id` | Post ID
`:category` | Categories. If the post is uncategorized, it'll be `category_dir` setting.

### Examples

Given a post named `hello-world.md` in `source/_posts` folder with   the following content.

``` yaml
title: Hello World
date: 2013-07-14 17:01:34
categories: 
- foo
- bar
```

Setting | Result
--- | ---
`:year/:month/:day/:title/` | 2013/07/14/hello-world
`:year-:month-:day-:title.html` | 2013-07-14-hello-world.html
`:category/:title` | foo/bar/hello-world