---
layout: page
title: 外掛
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 使用

### 安裝

執行以下指令。

``` bash
npm install <plugin-name> --save
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

## Generator

- [hexo-generator-feed] - RSS Feed
- [hexo-generator-sitemap] - Sitemap

## Renderer

- [hexo-renderer-coffeescript] - CoffeeScript
- [hexo-renderer-discount] - Discount
- [hexo-renderer-haml] - Haml
- [hexo-renderer-jade] - Jade
- [hexo-renderer-less] - Less

## Migrator

- [hexo-migrator-rss] - RSS
- [hexo-migrator-wordpress] - WordPress

## 開發

參考 [外掛開發](../docs/plugin-development.html) 以獲得更多資訊。若想要將你開發的外掛列於此頁面，請在 [Wiki] 中加入你的外掛。

[hexo-generator-feed]: https://github.com/tommy351/hexo-plugins/tree/master/generator/feed
[hexo-generator-sitemap]: https://github.com/tommy351/hexo-plugins/tree/master/generator/sitemap
[hexo-renderer-coffeescript]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/coffeescript
[hexo-renderer-haml]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/haml
[hexo-renderer-jade]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/jade
[hexo-renderer-less]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/less
[hexo-migrator-rss]: https://github.com/tommy351/hexo-plugins/tree/master/migrator/rss
[hexo-migrator-wordpress]: https://github.com/tommy351/hexo-plugins/tree/master/migrator/wordpress
[hexo-renderer-discount]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/discount
[Wiki]: https://github.com/tommy351/hexo/wiki/Plugins