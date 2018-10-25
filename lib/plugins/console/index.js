'use strict';

module.exports = function(ctx) {
  const { console } = ctx.extend;

  console.register('clean', 'Remove generated files and cache.', require('./clean'));

  console.register('config', 'Get or set configurations.', {
    usage: '[name] [value]',
    arguments: [
      {name: 'name', desc: 'Setting name. Leave it blank if you want to show all configurations.'},
      {name: 'value', desc: 'New value of a setting. Leave it blank if you just want to show a single configuration.'}
    ]
  }, require('./config'));

  console.register('deploy', 'Deploy your website.', {
    options: [
      {name: '--setup', desc: 'Setup without deployment'},
      {name: '-g, --generate', desc: 'Generate before deployment'}
    ]
  }, require('./deploy'));

  console.register('generate', 'Generate static files.', {
    options: [
      {name: '-d, --deploy', desc: 'Deploy after generated'},
      {name: '-f, --force', desc: 'Force regenerate'},
      {name: '-w, --watch', desc: 'Watch file changes'},
      {name: '-b, --bail', desc: 'Raise an error if any unhandled exception is thrown during generation'}
    ]
  }, require('./generate'));

  console.register('list', 'List the information of the site', {
    desc: 'List the information of the site.',
    usage: '<type>',
    arguments: [
      {name: 'type', desc: 'Available types: page, post, route, tag, category'}
    ]
  }, require('./list'));

  console.register('migrate', 'Migrate your site from other system to Hexo.', {
    init: true,
    usage: '<type>',
    arguments: [
      {name: 'type', desc: 'Migrator type.'}
    ]
  }, require('./migrate'));

  console.register('new', 'Create a new post.', {
    usage: '[layout] <title>',
    arguments: [
      {name: 'layout', desc: 'Post layout. Use post, page, draft or whatever you want.'},
      {name: 'title', desc: 'Post title. Wrap it with quotations to escape.'}
    ],
    options: [
      {name: '-r, --replace', desc: 'Replace the current post if existed.'},
      {name: '-s, --slug', desc: 'Post slug. Customize the URL of the post.'},
      {name: '-p, --path', desc: 'Post path. Customize the path of the post.'}
    ]
  }, require('./new'));

  console.register('publish', 'Moves a draft post from _drafts to _posts folder.', {
    usage: '[layout] <filename>',
    arguments: [
      {name: 'layout', desc: 'Post layout. Use post, page, draft or whatever you want.'},
      {name: 'filename', desc: 'Draft filename. "hello-world" for example.'}
    ]
  }, require('./publish'));

  console.register('render', 'Render files with renderer plugins.', {
    init: true,
    desc: 'Render files with renderer plugins (e.g. Markdown) and save them at the specified path.',
    usage: '<file1> [file2] ...',
    options: [
      {name: '--output', desc: 'Output destination. Result will be printed in the terminal if the output destination is not set.'},
      {name: '--engine', desc: 'Specify render engine'},
      {name: '--pretty', desc: 'Prettify JSON output'}
    ]
  }, require('./render'));
};
