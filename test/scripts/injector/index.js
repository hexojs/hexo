'use strict';

const decache = require('decache');

describe('Injector', () => {
  const Hexo = require('../../../lib/hexo');
  let hexo, injectorFilter;

  beforeEach(async () => {
    await decache('../../../lib/plugins/injector');
    hexo = new Hexo();
    injectorFilter = require('../../../lib/plugins/injector').bind(hexo);
  });

  const content = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head id="head"><title>Test</title>',
    '</head>',
    '<body id="body">',
    '<div></div>',
    '<p></p>',
    '</body>',
    '</html>'
  ].join('');

  it('default', () => {
    const result = injectorFilter(content);
    result.should.contain('<head id="head"><title>Test</title></head>');
    result.should.contain('<body id="body"><div></div><p></p></body>');
  });

  it('insert code', () => {
    hexo.extend.injector.register('head_begin', '<!-- Powered by Hexo -->');
    hexo.extend.injector.register('head_end', '<link href="prism.css" rel="stylesheet">');
    hexo.extend.injector.register('head_end', '<link href="prism-linenumber.css" rel="stylesheet">');
    hexo.extend.injector.register('body_begin', '<script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>');
    hexo.extend.injector.register('body_end', '<script src="prism.js"></script>');

    const result = injectorFilter(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- Powered by Hexo --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"><link href="prism-linenumber.css" rel="stylesheet"><!-- hexo injector head_end end --></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });

  it('no duplicate insert', () => {
    const content = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head id="head"><!-- hexo injector head_begin start --><!-- hexo injector head_begin end -->',
      '<title>Test</title>',
      '<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"></head>',
      '<body id="body"><!-- hexo injector body_begin start --><!-- hexo injector body_begin end -->',
      '<div></div>',
      '<p></p>',
      '<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>',
      '</html>'
    ].join('');

    hexo.extend.injector.register('head_begin', '<!-- Powered by Hexo -->');
    hexo.extend.injector.register('head_end', '<link href="prism.css" rel="stylesheet">');
    hexo.extend.injector.register('head_end', '<link href="prism-linenumber.css" rel="stylesheet">');
    hexo.extend.injector.register('body_begin', '<script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>');
    hexo.extend.injector.register('body_end', '<script src="prism.js"></script>');

    const result = injectorFilter(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });

  it('multi-line head & body', () => {
    const content = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head id="head"><title>Test</title>',
      '</head>',
      '<body id="body">',
      '<div></div>',
      '<p></p>',
      '</body>',
      '</html>'
    ].join('\n');

    hexo.extend.injector.register('head_begin', '<!-- Powered by Hexo -->');
    hexo.extend.injector.register('head_end', '<link href="prism.css" rel="stylesheet">');
    hexo.extend.injector.register('head_end', '<link href="prism-linenumber.css" rel="stylesheet">');
    hexo.extend.injector.register('body_begin', '<script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>');
    hexo.extend.injector.register('body_end', '<script src="prism.js"></script>');

    const result = injectorFilter(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- Powered by Hexo --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"><link href="prism-linenumber.css" rel="stylesheet"><!-- hexo injector head_end end --></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });

  it('inject on specific page', () => {
    const content = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head id="head"><title>Test</title>',
      '</head>',
      '<body id="body">',
      '<div></div>',
      '<p></p>',
      '</body>',
      '</html>'
    ].join('\n');

    hexo.extend.injector.register('head_begin', '<!-- head_begin_default -->');
    hexo.extend.injector.register('head_begin', '<!-- head_begin_home -->', 'home');
    hexo.extend.injector.register('head_begin', '<!-- head_begin_post -->', 'post');
    hexo.extend.injector.register('head_begin', '<!-- head_begin_page -->', 'page');
    hexo.extend.injector.register('head_begin', '<!-- head_begin_archive -->', 'archive');
    hexo.extend.injector.register('head_begin', '<!-- head_begin_category -->', 'category');
    hexo.extend.injector.register('head_begin', '<!-- head_begin_tag -->', 'tag');

    const result1 = injectorFilter(content, { page: {} });
    const result2 = injectorFilter(content, { page: { __index: true } });
    const result3 = injectorFilter(content, { page: { __post: true } });
    const result4 = injectorFilter(content, { page: { __page: true } });
    const result5 = injectorFilter(content, { page: { archive: true } });
    const result6 = injectorFilter(content, { page: { category: true } });
    const result7 = injectorFilter(content, { page: { tag: true } });

    // home
    result1.should.not.contain('<!-- head_begin_home -->');
    result2.should.contain('<!-- head_begin_home --><!-- head_begin_default -->');
    // post
    result1.should.not.contain('<!-- head_begin_post -->');
    result3.should.contain('<!-- head_begin_post --><!-- head_begin_default -->');
    // page
    result1.should.not.contain('<!-- head_begin_page -->');
    result4.should.contain('<!-- head_begin_page --><!-- head_begin_default -->');
    // archive
    result1.should.not.contain('<!-- head_begin_archive -->');
    result5.should.contain('<!-- head_begin_archive --><!-- head_begin_default -->');
    // category
    result1.should.not.contain('<!-- head_begin_category -->');
    result6.should.contain('<!-- head_begin_category --><!-- head_begin_default -->');
    // tag
    result1.should.not.contain('<!-- head_begin_tag -->');
    result7.should.contain('<!-- head_begin_tag --><!-- head_begin_default -->');
  });
});
