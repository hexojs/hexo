---
layout: page
title: 建立
lang: zh-CN
date: 2013-02-18 19:12:17
---

安装完成后，在你喜爱的文件夹下，执行以下指令，Hexo 即会自动在目标文件夹建立网站所需要的所有文件。

``` bash
hexo init <folder>
```

建立完成后，文件夹结构如下：

``` plain
|-- .gitignore
|-- _config.yml
|-- package.json
|-- public
|-- scaffolds
|-- scripts
|-- source
|   |-- _posts
        |-- hello-world.md
|   |-- _drafts
|-- themes
    |-- light
```

### _config.yml

全站的设定文件。

### package.json

应用程式资料。**请勿删除**，若不幸删除，请依照以下内容重建文件。

``` json
{
  "name": "hexo",
  "version": "0.0.1",
  "private": true,
  "engines": {
    "node": ">0.6.0",
    "npm": ">1.1.0"
  },
  "dependencies": {}
}
```

### public

静态文件夹。

### scaffolds

[骨架][2] 文件夹。

### scripts

[脚本][3] 文件夹。

### source

在此文件夹内的文件会被处理并另存至`public`文件夹。名称开头为`.`（点）或`_`（底线）的文件或文件夹会被忽略，除了`_posts`文件夹以外。

### themes

主题文件夹。Hexo 的预设主题为 [Light][1]。

[1]: https://github.com/tommy351/hexo-theme-light
[2]: writing.html
[3]: scripts.html