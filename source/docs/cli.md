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

Create a new post

``` bash
hexo new_post <title>
```

Create a new page

``` bash
hexo new_page <title>
```

Generate static files. Use `-t` or `--theme` to skip theme installation.

``` bash
hexo generate
hexo generate -t/--theme
```

Start server. Press `Ctrl+C` to stop it.

``` bash
hexo server
```

Display configuration of the site

``` bash
hexo config
```

Deploy

``` bash
hexo deploy
```

Setup deploy

``` bash
hexo setup_deploy
```

Safe mode. Plugins will not be loaded in this mode.

``` bash
hexo --safe
```

Debug mode.

``` bash
hexo --debug
```