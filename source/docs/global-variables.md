---
layout: page
title: Global Variables
date: 2012-11-01 18:13:30
---

Hexo creates a namespace `hexo` when initializing with the following read-only variables.

- **base_dir** - Root directory
- **public_dir** - Static files directory (public)
- **source_dir** - Source files directory (source)
- **theme_dir** - Theme directory (theme/theme_name)
- **plugin_dir** - Plugin directory (node_modules)
- **script_dir** - Script directory (scripts)
- **scaffold_dir** - Scaffold directory (scaffolds)
- **core_dir** - Program root directory (hexo)
- **lib_dir** - Program library directory (hexo/lib)
- **version** - Version of Hexo
- **env** - Environment
- **safe** - Safe mode
- **debug** - Debug mode
- **config** - [Global configuration][1], the content of `_config.yml`
- **render** - [Render][5]
- **[extend](#extend)** - Extensions
- **[util](#util)** - Utilities
- **[i18n](#i18n)** - Internationalization (i18n) module
- **[route](#route)** - Route module
- **[cache](#cache)** - Cache module

<a id="extend"></a>
### extend

**extend** is the module handling all extensions. Each extension has two method: **list** & **register**. The former lists all extensions that the object handling; the letter registers a new extension to the object.

#### generator

- **list** - Returns an array.
- **register(fn)** - Registers a extension.

#### renderer

- **list** - Returns an object. The element in the object has `output` property.
- **register(name, output, fn, sync)** - Registers a extension. `name` is the name of the extension. `output` is the extension of output files. `sync` is sync mode. (Default is `false`)

#### tag

- **list** - Returns an object.
- **register(name, fn, ends)** - Registers a extension. `name` is the name of the extension. `ends` is end tag. (Default is `false`)

#### deployer

- **list** - Returns an object.
- **register(name, fn)** - Registers a extension. `name` is the name of the extension.

#### processor

- **list** - Returns an array.
- **register(fn)** - Registers a extension.

#### helper

- **list** - Returns an array.
- **register(name, fn)** - Registers a extension. `name` is the name of the extension.

#### console

- **list** - Return an object. The element in the object has `description` property.
- **register(name, desc, fn)** - Registers a extension. `name` is the name of the extension. `desc` is the description of the extension.

#### migrator

- **list** - Returns an object.
- **register(name, fn)** - Registers a extension. `name` is the name of the extension.

Check [plugin development][2] for more info.

<a id="util"></a>
### util

**util** is the utilities, including the following module:

#### file

Operates file I/O, owning the following method:

- **mkdir(dest, callback)**
- **write(dest, content, callback)**
- **copy(src, dest, callback)**
- **dir(src, callback)**
- **read(src, callback)**
- **readSync(src, callback)**
- **empty(target, exclude, callback)**

#### highlight(string, options)

Exports highlighted code block. The following is the options:

- **gutter** - Display line numbers
- **first_line** - The first line number
- **lang** - Language
- **caption** - Caption

#### titlecase(string)

Transforms a string into proper title capitalization.

#### yfm(string)

Parses [YAML Front Matter][3]. Exports an object. The content is `_content` property.

<a id="i18n"></a>
### i18n

**i18n** is internationalization (i18n) module. Here's how to use:

``` js
var i18n = new hexo.i18n();
```

A i18n object owns the following methods:

#### get

The first argument must be the key value. The other arguments will be processed by [util.format][4].

When the first argument is an array, it will detect the second argument to process plural nouns.

- 2 elements in the 1st argument:
  - n > 1: Use the 2nd element
  - n <= 1: Use the 1st element
- 3 elements in the 1st argument:
  - n > 1: Use the 3rd element
  - 0 < n <= 1: Use the 2nd element
  - n == 0: Use the 1st element

#### set(key, value)

- **key** - Key value
- **value** - Value

#### list([obj])

Returns all elements of the object if `obj` undefined. Replaces the object with the argument if `obj` is an object.

#### load(path, callback)

Loads language files automatically. `path` is the language file directory. Hexo will based on `language` setting in `_config.yml`. If the language file is not found, it will load `default.yml` instead. So the directory must have `default.yml` at least.

<a id="route"></a>
### route

Hexo has started using route module to handle all paths of the website since version 0.3.

#### get(path)

Gets the content of the path.

``` js
route.get(path, function(err, result){
  ...
});
```

#### set(path, content)

Sets the content of the path. `content` can be a function or else. If it is a function, it must pass a callback with two arguments: `(err, result)`.

``` js
route.set(path, content);

route.set(path, function(fn){
  fn(null, 'content');
});
```

#### format(path)

Formats the path. Adds `index.html` if the path is empty or ended with `/`.

#### destroy(path)

Deletes a path.

#### list()

Returns an object.

<a id="cache"></a>
### cache

#### list()

List all contents of cache.

#### get(name)

Get the specific cache.

#### set(name, value, [callback])

Set the cache.

#### destroy(name, [callback])

Delete the specific cache.

[1]: configure.html
[2]: plugin-development.html
[3]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[4]: http://nodejs.org/api/util.html#util_util_format_format
[5]: render.html