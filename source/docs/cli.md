---
layout: page
title: Command-line Interface (CLI)
date: 2012-11-01 18:13:30
---

Display current version of Hexo

	hexo -v
	hexo --version
	hexo ver
	hexo version

Setup website. If `folder` is not defined, Hexo will setup website at current directory.

	hexo init <folder>

Create a new post

	hexo new_post <title>

Create a new page

	hexo new_page <title>

Generate static files. Use `-t` or `--theme` to skip theme installation.

	hexo generate
	hexo generate -t/--theme

Start server. Press `Ctrl+C` to stop it.

	hexo server

Display configuration of the site

	hexo config

Deploy

	hexo deploy

Setup deploy

	hexo setup_deploy

Render a file

	hexo render <source> <destination>

Safe mode. Plugins will not be loaded in this mode.

	hexo --safe

Debug mode.

	hexo --debug