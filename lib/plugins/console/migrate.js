require('colors');

module.exports = function(args){
  // Display help message if user didn't input any arguments
  if (!args._.length){
    return this.call('help', {_: ['migrate']});
  }

  var type = args._.shift();
  var migrators = this.extend.migrator.list();

  if (!migrators[type]){
    var help = '';

    help += type.magenta + ' migrator plugin is not installed.\n\n';
    help += 'Installed migrator plugins:\n';
    help += '  ' + Object.keys(migrators).join(', ') + '\n\n';
    help += 'For more help, you can check the online docs: ' + 'http://hexo.io/'.underline;

    console.log(help);
    return;
  }

  return migrators[type].call(this, args);
};