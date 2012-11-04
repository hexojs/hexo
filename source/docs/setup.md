---
layout: page
title: Setup
date: 2012-11-01 18:13:30
---

After the installation is done, execute the following command, Hexo will build all necessary files for the website.

``` bash
hexo init <folder>
```

After the files are built, the structure of folder will look like this.

``` yaml
|-- .gitignore
|-- _config.yml
|-- package.json
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

Application data. **Do not delete it.** If you had deleted it, rebuilt with the following content manually.

{% code package.json %}
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
{% endcode %}

### source

The files in this folder will be processed and saved in `public` folder. File or Folder whose name started with `.` or `_` will be ignored except `_posts` folder.

### themes

Theme folder. The default theme of Hexo is [Light].

[Light]: https://github.com/tommy351/hexo-theme-light