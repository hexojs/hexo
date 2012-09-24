var config = require('./config'),
  file = require('./file'),
  async = require('async'),
  path = require('path'),
  ejs = require('ejs'),
  yaml = require('yamljs'),
  marked = require('marked'),
  moment = require('moment'),
  _ = require('underscore'),
  highlight = require('highlight').Highlight,
  cache = {};

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

var getLayout = function(layout, callback){
  if (cache.hasOwnProperty(layout)){
    callback(cache.layout);
  } else {
    file.read(__dirname + '/../themes/' + config.theme + '/layout/' + layout + '.html', function(err, file){
      if (err) throw err;
      cache.layout = file;
      callback(file);
    });
  }
};

exports.read = function(source, type, category, callback){
  var extname = path.extname(source),
    filename = path.basename(source, extname);

  async.waterfall([
    function(next){
      file.read(source, next);
    },
    function(file, next){
      var content = file.split('---').slice(1),
        meta = yaml.parse(content.shift()),
        entry = marked(content.join('---'));

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

exports.render = function(locals, callback){
  getLayout(locals.page.layout, function(layout){
    callback(ejs.render(layout, locals));
  });
};