---
layout: page
title: 外掛
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 目錄

- [使用](#usage)
- [Generator](#generator)
- [Renderer](#renderer)
- [Helper](#helper)
- [Deployer](#deployer)
- [Processor](#processor)
- [Tag](#tag)
- [Console](#console)
- [Migrator](#migrator)
- [開發](#development)

<a id="usage"></a>
## 使用

### 安裝

執行以下指令。

``` bash
npm install <plugin-name>
```

### 啟用

在`_config.yml`的`plugins`欄位中加入外掛名稱。

``` plain
plugins:
- plugin-one
- plugin-name
```

### 停用

從`_config.yml`的`plugins`欄位中移除外掛名稱。

``` plain
plugins:
- plugin-one
```

### 更新

執行以下指令。

``` bash
npm update
```

### 移除

執行以下指令，在移除前別忘了先停用外掛。

``` bash
npm uninstall <plugin-name>
```

<a id="generator"></a>
## Generator

Generator用於生成靜態檔案。

- [hexo-generator-feed] - RSS Feed
- [hexo-generator-sitemap] - Sitemap

<a id="renderer"></a>
## Renderer

Renderer用於處理特定類型的檔案。

- [hexo-renderer-coffeescript] - CoffeeScript
- [hexo-renderer-haml] - Haml
- [hexo-renderer-jade] - Jade
- [hexo-renderer-less] - Less

<a id="helper"></a>
## Helper

Helper為模版檔案中使用的函數。

<a id="deployer"></a>
## Deployer

Deployer用於佈署檔案。

<a id="processor"></a>
## Processor

Processor用於處理原始檔案。

<a id="tag"></a>
## Tag

Tag為文章中使用的函數。

<a id="console"></a>
## Console

Console可讓你在命令列介面（CLI）中執行指令。

<a id="migrator"></a>
## Migrator

Migrator讓你輕鬆地從其他系統遷移。

- [hexo-migrator-rss] - RSS

<a id="development"></a>
## 開發

參考 [外掛開發](../docs/plugin-development.html) 以獲得更多資訊。

若想要將你開發的外掛列於此頁面，請在 [Wiki] 中加入你的外掛。

[hexo-generator-feed]: https://github.com/tommy351/hexo-plugins/tree/master/generator/feed
[hexo-generator-sitemap]: https://github.com/tommy351/hexo-plugins/tree/master/generator/sitemap
[hexo-renderer-coffeescript]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/coffeescript
[hexo-renderer-haml]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/haml
[hexo-renderer-jade]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/jade
[hexo-renderer-less]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/less
[hexo-migrator-rss]: https://github.com/tommy351/hexo-plugins/tree/master/migrator/rss
[Wiki]: https://github.com/tommy351/hexo/wiki/Plugins