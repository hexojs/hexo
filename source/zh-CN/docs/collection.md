---
layout: page
title: 集合（Collection）
lang: zh-CN
date: 2013-02-18 19:05:51
---

<a id="collection"></a>
## Collection

Collection 类别用于一般的文章集合。

#### each(iterator)

执行循环`iterator(item, i)`，`item`为循环目前的项目，`i`为循环执行的次数（从0开始）。

**别名**：forEach

#### map(iterator)

执行循环`iterator(item, i)`，并用其回传值代替原项目的值，`item`为循环目前的项目，`i`为循环执行的次数（从0开始）。

#### filter(iterator)

执行循环`iterator(item, i)`，若其回传值为真，则保留其值，`item`为循环目前的项目，`i`为循环执行的次数（从0开始）。

**别名**：select

#### toArray

将事件转换为数组（Array）。

#### slice(start, [end])

取出事件中的特定部分。`start`, `end`的值可为负数。

#### skip(num)

忽略事件中最前的指定段落。

#### limit(num)

限制传回的事件数量。

#### set(item)

在事件中新增项目。

**别名**：push

#### sort(orderby, [order])

排列事件。`order`为`1`, `asc`时为升序排列（预设），`-1`, `desc`时为降序排列。

#### reverse

反转对象顺序。

#### random

随机排列事件。

**别名**：shuffle

<a id="taxonomy"></a>
## Taxonomy

Taxonomy 类别用于文章分类集合，是 Collection 类别的继承，与 Collection 类别的差别在于 Taxonomy 类别使用字串当作键值。

#### get(name)

取得事件中的指定项目。

#### set(name, item)

在事件中新增一个名为`name`的项目。

**别名**：push

#### each(iterator)

执行循环`iterator(value, key, i)`，`value`为循环目前的项目数值，`key`为循环目前的项目名称，`i`为循环执行的次数（从0开始）。

**别名**：forEach

#### map(iterator)

执行循环`iterator(value, key, i)`，并用其回传值代替原项目的值，`value`为循环目前的项目数值，`key`为循环目前的项目名称，`i`为循环执行的次数（从0开始）。

#### filter(iterator)

执行循环`iterator(value, key, i)`，若其回传值为真，则保留其值，`value`为循环目前的项目数值，`key`为循环目前的项目名称，`i`为循环执行的次数（从0开始）。

**别名**：select

<a id="paginator"></a>
## Paginator

Paginator 类别是原类别的继承，仅增加下列属性。

- **per_page** - 每页显示的文章数量
- **total** - 文章总数量
- **current** - 目前页数
- **current_url** - 目前页数的网址
- **posts** - [Collection 类别][1]
- **prev** - 上一页的页数
- **prev_link** - 上一页的链接
- **next** - 下一页的页数
- **next_link** - 下一页的链接

[1]: #collection