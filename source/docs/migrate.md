---
layout: page
title: Migrate
date: 2012-11-15 18:13:30
---

## Contents

- [RSS](#rss)
- [Jekyll / Octopress](#jekyll)

<a id="rss"></a>
## RSS

First, execute the following command to install RSS migrator plugin, and add `hexo-migrator-rss` in `plugins` field in `_config.yml`.

``` bash
npm install hexo-migrator-rss
```

After installed, execute the following command to migrate. `source` argument can be file path or URL.

``` bash
hexo migrate rss <source>
```

<a id="jekyll"></a>
## Jekyll / Octopress

Move files in `source/_posts` to `source/_posts` of Hexo, and modify `categories` field of articles to `tags`.