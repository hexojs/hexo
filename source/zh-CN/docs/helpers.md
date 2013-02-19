---
layout: page
title: 辅助方法 (Helper)
lang: zh-CN
date: 2013-02-18 19:44:02
---

辅助方法（Helper）为模板中所使用的辅助方法，可将资料转换为 HTML 字串，使主题开发更加容易。以下是内建的辅助方法：（语法以EJS为范例）

### css

载入CSS文件。

```
<%- css(path) %>
```

### js

载入JavaScript文件。

```
<%- js(path) %>
```

### gravatar

载入Gravatar。

```
<%- gravatar(email, [size]) %>
```

### trim

清除字串内的空白。

```
<%- trim(string) %>
```

### strip_html

清除字串内的所有HTML标签。

```
<%- strip_html(string) %>
```

### titlecase

将字串转为合适的标题大小写。

```
<%- titlecase(string) %>
```

### render

使用指定的[渲染引擎][2]（`engine`）渲染内容，可使用`locals`指定区域变量。

```
<%- render(string, engine, [locals]) %>
```

例如：使用Markdown渲染。

```
<%- render('**bold**', 'md') %>
```

### partial

载入其他模板。`layout`为模板的相对路径；可使用`locals`指定区域变量。（使用方法与 [express-partials][1] 相同）

```
<%- partial(layout, [locals]) %>
```

### tagcloud

插入标签云（Tag Cloud）。`tags`请输入 [模板变量][3] `tags`；`options`详见下方。

```
<%- tagcloud(tags, [options]) %>
```

**选项：**

- **min_font** - 最小的字体大小
- **max_font** - 最大的字体大小
- **unit** - 字体单位
- **amount** - 标签数量
- **orderby** - 排列顺序
- **order** - 排列方式。`1`, `asc`代表升序排列，`-1`, `desc`代表降序排列，`rand`, `random`代表随机排列。

**预设值：**

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

插入翻页导航（Paginator）。`options`详见下方。

```
<%- paginator(options) %>
```

**选项：**

- **base** - 基础网址
- **format** - 网址格式
- **total** - 总页数
- **current** - 目前页数
- **prev_text** - 上一页文字
- **next_text** - 下一页文字
- **space** - 间隔
- **prev_next** - 显示上一页和下一页链接
- **end_size** - 开头和尾端显示的分页数量
- **mid_size** - 目前页面周围显示的分页数量
- **show_all** - 显示所有分页

**预设值：**

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