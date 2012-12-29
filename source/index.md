---
layout: index
title: Node.js blog framework
subtitle: A fast, simple & powerful blog framework, powered by Node.js.
date: 2012-11-01 18:13:30
---

## Features

- Incredibly fast - generate static files in a glance
- [Markdown][1] support
- Deploy to [GitHub Pages][2] & [Heroku][3] with only one command
- Ported [Octopress][4] plugins
- High extendibility & customizability
- Compatible with Windows, Mac & Linux

## Install

``` bash
npm install -g hexo
```

## Update

``` bash
npm update -g
```
	
## Getting Started

Setup a project:

``` bash
hexo init project && cd project
```
	
Create a new article:

``` bash
hexo new_post title
```
	
Generate static files:

``` bash
hexo generate
```
	
Start the server:

``` bash
hexo server
```
	
## Next Step

Interested? Check the [documentation][5] for more info!

[1]: http://daringfireball.net/projects/markdown/
[2]: http://pages.github.com/
[3]: http://heroku.com/
[4]: http://octopress.org/
[5]: docs/