---
layout: page
title: 命令列介面 (CLI)
lang: zh-TW
date: 2012-11-01 18:13:30
---

顯示 Hexo 目前的版本號

	hexo -v
	hexo --version
	hexo ver
	hexo version

建立網站，若`folder`未定義，則Hexo會在目前的資料夾建立網站

	hexo init <folder>

建立新文章

	hexo new_post <title>

建立新分頁

	hexo new_page <title>

生成靜態檔案，使用`-t`或`--theme`以忽略主題安裝

	hexo generate
	hexo generate -t/--theme

啟動伺服器，按下`Ctrl+C`停止伺服器

	hexo server

顯示網站設定

	hexo config

佈署

	hexo deploy

設定佈署

	hexo setup_deploy

渲染檔案

	hexo render <source> <destination>

安全模式，此模式下外掛不會被載入

	hexo --safe

除錯模式

	hexo --debug