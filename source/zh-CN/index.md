---
layout: index
title: Node.js 博客框架
subtitle: 快速、简单且功能强大的 Node.js 博客框架。
date: 2013-02-18 19:47:34
lang: zh-CN
---

## 功能

- 不可思议的快速 ─ 只要一眨眼静态文件即生成完成
- 支持 [Markdown][1]
- 仅需一道指令即可部署到 [GitHub Pages][2] 和 [Heroku][3]
- 已移植 [Octopress][4] 插件
- 高扩展性、自订性
- 兼容于 Windows, Mac & Linux

## 安装

``` bash
npm install -g hexo
```

## 更新

``` bash
npm update -g
```

## 开始

建立项目：

``` bash
hexo init project
cd project
```

建立新文章：

``` bash
hexo new "New Post"
```

生成静态文件：

``` bash
hexo generate
```

启动服务器：

``` bash
hexo server
```

## 下一步

有兴趣吗？浏览 [文件][5] 了解如何使用！

[1]: http://daringfireball.net/projects/markdown/
[2]: http://pages.github.com/
[3]: http://heroku.com/
[4]: http://octopress.org/
[5]: docs/