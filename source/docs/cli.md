---
layout: page
title: Command-line Interface (CLI)
date: 2012-11-01 18:13:30
---

Display current version of Hexo

	hexo version

Setup website. If `folder` is not defined, Hexo will setup website at current directory.

	hexo init [folder]

Create a new article

	hexo new [layout] <title>

Generate static files.

- -d/--deploy: Deploy automatically after generate
- -w/--watch: Watch file changes

```
hexo generate
```

Start server. Press `Ctrl+C` to stop it.

- -p/--port: Port setting
- -s/--static: Only serve static files

```
hexo server
hexo server -p 12345
```

Display configuration of the site

	hexo config

Deploy

- --setup: Setup without deployment
- --generate: Generate before deployment

```
hexo deploy
```

Safe mode. Plugins will not be loaded in this mode.

	hexo --safe

Debug mode.

	hexo --debug