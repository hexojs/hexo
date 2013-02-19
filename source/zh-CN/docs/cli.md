---
layout: page
title: 命令 (CLI)
lang: zh-CN
date: 2013-02-18 18:50:50
---

显示 Hexo 目前的版本号

	hexo version

建立网站，若`folder`未定义，则Hexo会在目前的资料夹建立网站

	hexo init <folder>

建立新文章

	hexo new [layout] <title>

生成静态文件，使用`-t`或`--theme`以忽略主题安装

- -t/--theme：忽略主题安装
- -d/--deploy：生成后自动布局
- -w/--watch：监视文件变更

```
hexo generate
hexo generate -t/--theme
hexo generate -d/--deploy
hexo generate -w/--watch
```

启动服务器，按下`Ctrl+C`停止服务器

- -p/--port：连接端口设定

```
hexo server
hexo server -p 12345
```

预览，按下`Ctrl+C`停止服务器

- -p/--port：连接端口设定
- -w/--watch：监视文件变更

```
hexo preview
hexo preview -p 12345
```

显示网站设定

	hexo config

部署

- --setup：只设定不部署
- --generate：部署前先生成文件

```
hexo deploy
hexo deploy --setup
hexo deploy --generate
```

渲染文件

	hexo render <source> <destination>

安全模式，此模式下插件不会被载入

	hexo --safe

调试模式

	hexo --debug