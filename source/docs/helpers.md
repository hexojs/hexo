title: Helpers
prev: pagination
next: i18n
---
Helpers help you inserts specified content in theme or processes contents in theme quickly.

### css

Loads CSS files. `path` can be an array or a string. If `path` isn't prefixed with `/` or any protocol, it'll be prefixed with root URL. If you didn't add extension name `.css` after `path`, it'll be added.

``` js
<%- css(path, [path1], [path2], [...]) %>
```

**Examples:**

``` js
<%- css('style.css') %>
// <link rel="stylesheet" href="/style.css" type="text/css">

<%- css(['style.css', 'screen.css']) %>
// <link rel="stylesheet" href="/style.css" type="text/css">
// <link rel="stylesheet" href="/screen.css" type="text/css">
```

### js

Loads JavaScript files. `path` can be an array or a string. If `path` isn't prefixed with `/` or any protocol, it'll be prefixed with root URL. If you didn't add extension name `.js` after `path`, it'll be added.

``` js
<%- js(path, [path1], [path2], [...]) %>
```

**Examples:**

``` js
<%- js('script.js') %>
// <script type="text/javascript" src="/script.js"></script>

<%- js(['script.js', 'gallery.js']) %>
// <script type="text/javascript" src="/script.js"></script>
// <script type="text/javascript" src="/gallery.js"></script>
```

### Conditional Tags

Conditional tags help you check the status of current page.

Helper | Description
--- | ---
`is_current(path, strict)` | Checks if `path` matches the URL of current page.
`is_home()` | Checks if the home page is being displayed
`is_post()` | Checks if posts are being displayed
`is_archive()` | Checks if archive pages are being displayed
`is_year()` | Checks if yearly archive pages are being displayed
`is_month()` | Checks if monthly archive pages are being displayed
`is_category()` | Checks if category pages are being displayed
`is_tag()` | Checks if tag pages are being displayed

### gravatar

Inserts a Gravatar image.

