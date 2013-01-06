---
layout: page
title: 渲染
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 使用

渲染模組擁有兩種方法，**render** 和 **compile**，前者為輸入字串後渲染，後者為讀取檔案後渲染，兩種方法都有同步和非同步兩種模式。

**render(string, engine, [locals], callback)**  
**renderSync(string, engine, [locals])**

- **string** - 輸入字串
- **engine** - 渲染引擎
- **locals** - 區域變數
- **callback** - 回傳函數
  - **err** - 錯誤內容
  - **content** - 輸出內容
  - **ext** - 輸出檔案的副檔名

**compile(src, locals, callback)**  
**compileSync(src, locals)**

- **src** - 原始檔案路徑
- **locals** - 區域變數
- **callback** - 回傳函數
  - **err** - 錯誤內容
  - **content** - 輸出內容
  - **ext** - 輸出檔案的副檔名

### 範例

渲染Markdown字串。

	hexo.render.render('**bold**', 'md', function(err, content, ext){
		// …
	});

編譯EJS樣板。

	hexo.render.compile('layout.ejs', {foo: 1, bar: 2}, function(err, content, ext){
		// …
	});

## 內建渲染器

### EJS

- 輸入檔名：ejs
- 輸出檔名：html

參考：

- [EJS][1]

### Markdown

- 輸入檔名：md, markdown, mkd, mkdn, mdwn, mdtxt, mdtext
- 輸出檔名：html

參考：

- [Marked][2]
- [Markdown][3]

### Stylus (with Nib)

- 輸入檔名：styl, stylus
- 輸出檔名：css

參考：

- [Stylus][4]
- [Nib][5]

### Swig

- 輸入檔名：swig
- 輸出檔名：html

參考：

- [Swig][6]

### YAML

- 輸入檔名：yml, yaml
- 輸出檔名：json

參考：

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