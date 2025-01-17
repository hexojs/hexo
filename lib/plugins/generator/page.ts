import type { BaseGeneratorReturn, PageSchema, SiteLocals } from '../../types';
import type Document from 'warehouse/dist/document';

type SimplePageGenerator = Omit<BaseGeneratorReturn, 'layout'> & { data: string };
interface NormalPageGenerator extends BaseGeneratorReturn {
  layout: string[];
  data: PageSchema;
}
type PageGenerator = SimplePageGenerator | NormalPageGenerator;

function pageGenerator(locals: SiteLocals): PageGenerator[] {
  return locals.pages.map((page: Document<PageSchema> & PageSchema) => {
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
