---
layout: page
title: 輔助方法 (Helper)
lang: zh-TW
date: 2012-11-01 18:13:30
---

輔助方法（Helper）為樣板中所使用的輔助方法，可將資料轉換為 HTML 字串，使主題開發更加容易。以下是內建的輔助方法：

### css

載入 CSS 檔案。`path` 可為陣列或字串。

```
<%- css(path) %>
```

**範例：**

``` js
<%- css('style.css') %>
// <link rel="stylesheet" href="style.css" type="text/css">

<%- css(['style.css', 'screen.css']) %>
// <link rel="stylesheet" href="style.css" type="text/css">
// <link rel="stylesheet" href="screen.css" type="text/css">
```

### js

載入 JavaScript 檔案。`path` 可為陣列或字串。

```
<%- js(path) %>
```

**範例：**

``` js
<%- js('script.js') %>
// <script type="text/javascript" src="script.js"></script>

<%- js(['script.js', 'gallery.js']) %>
// <script type="text/javascript" src="script.js"></script>
// <script type="text/javascript" src="gallery.js"></script>
```

### gravatar

載入 Gravatar。

```
<%- gravatar(email, [size]) %>
```

**範例：**

``` js
<%- gravatar('a@abc.com') %>
// http://www.gravatar.com/avatar/b9b00e66c6b8a70f88c73cb6bdb06787

<%- gravatar('a@abc.com', 40) %>
// http://www.gravatar.com/avatar/b9b00e66c6b8a70f88c73cb6bdb06787?s=40
```

### trim

清除字串內的空白。

```
<%- trim(string) %>
```

### strip_html

清除字串內的所有 HTML 標籤。

```
<%- strip_html(string) %>
```

**範例：**

``` js
<%- strip_html('It's not <b>important</b> anymore!') %>
// It's not important anymore!
```

### titlecase

將字串轉為合適的標題大小寫。

```
<%- titlecase(string) %>
```

**範例：**

``` js
<%- titlecase('this is an apple') %>
# This is an Apple
```

### partial

載入其他樣版。`layout`為樣版的相對路徑；可使用`locals`指定區域變數。（使用方法與 [express-partials][1] 相同）

```
<%- partial(layout, [locals]) %>
```

### tagcloud

插入標籤雲（Tag Cloud）。`options`詳見下方。

```
<%- tagcloud([options]) %>
```

**選項：**

- **min_font** - 最小的字體大小
- **max_font** - 最大的字體大小
- **unit** - 字體單位
- **amount** - 標籤數量
- **orderby** - 排列順序
- **order** - 排列方式。`1`, `asc`代表升冪排列，`-1`, `desc`代表降冪排列，`rand`, `random`代表隨機排列。

**預設值：**

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

插入翻頁導航（Paginator）。`options`詳見下方。

```
<%- paginator(options) %>
```

**選項：**

- **base** - 基礎網址
- **format** - 網址格式
- **total** - 總頁數
- **current** - 目前頁數
- **prev_text** - 上一頁文字
- **next_text** - 下一頁文字
- **space** - 間隔
- **prev_next** - 顯示上一頁和下一頁連結
- **end_size** - 開頭和尾端顯示的分頁數量
- **mid_size** - 目前頁面周圍顯示的分頁數量
- **show_all** - 顯示所有分頁

**預設值：**

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

顯示日期。`date` 為 Date 物件，`format` 為輸出格式，預設為 [全域設定][4] 中的 `date_format`。

```
<%- date(date, [format]) %>
```

**範例：**

``` js
<%- date(new Date()) %>
// Jan 1, 2013

<%- date(new Date(), 'YYYY/M/D') %>
// 2013/1/1
```

### date_xml

顯示 XML 格式的日期。`date` 為 Date 物件。

```
<%- date_xml(date) %>
```

**範例：**

``` js
<%- date_xml(new Date()) %>
// 2013-01-01T00:00:00.000Z
```

### time

顯示時間。`date` 為 Date 物件，`format` 為輸出格式，預設為 [全域設定][4] 中的 `time_format`。

```
<%- time(date, [format]) %>
```

**範例：**

``` js
<%- time(new Date()) %>
// 13:05:12

<%- time(new Date(), 'h:mm:ss a') %>
// 1:05:12 pm
```

### full_date

顯示完整日期。`date` 為 Date 物件，`format` 為輸出格式，預設為 [全域設定][4] 中的 `date_format` 加上 `time_format`。

```
<%- full_date(date, [format]) %>
```

**範例：**

``` js
<%- full_date(new Date()) %>
// Jan 1, 2013 0:00:00

<%- full_date(new Date(), 'dddd, MMMM Do YYYY, h:mm:ss a') %>
// Tuesday, January 1st 2013, 12:00:00 am
```

### moment

