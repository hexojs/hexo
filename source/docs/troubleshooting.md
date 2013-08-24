title: Troubleshooting
prev: plugins
next: contributing
---
You may encounter some problems when using Hexo. The following are the solutions to the problems that people frequently asked. If you can't find the answer here, run again in debug mode and [report an issue](https://github.com/tommy351/hexo/issues/new) on GitHub.

## YAML Parsing Error

``` bash
/usr/local/lib/node_modules/hexo/node_modules/yamljs/bin/yaml.js:1219
throw new YamlParseException('Unable to parse.', this.getRealCurrentLineNb
^
YamlParseException: Unable to parse.
```

When you encounter `YamlParseException`, check your configuration and front-matter in the post files. Make sure they are written in correct YAML format: use spaces instead of tabs and add a space before colons. For example:

``` yaml
foo: 1
bar:
  baz: 2
```

## EMFILE Error

``` bash
Error: EMFILE, too many open files
```

Though Node.js has non-blocking I/O, the number of synchronous I/O is still limited by system. You may come across EMFILE error when trying to generate a large number of files. You can try to run the following command to increase the number of synchronous I/O.

``` bash
$ ulimit -n 10000
```

## GitHub Deployment Problems

``` bash
fatal: 'username.github.io' does not appear to be a git repository
```

Make sure you have [set up git](https://help.github.com/articles/set-up-git) on your computer and try to use HTTPS repository URL instead.

## Server Problems

``` bash
Error: listen EADDRINUSE
```

You may open Hexo server twice or there's other applications using the same port. Try to edit `port` setting or start Hexo server with `-p` flag.

``` bash
$ hexo server -p 5000
```

## Plugin Installation Problems

``` bash
npm WARN package.json plugin-name@0.0.1 No read me data.
```

This error comes out when you install a plugin which doesn't provide read me file. Don't be scared. This error won't cause any problems.

``` bash
npm ERR! node-waf configure build
```

This error may occurred when you trying to install a plugin written in C, C++ or other non-JavaScript language. Make sure you have installed compiler on your computer.