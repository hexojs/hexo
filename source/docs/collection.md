---
layout: page
title: Collection
date: 2012-11-01 18:13:30
---

<a id="collection"></a>
## Collection

Collection class is used for general article collection.

#### each(iterator)

Iterates over the elements of the collection. The iterator has two arguments: `(item, i)`, `item` is the current item of the iterator, `i` is the times that the iterator has executed.
	
**Alias**：forEach
	
#### map(iterator)

Produces a new collection by iterating over the elements of the collection and replacing the original value with the return value. The iterator has two arguments: `(item, i)`, `item` is the current item of the iterator, `i` is the times that the iterator has executed.

#### filter(iterator)

Iterates over the elements of the collection and returns a new collection of all the elements that pass a truth test (**iterator**). The iterator has two arguments: `(item, i)`, `item` is the current item of the iterator, `i` is the times that the iterator has executed.

**Alias**：select
	
#### toArray

Converts the collection into an array.

#### slice(start, [end])

Returns a specific part of the collection. `start`, `end` can be a negative number.

#### skip(num)

Skips the first specific elements of the collection.

``` js
collection.skip(10);
```

Equals:

``` js
collection.slice(10);
```

#### limit(num)

Limits the quantity of elements in the collection.

``` js
collection.limit(10);
```

Equals:

``` js
collection.slice(0, 10);
```

#### set(item)

Adds a element to the collection.

**Alias**：push
	
#### sort(orderby, [order])

Sorts the elements of the collection. Ascending when `order` equals `1` or `asc`, descending when `order` equals `-1` or `desc`.

#### reverse

Returns a reversed copy of the collection.

#### random

Returns a shuffled copy of the collection.

**Alias**：shuffle

<a id="taxonomy"></a>
## Taxonomy

Taxonomy is used for taxonomy collection, the inheritance of Collection class. The difference between Collection class is that Taxonomy class uses a string as a key value.

#### get(name)

Gets the specific element of the collection.
	
#### set(name, item)

Added a element named `name` to the collection.

**Alias**：push
	
#### each(iterator)

Iterates over the elements of the collection. The iterator has three arguments: `(value, key, i)`, `value` is the value of the current item, `key` is the key value of the current item, `i` is the times that the iterator has executed.
	
**Alias**：forEach
	
#### map(iterator)

Produces a new collection by iterating over the elements of the collection and replacing the original value with the return value. The iterator has three arguments: `(value, key, i)`, `value` is the value of the current item, `key` is the key value of the current item, `i` is the times that the iterator has executed.

#### filter(iterator)

Iterates over the elements of the collection and returns a new collection of all the elements that pass a truth test (**iterator**). The iterator has three arguments: `(value, key, i)`, `value` is the value of the current item, `key` is the key value of the current item, `i` is the times that the iterator has executed.

**Alias**：select

<a id="paginator"></a>
## Paginator

Paginator inherits the original class and adds the following properties.

- **per_page** - Posts displayed per page
- **total** - Amount of posts
- **current** - Current page number
- **current_url** - Link of current page
- **posts** - [Collection class][1]
- **prev** - Previous page number
- **prev_link** - Link of previous page
- **next** - Next page number
- **next_link** - Link of next page

[1]: #collection