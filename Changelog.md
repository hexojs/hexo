## 0.1.6 (2011-11-18)

- Update Hexo and Light theme to fix link/photo layout ([Issue #6](https://github.com/tommy351/hexo/issues/6))
- Layout fallback

## 0.1.5 (2011-11-15)

- Added [Migrator plugin](http://zespia.tw/hexo/docs/migrate.html)
- Ignore global configuration when users set `permalink`, `updated` in articles ([Issue #5](https://github.com/tommy351/hexo/issues/5))
- Load plugins when initializing

## 0.1.4 (2012-11-12)

- Added [Backtick Code Block](http://octopress.org/docs/plugins/backtick-codeblock/) based on [Octopress](https://raw.github.com/imathis/octopress/master/plugins/backtick_code_block.rb)
- Only add line number when using code block plugin or backtick code block
- Added **"plain"** to escape highlight.
- Smarter permalink configuration
	- Add `/` to the end of permalink automatically
	- `.htm` or `.html` are now available for permalink
	- Use default configuration when undefined
- Fixed Gist file ([Issue #3](https://github.com/tommy351/hexo/pull/3), thanks to [dca](https://github.com/dca))

## 0.1.3 (2012-11-05)

- Fixed error occurred when initializing ([Issue #1](https://github.com/tommy351/hexo/issues/1))