title: Pagination
prev: variables
next: helpers
---
When there're many posts in your blog, it's useful to separate into several pages. Hexo supports pagination. The following is how you can use pagination in Hexo.

Before we start, you have to enable pagination. Edit `per_page` setting to change how many posts displayed in a single page. To disable pagination, just set it to `0`.

``` yaml
per_page: 10
```

You can edit the following setting to enable or disable pagination for specific pages. 

- 2: Enable pagination
- 1: Disable pagination
- 0: Fully disable

``` yaml
archive: 2
category: 2
tag: 2
```

## Basic

The most basic pagination is just two links: "Previous page" & "Next page". For example:

```
<% if (page.prev){ %>
  <a href="<%- config.root %><%- page.prev_link %>">Prev</a>
<% } %>
<% if (page.next){ %>
  <a href="<%- config.root %><%- page.next_link %>">Next</a>
<% } %>
```

## Paginator helper

To display pagination in number. You can use paginator helper. It helps you insert pagination fast.

```
<%- paginator() %>
```