---
layout: page
title: Plugin Development
date: 2012-11-01 18:13:30
---

## Contents

- [Global Variable](#variable)
- [Generator](#generator)
- [Renderer](#renderer)
- [Helper](#helper)
- [Deployer](#deployer)
- [Processor](#processor)
- [Tag](#tag)
- [Console](#console)
- [Migrator](#migrator)
- [Publish](#publish)
- [Source](#source)

<a id="variable"></a>
## Global Variable

When initializing, Hexo create a namespace named `hexo` with the following content. Do not delete or modify them.

- **base_dir** - Root directory of website
- **public_dir** - Static files directory (`public`)
- **source_dir** - Source files directory (`source`)
- **theme_dir** - Theme directory (`theme/theme_name`)
- **plugin_dir** - Plugin directory (`node_modules`)
- **version** - Version of Hexo
- **config** - Global configuration
- **extend** - Extensions
- **util** - Utilities

<a id="generator"></a>
## Generator

Generator is used to generate static files.

### Syntax

```
hexo.extend.generator.register(iterator);
```

- **iterator(locals, render, callback)**
	- **locals** - [Global site data (site)][1]
	- **render(layout, locals, callback)** - Render function
		- **layout** - The template to use
		- **locals** - Page data, `page` in [theme variables][1].
		- **callback** - Callback function, execute when rendering is completed
	- **callback** - Callback function, execute when generating is completed
	
### Example

Generate archive page at `public/archive.html`.

``` javascript
var fs = require('fs');

hexo.extend.generator.register(function(locals, render, callback){
  render('archive', locals.posts, function(err, result){
  	if (err) throw err;
  	fs.writeFile(hexo.public_dir + 'archive.html', result, callback);
  });
});
```

<a id="renderer"></a>
## Renderer

Renderer is used to process specific files.

### Syntax

``` javascript
hexo.extend.renderer.register(tag, output, iterator, [sync])
```

- **tag** - Filename extension of input file
- **output** - Filename extension of output file
- **iterator** - As below
- **sync** - Ability to execute synchronously. Default is `false`.

**Synchronous mode** (When `sync` equals `true`)

`iterator(path, content, [locals])` - Use `return` to return the result

- **path** - Path of input file. Only available in compile mode.
- **content** - Content of input file
- **locals** - Custom variables

**Asynchronous mode** (When `sync` equals `false`)

`iterator(path, content, [locals], [callback])` - Use `callback` to return the result

- **path** - Path of input file. Only available in compile mode.
- **content** - Content of input file.
- **locals** - Custom variables
- **callback** - Callback function, execute when done

### Example

Here are the source code of the built-in renderers: EJS & Stylus. In order to use `@import` in Stylus, it must use asynchronous mode.

``` javascript
var ejs = require('ejs');

hexo.extend.renderer.register('ejs', 'html', function(filename, content, locals){
	if (filename) locals = _.extend(locals, {filename: filename});
	return ejs.render(content, locals);
}, true);
```

``` javascript
var stylus = require('stylus');

hexo.extend.renderer.register('styl', 'css', function(filename, content, callback){
	stylus(content).set('filename', file).render(callback);
});
```

<a id="helper"></a>
## Helper

Helper is the function used in articles.

### Syntax

``` javascript
hexo.extend.helper.register(tag, iterator)
```

- **tag** - Tag
- **iterator(path, template, locals)** - It should return a function
	- **path** - Template path
	- **template** - Template source
	- **locals** - Custom variables
	
### Example

Here is the source code of the built-in helper: js.

``` javascript
hexo.extend.helper.register('js', function(){
  return function(path){
    return '<script type="text/javascript" src="' + path + '"></script>';
  }
});
```

<a id="deployer"></a>
## Deployer

Deployer is used to deploy.

### Syntax

``` javascript
hexo.extend.deployer.register(tag, method)
```

- **tag** - Tag
- **method** - It should be a object include the two following items
	- **setup(args)** - Execute when run `hexo setup_deploy`
	- **deploy(args)** - Execute when run `hexo deploy`
	
### Example

``` javascript
hexo.extend.deployer.register('github', {
	setup: function(args){ … },
	deploy: function(args){ … }
});
```

<a id="processor"></a>
## Processor

Processor is used to process source files.

### Syntax

``` javascript
hexo.extend.processor.register(iterator)
```

- **iterator(locals, callback)**
	- **locals** - [Global site data (site)][1]
	- **callback(err, locals)**
		- **err** - Error content. Return `null` when no error occurred.
		- **locals** - Processed [global site data (site)][1]
		
### Example

Sort articles by date descending.

``` javascript
hexo.extend.processor.register(function(locals, callback){
	locals.posts = locals.posts.sort('date', -1);
	locals.pages = locals.pages.sort('date', -1);
	
	callback(null, locals);
});
```

<a id="tag"></a>
## Tag

Tag is the function used in articles.

### Syntax

``` javascript
hexo.extend.tag.register(tag, iterator, [ends])
```

- **tag** - Tag
- **iterator(args, content)**
	- **args** - Arguments
	- **content** - Content
- **ends** - Whether to add end tag

### Example

Here are the source code of the built-in helpers: youtube, pullquote.

``` javascript
hexo.extend.tag.register('youtube', function(args, content){
  var id = args[0];

  return '<div class="video-container"><iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>';
});
```

``` javascript
hexo.extend.tag.register('pullquote', function(args, content){
  var className = args.length ? ' ' + args.join(' ') : '';

  return '<blockquote class="pullquote' + className + '">' + content + '</blockquote>';
}, true);
```

<a id="console"></a>
## Console

Console allows you to execute commands in command-line interface (CLI).

### Syntax

``` javascript
hexo.extend.console.register(tag, description, iterator)
```

- **tag** - Tag
- **description** - Description
- **iterator(args)**
	- **args** - Arguments
	
### Example

Display the configuration of website when execute the following command.

``` bash
hexo config
```

``` javascript
hexo.extend.console.register('config', 'Display configuration', function(args){
  console.log(hexo.config);
});
```

<a id="migrator"></a>
## Migrator

Migrator helps you migrate from other system easily.

### Syntax

``` javascript
hexo.extend.migrator.register(tag, iterator)
```

- **tag** - Tag
- **iterator(args)**
	- **args** - Arguments
	
<a id="publish"></a>
## Publish

Execute the following command to publish your plugin to NPM registry. Remember to test it before published.

``` bash
npm publish
```

Check [NPM](https://npmjs.org/doc) for more info.

<a id="source"></a>
## Source

You can reference the [source code](https://github.com/tommy351/hexo/tree/master/lib) of the built-in plugins to create your plugin.

[1]: theme-development.html#variable