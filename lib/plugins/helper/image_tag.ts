import {htmlTag, url_for} from 'hexo-util';

function imageTagHelper(path, options = {}) {
  const attrs = Object.assign({
    src: url_for.call(this, path)
  }, options);

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  return htmlTag('img', attrs);
}

export default imageTagHelper;
