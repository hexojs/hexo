---
layout: page
title: Scripts
date: 2012-11-01 18:13:30
---

A script is a extension which is smaller than a plugin and only has one file.

## Usage

Put a JavaScript file in `scripts` folder and it will be loaded automatically. File or folder whose name started with `.` (dot) or `_` (underscore) will be ignored.

## Example

Open file after the post created.

```
var spawn = require('child_process').spawn;

hexo.on('new', function(){
  spawn('open', [target]);
});
```

## Reference

- [Global variables][1]
- [Events][2]

[1]: global_variables.html
[2]: events.html