---
layout: page
title: Template Data
date: 2012-11-01 18:13:30
---

## Global

- **[site](#site)** - Global site data
- **[page](#page)** - Data of the current page, differed from each page
- **config** - [Global configuration][3], the content of `_config.yml`
- **theme** - Theme configuration, the content of `_config.yml` in theme folder, differed from each theme
- **__** (double underscores) - Gets [internationalization (i18n)][9] strings
- **layout** - Layout
- **cache** - Cache

<a name="site"></a>
## site

Global site data. In case of no other plugins loaded, **site** has the following content:

- **posts** - All posts
- **pages** - All pages
- **categories** - All categories
- **tags** - All tags

<a name="page"></a>
## page

Data of the current page, differed from each page.

### Article (post, page, …)

- **title** - Title
- **date** - Published date ([Moment.js][7] object)
- **updated** - Updated date ([Moment.js][7] object)
- **categories** - Categories ([Model][5] object)
- **tags** - Tags ([Model][5] object)
- **comments** - Comment enabled or not
- **layout** - Layout
- **content** - Content
- **excerpt** - Exerpt (Content before`<!--more-->`)
- **source** - Source file path
- **path** - Path
- **ctime** - File created time ([Moment.js][7] object)
- **mtime** - File modified time ([Moment.js][7] object)
- **prev** - Previous post
- **next** - Next post

And other variables user set in articles. The difference of **page** and **post** is that **page** doesn't have `categories`, `tag`, `prev` and `next`.

<a name="index"></a>
### Home (index)

**Pagination enabled**:

- **per_page** - Posts displayed per page
- **total** - Number of posts
- **current** - Current page number
- **current_url** - Current page link
- **posts** - Posts ([Model][5] object)
- **prev** - Previous page number
- **prev_link** - Previous page link
- **next** - Next page number
- **next_link** - Next page link

**Pagination disabled**:

A [Model][5] object.

### Archive (archive)

Same as [index layout](#index) with the following:

- **archive** - equals `true`
- **year** - Archive year
- **month** - Archive month

### Category (category)

Same as [index layout](#index) with the following:

- **category** - Category name

### Tag (tag)

Same as [index layout](#index) with the following:

- **tag** - Tag name

[3]: configure.html
[5]: collection.html#model
[7]: http://momentjs.com/
[9]: global-variables.html#i18n