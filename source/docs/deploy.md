---
layout: page
title: Deploy
date: 2012-11-01 18:13:30
---

It's easy to deploy with Hexo. It just needs 3 steps to complete setup, "Configure → Setup → Deploy".

## Contents

- [GitHub](#github)
- [Heroku](#heroku)
- [Rsync](#rsync)

<a id="github"></a>
## GitHub

### Configure

Edit `_config.yml`. Fill `repository` with GitHub repository. If repository is like `username.github.com`, fill `branch` with `master`, otherwise `gh-pages`.

``` yaml
deploy:
  type: github
  repository:
  branch:
```

### Setup

Execute the following command. Hexo will build a hidden folder named `.deploy`, initialize Git and setup remote repository.

``` bash
hexo setup_deploy
```

### Deploy

After the static files are generated, execute the following to deploy.

``` bash
hexo deploy
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

<a id="heroku"></a>
## Heroku

### Configure

Edit `_config.yml`. Fill `repository` with Heroku repository.

``` yaml
deploy:
  type: heroku
  repository:
```

### Setup

Execute the following command. Hexo will create two files in the root directory: `Procfile` & `app.js`, initialize Git and setup remote repository.

``` bash
hexo setup_deploy
```

`Procfile` & `app.js` is necessary. **Do not delete them.** If you had delete them, rebuilt with the following content manually.

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

### Deploy

After the static files are generated, execute the following to deploy.

``` bash
hexo deploy
```

### Remove

Delete the following files and folders to remove deployment.

``` plain
|-- _.git
|-- app.js
|-- Procfile
```

Check [Heroku][2] for more info.

<a id="rsync"></a>
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

### Setup

Don't need to setup.

### Deploy

After the static files are generated, execute the following to deploy.

``` bash
hexo deploy
```

[1]: https://help.github.com/articles/setting-up-a-custom-domain-with-pages
[2]: https://devcenter.heroku.com/