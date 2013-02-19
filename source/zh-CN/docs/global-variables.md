---
layout: page
title: 全局变量
lang: zh-CN
date: 2013-02-18 19:06:27
---

Hexo 在初始化时，会建立一个名为`hexo`的命名空间（Namespace），此命名空间内拥有以下唯读变量。

- **base_dir** - 网站根目录
- **public_dir** - 静态文件目录（public）
- **source_dir** - 源文件目录（source）
- **theme_dir** - 主题目录（theme/theme_name）
- **plugin_dir** - 插件目录（node_modules）
- **script_dir** - 脚本目录（scripts）
- **scaffold_dir** - 骨架目录（scaffolds）
- **core_dir** - 程序根目录（hexo）
- **lib_dir** - 程序资源库目录（hexo/lib）
- **version** - Hexo 版本号
- **env** - 执行环境
- **safe** - 安全模式
- **debug** - 调试模式
- **config** - [全站设定][1]，即`_config.yml`的内容
- **render** - [渲染][5]
- **[extend](#extend)** - 扩展程序
- **[util](#util)** - 工具程序
- **[i18n](#i18n)** - 国际化（i18n）模组
- **[route](#route)** - 路由模组
- **[cache](#cache)** - 缓存模组

<a id="extend"></a>
### extend

extend是负责处理所有扩展程序的模组，每个扩展都有两种方法：**list** 和 **register**，前者可列出该扩展所掌管的所有扩展程序，后者可挂载新的扩展程序到该扩展上。

#### generator

- **list** - 返回一个数组（Array）
- **register(fn)** - 加载扩展程序

#### renderer

- **list** - 返回一个对象（Object），扩展内的元素拥有`output`属性。
- **register(name, output, fn, sync)** - 挂载扩展程序。`name`为扩展程序的名称，`output`为输出后的扩展名，`sync`决定扩展程序是否可同步执行（预设为false）。

#### tag

- **list** - 返回一个对象（Object）
- **register(name, fn, ends)** - 挂载扩展程序。`name`为扩展程序的名称，`ends`决定该扩展程序是否拥有结尾标签（End tag），预设为`false`

#### deployer

- **list** - 返回一个对象（Object）
- **register(name, fn)** - 加载扩展程序。`name`为扩展程序的名称。

#### processor

- **list** - 返回一个数组（Array）
- **register(fn)** - 加载扩展程序

#### helper

- **list** - 返回一个对象（Object）
- **register(name, fn)** - 加载扩展程序。`name`为扩展程序的名称。

#### console

- **list** - 返回一个对象（Object），扩展内的元素拥有`description`属性。
- **register(name, desc, fn)** - 挂载扩展程序。`name`为扩展程序的名称，`desc`为扩展程序的描述。

#### migrator

- **list** - 返回一个对象（Object）
- **register(name, fn)** - 挂载扩展程序。`name`为扩展程序的名称。

更多详细资料请参考 [插件开发][2]。

<a id="util"></a>
### util

util为工具程序，包含下列模组：

#### file

用以操作文件，拥有以下方法：

- **mkdir(dest, callback)**
- **write(dest, content, callback)**
- **copy(src, dest, callback)**
- **dir(src, callback)**
- **read(src, callback)**
- **readSync(src, callback)**
- **empty(target, exclude, callback)**

#### highlight(string, options)

用以输出Highlight代码区块。以下为选项：

- **gutter** - 显示行号
- **first_line** - 起始行号
- **lang** - 语言
- **caption** - 代码区块说明

#### titlecase(string)

用以将字串转为适合的标题大小写。

#### yfm(string)

用以解析 [YAML Front Matter][3]，输出一个对象（Object），本文存放于`_content`属性。

<a id="i18n"></a>
### i18n

i18n为处理国际化（Internationalization）的模组，使用方式如下：

``` js
var i18n = new hexo.i18n();
```

i18n对象拥有以下方法：

#### get

第一引数必须为语言档的键值，其后的引数则会使用 [util.format][4] 处理。

若第一引数为数组（Array），则会判断第二引数的数值来处理复数名词。

- 第一引数拥有2个元素
  - n > 1: 使用第2个元素
  - n <= 1: 使用第1个元素
- 第一引数拥有3个元素
  - n > 1: 使用第3个元素
  - 0 < n <= 1: 使用第2个元素
  - n == 0: 使用第1个元素

#### set(key, value)

- **key** - 键值
- **value** - 对应值

#### list([obj])

若`obj`未定义，则传回对象内的所有数值；若`obj`为一对象（Object），则将对象取代为传入的引数。

#### load(path, callback)

自动载入语言文件。`path`为放置语言文件的文件夹，Hexo会根据`_config.yml`的`language`设定载入相对应的语言文件，若找不到语言文件的话，则会载入`default.yml`，因此文件夹内至少要有一个`default.yml`。

<a id="route"></a>
### route

自从0.3版之后，Hexo开始引入路由模组处理网站的所有文件路径。

#### get(path)

取得路径内容，传回一个函数。

#### set(path, content)

设定路径内容。`content`可为函数或其他内容，若为函数则必须使用`function(err, content)`格式。

#### format(path)

处理路径格式。若路径为空或结尾为`/`，则在最后加入`index.html`。

#### destroy(path)

删除路径。

#### list()

返回一个对象（Object）。

<a id="cache"></a>
### cache

#### list()

列出所有缓存内容。

#### get(name)

取得指定缓存。

#### set(name, value, [callback])

设定缓存内容。

#### destroy(name, [callback])

删除指定缓存。

[1]: configure.html
[2]: plugin-development.html
[3]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[4]: http://nodejs.org/api/util.html#util_util_format_format
[5]: render.html