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

顯示網站設定

``` bash
hexo config
```

啟動伺服器，按下`Ctrl+C`停止伺服器

``` bash
hexo server
```

生成靜態檔案

``` bash
hexo generate
```

佈署

``` bash
hexo deploy
```

設定佈署

``` bash
hexo setup_deploy
```

建立新文章，檔案會放置於網站根目錄的`source/_posts/title.md`。

``` bash
hexo new_post <title>
```

建立新分頁，檔案會放至於網站根目錄的`source/title/index.md`。

``` bash
hexo new_page <title>
```