---
layout: page
title: 渲染
lang: zh-CN
date: 2013-02-18 19:34:41
---

## 使用

渲染模组拥有两种方法，**render** 和 **compile**，前者为输入字串后渲染，后者为读取文件后渲染，两种方法都有同步和非同步两种模式。

**render(string, engine, [locals], callback)**
**renderSync(string, engine, [locals])**

- **string** - 输入字串
- **engine** - 渲染引擎
- **locals** - 区域变量
- **callback** - 回传函数
  - **err** - 错误内容
  - **content** - 输出内容
  - **ext** - 输出文件的副文件名

**compile(src, locals, callback)**
**compileSync(src, locals)**

- **src** - 原始文件路径
- **locals** - 区域变量
- **callback** - 回传函数
  - **err** - 错误内容
  - **content** - 输出内容
  - **ext** - 输出文件的扩展名

### 范例

渲染Markdown字串。

	hexo.render.render('**bold**', 'md', function(err, content, ext){
		// …
	});

编译EJS样板。

	hexo.render.compile('layout.ejs', {foo: 1, bar: 2}, function(err, content, ext){
		// …
	});

## 内建渲染器

### EJS

- 输入文件名：ejs
- 输出文件名：html

参考：

- [EJS][1]

### Markdown

- 输入文件名：md, markdown, mkd, mkdn, mdwn, mdtxt, mdtext
- 输出文件名：html

参考：

- [Marked][2]
- [Markdown][3]

### Stylus (with Nib)

- 输入文件名：styl, stylus
- 输出文件名：css

参考：

- [Stylus][4]
- [Nib][5]

### Swig

- 输入文件名：swig
- 输出文件名：html

参考：

- [Swig][6]

### YAML

- 输入文件名：yml, yaml
- 输出文件名：json

参考：

- [yamljs][7]
- [YAML][8]

[1]: https://github.com/visionmedia/ejs
[2]: https://github.com/chjj/marked
[3]: http://daringfireball.net/projects/markdown/
[4]: http://learnboost.github.com/stylus/
[5]: http://visionmedia.github.com/nib/
[6]: http://paularmstrong.github.com/swig/
[7]: https://github.com/jeremyfa/yaml.js
[8]: http://www.yaml.org/