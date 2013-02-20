---
layout: page
title: 模板资料
lang: zh-CN
date: 2013-02-18 19:06:06
---

## 全局

- **[site](#site)** - 网站全局资料，由 [Processor][1] 所控制
- **[page](#page)** - 目前页面的资料，内容根据不同页面而有所差异，由 [Generator][2] 所控制
- **config** - [全局设定][3]，即`_config.yml`的内容
- **theme** - 主题设定，即主题文件夹内`_config.yml`的内容，根据不同主题而有所差异
- **__**（双底线） - 取得 [国际化（i18n）][9] 字串

<a id="site"></a>
## site

网站全局资料，在没有挂载其他扩展程序的情况下，**site**拥有以下内容：

- **posts** - 所有文章，根据发表日期降序排列
- **pages** - 所有分页，根据发表日期降序排列
- **categories** - 所有分类，根据字母顺序排列
- **tags** - 所有标签，根据字母顺序排列

**posts**, **pages** 为 [Collection][4] 事件

**categories**, **tags** 为 [Taxonomy][5] 事件

<a id="page"></a>
## page

目前页面的资料，内容根据不同页面而有所差异，以下仅列举内建Generator所拥有的page内容。

#### page, post

- **layout** - 文章布局
- **title** - 文章标题
- **date** - 文章的发布日期（[Moment.js][7] 库）
- **updated** - 文章的更新日期（[Moment.js][7] 库）
- **comments** - 开启此文章的留言功能
- **permalink** - 文章的固定连接
- **stats** - 文章的文件状态（[fs.Stats][8] 类别）
- **content** - 文章内文
- **excerpt** - 文章摘要（内文中 `<!-- more -->` 之前的内容）
- **source** - 原始文件路径
- **path** - 文章的相对路径

以及使用者在文章设定中所设定的其他变量。

page和post的差别不大，仅在于page没有`categories`和`tags`变量。

#### index

- 启用分页功能：[Paginator][6] 事件
- 关闭分页功能：[Taxonomy][5] 事件

#### archive

- 启用分页功能：[Paginator][6] 事件
- 关闭分页功能：[Taxonomy][5] 事件

以及以下变量：

- **archive** - 为`true`
- **year** - 年份
- **month** - 月份

#### category

- 启用分页功能：[Paginator][6] 事件
- 关闭分页功能：[Taxonomy][5] 事件

以及以下变量：

- **category** - 分类名称

#### tag

- 启用分页功能：[Paginator][6] 事件
- 关闭分页功能：[Taxonomy][5] 事件

以及以下变量：

- **tag** - 标签名称

[1]: plugin-development.html#processor
[2]: plugin-development.html#generator
[3]: configure.html
[4]: collection.html#collection
[5]: collection.html#taxonomy
[6]: collection.html#paginator
[7]: http://momentjs.com/
[8]: http://nodejs.org/api/fs.html#fs_class_fs_stats
[9]: global-variables.html#i18n