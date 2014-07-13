var commandList = function(title, list){
  if (!list.length) return '';

  var str = title + '\n',
    length = 0;

  list = list.sort(function(a, b){
    var nameA = a.name,
      nameB = b.name;

    if (nameA.length >= nameB.length && length < nameA.length){
      length = nameA.length;
    } else if (length < nameB.length){
      length = nameB.length;
    }

    if (nameA < nameB) return -1;
    else if (nameA > nameB) return 1;
    else return 0;
  });

  list.forEach(function(item){
    str += '  ' + item.name.bold;

    for (var i = 0, len = length - item.name.length; i < len; i++){
      str += ' ';
    }

    str += '   ' + (item.description || item.desc) + '\n';
  });

  return str + '\n';
};

module.exports = function(args, callback){
  var command = args._.shift(),
    list = hexo.extend.console.list(),
    str = '',
    item,
    options;

  if (list.hasOwnProperty(command) && command !== 'help'){
    item = list[command];
    options = item.options;

    str += 'Usage: hexo ' + command;
    if (options.usage) str += options.usage;
    str += '\n\n';
    str += 'Description:\n';
    str += (options.description || options.desc || item.description || item.desc) + '\n\n';

    if (options.arguments) str += commandList('Arguments:', options.arguments);
    if (options.commands) str += commandList('Commands:', options.commands);
    if (options.options) str += commandList('Options:', options.options);
  } else {
    var keys = Object.keys(list),
      commands = [];

    str += 'Usage: hexo <command>\n\n';

    for (var i = 0, len = keys.length; i < len; i++){
      var key = keys[i];
      item = list[key];
      options = item.options;

      if ((!hexo.env.init && !options.init) || (!hexo.debug && options.debug)) continue;

      commands.push({
        name: key,
        desc: (item.description || item.desc)
      });
    }

    str += commandList('Commands:', commands);
    str += commandList('Global Options:', [
      {name: '--config', desc: 'Specify config file instead of using _config.yml'},
      {name: '--debug', desc: 'Display all verbose messages in the terminal'},
      {name: '--safe', desc: 'Disable all plugins and scripts'},
      {name: '--silent', desc: 'Hide output on console'}
    ]);
  }

  str += 'For more help, you can use `hexo help [command]` for the detailed information\n';
  str += 'or you can check the docs: ' + 'http://hexo.io/docs/'.underline;

  console.log(str);
  callback();
};