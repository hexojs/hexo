---
layout: page
title: Render
date: 2012-11-01 18:13:30
---

## Usage

#### render(data, [options], callback)

- **data** - Input data
  - **path** - Path
  - **text** - Text
  - **engine** - Render engine (Extension of `path` by default. Required if `path` undefined)
- **options** - Options
- **callback** - Callback function

#### renderSync(data, [options])

Synchronous `render`.

#### renderFile(path, [options], callback)

- **path** - Path
- **options** - Options
  - **cache** - Cache
  - **layout** - Layout
- **callback** - Callback function

### Example

```
hexo.render.render({path: layout.ejs}, function(err, content){
  // ...
});
```

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