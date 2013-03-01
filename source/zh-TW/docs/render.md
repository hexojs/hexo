---
layout: page
title: 渲染
lang: zh-TW
date: 2012-11-01 18:13:30
---

## 使用

#### render(data, [options], callback)

- **data** - 輸入資料（至少要有`path`或`text`其一）
  - **path** - 路徑
  - **text** - 字串
  - **engine** - 渲染引擎（預設為`path`的副檔名，或`path`未定義則此為必填項目）
- **options** - Renderer選項
- **callback** - 回呼函數

#### renderSync(data, [options])

與`render`相同，差別僅在於此為同步模式。

#### renderFile(path, [options], callback)

- **path** - 路徑
- **options** - 選項
  - **cache** - 快取
  - **layout** - 布局
- **callback** - 回呼函數

### 範例

``` js
hexo.render.render({path: layout.ejs}, function(err, content){
  // ...
});
```

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