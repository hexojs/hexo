---
layout: page
title: Command-line Interface (CLI)
date: 2012-11-01 18:13:30
---

Display current version of Hexo

``` plain
hexo version
```

Setup website. If `folder` is not defined, Hexo will setup website at current directory.

``` plain
hexo init [folder]
```

Create a new article

``` plain
hexo new [layout] <title>
```

Generate static files.

- -d/--deploy: Deploy automatically after generate
- -w/--watch: Watch file changes

``` plain
hexo generate
```

Start server. Press `Ctrl+C` to stop it.

- -p/--port: Port setting
- -s/--static: Only serve static files

``` plain
hexo server
```

Display configuration of the site

``` plain
hexo config
```

Deploy

- --setup: Setup without deployment
- --generate: Generate before deployment

``` plain
hexo deploy
```

Render

- -o/--output: Output path

``` plain
hexo render
```

Safe mode. Plugins will not be loaded in this mode.

``` plain
hexo --safe
```

Debug mode.

``` plain
hexo --debug
```