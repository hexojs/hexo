import Injector from '../../../lib/extend/injector';

describe('Injector', () => {
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

  it('register() - entry is required', () => {
    const i = new Injector();

    // no name
    try {
      // @ts-ignore
      i.register();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'entry is required');
    }
  });

  it('register() - string', () => {
    const i = new Injector();

    const str = '<link rel="stylesheet" href="DPlayer.min.css" />';
    i.register('head_begin', str);
    i.register('head_end', str, 'home');

    i.get('head_begin').should.contains(str);
    i.get('head_begin', 'default').should.contains(str);
    i.get('head_end', 'home').should.contains(str);
  });

  it('register() - function', () => {
    const i = new Injector();

    const fn = () => '<link rel="stylesheet" href="DPlayer.min.css" />';
    i.register('head_begin', fn);

    i.get('head_begin').should.contains(fn());
  });

  it('register() - fallback when entry not exists', () => {
    const i = new Injector();

    const str = '<link rel="stylesheet" href="DPlayer.min.css" />';
    // @ts-ignore
    i.register('foo', str);

    i.get('head_end').should.contains(str);
  });

  it('list()', () => {
    const i = new Injector();

    i.register('body_begin', '<script src="DPlayer.min.js"></script>');

    i.list().body_begin.default.should.be.instanceOf(Set);
    [...i.list().body_begin.default].should.not.be.empty;
  });

  it('get()', () => {
    const i = new Injector();
    const str = '<script src="jquery.min.js"></script>';

    i.register('body_begin', str);
    i.register('body_end', str, 'home');

    i.get('body_begin').should.be.instanceOf(Array);
    i.get('body_begin').should.contains(str);
    i.get('body_end', 'home').should.be.instanceOf(Array);
    i.get('body_end', 'home').should.contains(str);

    i.get('head_end').should.be.instanceOf(Array);
    i.get('head_end').should.eql([]);
  });

  it('getText()', () => {
    const i = new Injector();
    const str = '<script src="jquery.min.js"></script>';

    i.register('head_end', str);
    i.register('body_end', str, 'home');

    i.getText('body_end', 'home').should.eql(str);
    i.getText('body_end').should.eql('');
  });

  it('getSize()', () => {
    const i = new Injector();
    const str = '<script src="jquery.min.js"></script>';

    i.register('head_end', str);
    i.register('body_end', str);
    i.register('body_end', str, 'home');

    i.getSize('head_begin').should.eql(0);
    i.getSize('head_end').should.eql(1);
    i.getSize('body_end').should.eql(2);
  });

  it('exec() - default', () => {
    const i = new Injector();
    const result = i.exec(content);
    result.should.contain('<head id="head"><title>Test</title></head>');
    result.should.contain('<body id="body"><div></div><p></p></body>');
  });

  it('exec() - default', () => {
    const i = new Injector();
    const result = i.exec(content);
    result.should.contain('<head id="head"><title>Test</title></head>');
    result.should.contain('<body id="body"><div></div><p></p></body>');
  });

  it('exec() - insert code', () => {
    const i = new Injector();

    i.register('head_begin', '<!-- Powered by Hexo -->');
    i.register('head_end', '<link href="prism.css" rel="stylesheet">');
    i.register('head_end', '<link href="prism-linenumber.css" rel="stylesheet">');
    i.register('body_begin', '<script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>');
    i.register('body_end', '<script src="prism.js"></script>');

    const result = i.exec(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- Powered by Hexo --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"><link href="prism-linenumber.css" rel="stylesheet"><!-- hexo injector head_end end --></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });

  it('exec() - no duplicate insert', () => {
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

    const i = new Injector();

    i.register('head_begin', '<!-- Powered by Hexo -->');
    i.register('head_end', '<link href="prism.css" rel="stylesheet">');
    i.register('head_end', '<link href="prism-linenumber.css" rel="stylesheet">');
    i.register('body_begin', '<script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>');
    i.register('body_end', '<script src="prism.js"></script>');

    const result = i.exec(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });

  it('exec() - multi-line head & body', () => {
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

    const i = new Injector();

    i.register('head_begin', '<!-- Powered by Hexo -->');
    i.register('head_end', '<link href="prism.css" rel="stylesheet">');
    i.register('head_end', '<link href="prism-linenumber.css" rel="stylesheet">');
    i.register('body_begin', '<script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>');
    i.register('body_end', '<script src="prism.js"></script>');

    const result = i.exec(content);

    result.should.contain('<head id="head"><!-- hexo injector head_begin start --><!-- Powered by Hexo --><!-- hexo injector head_begin end -->');
    result.should.contain('<!-- hexo injector head_end start --><link href="prism.css" rel="stylesheet"><link href="prism-linenumber.css" rel="stylesheet"><!-- hexo injector head_end end --></head>');
    result.should.contain('<body id="body"><!-- hexo injector body_begin start --><script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script><!-- hexo injector body_begin end -->');
    result.should.contain('<!-- hexo injector body_end start --><script src="prism.js"></script><!-- hexo injector body_end end --></body>');
  });

  it('exec() - inject on specific page', () => {
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

    const i = new Injector();

    i.register('head_begin', '<!-- head_begin_default -->');
    i.register('head_begin', '<!-- head_begin_home -->', 'home');
    i.register('head_begin', '<!-- head_begin_post -->', 'post');
    i.register('head_begin', '<!-- head_begin_page -->', 'page');
    i.register('head_begin', '<!-- head_begin_archive -->', 'archive');
    i.register('head_begin', '<!-- head_begin_category -->', 'category');
    i.register('head_begin', '<!-- head_begin_tag -->', 'tag');

    const result1 = i.exec(content, { page: {} });
    const result2 = i.exec(content, { page: { __index: true } });
    const result3 = i.exec(content, { page: { __post: true } });
    const result4 = i.exec(content, { page: { __page: true } });
    const result5 = i.exec(content, { page: { archive: true } });
    const result6 = i.exec(content, { page: { category: true } });
    const result7 = i.exec(content, { page: { tag: true } });

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
