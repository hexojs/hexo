---
layout: page
title: 佈署
lang: zh-TW
date: 2012-11-01 18:13:30
---

Hexo 的佈署非常簡單，所有的佈署都只需要三步僅可完成設定，分別是「設定 → 建立 → 佈署」。

## 目錄

- [GitHub](#github)
- [Heroku](#heroku)
- [Rsync](#rsync)

<a id="github"></a>
## GitHub

### 設定

編輯`_config.yml`，在`repository`欄位填入 GitHub 的 Repository。若 Repository類似`username.github.com`，則在`branch`欄位填入`master`，否則填入`gh-pages`。

``` yaml
deploy:
	type: github
	repository:
	branch:
```

### 建立

執行以下指令，Hexo 會自動建立一個隱藏資料夾`.deploy`，初始化 Git 並設定遠端 Repository。

``` bash
hexo setup_deploy
```

### 佈署

靜態檔案生成後，執行下列指令即可完成佈署。

``` bash
hexo deploy
```

### 移除

執行下列指令移除佈署。

``` bash
rm -rf .deploy
```

### 自定網域

在`source`資料夾內建立名為`CNAME`的檔案，其內容為：

```
example.com
```

請根據你的網域類型設定DNS。

#### 頂級網域 (Top-level domain)

若網域類似`example.com`，則加入 **A 記錄 (A record)** `204.232.175.78`。

#### 子網域 (Subdomain)

若網域類似`username.example.com`，則加入 **CNAME 記錄 (CNAME record)** `username.github.com`。

請參考 [GitHub Pages][1] 以取得更多資訊。

<a id="heroku"></a>
## Heroku

### 設定

編輯 `_config.yml`，在`repository`欄位填入 Heroku 的 Repository。

``` yaml
deploy:
	type: heroku
	repository:
```

### 建立

執行以下指令：

``` bash
hexo setup_deploy
```

Hexo會在網站根目錄建立兩個檔案：`Procfile`和`app.js`，初始化 Git 並設定遠端 Repository。

`Procfile`和`app.js`為必要檔案，**請勿刪除**，若不幸刪除，請依照以下內容重建檔案。

{% code Procfile %}
web: node app
{% endcode %}

{% code app.js %}
var connect = require('connect'),
	app = connect.createServer(),
	port = process.env.PORT;
	
app.use(connect.static(__dirname + "/public"));
app.use(connect.compress());

app.listen(port, function(){
	console.log("Hexo is running on port %d.", port);
});
{% endcode %}

### 佈署

靜態檔案生成後，執行下列指令即可完成佈署。

``` bash
hexo deploy
```

### 移除

刪除下列檔案和資料夾移除佈署。

``` plain
|-- _.git
|-- app.js
|-- Procfile
```

請參考 [Heroku][2] 以取得更多資訊。

<a id="rsync"></a>
## Rsync

### 設定

編輯`_config.yml`檔案。

``` yaml
deploy:
  type: rsync
  host:
  user:
  root:
  port:
  delete:
```

- **host** - 遠端主機的位址
- **user** - 使用者名稱
- **root** - 遠端主機的根目錄
- **port** - 連接埠（預設為`22`）
- **delete** - 刪除遠端主機的舊有檔案（預設為`true`）

### 建立

無須建立。

### 佈署

靜態檔案生成後，執行下列指令即可完成佈署。

``` bash
hexo deploy
```

[1]: https://help.github.com/articles/setting-up-a-custom-domain-with-pages
[2]: https://devcenter.heroku.com/