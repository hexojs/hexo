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

  for (let i = 0, len = routes.length; i < len; i++) {
    const item = routes[i].split('/');
    cursor = obj;

    for (let j = 0, lenj = item.length; j < lenj; j++) {
      const seg = item[j];
      cursor = cursor[seg] = cursor[seg] || {};
    }
  }

  return obj;
}

function buildNodes(tree) {
  const keys = Object.keys(tree);
  const nodes = [];

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
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
