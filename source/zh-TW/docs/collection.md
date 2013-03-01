---
layout: page
title: 集合（Collection）
lang: zh-TW
date: 2012-11-01 18:13:30
---

自 1.0 版後，Hexo 採用 [Warehouse][1] 記錄所有資料，[Warehouse][1] 繼承了舊有的部份程式碼，並增加了搜尋功能，效能提昇，更為強大。

[1]: https://github.com/tommy351/warehouse

<a name="model>"></a>
## Model

Model 為資料的集合。

#### get(id1[, id2, ..., idN])

取得指定編號的資料。當 `id` 數量大於 1 時返回陣列。

#### each(iterator)

遞迴 Model 內所有項目，執行 `iterator(data, id)`，`data` 為資料，`id` 為編號。

#### toArray()

將 Model 轉換為陣列。

#### count()

返回 Model 的元素數量，相等於 `length`。

#### insert(data, callback)

插入資料至 Model。`data` 可為物件（Object）或陣列（Array），插入完成後，執行回呼函數 `callback(data, id)`，`data` 為資料，`id` 為編號。

#### update([id, ]data)

更新資料。`id` 可為數字、陣列，當不指定時會更新 Model 內的所有資料。

操作元：

- **$push** - 對陣列插入元素
- **$pull** - 從陣列移除元素
- **$shift** - 刪除陣列前幾個元素
- **$pop** - 刪除陣列後幾個元素
- **$addToSet** - 對陣列插入元素（不重複）
- **$inc** - 增加數字
- **$dec** - 減少數字

#### replace([id, ]data)

取代資料。`id` 可為數字、陣列，當不指定時會取代 Model 內的所有資料。

#### remove([id1, id2, ..., idN])

移除資料。不指定 `id` 時會刪除 Model 內的所有資料。

#### destroy()

從資料庫刪除 Model 的所有資料。

#### first()

取得第一個物件。

#### last()

取得最後一個物件。

#### eq(num)

取得指定位置的資料。

#### slice(start[, end])

取得特定區段的資料。`start` 和 `end` 可為負數。

#### limit(num)

限制物件數量。

#### skip(num)

省略前幾個物件。

#### reverse()

反轉物件順序。

#### sort(orderby[, order])

排序物件。`order` 為 `-1` 或 `desc` 時為降冪排列，預設為升冪排列。

#### random()

隨機排序 Model 內的資料。

#### find(query)

尋找資料。

操作元：

- **$lt** - 小於
- **$lte** - 小於或等於
- **$gt** - 大於
- **$gte** - 大於或等於
- **$length** - 陣列長度
- **$in** - 陣列內含有指定元素
- **$nin** - 陣列內不含有指定元素
- **$all** - 陣列內含有所有指定元素
- **$exists** - 物件存在
- **$ne** - 不等於

#### findRaw(query)

根據原始內容，尋找資料。

#### findOne(query)

尋找資料，並只返回第一個物件。