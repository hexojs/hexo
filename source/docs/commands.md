title: Commands
prev: configuration
next: migration
---
## init

``` bash
$ hexo init [folder]
```

Setup a website. If `folder` isn't defined, Hexo will setup the website at the current directory.

## new

``` bash
$ hexo new [layout] <title>
```

Create a new article. If `layout` isn't defined, it'll be `default_layout` setting. If the title is more than one word, wrap it with quotation marks.

## generate

``` bash
$ hexo generate
```

Generate static files.

Option | Description
--- | ---
`-d`<br>`--deploy` | Deploy after generate done
`-w`<br>`--watch` | Watch file changes

## server

``` bash
$ hexo server
```

Start server.

Option | Description
--- | ---
`-p`<br>`--port` | Override default port
`-s`<br>`--static` | Only serve static files
`-l`<br>`--log` | Enable logger. Override logger format.

## deploy

``` bash
$ hexo deploy
```

Deploy your website.

Option | Description
--- | ---
`--setup` | Setup without deployment
`--generate` | Generate before deployment

## render

``` bash
$ hexo render <file1> [file2] ...
```

Option | Description
--- | ---
`-o`<br>`--output` | Output destination

## migrate

``` bash
$ hexo migrate <type>
```

Migrate from other blog systems.

## clean

``` bash
$ hexo clean
```

Clean the cache file (`db.json`).

## list

``` bash
$ hexo list <type>
```

List all categories/pages/posts/routes/tags.

## version

``` bash
$ hexo version
```

Display version information.

## Others

### Safe mode

``` bash
$ hexo --safe
```

Plugins and scripts won't be loaded in safe mode. You can try this when you encounter some problems after installing a new plugin.

### Debug mode

``` bash
$ hexo --debug
```

Display verbose messages in console directly. When you encounter some problems, run Hexo again in the debug mode and submit the messages on GitHub.