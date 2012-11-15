---
layout: page
title: 遷移
lang: zh-TW
date: 2012-11-15 18:13:30
---

## 目錄

- [RSS](#rss)
- [Jekyll / Octopress](#jekyll)

<a id="rss"></a>
## RSS

首先，執行以下指令安裝 RSS Migrator 外掛，並在`_config.yml`中的`plugins`欄位加入`hexo-migrator-rss`。

``` bash
npm install hexo-migrator-rss
```

安裝完畢後，執行以下指令即可，`source`參數可為檔案路徑或網址。

``` bash
hexo migrate rss <source>
```

<a id="jekyll"></a>
## Jekyll / Octopress

將`source/_posts`內的檔案拷貝至Hexo的`source/_posts`內，並將文章內的`categories`屬性修改為`tags`即可。