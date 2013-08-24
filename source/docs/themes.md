title: Themes
prev: permalinks
next: variables
---
It's easier to build your theme based on the default theme. If you come across any problems, please [submit the issue](https://github.com/tommy351/hexo/issues) on GitHub.

## Structure

``` plain
.
├── _config.yml
├── languages
├── layout
└── source
```

### _config.yml

Theme configuration file.

### languages

Folder of language files.

### layout

Layout folder. File or folder whose name is prefixed with `_` (underscore) and hidden files will be ignored.

Hexo provides [EJS](https://github.com/visionmedia/ejs) and [Swig](http://paularmstrong.github.com/swig/) template engine. You can install other template engines such as Haml, Jade. Hexo chooses template engines based on the extension name of files. For example:

``` plain
EJS: layout.ejs
Swig: layout.swig
```

Every theme should at least has `index` layout.

Layout | Description | Fallback
--- | --- | ---
`index` | Index layout | 
`post` | Post layout | `index`
`page` | Page layout | `index`
`archive` | Archives layout | `index`
`category` | Category archives layout | `archive`
`tag` | Tag archives layout | `archive`

Hexo ported **Layout** and **Partials** feature from Express. Every template file use `layout.ejs` as layout by default. You can set `layout: false` in front-matter or delete `layout.ejs` to disable the layout feature.

{% note info Custom layout %}
If you set a custom for your posts. You have to add a new layout file in `layout` folder or it'll fallback to `post` layout. Page variables in the custom layout is same as `post` layout.
{% endnote %}

### source

Source folder. Asset files like CSS and Javascript files should be placed in this folder. File or folder whose name is prefixed with `_` (underscore) and hidden files will be ignored. Stylus files will be processed and put into `public` folder, while other files will be copied.

Hexo supports [Stylus](http://learnboost.github.com/stylus/) and [nib](http://visionmedia.github.com/nib/). You can install other plugins such as Less, CoffeeScript.

## Basic Techniques

Here are some code snippets that may help you on theme development.

### Post index

```
<% page.posts.each(function(post){ %>
  <article class="post">
    <h1>
      <a href="<%= config.root %><%= post.path %>"><%= post.title %></a>
    </h1>
  </article>
<% }); %>
```

### Post excerpts

```
<% page.posts.each(function(post){ %>
  <article class="post">
    <% if (post.excerpt){ %>
      <%- post.excerpt %>
    <% } else { %>
      <%- post.content %>
    <% } %>
  </article>
<% }); %>
```

### Recent posts

```
<ul>
  <% site.post.sort('date', -1).limit(5).each(function(post){ %>
    <li>
      <a href="<%= config.root %><%= post.path %>"><%= post.title %></a>
    </li>
  <% }); %>
</ul>
```

### Tag list

You can inserts a tag list in your theme by `list_tags()` helper or the following code.

```
<ul>
<% site.tags.sort('name').each(function(tag){ %>
  <li><a href="<%- config.root %><%- tag.path %>"><%= tag.name %></a><small><%= tag.posts.length %></small></li>
<% }); %>
</ul>
```

### Disqus comment

```
<div id="disqus_thread">
  <noscript>Please enable JavaScript to view the <a href="//disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
</div>
<script type="text/javascript">
var disqus_shortname = '<%= config.disqus_shortname %>';

(function(){
  var dsq = document.createElement('script');
  dsq.type = 'text/javascript';
  dsq.async = true;
  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
}());
</script>
```