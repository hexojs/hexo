---
layout: page
title: Plugin Development
date: 2012-11-01 18:13:30
---

There're 8 sorts of plugins:

- [Generator](#generator) - Generates static files
- [Renderer](#renderer) - Renders files
- [Helper](#helper) - Template helpers
- [Deployer](#deployer) - Deploy
- [Processor](#processor) - Process source files
- [Tag](#tag) - Article tag
- [Console](#console) - Command-line Interface (CLI)
- [Migrator](#migrator) - Migrate tool

<a name="generator"></a>
## Generator

### Syntax

``` js
hexo.extend.generator.register(fn);
```

- **fn(locals, render, callback)**
  - **locals** - [Global site data][1]
  - **render(layout, locals, callback)** - Render function
    - **layout** - The template to use
    - **locals** - Data passed to the template, the `page` variable in the template
    - **callback** - Callback function
  - **callback** - Callback function

### Example

Generates archives at `public/archive.html`.

``` js
hexo.extend.generator.register(function(locals, render, callback){
  hexo.route.set('archive.html', function(func){
    render('archive', locals, func);
  });
  callback();
});
```

<a name="renderer"></a>
## Renderer

### Syntax

``` js
hexo.extend.renderer.register(name, output, fn, [sync]);
```

- **name** - Extension of input file (lowercase, `.` excluded)
- **output** - Extension of output file (lowercase, `.` excluded)
- **fn** - As below
- **sync** - Sync mode (`false` by default)

`fn(data[, options], callback)`

- **data** - Input data containing the following
  - **path** - Source file path
  - **text** - File content
- **options** - Options
- **callback** - Callback function (Only in async mode)

### Example

#### Sync mode

``` js
var ejs = require('ejs');

hexo.extend.renderer.register('ejs', 'html', function(data, options){
  options.filename = data.path;
  return ejs.render(data.text, options);
}, true);
```

#### Async mode

``` js
var stylus = require('stylus');

hexo.extend.renderer.register('styl', 'css', function(data,  callback){
  stylus(data.text).set('filename', data.path).render(callback);
});
```

<a name="helper"></a>
## Helper

### Syntax

``` js
hexo.extend.helper.register();
```

### Example

Inserts a JavaScript file.

``` js
hexo.extend.helper.register('js', function(path){
  return '<script type="text/javascript" src="' + path + '"></script>';
});
```

Input:

```
<%- js('script.js') %>
```

Output:

``` html
<script type="text/javascript" src="script.js"></script>
```

<a name="deployer"></a>
## Deployer

### Syntax

``` js
hexo.extend.deployer.register(name, method);
```

- **name** - Name (lowercase)
- **method(args)**
  - **args** - Arguments

### Example

``` js
hexo.extend.deployer.register('github', {
  // ...
});
```

<a name="processor"></a>
## Processor

### Syntax

``` js
hexo.extend.processor.register(fn);
```

- **fn(locals, callback)**
	- **locals** - [Global site data][1]
	- **callback(err, locals)**
		- **err** - Error content. Return `null` when no error occurred.
		- **locals** - Processed data

### Example

Sort articles by date descending.

``` js
hexo.extend.processor.register(function(locals, callback){
	locals.posts = locals.posts.sort('date', -1);
	locals.pages = locals.pages.sort('date', -1);
	callback(null, locals);
});
```

<a name="tag"></a>
## Tag

### Syntax

``` js
hexo.extend.tag.register(name, fn, [ends]);
```

- **name** - Name (lowercase)
- **fn(args, content)**
	- **args** - Arguments
	- **content** - Content
- **ends** - End tag

### Example

Inserts a Youtube video.

``` js
hexo.extend.tag.register('youtube', function(args, content){
  var id = args[0];
  return '<div class="video-container"><iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>';
});
```

Inserts a pull quote.

``` js
hexo.extend.tag.register('pullquote', function(args, content){
  var className = args.length ? ' ' + args.join(' ') : '';
  return '<blockquote class="pullquote' + className + '">' + content + '</blockquote>';
}, true);
```

<a name="console"></a>
## Console

### Syntax

``` js
hexo.extend.console.register(name, desc, [options], fn);
```

- **name** - Name (lowercase)
- **desc** - Description
- **options** - Options (As below)
- **fn(args)**
	- **args** - Arguments

### Options

- **init** - Display when uninitialized
- **debug** - Display in debug mode

### Example

Display configuration when the following executed.

```
hexo config
```

``` js
hexo.extend.console.register('config', 'Display configuration', function(args){
  console.log(hexo.config);
});
```

<a name="migrator"></a>
## Migrator

### Syntax

``` js
hexo.extend.migrator.register(name, fn);
```

- **name** - Name (lowercase)
- **fn(args)**
	- **args** - Arguments


## Publish

Don't forget to test before publishing. Copy your plugin into `node_modules` folder and install dependencies. Try to use or do unit tests.

After all the tests done. Execute the following command to publish your plugins to NPM.

```
npm publish
```

## Reference

You can reference [built-in modules][2] and [official plugins][3] to develop your plugin.

[1]: template-data.html#site
[2]: https://github.com/tommy351/hexo/tree/master/lib
[3]: https://github.com/tommy351/hexo-plugins