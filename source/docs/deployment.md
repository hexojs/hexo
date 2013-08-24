title: Deployment
prev: server
next: permalinks
---
To deploy your site with Hexo, you only need one command.

``` bash
$ hexo deploy
```

## GitHub

Edit `_config.yml`.

``` yaml
deploy:
  type: github
  repository:
```

Option | Description
--- | ---
`repo`<br>`repository` | GitHub repository URL (Better to use HTTPS)

### Remove

Remove `.deploy` folder.

``` bash
$ rm -rf .deploy
```

### Custom Domain

Create a file named `CNAME` in `source` folder with the following content.

```
example.com
```

- **Top-level Domain:** Add A record `204.232.175.78`
- **Subdomain**: Add CNAME record `blog.example.com`.

Check [GitHub Pages](https://help.github.com/articles/setting-up-a-custom-domain-with-pages) for more info.

## Heroku

Edit `_config.yml`.

``` yaml
deploy:
  type: heroku
  repository:
```

Option | Description
--- | ---
`repo`<br>`repository` | Heroku repository URL

### Remove

Remove `.git`, `app.js` & `Procfile`.

## Rsync

Edit `_config.yml`.

``` yaml
deploy:
  type: rsync
  host:
  user:
  root:
  port:
  delete:
```

Option | Description | Default
--- | --- | ---
`host` | Address of remote host | 
`user` | Username | 
`root` | Root directory of remote host | 
`port` | Port | 22
`delete` | Delete old files on remote host | true

## Other Methods

All generated files are saved in `public` folder. You can copy it to wherever you like.