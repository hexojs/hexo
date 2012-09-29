var extend = require('../extend');

extend.helper.register('blockquote', function(args, content){
  var result = '<blockquote>' + content;

  if (args.length){
    var footer = '<strong>'+args[0]+'</strong>';

    if (args[1]){
      if (args[2]){
        footer += '<cite><a href="'+args[1]+'">'+args[2]+'</a></cite>';
      } else {
        var urltext = args[1].match(/https?:\/\/(.+)/)[1];
        if (urltext.length > 32) urltext = urltext.substring(0, 32) + '&hellip;';
        footer += '<cite><a href="'+args[1]+'">'+urltext+'</a></cite>';
      }
    }

    result += '<footer>' + footer + '</footer>';
  }

  result += '</blockquote>';

  return result;
}, true);