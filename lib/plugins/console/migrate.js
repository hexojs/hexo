module.exports = function(args, callback){
  // Display help message if user didn't input any arguments
  if (!args._.length){
    hexo.call('help', {_: ['migrate']}, callback);
    return;
  }

  var type = args._.shift(),
    extend = hexo.extend,
    migrator = extend.migrator.list();

  if (!migrator.hasOwnProperty(type)){
    var helps = [
      'It seems that ' + type + ' migrator plugin hasn\'t been installed yet.',
      '',
      'Installed migrator plugins:',
      '  ' + Object.keys(migrator).join(', ')
    ];

    console.log(helps.join('\n'));
    return callback();
  }

  migrator[type](args, callback);
};