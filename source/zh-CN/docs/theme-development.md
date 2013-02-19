---
layout: page
title: 主题开发
lang: zh-CN
date: 2013-02-18 18:58:52
---

## 结构

``` plain
|-- _config.yml
|-- languages
|-- layout
|-- source
```

### _config.yml

主题的设定文件。

参考：[设定][1]

### languages

主题的语言文件。

参考：[国际化（i18n）][2]

### layout

模板文件夹。你可使用 [EJS][4] 或 [Swig][5] 处理模版文件，或安装 [Renderer 插件][8] 以使用你喜爱的样板引擎。

基础布局：

- **archive** - 存档列表，若无此模板则使用 **index** 布局。
- **category** - 分类，若无此模板则使用 **archive** 布局。
- **index** - 首页
- **page** - 分页，若无此模板则使用 **index** 布局。
- **post** - 文章，若无此模板则使用 **index** 布局。
- **tag** - 标签，若无此模板则使用 **archive** 布局。

你也可以在主题中自定其他布局，例如`link`或`photo`之类的，若找不到自定的布局的话，则会根据 Generator 的不同，使用相对应的布局代替。

*（至少要有**index**布局）*

### source

源文件，CSS、JavaScript等文件（Asset）应放置于此文件夹。此文件夹内的文件在经过处理后会被复制至`public`文件夹，文件或文件夹名称开头为`.`（点）或`_`（底线）的会被忽略。

Hexo 内建 [Stylus][6] 及 [nib][7] 支持，你可安装 [Renderer 插件][8] 让 Hexo 支持更多文件格式。

## 参考

你可参考预设主题 [Light][3] 来制作主题。

[1]: configure.html
[2]: global-variables.html#i18n
[3]: https://github.com/tommy351/hexo-theme-light
[4]: https://github.com/visionmedia/ejs
[5]: http://paularmstrong.github.com/swig/
[6]: http://learnboost.github.com/stylus/
[7]: http://visionmedia.github.com/nib/
[8]: ../plugins/#renderer