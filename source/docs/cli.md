---
layout: page
title: Command-line Interface (CLI)
date: 2012-11-01 18:13:30
---

Display current version of Hexo

``` bash
hexo -v
hexo --version
hexo ver
hexo version
```

Setup website. If `folder` is not defined, Hexo will setup website at current directory.

``` bash
hexo init <folder>
```

Display configuration of the website

``` bash
hexo config
```

Start server. Press `Ctrl+C` to stop it.

``` bash
hexo server
```

Generate static files

``` bash
hexo generate
```

Deploy

``` bash
hexo deploy
```

Setup deploy

``` bash
hexo setup_deploy
```

Create a new post. File will be saved at `source/_posts/title.md` in the root directory.

``` bash
hexo new_post <title>
```

Create a new page. File will be saved at `source/title/index.md` in the root directory.

``` bash
hexo new_page <title>
```