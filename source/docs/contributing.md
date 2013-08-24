title: Contributing
prev: troubleshooting
---
It's great to hear you'd like to make Hexo more awesome! When modifying files, please keep the following in your mind.

**JavaScript:**

- Follow [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
- Use soft-tabs with a two space indent.
- Don't put commas first.

Example:

``` js
var fs = require('fs'),
  path = require('path');
  
var doSomething = function(callback){
  callback();
};
```


**CSS:**

- Use soft-tabs with a two space indent.
- Put spaces after `:` in property declarations.
- Put mixin first.
- Always use double quotations.
- Flat structure.

Example:

``` css
#foo
  clearfix()
  color: #444
  background: url("background.png")
```

**HTML:**

- Use soft-tabs with a two space indent.
- Use double quotations unless in `<% code %>` tag.
- Use HTML5 doctype.

## Development

1. Fork the Hexo repository.
2. Clone the repository to your computer.

	``` bash
	$ git clone git://github.com/<username>/hexo.git
	```

3. Install dependencies.

	``` bash
	$ make install
	```
	
4. Create a new branch and start hacking.
5. Push the branch.
6. Create a pull request on GitHub.

{% note warn Don't change version in package.json %}
When making changes on Hexo, don't change version number in `package.json`.
{% endnote %}

## Updating Documentation

The Hexo documentation is open-source and you can find it on `site` branch of Hexo repository. Here's how you can make the documentation better:

1. Fork the Hexo repository.
2. Clone the repository to your computer.

	``` bash
	$ git clone -b site git://github.com/<username>/hexo.git
	```
	
3. Create a new branch and start editing.
4. See live changes with `hexo server`.
5. Push the branch.
6. Create a pull request on GitHub.

## Reporting an Issue

When you come across problems, try to find the solution [here](troubleshooting.html). If the problem still exists, please do the following:

1. Run it again in debug mode.
2. Run `hexo version` to check the version info
3. Post both debug message and version info on GitHub.