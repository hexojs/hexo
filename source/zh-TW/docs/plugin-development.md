---
layout: page
title: 外掛開發
lang: zh-TW
date: 2012-11-01 18:13:30
---

外掛分為以下八種類型：

- [Generator](#generator) - 生成靜態檔案
- [Renderer](#renderer) - 渲染檔案
- [Helper](#helper) - 樣板輔助方法
- [Deployer](#deployer) - 佈署工具
- [Processor](#processor) - 處理原始檔案
- [Tag](#tag) - 文章標籤
- [Console](#console) - 命令列介面（CLI）
- [Migrator](#migrator) - 遷移工具

<a name="generator"></a>
## Generator

### 語法

``` js
hexo.extend.generator.register(fn);
```

- **fn(locals, render, callback)**
  - **locals** - [網站全域資料][1]
  - **render(layout, locals, callback)** - 渲染函數
    - **layout** - 要使用的樣板
    - **locals** - 傳入樣板的資料，即樣板中的`page`變數
    - **callback** - 回傳函數
  - **callback** - 回傳函數

### 範例

在`public/archive.html`生成文章彙整頁面。

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

### 語法

``` js
hexo.extend.renderer.register(name, output, fn, [sync]);
```

- **name** - 輸入檔案的副檔名（小寫，不包含`.`）
- **output** - 輸出檔案的副檔名（小寫，不包含`.`）
- **fn** - 見下方
- **sync** - 同步模式，預設為`false`

`fn(data[, options], callback)`

- **data** - 輸入資料，包含以下內容
  - **path** - 原始檔案路徑
  - **text** - 檔案內容
- **options** - 選項
- **callback** - 回傳函數，僅限於非同步模式

### 範例

#### 同步模式

``` js
var ejs = require('ejs');

hexo.extend.renderer.register('ejs', 'html', function(data, options){
  options.filename = data.path;
	return ejs.render(data.text, options);
}, true);
```

#### 非同步模式

``` js
var stylus = require('stylus');

hexo.extend.renderer.register('styl', 'css', function(data,  callback){
	stylus(data.text).set('filename', data.path).render(callback);
});
```

<a name="helper"></a>
## Helper

### 語法

``` js
hexo.extend.helper.register();
```

### 舉例

插入 JavaScript 檔案。

``` js
hexo.extend.helper.register('js', function(path){
  return '<script type="text/javascript" src="' + path + '"></script>';
});
```

輸入：

```
<%- js('script.js') %>
```

輸出：

``` html
<script type="text/javascript" src="script.js"></script>
```

<a name="deployer"></a>
## Deployer

### 語法

``` js
hexo.extend.deployer.register(name, fn);
```

- **name** - 名稱（小寫）
- **fn(args)**
  - **args** - 引數

### 範例

``` js
hexo.extend.deployer.register('github', function(args){
	// ...
});
```

<a name="processor"></a>
## Processor

### 語法

``` js
hexo.extend.processor.register(fn);
```

- **fn(locals, callback)**
	- **locals** - [網站全域資料][1]
	- **callback(err, locals)**
		- **err** - 錯誤內容，當無錯誤時請返回`null`
		- **locals** - 處理後的資料

### 範例

根據日期降冪排列文章。

``` js
hexo.extend.processor.register(function(locals, callback){
	locals.posts = locals.posts.sort('date', -1);
	locals.pages = locals.pages.sort('date', -1);
	callback(null, locals);
});
```

<a name="tag"></a>
## Tag

### 語法

``` js
hexo.extend.tag.register(name, fn, [ends]);
```

- **name** - 名稱（小寫）
- **fn(args, content)**
	- **args** - 引數
	- **content** - 內容
- **ends** - 結尾標籤

### 範例

插入Youtube影片。

``` js
hexo.extend.tag.register('youtube', function(args, content){
  var id = args[0];
  return '<div class="video-container"><iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>';
});
```

插入 Pull Quote

``` js
hexo.extend.tag.register('pullquote', function(args, content){
  var className = args.length ? ' ' + args.join(' ') : '';
  return '<blockquote class="pullquote' + className + '">' + content + '</blockquote>';
}, true);
```

<a name="console"></a>
## Console

### 語法

``` js
hexo.extend.console.register(name, desc, [options], fn);
```

- **name** - 名稱（小寫）
- **desc** - 描述
- **options** - 選項（見下方）
- **fn(args)**
	- **args** - 引數

### 選項

- **init** - 未初始化時顯示
- **debug** - 除錯模式時顯示

### 範例

執行以下指令時顯示網站設定。

``` bash
hexo config
```

``` js
hexo.extend.console.register('config', 'Display configuration', function(args){
  console.log(hexo.config);
});
```

<a name="migrator"></a>
## Migrator

### 語法

``` js
hexo.extend.migrator.register(name, fn);
```

- **name** - 名稱（小寫）
- **fn(args)**
	- **args** - 引數

## 發佈

在發佈之前，別忘了先測試。將外掛複製至`node_modules`資料夾內，安裝相依性模組後，試著實際使用，或進行單元測試。

當一切測試結束後，執行以下指令，將外掛發佈至 NPM。

```
npm publish
```

## 參考

你可參考 [內建模組][2] 和 [官方外掛][3] 的原始碼來製作外掛。

[1]: template-data.html#site
[2]: https://github.com/tommy351/hexo/tree/master/lib
[3]: https://github.com/tommy351/hexo-plugins