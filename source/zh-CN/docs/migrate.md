---
layout: page
title: 迁移
lang: zh-CN
date: 2013-02-18 19:40:47
---

## 目录

- [RSS](#rss)
- [Jekyll / Octopress](#jekyll)
- [WordPress](#wordpress)

<a id="rss"></a>
## RSS

首先，执行以下指令安装 RSS Migrator 插件，并在`_config.yml`中的`plugins`栏位加入`hexo-migrator-rss`。

``` plain
npm install hexo-migrator-rss
```

安装完毕后，执行以下指令即可，`source`参数可为文件路径或网址。

	hexo migrate rss <source>

<a id="jekyll"></a>
## Jekyll / Octopress

将`source/_posts`内的档桉拷贝至Hexo的`source/_posts`内，并将文章内的`categories`属性修改为`tags`。

然后调整 `_config.yml` 中的 `new_post_name` 为 `:year-:month-:day-:title.md`。

<a id="wordpress"></a>
## WordPress

首先，执行以下指令安装 WordPress Migrator 插件，并在`_config.yml`中的`plugins`栏位加入`hexo-migrator-wordpress`。

``` plain
npm install hexo-migrator-wordpress
```

安装完毕后，执行以下指令即可，`source`参数可为文件路径或网址。

	hexo migrate wordpress <source>