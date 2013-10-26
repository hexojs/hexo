var console = hexo.extend.console;

console.register('clean', 'Remove generated files and the cache', require('./clean'));

var configOptions = {
  options: [
    {name: '--json', desc: 'Print in JSON format'}
  ]
};

console.register('config', 'List the current configuration', configOptions, require('./config'));

var deployOptions = {
  alias: 'd',
  options: [
    {name: '--setup', desc: 'Setup without deployment'},
    {name: '-g, --generate', desc: 'Generate before deployment'}
  ]
};

console.register('deploy', 'Deploy your website', deployOptions, require('./deploy'));

var generateOptions = {
  alias: 'g',
  options: [
    {name: '-d, --deploy', desc: 'Deploy after generated'},
    {name: '-w, --watch', desc: 'Watch file changes'}
  ]
};

console.register('generate', 'Generate static files', generateOptions, require('./generate'));

console.register('help', 'Get help on a command', {init: true}, require('./help'));

var initOptions = {
  init: true,
  desc: 'Create a new Hexo folder at the specified path or the current directory.',
  usage: '[destination]',
};

console.register('init', 'Create a new Hexo folder', initOptions, require('./init'));

var listOptions = {
  desc: 'List the information of the site.',
  usage: '<type>',
  arguments: [
    {name: 'type', desc: 'Available types: route'}
  ]
};

console.register('list', 'List the information of the site', listOptions, require('./list'));

var migrateOptions = {
  init: true,
  usage: '<type>'
};

console.register('migrate', 'Migrate your site from other system to Hexo', migrateOptions, require('./migrate'));

var newOptions = {
  alias: 'n',
  usage: '[layout] <title>'
};

console.register('new', 'Create a new post', newOptions, require('./new'));

var renderOptions = {
  desc: 'Render the files with Markdown or other engines and save them at the specified path or the current directory.',
  usage: '<file1> [file2] ...',
  options: [
    {name: '-o, --output', desc: 'Output destination'}
  ]
};

console.register('render', 'Render the files with Markdown or other engines', renderOptions, require('./render'));

var serverOptions = {
  alias: 's',
  desc: 'Start the server and watch for file changes.',
  options: [
    {name: '-p, --port', desc: 'Override the default port'},
    {name: '-s, --static', desc: 'Only serve static files'},
    {name: '-l, --log [format]', desc: 'Enable logger. Override the logger format.'},
    {name: '-d, --drafts', desc: 'Serve draft posts.'}
  ]
};

console.register('server', 'Start the server', serverOptions, require('./server'));

var versionOptions = {
  init: true
};

console.register('version', 'Display version information', versionOptions, require('./version'));

var publishOptions = {
  alias: 'p',
  desc: 'Moves a draft post from _drafts to _posts directory',
  usage: '<filename>',
  arguments: [
    { name: 'filename', desc: 'Complete draft filename. Example: "2013-10-22-hello-world"' }
  ]
};

console.register('publish', 'Publish a draft', publishOptions, require('./publish'));