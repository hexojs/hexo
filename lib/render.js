var config = require('./config'),
  file = require('./file'),
  theme = require('./theme'),
  yfm = require('./yaml-front-matter'),
  async = require('async'),
  path = require('path'),
  ejs = require('ejs'),
  marked = require('marked'),
  moment = require('moment'),
  _ = require('underscore'),
  highlight = require('highlight').Highlight;

var regex = {
  excerpt: /<!--\s*more\s*-->/
};

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  highlight: function(code){
    return highlight(code);
  }
});

exports.read = function(source, type, category, callback){
  var extname = path.extname(source),
    filename = path.basename(source, extname);

  async.waterfall([
    function(next){
      file.read(source, next);
    },
    function(file, next){
      var meta = yfm(file),
        entry = marked(meta._content);

      delete meta._content;

      var locals = meta,
        date = _.isDate(meta.date) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');

      locals.date = date.toDate();
      if (type === 'post'){
        if (!locals.tags) locals.tags = [];

        if (meta.tags){
          for (var i=0, len=meta.tags.length; i<len; i++){
            var item = meta.tags[i];

            locals.tags[i] = {
              name: item,
              permalink: config.root + config.tag_dir + '/' + item
            };
          }
        }

        locals.categories = [];

        if (category){
          var categories = category.split(path.sep);

          for (var i=0, len=categories.length; i<len; i++){
            var item = categories[i];

            locals.categories.push({
              name: item,
              permalink: config.root + categories.slice(0, i + 1).join(path.sep)
            });
          }
        }

        locals.permalink = config.root + config.permalink
          .replace(/:category/, category ? category : config.category)
          .replace(/:year/, date.format('YYYY'))
          .replace(/:month/, date.format('MM'))
          .replace(/:day/, date.format('DD'))
          .replace(/:title/, filename);
      } else if (type === 'page'){
        locals.permalink = config.root + category
          .replace('.txt', '.html')
          .replace('.text', '.html')
          .replace('.md', '.html')
          .replace('.markdown', '.html')
          .replace('.mdown', '.html')
          .replace('.mkd', '.html')
          .replace('.mkdn', '.html')
          .replace('.mdtxt', '.html')
          .replace('.mdtext', '.html')
          .replace('.mdml', '.html');
      }

      if (entry.match(regex.excerpt)){
        locals.content = entry.replace(regex.excerpt, '<span id="more"></span>');
        locals.excerpt = entry.split(regex.excerpt)[0];
      } else {
        locals.content = entry;
      }

      callback(locals);
    }
  ]);
};

exports.render = function(locals){
  return ejs.render(theme.layout[locals.page.layout], locals);
};