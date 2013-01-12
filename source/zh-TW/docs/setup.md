---
layout: page
title: 建立
lang: zh-TW
date: 2012-11-01 18:13:30
---

安裝完成後，在你喜愛的資料夾下，執行以下指令，Hexo 即會自動在目標資料夾建立網站所需要的所有檔案。

``` bash
hexo init <folder>
```

建立完成後，資料夾結構如下：

``` plain
|-- .gitignore
|-- _config.yml
|-- package.json
|-- public
|-- scaffolds
|-- scripts
|-- source
|   |-- _posts
        |-- hello-world.md
|   |-- _drafts
|-- themes
    |-- light
```

### _config.yml

全域的設定檔案。

### package.json

應用程式資料。**請勿刪除**，若不幸刪除，請依照以下內容重建檔案。

``` json
{
  "name": "hexo",
  "version": "0.0.1",
  "private": true,
  "engines": {
    "node": ">0.6.0",
    "npm": ">1.1.0"
  },
  "dependencies": {}
}
```

### public

靜態檔案資料夾。

### scaffolds

[骨架][2] 資料夾。

### scripts

[腳本][3] 資料夾。

### source

在此資料夾內的檔案會被處理並另存至`public`資料夾。名稱開頭為`.`（點）或`_`（底線）的檔案或資料夾會被忽略，除了`_posts`資料夾以外。

### themes

主題資料夾。Hexo 的預設主題為 [Light][1]。

[1]: https://github.com/tommy351/hexo-theme-light
[2]: scaffolds.html
[3]: scripts.html