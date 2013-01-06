---
layout: page
title: Render
date: 2012-11-01 18:13:30
---

## Usage

The render module has two method: **render** & **compile**. The former renders a string; the letter renders a file. Both method have sync and async mode.

**render(string, engine, [locals], callback)**  
**renderSync(string, engine, [locals])**

- **string** - Input string
- **engine** - Render engine
- **locals** - Local variables
- **callback** - Callback function
  - **err** - Error content
  - **content** - Output content
  - **ext** - Extension name of the output file

**compile(src, locals, callback)**  
**compileSync(src, locals)**

- **src** - Source file path
- **locals** - Local variables
- **callback** - Callback function
  - **err** - Error content
  - **content** - Output content
  - **ext** - Extension name of the output file

### Example

Render a Markdown content.

	hexo.render.render('**bold**', 'md', function(err, content, ext){
		// …
	});

Compile a EJS template.

	hexo.render.compile('layout.ejs', {foo: 1, bar: 2}, function(err, content, ext){
		// …
	});

## Built-in Renderer

### EJS

- Input: ejs
- Output: html

Reference: 

- [EJS][1]

### Markdown

- Input: md, markdown, mkd, mkdn, mdwn, mdtxt, mdtext
- Output: html

Reference: 

- [Marked][2]
- [Markdown][3]

### Stylus (with Nib)

- Input: styl, stylus
- Output: css

Reference: 

- [Stylus][4]
- [Nib][5]

### Swig

- Input: swig
- Output: html

Reference: 

- [Swig][6]

### YAML

- Input: yml, yaml
- Output: json

Reference: 

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