---
layout: page
title: Theme Development
date: 2012-11-01 18:13:30
---

## Structure

``` plain
|-- _config.yml
|-- languages
|-- layout
|-- source
```

### _config.yml

Theme configuration file.

Reference: [Configure][1]

### languages

Folder of language files.

Reference: [Internationalization (i18n)][2]

### layout

Layout folder. You can use [EJS][4] or [Swig][5] to render template files, or install [renderer plugins][8] to use the template engine you like.

Basic layouts:

- **archive** - Archives, use **index** layout instead if not exist
- **category** - Category archives, use **archive** layout instead if not exist
- **index** - Home page
- **page** - Page, use **index** layout instead if not exist
- **post** - Post, use **index** layout instead if not exist
- **tag** - Tag archives, use **archive** layout instead if not exist

You can customize other layouts such as `link` or `photo`. If the custom layout not found, it'll use other layout based on generators.

*（**index** layout at least）*

### source

Source files folder. CSS, JavaScript and other files (Asset) should be placed in this folder. The files in this folder will be processed and copied to `public` folder. File or folder whose name started with `.` (dot) or `_` (underscore) will be ignored.

Hexo supports [Stylus][6] & [nib][7]. You can install [renderer plugins][8] to add more support for Hexo.

## Reference

Reference the default theme [Light][3] to make your theme.

[1]: configure.html
[2]: global-variables.html#i18n
[3]: https://github.com/tommy351/hexo-theme-light
[4]: https://github.com/visionmedia/ejs
[5]: http://paularmstrong.github.com/swig/
[6]: http://learnboost.github.com/stylus/
[7]: http://visionmedia.github.com/nib/
[8]: ../plugins/#renderer