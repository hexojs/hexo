title: Contributing
prev: troubleshooting
---
It's great to hear you'd like to make Hexo more awesome! When modifying JavaScript code, please keep the following in your mind.

- Please follow the [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
- Comment in [JSDoc](http://usejsdoc.org/) format.

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