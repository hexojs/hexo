---
layout: page
title: Server
date: 2012-11-01 18:13:30
---

## Contents

- [Built-in Server](#builtin)
- [Pow](#pow)

<a id="builtin"></a>
## Built-in Server

Hexo uses [Connect] to serve static files.

Edit `port` in `_config.yml` to configure the port of the server.

``` yaml
port: 4000
```

Execute the following command to start server. Press `Ctrl+C` to stop it.

``` bash
hexo server
```

### Logger

Edit `logger` in `_config.yml` to enable logger. Edit `logger_format` to adjust the way logger displays. Check [documentation](http://www.senchalabs.org/connect/logger.html) for more info.

``` yaml
logger: true
logger_format:
```

<a id="pow"></a>
## Pow

[Pow] is a zero-config Rack server for Mac, but it can serve static files, too.

### Install

Execute the following command to install.

``` bash
curl get.pow.cx | sh
```

### Usage

Create a symlink into `~/.pow` to use.

``` bash
cd ~/.pow
ln -s /path/to/myapp
```

Your website will be up and running at `http://myapp.dev`. The URL is based on the name of the symlink.

Check [documentation](http://pow.cx/manual.html) for more info.

[Connect]: https://github.com/senchalabs/connect
[Pow]: http://pow.cx/