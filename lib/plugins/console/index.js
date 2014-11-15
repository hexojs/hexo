module.exports = function(ctx){
  var console = ctx.extend.console;

  console.register('clean', 'Removed generated files and cache', require('./clean')(ctx));

  console.register('help', 'Get help on a command', {
    init: true
  }, require('./help')(ctx));

  console.register('init', 'Create a new Hexo folder', {
    init: true,
    desc: 'Create a new Hexo folder at the specified path or the current directory.',
    usage: '[destination]'
  }, require('./init')(ctx));

  console.register('render', 'Render files with renderer plugins', {
    init: true,
    desc: 'Render files with renderer plugins (e.g. Markdown) and save them at the specified path.',
    usage: '<file1> [file2] ...',
    options: [
      {name: '--output', desc: 'Output destination. Result will be print in the terminal if the output destination is not set.'},
      {name: '--engine', desc: 'Specify render engine'},
      {name: '--pretty', desc: 'Prettify JSON output'}
    ]
  }, require('./render')(ctx));

  console.register('version', 'Display version information', {
    init: true
  }, require('./version')(ctx));
};