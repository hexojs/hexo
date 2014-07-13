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
    var help = '';

    help += type + ' migrator plugin is not installed.\n\n';
    help += 'Installed migrator plugins:\n';
    help += '  ' + Object.keys(migrator).join(', ');

    console.log(help);
    return callback();
  }

  migrator[type](args, callback);
};