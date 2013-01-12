---
layout: page
title: Deploy
date: 2012-11-01 18:13:30
---

It's easy to deploy with Hexo. It just needs 1 command to complete all the settings.

## GitHub

### Configure

Edit `_config.yml`. Fill `repository` with GitHub repository. If repository is like `username.github.com`, fill `branch` with `master`, otherwise `gh-pages`.

``` yaml
deploy:
  type: github
  repository:
  branch:
```

- **repository** - GitHub repository
- **branch** - If repository is like `username.github.com`, fill it with `master`, otherwise `gh-pages`

### Deploy

After the static files are generated, execute the following to deploy. You can add `--generate` option to generate automatically before deploy.

``` bash
hexo deploy
hexo deploy --generate
```

### Remove

Execute the following command to remove deployment.

``` bash
rm -rf .deploy
```

### Custom Domain

Create a file name `CNAME` in `source` folder with the following content.

```
example.com
```

Configure DNS according to the type of domain.

#### Top-level Domain

If the domain is like `example.com`, add A record `204.232.175.78`.

#### Subdomain

If the domain is like `username.example.com`, add CNAME record `username.github.com`.

Check [GitHub Pages][1] for more info.

## Heroku

### Configure

Edit `_config.yml`.

``` yaml
deploy:
  type: heroku
  repository:
```

- **repository** - Heroku repository

### Deploy

After the static files are generated, execute the following to deploy. You can add `--generate` option to generate automatically before deploy.

``` bash
hexo deploy
hexo deploy --generate
```

Check [Heroku][2] for more info.

### Remove

Remove `.git`, `app.js` and `Procfile`.

## Rsync

### Configure

Edit`_config.yml`.

``` yaml
deploy:
  type: rsync
  host:
  user:
  root:
  port:
  delete:
```

- **host** - Address of remote host
- **user** - Username
- **root** - Root directory of remote host
- **port** - Port (Default is `22`)
- **delete** - Delete old files on remote host (Default is `true`)

### Deploy

After the static files are generated, execute the following to deploy. You can add `--generate` option to generate automatically before deploy.

``` bash
hexo deploy
hexo deploy --generate
```

[1]: https://help.github.com/articles/setting-up-a-custom-domain-with-pages
[2]: https://devcenter.heroku.com/