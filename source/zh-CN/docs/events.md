---
layout: page
title: 事件
lang: zh-CN
date: 2013-02-18 19:46:12
---

[全局变量][1] `hexo` 本身是一个 [EventEmitter][2] 对象，你可直接监听或触发事件。

## 使用

监听事件：

```
hexo.on('ready', function(){
	...
});
```

触发事件：

```
hexo.emit('event', [arg1], [arg2], [….]);
```

[参考][2]

## 预设事件

### ready

设定和所有插件都载入完毕后。

### generateBefore

开始生成文件前。

### generateAfter

生成文件完成后。

### new

建立新文章后。回传一个参数 `target`，代表新文件的绝对路径。

### server

服务器开启后。

### preview

预览服务器开启后。

[1]: global-variables.html
[2]: http://nodejs.org/api/events.html#events_class_events_eventemitter