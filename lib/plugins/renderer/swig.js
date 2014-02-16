var swig = require('swig');

swig.setDefaults({
  cache: false
});

module.exports = function(data, locals){
  return swig.render(data.text, {
    locals: locals,
    filename: data.path
  });
};