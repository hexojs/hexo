---
layout: index
title: Node.js 網誌框架
subtitle: 快速、簡單且功能強大的 <a href="http://nodejs.org">Node.js</a> 網誌框架。
date: 2012-11-01 18:13:30
lang: zh-TW
---

## 功能

- 不可思議的快速 ─ 只要一眨眼靜態檔案即生成完成
- 支援 [Markdown]
- 僅需一道指令即可佈署到 [GitHub Pages] 和 [Heroku]
- 已移植 [Octopress] 外掛
- 高擴展性、自訂性
- 相容於 Windows, Mac & Linux

## 安裝

``` bash
npm install -g hexo
```
	
## 開始

建立專案：

``` bash
hexo init project && cd project
```
	
建立新文章：

``` bash
hexo new_post title
```
	
生成靜態檔案：

``` bash
hexo generate
```
	
啟動伺服器：

``` bash
hexo server
```
	
## 下一步

有興趣嗎？瀏覽 [文件](docs) 瞭解如何使用！

[Markdown]: http://daringfireball.net/projects/markdown/
[GitHub Pages]: http://pages.github.com/
[Heroku]: http://heroku.com/
[Octopress]: http://octopress.org/