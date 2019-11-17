'use strict';

const archy = require('archy');

function listRoute() {
  const routes = this.route.list().sort();
  const tree = buildTree(routes);
  const nodes = buildNodes(tree);

  const s = archy({
    label: `Total: ${routes.length}`,
    nodes
  });

  console.log(s);
}

function buildTree(routes) {
  const obj = {};
  let cursor;

  for (const route of routes) {
    const item = route.split('/');
    cursor = obj;

    for (const seg of item) {
      cursor[seg] = cursor[seg] || {};
      cursor = cursor[seg];
    }
  }

  return obj;
}

function buildNodes(tree) {
  const keys = Object.keys(tree);
  const nodes = [];

  for (const key of keys) {
    const item = tree[key];

    if (Object.keys(item).length) {
      nodes.push({
        label: key,
        nodes: buildNodes(item)
      });
    } else {
      nodes.push(key);
    }
  }

  return nodes;
}

module.exports = listRoute;
