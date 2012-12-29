---
layout: page
title: Helpers
date: 2012-11-01 18:13:30
---

Helpers help you transform data into HTML string in templates, making it easier to develop a theme. The following is built-in helpers. (EJS syntax)

#### css

Loads a CSS file.

```
<%- css(path) %>
```

#### js

Loads a JavaScript file.

```
<%- js(path) %>
```

#### trim

Clears all spaces in a string.

```
<%- trim(string) %>
```

#### strip_html

Clears all HTML tags in a string.

```
<%- strip_html(string) %>
```

#### titlecase

Transforms a string into proper title capitalization.

```
<%- titlecase(string) %>
```

#### partial

Loads other template. Use `locals` to define variables in the template. (Same as [express-partials][1])

```
<%- partial(layout, [locals]) %>
```

#### tagcloud

Inserts tag cloud.

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

[1]: https://github.com/publicclass/express-partials