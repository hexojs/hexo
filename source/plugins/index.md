---
layout: page
title: Plugins
date: 2012-11-01 18:13:30
---

## Contents

- [Usage](#usage)
- [Generator](#generator)
- [Renderer](#renderer)
- [Helper](#helper)
- [Deployer](#deployer)
- [Processor](#processor)
- [Tag](#tag)
- [Console](#console)
- [Migrator](#migrator)
- [Development](#development)

<a id="usage"></a>
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

<a id="generator"></a>
## Generator

Generator is used to generate static files.

- [hexo-generator-feed] - RSS Feed
- [hexo-generator-sitemap] - Sitemap

<a id="renderer"></a>
## Renderer

Renderer is used to process specific files.

- [hexo-renderer-coffeescript] - CoffeeScript
- [hexo-renderer-haml] - Haml
- [hexo-renderer-jade] - Jade
- [hexo-renderer-less] - Less

<a id="helper"></a>
## Helper

Helper is the function used in articles.

<a id="deployer"></a>
## Deployer

Deployer is used to deploy.

<a id="processor"></a>
## Processor

Processor is used to process source files.

<a id="tag"></a>
## Tag

Tag is the function used in articles.

<a id="console"></a>
## Console

Console allows you to execute commands in command-line interface (CLI).

<a id="migrator"></a>
## Migrator

Migrator helps you migrate from other system easily.

- [hexo-migrator-rss] - RSS

<a id="development"></a>
## Development

Reference [plugin development](../docs/plugin-development.html) for more info.

If you wanna your plugin listed in this page. Please add it to the [wiki].

[hexo-generator-feed]: https://github.com/tommy351/hexo-plugins/tree/master/generator/feed
[hexo-generator-sitemap]: https://github.com/tommy351/hexo-plugins/tree/master/generator/sitemap
[hexo-renderer-coffeescript]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/coffeescript
[hexo-renderer-haml]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/haml
[hexo-renderer-jade]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/jade
[hexo-renderer-less]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/less
[hexo-migrator-rss]: https://github.com/tommy351/hexo-plugins/tree/master/migrator/rss
[wiki]: https://github.com/tommy351/hexo/wiki/Plugins