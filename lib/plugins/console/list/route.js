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

  for (let i = 0; i < routes.length; i++) {
    const item = routes[i].split('/');
    cursor = obj;

    for (let j = 0; j < item.length; j++) {
      const seg = item[j];
      cursor[seg] = cursor[seg] || {};
      cursor = cursor[seg];
    }
  }

  return obj;
}

function buildNodes(tree) {
  const keys = Object.keys(tree);
  const nodes = [];

  for (let i = 0; i < keys.length; i++) {
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
