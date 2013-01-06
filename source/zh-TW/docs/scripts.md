---
layout: page
title: 腳本
lang: zh-TW
date: 2012-11-01 18:13:30
---

腳本（Script）相較於外掛（Plugin），是規模較小且僅有單一檔案的擴充元件。

## 使用

將JavaScript檔案放置於`scripts`資料夾，即會自動載入，檔案或資料夾名稱開頭為`_`（點）或`.`（底線）的會被忽略。

## 範例

文章建立後，自動使用 Vim 開啟檔案。

```
var exec = require('child_process').exec;

hexo.on('newPost', function(){
	exec('vim ' + target);
});
```

## 參考

- [全域變數][1]
- [事件][2]

[1]: global_variables.html
[2]: events.html