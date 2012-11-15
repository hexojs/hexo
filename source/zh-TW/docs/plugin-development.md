---
layout: page
title: 外掛開發
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 目錄

- [全域變數](#variable)
- [Generator](#generator)
- [Renderer](#renderer)
- [Helper](#helper)
- [Deployer](#deployer)
- [Processor](#processor)
- [Tag](#tag)
- [Console](#console)
- [Migrator](#migrator)
- [發佈](#publish)
- [原始碼](#source)

<a id="variable"></a>
## 全域變數

Hexo在初始化時，會建立一個名為`hexo`的命名空間（Namespace），以下是其內容，請勿刪除或變更這些變數。

- **base_dir** - 網站根目錄
- **public_dir** - 靜態檔案目錄（`public`）
- **source_dir** - 原始檔目錄（`source`）
- **theme_dir** - 主題目錄（`theme/theme_name`）
- **plugin_dir** - 外掛目錄（`node_modules`）
- **version** - Hexo 版本號
- **config** - 全域設定
- **extend** - 擴充功能
- **util** - 工具程式

<a id="generator"></a>
## Generator

Generator用於生成靜態檔案。

### 語法

``` javascript
hexo.extend.generator.register(iterator);
```

- **iterator(locals, render, callback)**
	- **locals** - [網站全域資料 (site)][1]
	- **render(layout, locals, callback)** - 渲染函數
		- **layout** - 要使用的模版
		- **locals** - 頁面資料，即 [主題變數][1] 中的 `page`
		- **callback** - 回傳函數，當渲染完成後執行此函數
	- **callback** - 回傳函數，當Generator執行完成後執行此函數
	
### 範例

在`public/archive.html`生成文章彙整頁面。

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

Renderer用於處理特定類型的檔案。

### 語法

``` javascript
hexo.extend.renderer.register(tag, output, iterator, [sync])
```

- **tag** - 輸入檔案的副檔名
- **output** - 輸出檔案的副檔名
- **iterator** - 見下方
- **sync** - 是否能同步執行，預設為`false`

**同步模式**（當`sync`為`true`時）

`iterator(path, content, [locals])` - 當執行完成時，應使用`return`回傳結果

- **path** - 輸入檔案的路徑，僅在編譯（Compile）模式時有效
- **content** - 輸入檔案的內容
- **locals** - 自定變數

**非同步模式**（當`sync`為`false`或未指定時）

`iterator(path, content, [locals], [callback])` - 當執行完成時，應透過`callback`回傳結果

- **path** - 輸入檔案的路徑，僅在編譯（Compile）模式時有效
- **content** - 輸入檔案的內容
- **locals** - 自定變數
- **callback** - 回傳函數，當`iterator`執行完成後執行此函數

### 範例

以下分別是內建Renderer中EJS和Stylus的原始碼，Stylus為了要使用`@import`功能，一定得使用非同步模式。

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

Helper為模版檔案中使用的函數。

### 語法

``` javascript
hexo.extend.helper.register(tag, iterator)
```

- **tag** - 標籤
- **iterator(path, template, locals)** - 應傳回一函數
	- **path** - 模版路徑
	- **template** - 模版內容
	- **locals** - 自定變數
	
###舉例

以下為內建Helper中js的原始碼。

``` javascript
hexo.extend.helper.register('js', function(){
  return function(path){
    return '<script type="text/javascript" src="' + path + '"></script>';
  }
});
```

<a id="deployer"></a>
## Deployer

Deployer用於佈署檔案。

### 語法

``` javascript
hexo.extend.deployer.register(tag, method)
```

- **tag** - 標籤
- **method** - 應為包含以下兩個項目的物件
	- **setup(args)** - 執行`hexo setup_deploy`時執行的函數
	- **deploy(args)** - 執行`hexo deploy`時執行的函數
	
### 範例

``` javascript
hexo.extend.deployer.register('github', {
	setup: function(args){ … },
	deploy: function(args){ … }
});
```

<a id="processor"></a>
## Processor

Processor用於處理原始檔案。

### 語法

``` javascript
hexo.extend.processor.register(iterator)
```

- **iterator(locals, callback)**
	- **locals** - [網站全域資料 (site)][1]
	- **callback(err, locals)**
		- **err** - 錯誤內容，當無錯誤時請返回`null`
		- **locals** - Processor處理後的 [網站全域資料 (site)][1]
		
### 範例

根據日期降冪排列文章。

``` javascript
hexo.extend.processor.register(function(locals, callback){
	locals.posts = locals.posts.sort('date', -1);
	locals.pages = locals.pages.sort('date', -1);
	
	callback(null, locals);
});
```

<a id="tag"></a>
## Tag

Tag為文章中使用的函數。

### 語法

``` javascript
hexo.extend.tag.register(tag, iterator, [ends])
```

- **tag** - 標籤
- **iterator(args, content)**
	- **args** - 參數
	- **content** - 內容
- **ends** - 是否須加入結尾標籤

### 範例

以下分別是內建Helper中youtube和pullquote的內容。

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

Console可讓你在命令列介面（CLI）中執行指令。

### 語法

``` javascript
hexo.extend.console.register(tag, description, iterator)
```

- **tag** - 標籤
- **description** - 描述
- **iterator(args)**
	- **args** - 參數
	
### 範例

執行以下指令時顯示網站設定。

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

Migrator讓你輕鬆地從其他系統遷移。

### 語法

``` javascript
hexo.extend.migrator.register(tag, iterator)
```

- **tag** - 標籤
- **iterator(args)**
	- **args** - 參數
	
<a id="publish"></a>
## 發佈

執行下列指令將你的外掛發佈至 NPM，發佈前別忘了檢查。

``` bash
npm publish
```

請參考 [NPM](https://npmjs.org/doc) 以取得更多資訊。

<a id="source"></a>
## 原始碼

你可參考內建外掛的 [原始碼](https://github.com/tommy351/hexo/tree/master/lib) 來製作外掛。

[1]: theme-development.html#variable