---
layout: page
title: Command-line Interface (CLI)
date: 2012-11-01 18:13:30
---

Display current version of Hexo

	hexo version

Setup website. If `folder` is not defined, Hexo will setup website at current directory.

	hexo init <folder>

Create a new article

	hexo new [layout] <title>

Generate static files.

- -t/--theme: Skip theme installation
- -d/--deploy: Deploy automatically after generate

```
hexo generate
hexo generate -t/--theme
hexo generate -d/--deploy
```

Start server. Press `Ctrl+C` to stop it.

- -p: Port setting

```
hexo server
hexo server -p 12345
```
	
Preview. Press `Ctrl+C` to stop it.

- -p: Port setting

```
hexo preview
hexo preview -p 12345
```

Display configuration of the site

	hexo config

Deploy

- --setup: Setup without deployment
- --generate: Generate before deployment

```
hexo deploy
hexo deploy --setup
hexo deploy --generate
```

Render a file

	hexo render <source> <destination>

Safe mode. Plugins will not be loaded in this mode.

	hexo --safe

Debug mode.

	hexo --debug