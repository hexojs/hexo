---
layout: page
title: 脚本
lang: zh-TW
date: 2013-02-18 19:32:35
---

脚本（Script）相较于插件（Plugin），是规模较小且仅有单一文件的扩展程序。

## 使用

将JavaScript文件放置于`scripts`文件夹，即会自动载入，文件或文件夹名称开头为`_`（点）或`.`（底线）的会被忽略。

## 范例

文章建立后，自动开启文件。

```
var spawn = require('child_process').spawn;

hexo.on('newPost', function(){
  spawn('open', [target]);
});
```

## 参考

- [全局变量][1]
- [事件][2]

[1]: global_variables.html
[2]: events.html