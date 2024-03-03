import { Color, url_for } from 'hexo-util';
import moize from 'moize';
import type { LocalsType, TagSchema } from '../../types';
import type Query from 'warehouse/dist/query';

interface Options {
  min_font?: number;
  max_font?: number;
  orderby?: string;
  order?: number;
  unit?: string;
  color?: boolean;
  class?: string;
  show_count?: boolean;
  count_class?: string;
  level?: number;
  transform?: (name: string) => string;
  separator?: string;
  amount?: number;
  start_color?: string;
  end_color?: string;
}

function tagcloudHelper(this: LocalsType, tags?: Query<TagSchema> | Options, options?: Options) {
  if (!options && (!tags || !Object.prototype.hasOwnProperty.call(tags, 'length'))) {
    options = tags as Options;
    tags = this.site.tags;
  }
  tags = tags as Query<TagSchema>;

  if (!tags || !tags.length) return '';
  options = options || {};

  const min = options.min_font || 10;
  const max = options.max_font || 20;
  const orderby = options.orderby || 'name';
  const order = options.order || 1;
  const unit = options.unit || 'px';
  const color = options.color;
  const className = options.class;
  const showCount = options.show_count;
  const countClassName = options.count_class || 'count';
  const level = options.level || 10;
  const { transform } = options;
  const separator = options.separator || ' ';
  const result = [];
  let startColor, endColor;

  if (color) {
    if (!options.start_color) throw new TypeError('start_color is required!');
    if (!options.end_color) throw new TypeError('end_color is required!');

    startColor = new Color(options.start_color);
    endColor = new Color(options.end_color);
  }

  // Sort the tags
  if (orderby === 'random' || orderby === 'rand') {
    tags = tags.random();
  } else {
    tags = tags.sort(orderby, order);
  }

  // Limit the number of tags
  if (options.amount) {
    tags = tags.limit(options.amount);
  }

  const sizes = [];

  tags.sort('length').forEach(tag => {
    const { length } = tag;
    if (sizes.includes(length)) return;

    sizes.push(length);
  });

  const length = sizes.length - 1;

  tags.forEach(tag => {
    const ratio = length ? sizes.indexOf(tag.length) / length : 0;
    const size = min + ((max - min) * ratio);
    let style = `font-size: ${parseFloat(size.toFixed(2))}${unit};`;
    const attr = className ? ` class="${className}-${Math.round(ratio * level)}"` : '';

    if (color) {
      const midColor = startColor.mix(endColor, ratio);
      style += ` color: ${midColor.toString()}`;
    }

    result.push(
      `<a href="${url_for.call(this, tag.path)}" style="${style}"${attr}>${transform ? transform(tag.name) : tag.name}${showCount ? `<span class="${countClassName}">${tag.length}</span>` : ''}</a>`
    );
  });

  return result.join(separator);
}

function tagcloudHelperFactory(this: LocalsType, tags?: Query<TagSchema> | Options, options?: Options) {
  const transformArgs = () => {
    if (!options && (!tags || !Object.prototype.hasOwnProperty.call(tags, 'length'))) {
      options = tags as Options;
      tags = this.site.tags;
    }
    tags = tags as Query<TagSchema>;

    return [tags.toArray(), options];
  };

  return moize(tagcloudHelper.bind(this), {
    maxSize: 5,
    isDeepEqual: true,
    transformArgs
  }).call(this, tags, options);
}

export = tagcloudHelperFactory;
