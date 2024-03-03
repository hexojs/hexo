import Hexo from '../../../lib/hexo';
import titlecaseFilter from '../../../lib/plugins/filter/before_post_render/titlecase';
type titlecaseFilterParams = Parameters<typeof titlecaseFilter>;
type titlecaseFilterReturn = ReturnType<typeof titlecaseFilter>;

describe('Titlecase', () => {
  const hexo = new Hexo();
  const titlecase: (...args: titlecaseFilterParams) => titlecaseFilterReturn = titlecaseFilter.bind(hexo);

  it('disabled', () => {
    const title = 'Today is a good day';
    const data = {title};
    hexo.config.titlecase = false;

    titlecase(data);
    data.title.should.eql(title);
  });

  it('enabled', () => {
    const title = 'Today is a good day';
    const data = {title};
    hexo.config.titlecase = true;

    titlecase(data);
    data.title.should.eql('Today Is a Good Day');
  });

  it('enabled globally but disabled in a specify post', () => {
    const title = 'Today is a good day';
    const data = {title, titlecase: false};
    hexo.config.titlecase = true;

    titlecase(data);
    data.title.should.eql('Today is a good day');
  });

  it('disabled globally but enabled in a specify post', () => {
    const title = 'Today is a good day';
    const data = {title, titlecase: true};
    hexo.config.titlecase = false;

    titlecase(data);
    data.title.should.eql('Today Is a Good Day');
  });

});
