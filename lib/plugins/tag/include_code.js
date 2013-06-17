// Based on: https://raw.github.com/imathis/octopress/master/plugins/include_code.rb

var extend = hexo.extend,
  highlight = hexo.util.highlight,
  config = hexo.config,
  highlightConfig = config.highlight,
  lineNumConfig = highlightConfig.line_number,
  tabConfig = highlightConfig.tab_replace,
  fs = require('fs'),
  hexofs = hexo.util.file,
  path = require("path");

var code_prefix = '/downloads/code',
    code_path = path.join(hexo.source_dir, config.code_dir);

var regex = {
  captionTitleFile:/(.*)?(\s+|^)(\/*\S+)/i,
  lang: /\s*lang:(\w+)/i
};

extend.tag.register('include_code', function(args, content) {
  var args = args.join(' ');
  var file = '';
  var title = '';
  var lang = '';

  if (regex.lang.test(args)){
    lang = args.match(regex.lang)[1];
    args = args.replace(/lang:\w+/i, '');
  }

  if (regex.captionTitleFile.test(args)) {
    var match = args.match(regex.captionTitleFile);
    title = match[1];
    file = match[3];
  } else {
    throw new Error("File could not be found");
  }

  var local = path.join(code_path, file);
  var url = path.join(code_prefix, file);

  if (!fs.existsSync(code_path) || !fs.existsSync(local)) {
    throw new Error("File '" + local + "' could not be found");
  }

  if (fs.lstatSync(code_path).isSymbolicLink()) {
    throw new Error("Code directory '" + config.code_dir + "' cannot be a symlink");
  }

  var code = fs.readFileSync(local).toString();

  title = title || path.basename(file);
  lang = lang || path.extname(file).replace('.', '');
  caption = '<span>' + title + '</span> <a href="' + url + '">download</a>';
  return highlight(code, {lang: lang, caption:caption, gutter: lineNumConfig, tab: tabConfig});
});

extend.generator.register(function(locals, render, callback) {
  hexofs.dir(code_path, function(files) {
    for (var i in files) {
      var file = files[i];
      var url = path.join(code_prefix, file);
      var local = path.join(code_path, file);
      var code = fs.readFileSync(local).toString();
      hexo.route.set(url, code);
    }
    callback();
  });
});
