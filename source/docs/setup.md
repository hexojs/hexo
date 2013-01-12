---
layout: page
title: Setup
date: 2012-11-01 18:13:30
---

After installed, execute the following command in the folder you want. Hexo will build all files you need in the target folder.

``` bash
hexo init <folder>
```

After built, here's how the folder looks like:

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

Global configuration file.

### package.json

Application data. **Don't delete it.** If you deleted it unfortunately, rebuild the file with the following content.

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

Static file folder.

### scaffolds

[Scaffold][2] folder.

### scripts

[Script][3] folder.

### source

Files in this folder will be processed and saved in `public` folder. File or folder whose name started with `.` (dot) or `_` (underscore) will be ignored except `_posts` folder.

### themes

Theme folder. The default theme of Hexo is [Light][1]。

[1]: https://github.com/tommy351/hexo-theme-light
[2]: writing.html
[3]: scripts.html