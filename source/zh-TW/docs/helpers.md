---
layout: page
title: 輔助方法 (Helper)
lang: zh-TW
date: 2012-11-01 18:13:30
---

輔助方法（Helper）為樣板中所使用的輔助方法，可將資料轉換為 HTML 字串，使主題開發更加容易。以下是內建的輔助方法：（語法以EJS為範例）

### css

載入CSS檔案。

```
<%- css(path) %>
```

### js

載入JavaScript檔案。

```
<%- js(path) %>
```

### gravatar

載入Gravatar。

```
<%- gravatar(email, [size]) %>
```

### trim

清除字串內的空白。

```
<%- trim(string) %>
```

### strip_html

清除字串內的所有HTML標籤。

```
<%- strip_html(string) %>
```

### titlecase

將字串轉為合適的標題大小寫。

```
<%- titlecase(string) %>
```

### render

使用指定的[渲染引擎][2]（`engine`）渲染內容，可使用`locals`指定區域變數。

```
<%- render(string, engine, [locals]) %>
```

例如：使用Markdown渲染。

```
<%- render('**bold**', 'md') %>
```

### partial

載入其他樣版。`layout`為樣版的相對路徑；可使用`locals`指定區域變數。（使用方法與 [express-partials][1] 相同）

```
<%- partial(layout, [locals]) %>
```

### tagcloud

插入標籤雲（Tag Cloud）。`tags`請輸入 [樣板變數][3] `tags`；`options`詳見下方。

```
<%- tagcloud(tags, [options]) %>
```

**選項：**

- **min_font** - 最小的字體大小
- **max_font** - 最大的字體大小
- **unit** - 字體單位
- **amount** - 標籤數量
- **orderby** - 排列順序
- **order** - 排列方式。`1`, `asc`代表升冪排列，`-1`, `desc`代表降冪排列，`rand`, `random`代表隨機排列。

**預設值：**

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