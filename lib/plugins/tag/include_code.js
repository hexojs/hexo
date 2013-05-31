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

var code_prefix = '/downloads/code';

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
    throw "File could not be found";
  }

  var local = path.join(config.code_dir, file);
  var url = path.join(code_prefix, file);

  if (!fs.existsSync(config.code_dir) || !fs.existsSync(local)) {
    throw "File '" + local + "'could not be found";
  }

  if (fs.lstatSync(config.code_dir).isSymbolicLink()) {
    throw "Code directory '" + config.code_dir + "' cannot be a symlink";
  }

  var code = fs.readFileSync(local).toString();

  caption = '<span>' + title + '</span> <a href="' + url + '">download</a>';
  return highlight(code, {lang: lang, caption:caption, gutter: lineNumConfig, tab: tabConfig});
});

extend.generator.register(function(locals, render, callback) {
  hexofs.dir(config.code_dir, function(files) {
    for (var i in files) {
      var file = files[i];
      var url = path.join(code_prefix, file);
      var local = path.join(config.code_dir, file);
      var code = fs.readFileSync(local).toString();
      hexo.route.set(url, code);
    }
    callback();
  });
});

