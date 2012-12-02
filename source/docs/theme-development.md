---
layout: page
title: Theme Development
date: 2012-11-01 18:13:30
---

## Contents

- [Structure](#structure)
- [Variable](#variable)
- [Class](#class)
- [Helper](#helper)
- [Source](#source)

<a id="structure"></a>
## Structure

``` plain
|-- _config.yml
|-- layout
|-- source
```

### _config.yml

Theme configuration file.

### layout

Layout folder. You can [EJS] or [Swig] to render templates, or you can install [Renderer plugins] to use the template engine you like.

Basic layouts:

- **archive** - Blog archive
- **category** - Category archive
- **index** - Home
- **page** - Page
- **post** - Post
- **tag** - Tag archive

### source

Source folder. CSS, JavaScript files (*Asset*) should be stored in this folder. Files in this folder will be rendered and saved in `public` folder. File or Folder whose name started with `.` or `_` will be ignored.

Hexo comes with [Stylus] & [nib] support built-in. You can install [Renderer plugins] to add more support for Hexo.

<a id="variable"></a>
## Variable

### site

Global site data.

- **posts** - All posts. Sort by article date descending.
- **pages** - All pages. Sort by article date descending.
- **categories** - All categories. Sort alphabetically.
- **tags** - All tags. Sort alphabetically.

`posts`, `pages` uses [Collection class]。

`categories`, `tags` uses [Taxonomy class]。

### page

Data of the current page. The content is various from pages.

**page, post:**

- **layout** - Article layout
- **title** - Article title
- **date** - The published date of the article ([Moment.js] object)
- **updated** - The updated date of the article ([Moment.js] object)
- **comments** - Enable comment for the article
- **permalink** - The permalink of the article
- **stats** - The file status of the article ([fs.Stats] class)
- **content** - Article content
- **excerpt** - Article summary (Content before `<!-- more -->`)
- **source** - Source file path
- **path** - The relative path of the article

And other variable user set in article.

The difference of page and post is that page doesn't have `categories` and `tag` variables.

**index:**

- Enable pagination: [Paginator class]
- Disable pagination: [Taxonomy class]

**archive:**

- Enable pagination: [Paginator class]
- Disable pagination: [Taxonomy class]

And the following variables:

- **archive** - equals `true`
- **year** - The year of archive (Only available in archive by year)
- **month** - The month of archive (Only available in archive by month)

**category:**

- Enable pagination: [Paginator class]
- Disable pagination: [Taxonomy class]

And the following variables:

- **category** - Category name

**tag:**

- Enable pagination: [Paginator class]
- Disable pagination: [Taxonomy class]

And the following variables:

- **tag** - Tag name

### config

Global [configuration](config.html).

### theme

Theme configuration.

<a id="class"></a>
## Class

<a id="collection"></a>
### Collection

- **each(iterator)**

	Run loop `iterator(item, i)`. `item` is the current item of the loop. `i` is the times loop has ran (started from 0).
		
	**Alias:** forEach
	
- **map(iterator)**

	Run loop `iterator(item, i)` and replace original value with return value. `item` is the current item of the loop. `i` is the times loop has ran (started from 0).

- **filter(iterator)**

	Run loop `iterator(item, i)`. If the return value is true, preserve it. `item` is the current item of the loop. `i` is the times loop has ran (started from 0).

	**Alias:** select
	
- **toArray**

	Transform the object into an array.

- **slice(start, [end])**

	Get a specific part of the object. `start`, `end` can be negative number.

- **skip(num)**

	Ignore the first specified range of the object.

- **limit(num)**

	Limit the amount of items in the object.

- **set(item)**

	Add a new item to the object.

	**Alias:** push
	
- **sort(orderby, [order])**

	Sort the object. When `order` equals `1`, `asc` means ascending sort, `-1`, `desc` means descending sort.

- **reverse**

	Reverse the order of the object.

- **random**

	Sort the object randomly.

	**Alias:** shuffle

<a id="taxonomy"></a>
### Taxonomy

Taxonomy class is inheritance of [Collection class]. Most method is same as [Collection class]. Only the following method is different.

- **get(name)**

	Get the specific item from the object.
	
- **set(name, item)**

	Add a new item named `name` to the object.

	**Alias:** push
	
- **each(iterator)**

	Run loop `iterator(value, key, i)`. `value` is the value of the current item of the loop. `key` is the name of the current item of the loop. `i` is the times loop has ran (started from 0).
	
	**Alias:** forEach
	
- **map(iterator)**

	Run loop `iterator(item, i)` and replace original value with return value. `value` is the value of the current item of the loop. `key` is the name of the current item of the loop. `i` is the times loop has ran (started from 0).

- **filter(iterator)**

	Run loop `iterator(item, i)`. If the return value is true, preserve it. `value` is the value of the current item of the loop. `key` is the name of the current item of the loop. `i` is the times loop has ran (started from 0).

	**Alias:** select

<a id="paginator"></a>
### Paginator

Paginator class is inheritance of original class. The following properties are added.

- **per_page** - Posts displayed in a single page
- **total** - Amount of posts
- **current** - Current page number
- **current_url** - Link of current page
- **posts** - [Collection class]
- **prev** - Previous page number
- **prev_link** - Link of previous page
- **next** - Next page number
- **next_link** - Link of next page

<a id="helper"></a>
## Helper

Helper helps you insert code in template faster. The following are the built-in helpers. You can install [Helper plugins] to make theme development more convenient. (The following syntax is written in EJS)

### css

Load CSS file.

```
<%- css(path) %>
```

### js

Load JavaScript file.

```
<%- js(path) %>
```

### trim

Clear spaces in string.

```
<%- trim(string) %>
```

### strip_html

Clear all HTML tags in string.

```
<%- strip_html(string) %>
```

### titlecase

Transform string into proper title capitalization.

```
<%- titlecase(string) %>
```

### partial

Load other template. Use `locals` to define variable in template. (Same as [express-partials])

```
<%- partial(layout, [locals]) %>
```

### tagcloud

Insert tag cloud.

```
<%- tagcloud(tags, [options]) %>
```

**Options:**

- **min_font** - Minimal font size
- **max_font** - Maximum font size
- **unit** - Unit of font size
- **amount** - Amount of the tags
- **orderby** - Order of the tags
- **order** - Sort order. `1`, `asc` means ascending sort. `-1`, `desc` means descending sort. `rand`, `random` means random sort.

**Default:**

```
{
	min_font: 10,
	max_font: 20,
	unit: 'px',
	amount: 40,
	orderby: 'name',
	order: 1
}
```

<a id="source"></a>
## Source

You can reference the [source code](https://github.com/tommy351/hexo-theme-light) of the default theme "Light" to create your theme.

[EJS]: https://github.com/visionmedia/ejs
[Swig]: http://paularmstrong.github.com/swig/
[Stylus]: http://learnboost.github.com/stylus/
[nib]: http://visionmedia.github.com/nib/
[Renderer plugins]: ../plugins/#renderer
[Helper plugins]: ../plugins/#helper
[express-partials]: https://github.com/publicclass/express-partials
[Moment.js]: http://momentjs.com/
[fs.Stats]: http://nodejs.org/api/fs.html#fs_class_fs_stats
[Collection class]: #collection
[Taxonomy class]: #taxonomy
[Paginator class]: #paginator