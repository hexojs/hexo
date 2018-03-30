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

  for (const route of routes) {
    let cursor = obj;

    for (const seg of route.split('/')) {
      cursor = cursor[seg] = cursor[seg] || {};
    }
  }

  return obj;
}

function buildNodes(tree) {
  const nodes = [];

  for (const key of Object.keys(tree)) {
    const item = tree[key];

    const result = Object.keys(item).length ? {
      label: key,
      nodes: buildNodes(item)
    } : key;

    nodes.push(result);
  }

  return nodes;
}

module.exports = listRoute;
