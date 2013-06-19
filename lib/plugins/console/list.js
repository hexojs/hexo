var extend = require('../../extend'),
  route = require('../../route'),
  log = hexo.log,
  model = hexo.model;

extend.console.register('list', 'List information', function(args, callback){
  var types = ['category', 'draft', 'page', 'post', 'route', 'tag'],
    type = args._[0];

  if (types.indexOf(type) == -1){
    var help = 'Usage: hexo list <type>\n\n' +
      'Type:\n' +
      '  ' + types.join(', ') + '\n';

    console.log(help);

    return callback();
  }

  log.i('Loading');

  require('../../load')(function(err){
    if (err) return callback(err);

    switch (type){
      case 'category':
        var Category = model('Category');

        if (!Category.length){
          log.i('No category found');
          return callback();
        }

        var results = ['Categories:'];

        Category.sort({name: 1}).each(function(cat){
          results.push('- ' + cat.name + ': ' + cat.path);
        });

        results.push('TOTAL: ' + Category.length);
        log.i(results.join('\n'));

        break;

      case 'draft':
        var Post = model('Post').listDraft();

        if (!Post.length){
          log.i('No draft found');
          return callback();
        }

        var results = ['Drafts:'];

        Post.sort({date: -1}).each(function(post){
          results.push('- ' + post.title + ' (' + post.date.format('YYYY-MM-DD') + ')' + ': ' + post.path);
        });

        results.push('TOTAL: ' + Post.length);
        log.i(results.join('\n'));

        break;

      case 'page':
        var Page = model('Page');

        if (!Page.length){
          log.i('No page found');
          return callback();
        }

        var results = ['Pages:'];

        Page.sort({date: -1}).each(function(page){
          results.push('- ' + page.title + ' (' + page.date.format('YYYY-MM-DD') + ')' + ': ' + page.path);
        });

        results.push('TOTAL: ' + Page.length);
        log.i(results.join('\n'));

        break;

      case 'post':
        var Post = model('Post').listPublished();

        if (!Post.length){
          log.i('No post found');
          return callback();
        }

        var results = ['Posts:'];

        Post.sort({date: -1}).each(function(post){
          results.push('- ' + post.title + ' (' + post.date.format('YYYY-MM-DD') + ')' + ': ' + post.path);
        });

        results.push('TOTAL: ' + Post.length);
        log.i(results.join('\n'));

        break;

      case 'route':
        var list = Object.keys(route.list()).sort(),
          results = ['Routes:'];

        list.forEach(function(item){
          results.push('- ' + item);
        });

        results.push('TOTAL: ' + list.length);
        log.i(results.join('\n'));

        break;

      case 'tag':
        var Tag = model('Tag');

        if (!Tag.length){
          log.i('No tag found');
          return callback();
        }

        var results = ['Tags:'];

        Tag.sort({name: 1}).each(function(tag){
          results.push('- ' + tag.name + ': ' + tag.path);
        });

        results.push('TOTAL: ' + Tag.length);
        log.i(results.join('\n'));

        break;
    }

    callback();
  });
});