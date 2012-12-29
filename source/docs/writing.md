---
layout: page
title: Writing
date: 2012-11-01 18:13:30
---

## Post

### Create

Execute the following command.

``` bash
hexo new_post <title>
```

The new post will be saved at `source/_posts/name.md` with the following content.

``` plain
---
layout: post
title: title
date: YYYY-MM-DD HH:mm:ss
comments: true
tags:
---
```

File name is based on `title` argument and `new_post_name` setting in `_config.yml`, title will be transformed into lower case, spaces will be transformed into dash. For example:

```
hexo new_post Test Post => source/_posts/test-post.md
```

### Configure

The beginning of article is a block wrapped with `---`, called [YAML Front Matter][1]. You can use YAML to configure posts.

The following is default configuration. You can modify them as you like.

- **layout** - Layout
- **title** - Title
- **date** - Published date (`YYYY-MM-DD HH:mm:ss`)
- **comments** - Comments
- **tags** - Tags
- **permalink** - Override default URL (Optional)

### Categories

Category is the relative path to `source/_posts`. It's hierarchical.

For example:

- `source/_posts/title.md` - Uncategorized
- `source/_posts/Fruits/title.md` - Fruit
- `source/_posts/Fruits/Apple/title.md` - Fruit, Apple

### Tags

``` yaml
# Single tag
tags: Apple

# Multiple tags
tags: [Apple, Banana]

tags:
- Apple
- Banana
```

## Page

### Create

Execute the following command.

``` bash
hexo new_page <title>
```

The new post will be saved at `source/name/index.md` with the following content.

``` plain
---
layout: page
title: title
date: YYYY-MM-DD HH:mm:ss
comments: true
---
```

File name is based on `title` argument, title will be transformed into lower case, spaces will be transformed into dash. For example:

```
hexo new_page Test Page => source/test-page/index.md
```

### Configure

The beginning of article is a block wrapped with `---`, called [YAML Front Matter][1]. You can use YAML to configure posts.

The following is default configuration. You can modify them as you like.

- **layout** - Layout
- **title** - Title
- **date** - Published date (`YYYY-MM-DD HH:mm:ss`)
- **comments** - Comments
- **permalink** - Override default URL (Optional)

## Generate Static Files

Execute the following command to transform articles into static files.

``` bash
hexo generate
```

After that, you can add `-t` or `--theme` after the command to ignore theme installation to make generating faster.

``` bash
hexo generate -t
hexo generate --theme
```

[1]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter