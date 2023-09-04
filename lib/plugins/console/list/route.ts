import archy from 'archy';

function listRoute(): void {
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
      cursor[seg] = cursor[seg] || {};
      cursor = cursor[seg];
    }
  }

  return obj;
}

function buildNodes(tree) {
  const nodes = [];

  for (const [key, item] of Object.entries(tree)) {
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

export = listRoute;
