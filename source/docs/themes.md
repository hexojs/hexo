title: Themes
prev: permalinks
next: variables
---
Hexo uses [EJS] to process theme layout by default. You can use [helpers](helpers.html) to insert specified content quickly. It's recommended to enable debug mode in development. All layouts and source files will be updated automatically in debug mode.

``` bash
$ hexo server --debug
```

## Structure

``` plain
.
├── _config.yml
├── languages
├── layout
└── source
```

### _config.yml

Theme configuration file.

### languages

Folder of language files.

### layout

Layout folder. File or folder whose name is prefixed with `_` (underscore) and hidden files will be ignored.

Hexo provides [EJS] and [Swig](http://paularmstrong.github.com/swig/) template engine. You can install other template engines such as Haml, Jade. Hexo chooses template engines based on the extension name of files. For example:

``` plain
EJS: layout.ejs
Swig: layout.swig
```

Every theme should at least has `index` layout.

Layout | Description | Fallback
--- | --- | ---
`index` | Index layout | 
`post` | Post layout | `index`
`page` | Page layout | `index`
`archive` | Archives layout | `index`
`category` | Category archives layout | `archive`
`tag` | Tag archives layout | `archive`

Hexo supports **Layout** and **Partials**. Every template file use `layout.ejs` as layout by default. You can set `layout: false` in front-matter or delete `layout.ejs` to disable the layout.

{% note info Custom layout %}
If you set a custom for your posts. You have to add a new layout file in `layout` folder or it'll fallback to `post` layout. Page variables in the custom layout is same as `post` layout.
{% endnote %}

### source

Source folder. Asset files like CSS and Javascript files should be placed in this folder. File or folder whose name is prefixed with `_` (underscore) and hidden files will be ignored. Stylus files will be processed and put into `public` folder, while other files will be copied.

Hexo supports [Stylus](http://learnboost.github.com/stylus/) and [nib](http://visionmedia.github.com/nib/). You can install other plugins such as Less, CoffeeScript.

{% note info Get config in Stylus File %}
You can get global and theme configuration by using `hexo-config(key)` in stylus file.
{% endnote %}

[EJS]: https://github.com/visionmedia/ejs