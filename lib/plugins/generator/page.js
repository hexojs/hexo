'use strict';

function pageGenerator(locals) {
  return locals.pages.map(page => {
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

module.exports = pageGenerator;
