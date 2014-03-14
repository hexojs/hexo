var pathFn = require('path'),
  _ = require('lodash');

module.exports = function(name, options, only){
  var viewDir = this.view_dir || this.settings.views,
    path = pathFn.join(pathFn.dirname(this.filename.substring(viewDir.length)), name);

  var view = hexo.theme.getView(path) || hexo.theme.getView(name);

  if (view){
    var locals = {};

    if (only){
      _.extend(locals, options);
    } else {
      _.extend(locals, _.omit(this, 'layout'), options);
    }

    return view.renderSync(locals);
  } else {
    hexo.log.w('Partial %s does not exist', name);
    return '';
  }
};