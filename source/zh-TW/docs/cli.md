---
layout: page
title: 命令列介面 (CLI)
lang: zh-TW
date: 2012-11-01 18:13:30
---

顯示 Hexo 目前的版本號

``` bash
hexo -v
hexo --version
hexo ver
hexo version
```

建立網站，若`folder`未定義，則Hexo會在目前的資料夾建立網站

``` bash
hexo init <folder>
```

建立新文章

``` bash
hexo new_post <title>
```

建立新分頁

``` bash
hexo new_page <title>
```

生成靜態檔案，使用`-t`或`--theme`以忽略主題安裝

``` bash
hexo generate
hexo generate -t/--theme
```

啟動伺服器，按下`Ctrl+C`停止伺服器

``` bash
hexo server
```

顯示網站設定

``` bash
hexo config
```

佈署

``` bash
hexo deploy
```

設定佈署

``` bash
hexo setup_deploy
```

渲染檔案

``` bash
hexo render <source> <destination>
```

安全模式，此模式下外掛不會被載入

``` bash
hexo --safe
```

除錯模式

``` bash
hexo --debug
```