---
layout: page
title: Helpers
date: 2012-11-01 18:13:30
---

Helpers help you transform data into HTML string in templates, making it easier to develop a theme. The following is built-in helpers. (EJS syntax)

### css

Loads a CSS file.

```
<%- css(path) %>
```

### js

Loads a JavaScript file.

```
<%- js(path) %>
```

### gravatar

Loads Gravatar.

```
<%- gravatar(email, [size]) %>
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

### titlecase

Transforms a string into proper title capitalization.

```
<%- titlecase(string) %>
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

```
{
  base: '/',
  format: 'page/%d/',
  total: 1,
  current: 0,
  prev_text: 'Prev',
  next_text: 'Next',
  space: '&hellp;',
  prev_next: true,
  end_size: 1,
  mid_size: 2,
  show_all: false
}
```

[1]: https://github.com/publicclass/express-partials
[2]: render.html
[3]: template-data.html