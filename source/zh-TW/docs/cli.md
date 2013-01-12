---
layout: page
title: 命令列介面 (CLI)
lang: zh-TW
date: 2012-11-01 18:13:30
---

顯示 Hexo 目前的版本號

	hexo version

建立網站，若`folder`未定義，則Hexo會在目前的資料夾建立網站

	hexo init <folder>

建立新文章

	hexo new [layout] <title>

生成靜態檔案，使用`-t`或`--theme`以忽略主題安裝

- -t/--theme：忽略主題安裝
- -d/--deploy：生成後自動佈署
- -w/--watch：監視檔案變更

```
hexo generate
hexo generate -t/--theme
hexo generate -d/--deploy
hexo generate -w/--watch
```

啟動伺服器，按下`Ctrl+C`停止伺服器

- -p/--port：連接埠設定

```
hexo server
hexo server -p 12345
```

預覽，按下`Ctrl+C`停止伺服器

- -p/--port：連接埠設定
- -w/--watch：監視檔案變更

```
hexo preview
hexo preview -p 12345
```

顯示網站設定

	hexo config

佈署

- --setup：只設定不佈署
- --generate：佈署前先生成檔案

```
hexo deploy
hexo deploy --setup
hexo deploy --generate
```

渲染檔案

	hexo render <source> <destination>

安全模式，此模式下外掛不會被載入

	hexo --safe

除錯模式

	hexo --debug