---
layout: page
title: Helpers
date: 2012-11-01 18:13:30
---

Helpers help you transform data into HTML string in templates, making it easier to develop a theme. The following is built-in helpers.

### css

Loads CSS file. `path` can be an array or a string.

```
<%- css(path) %>
```

**Examples:**

``` js
<%- css('style.css') %>
// <link rel="stylesheet" href="style.css" type="text/css">

<%- css(['style.css', 'screen.css']) %>
// <link rel="stylesheet" href="style.css" type="text/css">
// <link rel="stylesheet" href="screen.css" type="text/css">
```

### js

Loads JavaScript file. `path` can be an array or a string.

```
<%- js(path) %>
```

**Examples:**

``` js
<%- js('script.js') %>
// <script type="text/javascript" src="script.js"></script>

<%- js(['script.js', 'gallery.js']) %>
// <script type="text/javascript" src="script.js"></script>
// <script type="text/javascript" src="gallery.js"></script>
```

### gravatar

Loads Gravatar.

```
<%- gravatar(email, [size]) %>
```

**Examples:**

``` js
<%- gravatar('a@abc.com') %>
// http://www.gravatar.com/avatar/b9b00e66c6b8a70f88c73cb6bdb06787

<%- gravatar('a@abc.com', 40) %>
// http://www.gravatar.com/avatar/b9b00e66c6b8a70f88c73cb6bdb06787?s=40
```

### trim

Clears all spaces in a string.

```
<%- trim(string) %>
```

### strip_html

Clears all HTML tags in a string.

```
<%- strip_html(string) %>
```

**Examples:**

``` js
<%- strip_html('It's not <b>important</b> anymore!') %>
// It's not important anymore!
```

### titlecase

Transforms a string into proper title capitalization.

```
<%- titlecase(string) %>
```

**Examples:**

``` js
<%- titlecase('this is an apple') %>
# This is an Apple
```

### partial

Loads other template. Use `locals` to define local variables. (Same as [express-partials][1])

```
<%- partial(layout, [locals]) %>
```

### tagcloud

Inserts tag cloud. Input `tags` with [template data][3]. The following is `options`.

```
<%- tagcloud(tags, [options]) %>
```

**Options:**

- **min_font** - Minimal font size
- **max_font** - Maximum font size
- **unit** - Unit of font size
- **amount** - Amount of tags
- **orderby** - Order of tags
- **order** - Sort order. `1`, `asc` as ascending; `-1`, `desc` as descending.

**Default:**

``` json
{
  "min_font": 10,
  "max_font": 20,
  "unit": "px",
  "amount": 40,
  "orderby": "name",
  "order": 1
}
```

### paginator

Inserts paginator. The following is `options`.

```
<%- paginator(options) %>
```

**Options:**

- **base** - Base URL
- **format** - URL format
- **total** - The total amount of pages
- **current** - Current page number
- **prev_text** - The previous page text
- **next_text** - The next page text
- **space** - The space text
- **prev_next** - Display previous and next links
- **end_size** - Number of pages displayed on the start and the end side
- **mid_size** - Number of pages displayed between current page, but not including current page
- **show_all** - Display all pages

**Default:**

``` json
{
  "base": "/",
  "format": "page/%d/",
  "total": 1,
  "current": 0,
  "prev_text": "Prev",
  "next_text": "Next",
  "space": "&hellp;",
  "prev_next": true,
  "end_size": 1,
  "mid_size": 2,
  "show_all": false
}
```

### date

Displays date. `date` is a date object. `format` is the output format ([Moment.js][5]), `date_format` in [global configuration][4] by default.

```
<%- date(date, [format]) %>
```

**Examples:**

``` js
<%- date(new Date()) %>
// Jan 1, 2013

<%- date(new Date(), 'YYYY/M/D') %>
// 2013/1/1
```

### date_xml

Displays date in XML format. `date` is a date object.

```
<%- date_xml(date) %>
```

**Examples:**

``` js
<%- date_xml(new Date()) %>
// 2013-01-01T00:00:00.000Z
```

### time

Displays time. `date` is a date object. `format` is the output format  ([Moment.js][5]), `time_format` in [global configuration][4] by default.

```
<%- time(date, [format]) %>
```

**Examples:**

``` js
<%- time(new Date()) %>
// 13:05:12

<%- time(new Date(), 'h:mm:ss a') %>
// 1:05:12 pm
```

### full_date

Displays full date. `date` is a date object. `format` is the output format  ([Moment.js][5]), `date_format` plus `time_format` in [global configuration][4] by default.

```
<%- full_date(date, [format]) %>
```

**Examples:**

``` js
<%- full_date(new Date()) %>
// Jan 1, 2013 0:00:00

<%- full_date(new Date(), 'dddd, MMMM Do YYYY, h:mm:ss a') %>
// Tuesday, January 1st 2013, 12:00:00 am
```

### moment

