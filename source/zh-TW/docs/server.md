---
layout: page
title: 伺服器
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 內建伺服器

Hexo 使用 [Connect][1] 作為靜態檔案的伺服器。

編輯`_config.yml`中的`port`欄位調整伺服器的連接埠。

``` yaml
port: 4000
```

執行以下命令啟動伺服器，按下`Ctrl+C`關閉伺服器。加入 `-p` 選項設定連接埠。

``` bash
hexo server
hexo server -p 12345
```

### 記錄器

編輯`_config.yml`中的`logger`欄位啟動記錄器。編輯`logger_format`欄位可調整記錄的顯示內容，參考 [Connect][4] 以獲得更多資訊。

``` yaml
logger: true
logger_format:
```

## Pow

[Pow][2] 是由Node.js所建立的Mac環境專用的零配置Rack伺服器，不過它也能用於處理一般的靜態檔案。

### 安裝

執行以下命令即可完成安裝。

``` bash
curl get.pow.cx | sh
```

### 使用

在`~/.pow`建立連結即可使用。

``` bash
cd ~/.pow
ln -s /path/to/myapp
```

完成後，網站即會出現在`http://myapp.dev`，網址根據連結名稱而有所不同。

參考 [Pow][3] 以獲得更多資訊。

[1]: https://github.com/senchalabs/connect
[2]: http://pow.cx/
[3]: http://pow.cx/manual.html
[4]: http://www.senchalabs.org/connect/logger.html