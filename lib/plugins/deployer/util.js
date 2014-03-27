var swig = require('swig'),
  moment = require('moment');

var helpers = {
  now: function(format){
    return moment().format(format);
  }
};

exports.commitMessage = function(args){
  var message = args.m || args.msg || args.message;

  if (!message){
    message = 'Site updated: {{ now(\'YYYY-MM-DD HH:mm:ss\') }}';
  }

  return swig.compile(message)(helpers);
};
