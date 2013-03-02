---
layout: page
title: Collection
date: 2012-11-01 18:13:30
---

Since 1.0, Hexo records all data with [Warehouse][1]. [Warehouse][1] inherits some parts of old features and adds searching, improves performance, more powerful than before.

<a name="model>"></a>
## Model

Model is a collection of data.

#### get(id1[, id2, ..., idN])

Gets data of specific id. Returns an array when multiple id.

#### each(iterator)

Iterates over all items in the model, executing `iterator(data, id)`.

#### toArray()

Transforms the model into an array.

#### count()

Returns the number of elements. Equals to `length`.

#### insert(data, callback)

Inserts data to the model. `data` can be an object or an array. Once the insertion is complete, executing `callback(data, id)`.

#### update([id, ]data)

Updates data. `id` can be a number or an array. If `id` is undefined, updates all items in the model.

Operators:

- **$push** - Appends elements to an array
- **$pull** - Remove elements from an array
- **$shift** - Removed the first elements from an array
- **$pop** - Removed the last elements from an array
- **$addToSet** - Appends elements to an array (only if the elements not exists)
- **$inc** - Increase number
- **$dec** - Decrease number

#### replace([id, ]data)

Replaces data. `id` can be a number or an array. If `id` is undefined, replaces all items in the model.

#### remove([id1, id2, ..., idN])

Removes data. If `id` is undefined, removes all items in the model.

#### destroy()

Removes all data of the model from the database.

#### first()

Gets the first item.

#### last()

Gets the last item.

#### eq(num)

Gets the specific position of the item.

#### slice(start[, end])

Gets the specific part of the model. `start` and `end` can be a negative number.

#### limit(num)

Limits the number of items in the model.

#### skip(num)

Skips the first items of the model.

#### reverse()

Reversed the order of the model.

#### sort(orderby[, order])

Sorts the items in the model. Descending when `order` equals to `1` or `desc`, otherwise ascending.

#### random()

Sorts data randomly.

#### find(query)

Finds data.

Operators:

- **$lt** - Less than
- **$lte** - Less than equal
- **$gt** - Greater than
- **$gte** - Greater than equal
- **$length** - Number of elements in an array
- **$in** - An array contains the element
- **$nin** - An array doesn't contain the element
- **$all** - n array contains all elements
- **$exists** - Item exists or not
- **$ne** - Not equal

#### findRaw(query)

Finds data based on raw data.

#### findOne(query)

Finds data and returns the first matched item.

[1]: https://github.com/tommy351/warehouse