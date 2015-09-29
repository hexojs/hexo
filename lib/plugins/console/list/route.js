'use strict';

var archy = require('archy');

function listRoute() {
  var routes = this.route.list().sort();
  var tree = buildTree(routes);
  var nodes = buildNodes(tree);

  var s = archy({
    label: 'Total: ' + routes.length,
    nodes: nodes
  });

  console.log(s);
}

function buildTree(routes) {
  var obj = {};
  var item, j, lenj, seg, cursor;

  for (var i = 0, len = routes.length; i < len; i++) {
    item = routes[i].split('/');
    cursor = obj;

    for (j = 0, lenj = item.length; j < lenj; j++) {
      seg = item[j];
      cursor = cursor[seg] = cursor[seg] || {};
    }
  }

  return obj;
}

function buildNodes(tree) {
  var keys = Object.keys(tree);
  var nodes = [];
  var key, item;

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    item = tree[key];

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
