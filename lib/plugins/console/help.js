var commandList = function(title, list){
  if (!list.length) return [];

  var result = [title],
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
    var str = '  ' + item.name.bold;

    for (var i = 0; i < length - item.name.length; i++){
      str += ' ';
    }

    str += '   ' + item.desc;

    result.push(str);
  });

  return result;
};

module.exports = function(args, callback){
  var command = args._.shift(),
    list = hexo.extend.console.list(),
    result = [];

  if (list.hasOwnProperty(command) && command !== 'help'){
    var item = list[command],
      options = item.options;

    result.push(
      'Usage: hexo ' + command + ' ' + (options.usage ? options.usage : ''),
      '',
      'Description:',
      options.Description || options.desc || item.desc,
      ''
    );

    if (options.arguments) result = result.concat(commandList('Arguments:', options.arguments), '');
    if (options.commands) result = result.concat(commandList('Commands:', options.commands), '');
    if (options.options) result = result.concat(commandList('Options:', options.options), '');
  } else {
    var keys = Object.keys(list),
      commands = [];

    result.push(
      'Usage: hexo <command>',
      ''
    );

    for (var i = 0, len = keys.length; i < len; i++){
      var key = keys[i],
        item = list[key],
        options = item.options;

      if ((!hexo.init && !options.init) || (!hexo.debug && options.debug)) continue;

      commands.push({
        name: key,
        desc: item.desc
      });
    }

    result = result.concat(commandList('Commands:', commands), '');
    result = result.concat(commandList('Global Options:', [
      {name: '--debug', desc: 'Display all verbose messages in the terminal'},
      {name: '--safe', desc: 'Disable all plugins and scripts'}
    ]), '');

    result.push(
      'For more help, you can use `hexo help [command]` for the detailed information',
      'or you can check the docs: ' + 'http://zespia.tw/hexo/docs/'.underline
    );
  }

  if (!result[result.length - 1]) result.length--;

  console.log(result.join('\n'));
  callback();
};