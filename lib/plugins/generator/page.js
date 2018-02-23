'use strict';

function pageGenerator(locals) {
  return locals.pages.map(page => {
    const layout = page.layout;
    const path = page.path;

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