``` js
<%- gravatar(email, [size]);
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

``` js
<%- trim(string) %>
```

### strip_html

Sanitizes all HTML tags in a string.

``` js
<%- strip_html(string) %>
```

**Examples:**

``` js
<%- strip_html('It's not <b>important</b> anymore!') %>
// It's not important anymore!
```

### titlecase

Transforms a string into proper title caps.

``` js
<%- titlecase(string) %>
```

**Examples:**

``` js
<%- titlecase('this is an apple') %>
# This is an Apple
```

### partial

Loads other template files. You can define local variables in `local`.

``` js
<%- partial(layout, [locals]) %>
```

### tagcloud

Inserts a tag cloud.

``` js
<%- tagcloud([tags], [options]) %>
```

Option | Description | Default
--- | --- | ---
`min_font` | Minimal font size | 10
`max_font` | Maximum font size | 20
`unit` | Unit of font size | px
`amount` | Total amount of tags | 40
`orderby` | Order of tags | name
`order` | Sort order. `1`, `sac` as ascending; `-1`, `desc` as descending | 1
`color` | Colorizes the tag cloud | false
`start_color` | Start color. You can use hex (`#b700ff`), rgba (`rgba(183, 0, 255, 1)`), hsla (`hsla(283, 100%, 50%, 1)`) or [color keywords]. This option only works when `color` is true. | 
`end_color` | End color. You can use hex (`#b700ff`), rgba (`rgba(183, 0, 255, 1)`), hsla (`hsla(283, 100%, 50%, 1)`) or [color keywords]. This option only works when `color` is true. |

### paginator

Inserts a paginator.

``` js
<%- paginator(options) %>
```

Option | Description | Default
--- | --- | ---
`base` | Base URL | /
`format` | URL format | page/%d/
`total` | Total amount of pages | 1
`current` | Current page number | 0
`prev_text` | The link text of previous page. Works only if `prev_next` is set to true. | Prev
`next_text` | The link text of next page. Works only if `prev_next` is set to true. | Next
`space` | The space text | &hellp;
`prev_next` | Display previous and next links | true
`end_size` | The number of pages displayed on the start and the end side | 1
`mid_size` | The number of pages displayed between current page, but not including current page | 2
`show_all` | Display all pages. If this is set true, `end_size` and `mid_size` will not works. | false

### date

Inserts formatted date. `date` can be unix time, ISO string, date object, or moment.js object. `format` is `date_format` setting by default.

``` js
<%- date(date, [format]) %>
```

**Examples:**

``` js
<%- date(Date.now()) %>
// Jan 1, 2013

<%- date(Date.now(), 'YYYY/M/D') %>
// 2013/1/1
```

### date_xml

Inserts date in XML format. `date` can be unix time, ISO string, date object, or moment.js object. `format` is `date_format` setting by default.

``` js
<%- date_xml(date) %>
```

**Examples:**

``` js
<%- date_xml(Date.now()) %>
// 2013-01-01T00:00:00.000Z
```

### time

Inserts formatted time. `date` can be unix time, ISO string, date object, or moment.js object. `format` is `time_format` setting by default.

``` js
<%- date(date, [format]) %>
```

**Examples:**

``` js
<%- time(Date.now()) %>
// 13:05:12

<%- time(Date.now(), 'h:mm:ss a') %>
// 1:05:12 pm
```

### full_date

Inserts formatted date and time. `date` can be unix time, ISO string, date object, or moment.js object. `format` is `date_format + time_format` setting by default.

``` js
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

[Moment.js] library.

### searh_form

Inserts a Google search form.

``` js
<%- search_form(options) %>
```

Option | Description | Default
--- | --- | ---
`class` | The class name of form | search-form
`text` | Search hint word | Search
`button` | Display search button. The value can be a boolean or a string. When the value is a string, it'll be the text of the button. | false

### markdown

Renders a string with Markdown.

``` js
<%- markdown(str) %>
```

**Examples:**

``` js
<%- markdown('make me **strong**') %>
// make me <strong>strong</strong>
```

### word_wrap

Wraps text into lines no longer than `length`. `length` is 80 by default.

``` js
<%- word_wrap(str, [length]) %>
```

**Examples:**

``` js
<%- word_wrap('Once upon a time', 8) %>
// Once upon\n a time
```

### truncate

Truncates text after `length`.

``` js
<%- truncate(text, length) %>
```

**Examples:**

``` js
<%- truncate('Once upon a time in a world far far away', 16) %>
// Once upon a time
```

### truncate_words

Truncates words after `length`.

``` js
<%- truncate_words(text, length) %>
```

**Examples:**

``` js
<%- truncate_words('Once upon a time in a world far far away', 4) %>
// Once upon a time
```

### link_to

Inserts a link.

``` js
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

Inserts a mail link.

``` js
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

Inserts a list of all categories.

``` js
<%- list_categories([options]) %>
```

Option | Description | Default
--- | --- | ---
`orderby` | Order of categories | name
`order` | Sort of order. `1`, `asc` as ascending; `-1`, `desc` as descending | 1
`show_count` | Display the total amount of posts for each category | true
`style` | Style to display the categories list. `list` displays categories in an unordered list.  | list
`separator` | Separator between categories. (Only works if `style` is `none`) | , 
`depth` | Levels of categories to be displayed. `0` displays all categories and child categories; `-1` is same as `0` but displayed in flat; `1` displays only top level categories. | 0
`class` | Class name of categories list. | category

### list_tags

Inserts a list of all tags.

``` js
<%- list_tags([options]) %>
```

Option | Description | Default
--- | --- | ---
`orderby` | Order of categories | name
`order` | Sort of order. `1`, `asc` as ascending; `-1`, `desc` as descending | 1
`show_count` | Display the total amount of posts for each tag | true
`style` | Style to display the tags list. `list` displays tags in an unordered list.  | list
`separator` | Separator between tags. (Only works if `style` is `none`) | , 
`class` | Class name of tags list. | tag

### list_archives

Inserts a list of archives.

``` js
<%- list_archive([options]) %>
```

Option | Description | Default
--- | --- | ---
`type` | Type. This value can be `yearly` or `monthly`. | monthly
`order` | Sort of order. `1`, `asc` as ascending; `-1`, `desc` as descending | 1
`show_count` | Display the total amount of posts for each archive | true
`format` | Date format | MMMM YYYY
`style` | Style to display the archives list. `list` displays archives in an unordered list.  | list
`separator` | Separator between archives. (Only works if `style` is `none`) | , 
`class` | Class name of archives list. | category

### number_format

Formats a number.

``` js
<%- number_format(number, options) %>
```

Option | Description | Default
--- | ---
`precision` | The precision of number. The value can be `false` or a nonnegative integer. | false
`delimiter` | The thousands delimiter | ,
`separator` | The separator between the fractional and integer digits. | .

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

[color keywords]: http://www.w3.org/TR/css3-color/#svg-color