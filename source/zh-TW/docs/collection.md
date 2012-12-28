---
layout: page
title: 集合（Collection）
lang: zh-TW
date: 2012-11-01 18:13:30
---

<a id="collection"></a>
## Collection

Collection 類別用於一般的文章集合。

#### each(iterator)

執行迴圈`iterator(item, i)`，`item`為迴圈目前的項目，`i`為迴圈執行的次數（從0開始）。
	
**別名**：forEach
	
#### map(iterator)

執行迴圈`iterator(item, i)`，並用其回傳值代替原項目的值，`item`為迴圈目前的項目，`i`為迴圈執行的次數（從0開始）。

#### filter(iterator)

執行迴圈`iterator(item, i)`，若其回傳值為真，則保留其值，`item`為迴圈目前的項目，`i`為迴圈執行的次數（從0開始）。

**別名**：select
	
#### toArray

將物件轉換為陣列（Array）。

#### slice(start, [end])

取出物件中的特定部分。`start`, `end`的值可為負數。

#### skip(num)

忽略物件中最前的指定段落。

#### limit(num)

限制傳回的物件數量。

#### set(item)

在物件中新增項目。

**別名**：push
	
#### sort(orderby, [order])

排列物件。`order`為`1`, `asc`時為升冪排列（預設），`-1`, `desc`時為降冪排列。

#### reverse

反轉物件順序。

#### random

隨機排列物件。

**別名**：shuffle

<a id="taxonomy"></a>
## Taxonomy

Taxonomy 類別用於文章分類集合，是 Collection 類別的繼承，與 Collection 類別的差別在於 Taxonomy 類別使用字串當作鍵值。

#### get(name)

取得物件中的指定項目。
	
#### set(name, item)

在物件中新增一個名為`name`的項目。

**別名**：push
	
#### each(iterator)

執行迴圈`iterator(value, key, i)`，`value`為迴圈目前的項目數值，`key`為迴圈目前的項目名稱，`i`為迴圈執行的次數（從0開始）。
	
**別名**：forEach
	
#### map(iterator)

執行迴圈`iterator(value, key, i)`，並用其回傳值代替原項目的值，`value`為迴圈目前的項目數值，`key`為迴圈目前的項目名稱，`i`為迴圈執行的次數（從0開始）。

#### filter(iterator)

執行迴圈`iterator(value, key, i)`，若其回傳值為真，則保留其值，`value`為迴圈目前的項目數值，`key`為迴圈目前的項目名稱，`i`為迴圈執行的次數（從0開始）。

**別名**：select

<a id="paginator"></a>
## Paginator

Paginator 類別是原類別的繼承，僅增加下列屬性。

- **per_page** - 每頁顯示的文章數量
- **total** - 文章總數量
- **current** - 目前頁數
- **current_url** - 目前頁數的網址
- **posts** - [Collection 類別][1]
- **prev** - 上一頁的頁數
- **prev_link** - 上一頁的連結
- **next** - 下一頁的頁數
- **next_link** - 下一頁的連結

[1]: #collection