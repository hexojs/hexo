---
layout: page
title: Template Data
date: 2012-11-01 18:13:30
---

## Global

- **[site](#site)** - Global site data, controlled by [Processor][1]
- **[page](#page)** - Data of the current page, differed from each page, controlled by [Generator][2]
- **config** - [Global configuration][3], the content of `_config.yml`
- **theme** - Theme configuration, the content of `_config.yml` in theme folder, differed from each theme
- **__** (double underscores) - Gets [internationalization (i18n)][9] strings

<a id="site"></a>
## site

Global site data. In case of no other plugins loaded, **site** has the following content:

- **posts** - All posts, sorted by published date descending.
- **pages** - All pages, sorted by published date descending.
- **categories** - All categories, sorted alphabetically.
- **tags** - All tags, sorted alphabetically.

**posts**, **pages** is a [Collection][4] object

**categories**, **tags** is a [Taxonomy][5] object

<a id="page"></a>
## page

Data of the current page, differed from each page. The following is the content of built-in generators.

#### page, post

- **layout** - Article layout
- **title** - Article title
- **date** - Published date（[Moment.js][7] object）
- **updated** - Updated date（[Moment.js][7] object）
- **comments** - Comments
- **permalink** - Permalink
- **stats** - Status of source file（[fs.Stats][8] object）
- **content** - Content
- **excerpt** - Excerpt (Content before `<!-- more -->`)
- **source** - Path of source file
- **path** - Relative path

And other variables user set in articles.

The difference of **page** and **post** is that **page** doesn't have `categories` and `tag`.

#### index

- Enable pagination: [Paginator][6] object
- Disable pagination: [Taxonomy][5] object

#### archive

- Enable pagination: [Paginator][6] object
- Disable pagination: [Taxonomy][5] object

And the following variable:

- **archive** - Equals `true`
- **year** - Archive year
- **month** - Archive month

#### category

- Enable pagination: [Paginator][6] object
- Disable pagination: [Taxonomy][5] object

And the following variable:

- **category** - Category name

#### tag

- Enable pagination: [Paginator][6] object
- Disable pagination: [Taxonomy][5] object

And the following variable:

- **tag** - Tag name

[1]: plugin-development.html#processor
[2]: plugin-development.html#generator
[3]: configure.html
[4]: collection.html#collection
[5]: collection.html#taxonomy
[6]: collection.html#paginator
[7]: http://momentjs.com/
[8]: http://nodejs.org/api/fs.html#fs_class_fs_stats
[9]: global-variables.html#i18n