---
layout: page
title: Server
date: 2012-11-01 18:13:30
---

## Built-in Server

Hexo uses [Connect][1] to serve static files.

Edit `port` setting in `_config.yml` to configure the port of the server.

``` yaml
port: 4000
```

Execute the following command to start the server. Press `Ctrl+c` to stop it. Add `-p` option to set the port.

``` bash
hexo server
hexo server -p 12345
```

### Logger

Edit `logger` in `_config.yml` to enable logger. Edit `logger_format` to adjust the content displayed. Check [Connect][4] for more info.

``` yaml
logger: true
logger_format:
```

## Pow

[Pow][2] is a zero-config Rack server for Mac powered by Node.js and it can serve static files, too.

### Install

Execute the following command.

``` bash
curl get.pow.cx | sh
```

### Usage

Create a symlink in `~/.pow` folder to use.

``` bash
cd ~/.pow
ln -s /path/to/myapp
```

Your website will be up and running at `http://myapp.dev`. The URL is based on the name of the symlink.

Check [Pow][3] for more info.

[1]: https://github.com/senchalabs/connect
[2]: http://pow.cx/
[3]: http://pow.cx/manual.html
[4]: http://www.senchalabs.org/connect/logger.html