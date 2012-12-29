---
layout: page
title: 輔助方法 (Helper)
lang: zh-TW
date: 2012-11-01 18:13:30
---

輔助方法（Helper）為樣板中所使用的輔助方法，可將資料轉換為 HTML 字串，使主題開發更加容易。以下是內建的輔助方法：（語法以EJS為範例）

#### css

載入CSS檔案。

```
<%- css(path) %>
```

#### js

載入JavaScript檔案。

```
<%- js(path) %>
```

#### trim

清除字串內的空白。

```
<%- trim(string) %>
```

#### strip_html

清除字串內的所有HTML標籤。

```
<%- strip_html(string) %>
```

#### titlecase

將字串轉為合適的標題大小寫。

```
<%- titlecase(string) %>
```

#### partial

載入其他模版，可使用`locals`指定模版內的變數。（使用方法與 [express-partials][1] 相同）

```
<%- partial(layout, [locals]) %>
```

#### tagcloud

插入標籤雲（Tag Cloud）。

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

[1]: https://github.com/publicclass/express-partials