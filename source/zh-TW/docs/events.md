---
layout: page
title: 事件
lang: zh-TW
date: 2012-11-01 18:13:30
---

[全域變數][1] `hexo` 本身是一個 [EventEmitter][2] 物件，你可直接監聽或觸發事件。

## 使用

監聽事件：

```
hexo.on('ready', function(){
	...
});
```

觸發事件：

```
hexo.emit('event', [arg1], [arg2], [….]);
```

[參考][2]

## 預設事件

### ready

設定和所有外掛都載入完畢後。

### generateBefore

開始生成檔案前。

### generateAfter

生成檔案完成後。

### newPost

建立新文章後。回傳一個參數 `target`，代表新檔案的絕對路徑。

### newPage

建立新分頁後。回傳一個參數 `target`，代表新檔案的絕對路徑。

### serverOn

伺服器開啟後。

### previewOn

預覽伺服器開啟後。

[1]: global-variables.html
[2]: http://nodejs.org/api/events.html#events_class_events_eventemitter