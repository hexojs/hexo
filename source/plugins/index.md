---
layout: page
title: Plugins
date: 2012-11-01 18:13:30
---

## Usage

### Install

Execute the following command.

``` bash
npm install <plugin-name> --save
```

### Enable

Add plugin name to `plugins` in `_config.yml`.

``` plain
plugins:
- plugin-one
- plugin-name
```

### Disable

Remove plugin name from `plugins` in `_config.yml`.

``` plain
plugins:
- plugin-one
```

### Update

Execute the following command.

``` bash
npm update
```

### Uninstall

Execute the following command. Don't forget to disable the plugin before uninstalling.

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

## Development

Reference [plugin development](../docs/plugin-development.html) for more info. If you wanna your plugin listed in this page. Please add it to the [wiki].

[hexo-generator-feed]: https://github.com/tommy351/hexo-plugins/tree/master/generator/feed
[hexo-generator-sitemap]: https://github.com/tommy351/hexo-plugins/tree/master/generator/sitemap
[hexo-renderer-coffeescript]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/coffeescript
[hexo-renderer-haml]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/haml
[hexo-renderer-jade]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/jade
[hexo-renderer-less]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/less
[hexo-migrator-rss]: https://github.com/tommy351/hexo-plugins/tree/master/migrator/rss
[hexo-migrator-wordpress]: https://github.com/tommy351/hexo-plugins/tree/master/migrator/wordpress
[hexo-renderer-discount]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/discount
[wiki]: https://github.com/tommy351/hexo/wiki/Plugins