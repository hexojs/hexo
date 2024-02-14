import type { PageGenerator, PageSchema, SiteLocals } from '../../types';

function pageGenerator(locals: SiteLocals): PageGenerator[] {
  return locals.pages.map((page: PageSchema) => {
    const { path, layout } = page;

    if (!layout || layout === 'false' || layout === 'off') {
      return {
        path,
        data: page.content
      };
    }

    const layouts = ['page', 'post', 'index'];
    if (layout !== 'page') layouts.unshift(layout);

    page.__page = true;

    return {
      path,
      layout: layouts,
      data: page
    };
  });
}

export = pageGenerator;
