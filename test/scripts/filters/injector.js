'use strict';

describe('Injector', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const injectorFilter = require('../../../lib/plugins/filter/after_render/injector').bind(hexo);

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

    const result = injectorFilter(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- Powered by Hexo --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"><link href="prism-linenumber.css" rel="stylesheet"><!-- hexo injector head_end end --></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });
});
