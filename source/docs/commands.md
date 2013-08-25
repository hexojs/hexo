title: Commands
prev: configuration
next: migration
---
## init

``` bash
$ hexo init [folder]
```

Setups a website. If `folder` isn't defined, Hexo will setup the website at the current directory.

## new

``` bash
$ hexo new [layout] <title>
```

Creates a new article. If `layout` isn't defined, it'll be `default_layout` setting. If the title is more than one word, wrap it with quotation marks.

**Alias:** n

## generate

``` bash
$ hexo generate
```

Generates static files.

**Alias**: g

Option | Description
--- | ---
`-d`<br>`--deploy` | Deploy after generate done
`-w`<br>`--watch` | Watch file changes

## server

``` bash
$ hexo server
```

Starts server.

**Alias:** s

Option | Description
--- | ---
`-p`<br>`--port` | Override default port
`-s`<br>`--static` | Only serve static files
`-l`<br>`--log` | Enable logger. Override logger format.

## deploy

``` bash
$ hexo deploy
```

Deploys your website.

**Alias:** d

Option | Description
--- | ---
`--setup` | Setup without deployment
`--generate` | Generate before deployment

## render

``` bash
$ hexo render <file1> [file2] ...
```

Renders files.

Option | Description
--- | ---
`-o`<br>`--output` | Output destination

## migrate

``` bash
$ hexo migrate <type>
```

Migrates from other blog systems.

## clean

``` bash
$ hexo clean
```

Cleans the cache file (`db.json`) and generated files (`public`).

## list

``` bash
$ hexo list <type>
```

Lists all routes.

## version

``` bash
$ hexo version
```

Displays version information.

## Options

### Safe mode

``` bash
$ hexo --safe
```

Plugins and scripts won't be loaded in safe mode. You can try this when you encounter some problems after installing a new plugin.

### Debug mode

``` bash
$ hexo --debug
```

Displays verbose messages in terminal and saves log in `debug.log`. When you get some problems, try to run Hexo again in debug mode and submit the messages to GitHub.