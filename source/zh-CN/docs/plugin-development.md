---
layout: page
title: 插件开发
lang: zh-CN
date: 2013-02-18 19:34:52
---

插件分为以下八种类型：

- [Generator](#generator) - 生成静态文件
- [Renderer](#renderer) - 渲染文件
- [Helper](#helper) - 模板辅助方法
- [Deployer](#deployer) - 部署工具
- [Processor](#processor) - 处理原始文件
- [Tag](#tag) - 文章标签
- [Console](#console) - 命令（CLI）
- [Migrator](#migrator) - 迁移工具

<a id="generator"></a>
## Generator

### 语法

``` js
hexo.extend.generator.register(fn);
```

- **fn(locals, render, callback)**
  - **locals** - [网站全局资料][1]
  - **render(layout, locals)** - 渲染函数
    - **layout** - 要使用的模板
    - **locals** - 传入模板的资料，即模板中的`page`变量
  - **callback** - 回传函数

### 范例

在`public/archive.html`生成文章列表页面。

``` js
hexo.extend.generator.register(function(locals, render, callback){
  hexo.route.set('archive.html', function(func){
    var result = render('archive', locals);
    func(null, result);
  });
});
```

<a id="renderer"></a>
## Renderer

### 语法

``` js
hexo.extend.renderer.register(name, output, fn, [sync]);
```

- **name** - 输入文件的扩展名（小写，不包含`.`）
- **output** - 输出文件的扩展名（小写，不包含`.`）
- **fn** - 见下方
- **sync** - 同步模式，预设为`false`

**同步模式**（当`sync`为`true`时）

`fn(path, content, [locals])` - 当执行完成时，应使用`return`回传结果

- **path** - 输入文件的路径，仅在编译（Compile）模式时有效
- **content** - 输入文件的内容
- **locals** - 自定变量

**非同步模式**（当`sync`为`false`或未指定时）

`fn(path, content, [locals], [callback])` - 当执行完成时，应透过`callback`回传结果

- **path** - 输入文件的路径，仅在编译（Compile）模式时有效
- **content** - 输入文件的内容
- **locals** - 自定变量
- **callback** - 回传函数

### 范例

#### 同步模式

``` js
var ejs = require('ejs'),
  _ = require('underscore');

hexo.extend.renderer.register('ejs', 'html', function(path, content, locals){
  if (path) locals = _.extend(locals, {filename: path});
  return ejs.render(content, locals);
}, true);
```

#### 非同步模式

``` js
var stylus = require('stylus');

hexo.extend.renderer.register('styl', 'css', function(path, content, callback){
  stylus(content).set('filename', path).render(callback);
});
```

<a id="helper"></a>
## Helper

### 语法

``` js
hexo.extend.helper.register(name, fn);
```

- **name** - 名称（小写）
- **fn** - 应传回一函数

### 举例

插入 JavaScript 文件。

``` js
hexo.extend.helper.register('js', function(){
  return function(path){
    return '<script type="text/javascript" src="' + path + '"></script>';
  }
});
```

输入：

```
<%- js('script.js') %>
```

输出：

``` html
<script type="text/javascript" src="script.js"></script>
```

<a id="deployer"></a>
## Deployer

### 语法

``` js
hexo.extend.deployer.register(name, fn);
```

- **name** - 名称（小写）
- **fn(args)**
  - **args** - 引数

### 范例

``` js
hexo.extend.deployer.register('github', function(args){
  // ...
});
```

<a id="processor"></a>
## Processor

### 语法

``` js
hexo.extend.processor.register(fn);
```

- **fn(locals, callback)**
  - **locals** - [网站全站资料][1]
  - **callback(err, locals)**
    - **err** - 错误内容，当无错误时请返回`null`
    - **locals** - 处理后的资料

### 范例

根据日期升降排列文章。

``` js
hexo.extend.processor.register(function(locals, callback){
  locals.posts = locals.posts.sort('date', -1);
  locals.pages = locals.pages.sort('date', -1);
  callback(null, locals);
});
```

<a id="tag"></a>
## Tag

### 语法

``` js
hexo.extend.tag.register(name, fn, [ends]);
```

- **name** - 名称（小写）
- **fn(args, content)**
  - **args** - 引数
  - **content** - 内容
- **ends** - 结尾标签

### 范例

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

<a id="console"></a>
## Console

### 语法

``` js
hexo.extend.console.register(name, desc, [options], fn);
```

- **name** - 名称（小写）
- **desc** - 描述
- **options** - 选项（见下方）
- **fn(args)**
  - **args** - 引数

### 选项

- **init** - 未初始化时显示
- **debug** - 调试模式时显示

### 范例

执行以下指令时显示网站设定。

``` bash
hexo config
```

``` js
hexo.extend.console.register('config', 'Display configuration', function(args){
  console.log(hexo.config);
});
```

<a id="migrator"></a>
## Migrator

### 语法

``` js
hexo.extend.migrator.register(name, fn);
```

- **name** - 名称（小写）
- **fn(args)**
  - **args** - 引数

## 发布

在发布之前，别忘了先测试。将插件复制至`node_modules`资料夹内，安装相关模组后，试着实际使用，或进行单元测试。

当一切测试结束后，执行以下指令，将插件发布至 NPM。

```
npm publish
```

## 参考

你可参考 [内建模组][2] 和 [官方插件][3] 的原始码来制作插件。

[1]: template-data.html#site
[2]: https://github.com/tommy351/hexo/tree/master/lib
[3]: https://github.com/tommy351/hexo-plugins