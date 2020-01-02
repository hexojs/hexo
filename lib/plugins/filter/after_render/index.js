'use strict';

module.exports = ctx => {
  const { filter } = ctx.extend;

  filter.register('after_route_render', require('./external_link'));
  filter.register('after_route_render', require('./meta_generator'));
  filter.register('after_route_render', require('./injector'));
};
