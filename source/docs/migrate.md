---
layout: page
title: Migrate
date: 2012-11-15 18:13:30
---

## Contents

- [RSS](#rss)
- [Jekyll / Octopress](#jekyll)
- [WordPress](#wordpress)

<a id="rss"></a>
## RSS

First, execute the following command to install RSS migrator plugin, and add `hexo-migrator-rss` in `plugins` field in `_config.yml`.

``` plain
npm install hexo-migrator-rss
```

After installed, execute the following command to migrate. `source` argument can be file path or URL.

``` plain
hexo migrate rss <source>
```

<a id="jekyll"></a>
## Jekyll / Octopress

Move files in `source/_posts` to `source/_posts` of Hexo, and modify `categories` field of articles to `tags`.

<a id="wordpress"></a>
## WordPress

First, execute the following command to install WordPress migrator plugin, and add `hexo-migrator-wordpress` in `plugins` field in `_config.yml`.

``` plain
npm install hexo-migrator-wordpress
```

After installed, execute the following command to migrate. `source` argument can be file path or URL.

``` plain
hexo migrate wordpress <source>
```