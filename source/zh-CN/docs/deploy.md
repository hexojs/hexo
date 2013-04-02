---
layout: page
title: 部署
lang: zh-CN
date: 2013-02-18 19:04:50
---

Hexo 的部署非常简单，仅需一个指令即可完成所有设定。

## GitHub

### 设定

编辑`_config.yml`。

``` yaml
deploy:
  type: github
  repository:
  branch:
```

- **repository** - GitHub的Repository网址
- **branch** - 若 Repository类似`username.github.com`，则填入`master`，否则填入`gh-pages`

### 部署

静态文件生成后，执行下列指令即可完成部署，或可加入 `--generate` 选项，在部署前自动生成文件。

``` bash
hexo deploy
hexo deploy --generate
```

### 移除

执行下列指令移除部署文件。

``` bash
rm -rf .deploy
```

### 自定域名

在`source`文件夹内建立名为`CNAME`的文件。

请根据你的域名类型设定DNS。

#### 顶级域名 (Top-level domain)

若域名类似`example.com`，则加入 **A 记录 (A record)** `204.232.175.78`。`CNAME`文件内容为`example.com`。

#### 子域名 (Subdomain)

若域名类似`username.example.com`，则加入 **CNAME 记录 (CNAME record)** `username.github.com`。`CNAME`文件内容为`username.example.com`。

请参考 [GitHub Pages][1] 以取得更多资讯。

## Heroku

### 设定

编辑 `_config.yml`。

``` yaml
deploy:
  type: heroku
  repository:
```

- **repository** - Heroku的Repository

### 部署

静态文件生成后，执行下列指令即可完成部署，或可加入 `--generate` 选项，在部署前自动生成文件。

``` bash
hexo deploy
hexo deploy --generate
```

请参考 [Heroku][2] 以取得更多资讯。

### 移除

删除`.git`、`app.js`和`Procfile`即可移除部署。

## Rsync

### 设定

编辑`_config.yml`文件。

``` yaml
deploy:
  type: rsync
  host:
  user:
  root:
  port:
  delete:
```

- **host** - 远端主机的位置
- **user** - 使用者名称
- **root** - 远端主机的根目录
- **port** - 连接端口（预设为`22`）
- **delete** - 删除远端主机的旧有文件（预设为`true`）

### 部署

静态文件生成后，执行下列指令即可完成部署，或可加入 `--generate` 选项，在部署前自动生成文件。

``` bash
hexo deploy
hexo deploy --generate
```

[1]: https://help.github.com/articles/setting-up-a-custom-domain-with-pages
[2]: https://devcenter.heroku.com/