[Moment.js](http://momentjs.com/)

### search_form

Returns a Google search form. The following is `options`.

```
<%- search_form(options) %>
```

**Options:**

- **class** - Form class name
- **text** - Search hint word
- **button** - Whether to display search button. The value can be a boolean or a string.

**Defaults:**

``` json
{
  "class": "search-form",
  "text": "Search",
  "button": false
}
```

### markdown

Renders string with Markdown.

```
<%- markdown(str) %>
```

**Examples:**

``` js
<%- markdown('make me **strong**') %>
// make me <strong>strong</strong>
```

### word_wrap

Wraps the text into lines no longer than `length`. `length` is 80 by default。

```
<%- word_wrap(str, [length]) %>
```

**Examples:**

```
<%- word_wrap('Once upon a time', 8) %>
// Once upon\n a time
```

### truncate

Truncates a given `text` after a given `length`.

```
<%- truncate(text, length) %>
```

**Examples:**

``` js
<%- truncate('Once upon a time in a world far far away', 16) %>
// Once upon a time
```

### truncate_words

Truncates words of a given `text` after a given `length`.

```
<%- truncate_words(text, length) %>
```

**Examples:**

``` js
<%- truncate_words('Once upon a time in a world far far away', 4) %>
// Once upon a time
```

### is_current

Checks if `path` is being displayed.

```
<%- is_current(path) %>
```

### is_home

Check if the home page is being displayed

```
<%- is_home() %>
```

### is_post

Check if the post is being displayed.

```
<%- is_post() %>
```

### is_archive

Check if the archives is being displayed.

```
<%- is_archive() %>
```

### is_year

Check if the yearly archives is being displayed.

```
<%- is_year() %>
```

### is_month

Check if the monthly archives is being displayed.

```
<%- is_month() %>
```

### is_category

Check if the category page is being displayed.

```
<%- is_category() %>
```

### is_tag

Check if the tag page is being displayed.

```
<%- is_tag() %>
```

### link_to

Inserts a link. `path` is the link destination. `text` is the link text. `external` is whether the link is opened in a new window.

```
<%- link_to(path, [text], [external]) %>
```

**Examples:**

``` js
<%- link_to('http://www.google.com') %>
// <a href="http://www.google.com" title="http://www.google.com">http://www.google.com</a>

<%- link_to('http://www.google.com', 'Google') %>
// <a href="http://www.google.com" title="Google">Google</a>

<%- link_to('http://www.google.com', 'Google', true) %>
// <a href="http://www.google.com" title="Google" target="_blank" rel="external">Google</a>
```

### mail_to

Inserts a mail link. `path` is the link destination. `text` is the link text.

```
<%- mail_to(path, [text]) %>
```

**Examples:**

``` js
<%- mail_to('a@abc.com') %>
// <a href="mailto:a@abc.com" title="a@abc.com">a@abc.com</a>

<%- mail_to('a@abc.com', 'Email') %>
// <a href="mailto:a@abc.com" title="Email">Email</a>
```

### list_categories

Inserts a list of categories. The following is `options`.

```
<%- list_categories([options]) %>
```

**Options:**

- **orderby** - Order of tags
- **order** - Sort of order. `1`, `asc` as ascending; `-1`, `desc` as descending.
- **show_count** - Whether to show the number of posts

**Defaults:**

``` json
{
  "orderby": "name",
  "order": 1,
  "show_count": true
}
```

### list_tags

Inserts a list of tags. The following is `options`.

```
<%- list_tags([options]) %>
```

**Options:**

- **orderby** - Order of tags
- **order** - Sort of order. `1`, `asc` as ascending; `-1`, `desc` as descending.
- **show_count** - Whether to show the number of posts

**Defaults:**

``` json
{
  "orderby": "name",
  "order": 1,
  "show_count": true
}
```

### list_archives

Inserts a list of archives. The following is `options`.

```
<%- list_archives([options]) %>
```

**Options:**

- **type** - Type. `yearly` as yearly archives; `monthly` as monthly archives (default).
- **order** - Sort of order. `1`, `asc` as ascending; `-1`, `desc` as descending.
- **show_count** - Whether to show the number of posts
- **format** - Date format. `MMMM YYYY` by default. ([Moment.js][5])

**Defaults:**

``` json
{
  "type": "monthly",
  "order": 1,
  "show_count": true,
  "format": "MMMM YYYY"
}
```

### number_format

Formats a `number`. The following is `options`.

<%- number_format(number, options) %>

**Options:**

- **precision** - The precision of the number. The value can be `false` or nonnegative integer.
- **delimiter** - The thousands delimiter.
- **separator** - The sperator between the fractional and integer digits.

**Defaults:**

``` json
{
  "precision": false,
  "delimiter": ",",
  "separator": "."
}
```

**Examples:**

``` js
<%- number_format(12345.67, {precision: 1}) %>
// 12,345.68

<%- number_format(12345.67, {precision: 4}) %>
// 12,345.6700

<%- number_format(12345.67, {precision: 0}) %>
// 12,345

<%- number_format(12345.67, {delimiter: ''}) %>
// 12345.67

<%- number_format(12345.67, {separator: '/'}) %>
// 12,345/67
```

[1]: https://github.com/publicclass/express-partials
[2]: render.html
[3]: template-data.html
[4]: configure.html
[5]: http://momentjs.com/docs/#/displaying/format/