[Moment.js](http://momentjs.com/)

### search_form

Google 搜尋表單。`options` 詳見下方。

```
<%- search_form(options) %>
```

**選項：**

- **class** - 表單 Class Name
- **text** - 搜尋提示文字
- **button** - 顯示搜尋按鈕。數值可為布林值（Boolean）或字串，數值為字串時即是搜尋按鈕的文字。

**預設值：**

``` json
{
  "class": "search-form",
  "text": "Search",
  "button": false
}
```

### markdown

使用 Markdown 渲染字串。

```
<%- markdown(str) %>
```

**範例：**

``` js
<%- markdown('make me **strong**') %>
// make me <strong>strong</strong>
```

### word_wrap

使字串每一固定長度換行。`length` 預設為 80。

```
<%- word_wrap(str, [length]) %>
```

**範例：**

```
<%- word_wrap('Once upon a time', 8) %>
// Once upon\n a time
```

### truncate

截取字串中的前幾個字元。

```
<%- truncate(str, length) %>
```

**範例：**

``` js
<%- truncate('Once upon a time in a world far far away', 16) %>
// Once upon a time
```

### truncate_words

截取字串中的前幾個單字。

```
<%- truncate_words(str, length) %>
```

**範例：**

``` js
<%- truncate_words('Once upon a time in a world far far away', 4) %>
// Once upon a time
```

### is_current

判斷是否為目前頁面。

```
<%- is_current(path) %>
```

### is_home

判斷目前頁面是否為首頁。

```
<%- is_home() %>
```

### is_post

判斷目前頁面是否為文章。

```
<%- is_post() %>
```

### is_archive

判斷目前頁面是否為彙整。

```
<%- is_archive() %>
```

### is_year

判斷目前頁面是否為年份彙整。

```
<%- is_year() %>
```

### is_month

判斷目前頁面是否為月份彙整。

```
<%- is_month() %>
```

### is_category

判斷目前頁面是否為分類頁面。

```
<%- is_category() %>
```

### is_tag

判斷目前頁面是否為標籤頁面。

```
<%- is_tag() %>
```

### link_to

插入超連結。`path` 為連結目標，`text` 為連結文字，`external` 為是否在新視窗開啟。

```
<%- link_to(path, [text], [external]) %>
```

**範例：**

``` js
<%- link_to('http://www.google.com') %>
// <a href="http://www.google.com" title="http://www.google.com">http://www.google.com</a>

<%- link_to('http://www.google.com', 'Google') %>
// <a href="http://www.google.com" title="Google">Google</a>

<%- link_to('http://www.google.com', 'Google', true) %>
// <a href="http://www.google.com" title="Google" target="_blank" rel="external">Google</a>
```

### mail_to

插入電子信箱連結。`path` 為連結目標，`text` 為連結文字。

```
<%- mail_to(path, [text]) %>
```

**範例：**

``` js
<%- mail_to('a@abc.com') %>
// <a href="mailto:a@abc.com" title="a@abc.com">a@abc.com</a>

<%- mail_to('a@abc.com', 'Email') %>
// <a href="mailto:a@abc.com" title="Email">Email</a>
```

### list_categories

插入分類列表。`options` 詳見下方。

```
<%- list_categories([options]) %>
```

**選項：**

- **orderby** - 排序依據
- **order** - 排列順序。`1`, `asc`代表升冪排列，`-1`, `desc`代表降冪排列。
- **show_count** - 顯示文章數目

**預設值：**

``` json
{
  "orderby": "name",
  "order": 1,
  "show_count": true
}
```

### list_tags

插入標籤列表。`options` 詳見下方。

```
<%- list_tags([options]) %>
```

**選項：**

- **orderby** - 排序依據
- **order** - 排列順序。`1`, `asc`代表升冪排列，`-1`, `desc`代表降冪排列。
- **show_count** - 顯示文章數目

**預設值：**

``` json
{
  "orderby": "name",
  "order": 1,
  "show_count": true
}
```

### list_archives

插入彙整列表。`options` 詳見下方。

```
<%- list_archives([options]) %>
```

**選項：**

- **type** - 類型。`yearly` 表示年份彙整，`monthly` 表示月份彙整。預設為 `monthly`。
- **order** - 排列順序。`1`, `asc`代表升冪排列，`-1`, `desc`代表降冪排列。
- **show_count** - 顯示文章數目
- **format** - 日期格式。預設為 `MMMM YYYY`。（設定詳見 [Moment.js][5]）

**預設值：**

``` json
{
  "type": "monthly",
  "order": 1,
  "show_count": true,
  "format": "MMMM YYYY"
}
```

### number_format

格式化文字。`options` 詳見下方。

<%- number_format(num, options) %>

**選項：**

- **precision** - 捨去小數點位數。數值可為 `false` 或非負整數。
- **delimiter** - 千位分隔符號
- **separator** - 整數與分數的分隔符號

**預設值：**

``` json
{
  "precision": false,
  "delimiter": ",",
  "separator": "."
}
```

**範例：**

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