---
layout: page
title: 佈署
lang: zh-TW
date: 2012-11-01 18:13:30
---

Hexo 的佈署非常簡單，僅需一個指令即可完成所有設定。

## GitHub

### 設定

編輯`_config.yml`。

``` yaml
deploy:
  type: github
  repository:
  branch:
```

- **repository** - GitHub的Repository網址
- **branch** - 若 Repository類似`username.github.com`，則填入`master`，否則填入`gh-pages`

### 佈署

靜態檔案生成後，執行下列指令即可完成佈署，或可加入 `--generate` 選項，在佈署前自動生成檔案。

``` bash
hexo deploy
hexo deploy --generate
```

### 移除

執行下列指令移除佈署檔案。

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

## Heroku

### 設定

編輯 `_config.yml`。

``` yaml
deploy:
  type: heroku
  repository:
```

- **repository** - Heroku的Repository

### 佈署

靜態檔案生成後，執行下列指令即可完成佈署，或可加入 `--generate` 選項，在佈署前自動生成檔案。

``` bash
hexo deploy
hexo deploy --generate
```

請參考 [Heroku][2] 以取得更多資訊。

### 移除

刪除`.git`、`app.js`和`Procfile`即可移除佈署。

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

### 佈署

靜態檔案生成後，執行下列指令即可完成佈署，或可加入 `--generate` 選項，在佈署前自動生成檔案。

``` bash
hexo deploy
hexo deploy --generate
```

[1]: https://help.github.com/articles/setting-up-a-custom-domain-with-pages
[2]: https://devcenter.heroku.com/