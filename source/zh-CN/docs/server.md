---
layout: page
title: 服务器
lang: zh-CN
date: 2013-02-18 19:31:09
---

## 内建服务器

Hexo 使用 [Connect][1] 作为静态文件的服务器。

编辑`_config.yml`中的`port`栏位调整服务器的连接端口。

``` yaml
port: 4000
```

执行以下命令启动服务器，按下`Ctrl+C`关闭服务器。加入 `-p/--port` 选项设定连接端口。

``` bash
hexo server
hexo server -p 12345
```

### 记录器

编辑`_config.yml`中的`logger`栏位启动记录器。编辑`logger_format`栏位可调整记录的显示内容，参考 [Connect][4] 以获得更多资讯。

``` yaml
logger: true
logger_format:
```

## Pow

[Pow][2] 是由Node.js所建立的Mac环境专用的零配置Rack服务器，不过它也能用于处理一般的静态文件。

### 安装

执行以下命令即可完成安装。

``` bash
curl get.pow.cx | sh
```

### 使用

在`~/.pow`建立链接即可使用。

``` bash
cd ~/.pow
ln -s /path/to/myapp
```

完成后，网站即会出现在`http://myapp.dev`，网址根据链接名称而有所不同。

参考 [Pow][3] 以获得更多资讯。

[1]: https://github.com/senchalabs/connect
[2]: http://pow.cx/
[3]: http://pow.cx/manual.html
[4]: http://www.senchalabs.org/connect/logger.html