# Contributing

## Style Guide

We use [JSCS] and [ESLint] to maintain the code style. You can install linter plugins on your editor or check the status with the following commands:

``` bash
$ npm run jscs
$ npm run eslint

# You can append `--fix` option to these commands to fix the code style automatically
$ npm run jscs -- --fix
$ npm run eslint -- --fix
```

## Pull Requests

1. Fork [hexojs/hexo](https://github.com/hexojs/hexo).
2. Clone the repository to your computer and install dependencies.

    ``` bash
    $ git clone https://github.com/<username>/hexo.git
    $ cd hexo
    $ npm install
    ```
    
3. Create a feature branch.

    ``` bash
    $ git checkout -b new_feature
    ```
    
4. Start hacking.
5. Push the branch.

    ``` bash
    $ git push origin new_feature
    ```
    
6. Create a pull request and describe the change.

## Testing

Before you submitting the pull request. Please make sure your code is coveraged and passes the tests. Otherwise your pull request won't be merged.

``` bash
$ npm test
```

## Updating Documentation

The Hexo documentation is open source and you can find the source code on [hexojs/site]. 

### Workflow

1. Fork [hexojs/site](https://github.com/hexojs/site).
2. Clone the repository to your computer and install dependencies.

    ``` bash
    $ git clone https://github.com/<username>/site.git
    $ cd site
    $ npm install
    ```
    
3. Start editing the documentation. You can start the server for live previewing.

    ``` bash
    $ hexo server
    ```
    
4. Push the branch.
5. Create a pull request and describe the change.

### Translating

1. Add a new language folder in `source` folder. (all in lower case)
2. Copy Markdown and template files in `source` folder to the new language folder.
3. Add the new language to `source/_data/language.yml`.
4. Copy `en.yml` in `themes/navy/languages` and rename to the language name (all in lower case).

## Reporting Issues

When you encounter some problems when using Hexo, you can find the solutions in [Troubleshooting](http://hexo.io/docs/troubleshooting.html) or ask me on [GitHub](https://github.com/hexojs/hexo/issues) or [Google Group](https://groups.google.com/group/hexo). If you can't find the answer, please report it on GitHub.

1. Represent the problem in [debug mode](http://hexo.io/docs/commands.html#Debug_mode).
2. Run `hexo version` and check the version info.    
3. Post both debug message and version info on GitHub.

[JSCS]: http://jscs.info/
[ESLint]: http://eslint.org/