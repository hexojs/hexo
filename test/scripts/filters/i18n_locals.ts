import Hexo from '../../../lib/hexo';
import i18nLocalsFilter from '../../../lib/plugins/filter/template_locals/i18n';
type I18nLocalsFilterParams = Parameters<typeof i18nLocalsFilter>;
type I18nLocalsFilterReturn = ReturnType<typeof i18nLocalsFilter>;

describe('i18n locals', () => {
  const hexo = new Hexo();
  const i18nFilter: (...args: I18nLocalsFilterParams) => I18nLocalsFilterReturn = i18nLocalsFilter.bind(hexo);
  const theme = hexo.theme;
  const i18n = theme.i18n;

  // Default language
  i18n.languages = ['en', 'default'];

  // Fixtures
  i18n.set('de', {
    Home: 'Zuhause'
  });

  i18n.set('default', {
    Home: 'Default Home'
  });

  i18n.set('en', {
    Home: 'Home'
  });

  i18n.set('zh-tw', {
    Home: '首頁'
  });

  it('page.lang set', () => {
    const locals = {
      config: hexo.config,
      page: {
        lang: 'zh-tw'
      }
    } as any;

    i18nFilter(locals);

    locals.__('Home').should.eql('首頁');
  });

  it('page.language set', () => {
    const locals = {
      config: hexo.config,
      page: {
        language: 'zh-tw'
      }
    } as any;

    i18nFilter(locals);

    locals.__('Home').should.eql('首頁');
  });

  it('detect by path (lang found)', () => {
    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'zh-tw/index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('zh-tw');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('首頁');
  });

  it('detect by path (lang not found)', () => {
    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'news/index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('en');
    locals.page.canonical_path.should.eql('news/index.html');
    locals.__('Home').should.eql('Home');
  });

  it('use config by default', () => {
    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('en');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Home');
  });

  it('use config by default - with multiple languages, first language should be used', () => {
    const oldConfig = i18n.languages;
    i18n.languages = ['zh-tw', 'en', 'default'];

    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('zh-tw');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('首頁');

    i18n.languages = oldConfig;
  });

  it('use config by default - with no languages, default language should be used', () => {
    const oldConfig = i18n.languages;
    i18n.languages = ['default'];

    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('default');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Default Home');

    i18n.languages = oldConfig;
  });

  it('use config by default - with unknown language, default language should be used', () => {
    const oldConfig = i18n.languages;
    i18n.languages = ['fr', 'default'];

    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('fr');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Default Home');

    i18n.languages = oldConfig;
  });

  it('use config by default - with no set language and no default file take first available', () => {
    const oldConfig = i18n.languages;
    const oldSet = i18n.get('default');
    i18n.remove('default');
    i18n.languages = ['default'];

    const locals = {
      config: hexo.config,
      page: {} as any,
      path: 'index.html'
    } as any;

    i18nFilter(locals);

    locals.page.lang.should.eql('default');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Zuhause');

    i18n.set('default', oldSet);
    i18n.languages = oldConfig;
  });
});
