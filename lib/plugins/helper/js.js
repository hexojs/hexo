'use strict';

function jsHelper(...args) {
  return args.reduce((result, path, i) => {
    if (i) result += '\n';

    if (Array.isArray(path)) {
      return result + Reflect.apply(jsHelper, this, path);
    }
    if (!path.includes('?') && !path.endsWith('.js')) path += '.js';
    return `${result}<script src="${this.url_for(path)}"></script>`;
  }, '');
}

module.exports = jsHelper;
