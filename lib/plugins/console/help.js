var chalk = require('chalk');

function helpConsole(args){
  var command = args._[0];
  var list = this.extend.console.list();
  var str = '';
  var item, options;

  if (list.hasOwnProperty(command) && command !== 'help'){
    item = list[command];
    options = item.options;

    str += 'Usage: hexo ' + command;
    if (options.usage) str += ' ' + options.usage;
    str += '\n\n';
    str += 'Description:\n';
    str += (options.description || options.desc || item.description || item.desc) + '\n\n';

    if (options.arguments) str += commandList('Arguments:', options.arguments);
    if (options.commands) str += commandList('Commands:', options.commands);
    if (options.options) str += commandList('Options:', options.options);
  } else {
    var keys = Object.keys(list);
    var commands = [];

    str += 'Usage: hexo <command>\n\n';

    for (var i = 0, len = keys.length; i < len; i++){
      var key = keys[i];
      item = list[key];
      options = item.options;

      if ((!this.env.init && !options.init) || (!this.env.debug && options.debug)) continue;

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
  str += 'or you can check the docs: ' + chalk.underline('http://hexo.io/docs/');

  console.log(str);
}

function commandList(title, list){
  if (!list.length) return '';

  var str = title + '\n';
  var length = 0;

  list = list.sort(function(a, b){
    var nameA = a.name;
    var nameB = b.name;

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
    str += '  ' + chalk.bold(item.name);

    for (var i = 0, len = length - item.name.length; i < len; i++){
      str += ' ';
    }

    str += '   ' + (item.description || item.desc) + '\n';
  });

  return str + '\n';
}

module.exports = helpConsole;