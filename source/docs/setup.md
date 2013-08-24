title: Setup
prev: installation
next: configuration
---
Once Hexo is installed, run the following command and hexo will build all files you need in the target folder.

``` bash
$ hexo init <folder>
```

After build, here's how the folder looks like:

``` plain
.
├── _config.yml
├── package.json
├── scaffolds
├── scripts
├── source
|   ├── _drafts
|   └── _posts
└── themes
```

### _config.yml

Site [configuration](configuration.html) file. You can configure most of options here.

### package.json

Application data. If you deleted it unfortunately, rebuild the file with the following content.

``` json
{
  "name": "hexo",
  "version": "0.0.1",
  "private": true,
  "dependencies": {}
}
```

### scaffolds

[Scaffold](scaffolds.html) folder. When you create a new post, Hexo will build the file based on the scaffold.

### scripts

[Script](scripts.html) folder. Script is the easiest way to extend Hexo. JavaScript files in this folder will be executed automatically.

### source

Source folder is where you can put your content in. File or folder whose name is prefixed with `_` (underscore) and hidden files will be ignore except `_posts` folder. Markdown, HTML files will be processed and put into `public` folder, while other files will be copied.

### themes

[Theme](themes.html) folder. Hexo will generate files based on the theme.
