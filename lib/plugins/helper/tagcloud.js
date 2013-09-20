var _ = require('lodash');

// https://github.com/imathis/hsl-picker/blob/master/assets/javascripts/modules/color.coffee
var rHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
  rRgb = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,?\s*(0?\.?\d+)?\s*\)$/,
  rHsl = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\%\s*,\s*(\d{1,3})\%\s*,?\s*(0?\.?\d+)?\s*\)$/;

var parseColor = function(str){
  var color = {},
    valid = true;

  if (rHex.test(str)){
    var txt = str.match(rHex)[1];

    if (txt.length == 6){
      var r = txt.substr(0, 2),
        g = txt.substr(2, 2),
        b = txt.substr(4, 2);
    } else {
      var r = txt[0] + txt[0],
        g = txt[1] + txt[1],
        b = txt[2] + txt[2];
    }

    color.r = parseInt(r, 16);
    color.g = parseInt(g, 16);
    color.b = parseInt(b, 16);
    color.a = 1;
  } else if (rRgb.test(str)){
    var match = str.match(rRgb);

    color.r = +match[1];
    color.g = +match[2];
    color.b = +match[3];
    color.a = match[4] ? +match[4] : 1;
  } else if (rHsl.test(str)){
    var match = str.match(rHsl),
      h = +match[1] / 360,
      s = +match[2] / 100,
      l = +match[3] / 100;

    if (s > 0){
      var q = l < 0.5 ? l * (1 + s) : l + s - (l * s),
        p = 2 * l - q;

      var rt = h + 1 / 3,
        gt = h,
        bt = h - 1 / 3;

      color.r = Math.round(hueToRgb(p, q, rt) * 255);
      color.g = Math.round(hueToRgb(p, q, gt) * 255);
      color.b = Math.round(hueToRgb(p, q, bt) * 255);
    } else {
      color.r = color.g = color.b = l * 255;
    }

    color.a = match[4] ? +match[4] : 1;
  } else {
    return;
  }

  ['r', 'g', 'b'].forEach(function(i){
    if (color[i] > 255 || color[i] < 0) valid = false;
  });

  if (color.a > 1 || color.a < 0) valid = false;

  if (valid) return color;
};

var hueToRgb = function(p, q, h){
  if (h < 0) h++;
  if (h > 1) h--;

  if (h * 6 < 1){
    return p + (q - p) * h * 6;
  } else if (h * 2 < 1){
    return q;
  } else if (h * 3 < 2){
    return p + (q - p) * ((2 / 3) - h) * 6;
  } else {
    return p;
  }
};

var rgbToHex = function(color){
  var r = color.r.toString(16),
    g = color.g.toString(16),
    b = color.b.toString(16);

  if (r.length > 1 || g.length > 1 || b.length > 1){
    return '#' + r + g + b;
  } else {
    return '#' + r + r + g + g + b + b;
  }
};

var midColor = function(a, b, ratio){
  var color = {};

  ['r', 'g', 'b'].forEach(function(i){
    color[i] = Math.round(a[i] + (b[i] - a[i]) * ratio);
  });

  color.a = a.a + (b.a - a.a) * ratio;

  return color;
};

module.exports = function(tags, options){
  if (!options){
    options = tags;
    tags = this.site.tags;
  }

  if (!tags.length) return '';

  var options = _.extend({
    min_font: 10,
    max_font: 20,
    unit: 'px',
    start_color: '',
    end_color: '',
    color: false,
    amount: 40, // 0 = unlimited
    orderby: 'name', // name, length, random
    order: 1
  }, options);

  var min = options.min_font,
    max = options.max_font,
    orderby = options.orderby,
    order = options.order,
    unit = options.unit,
    color = options.color,
    root = this.config.root;

  if (color){
    var startColor = parseColor(options.start_color),
      endColor = parseColor(options.end_color);

    if (!startColor || !endColor) color = false;
  }

  if (orderby === 'random' || orderby === 'rand'){
    tags = tags.random();
  } else {
    tags = tags.sort(orderby, order);
  }

  if (options.amount) tags = tags.limit(options.amount);

  var sizes = [];

  tags.sort('length').each(function(tag){
    var length = tag.length;

    if (sizes.indexOf(length) > -1) return;

    sizes.push(length);
  });

  var length = sizes.length,
    result = '';

  tags.each(function(tag){
    var index = sizes.indexOf(tag.length),
      size = min + (max - min) / (length - 1) * index;

    if (color){
      var tagColor = ' color: ',
        mid = midColor(startColor, endColor, index / (length - 1));

      if (mid.a < 1){
        tagColor += 'rgba(' + mid.r + ', ' + mid.g + ', ' + mid.b + ', ' + mid.a.toFixed(2).replace(/\.?0*$/, '') + ')';
      } else {
        tagColor += rgbToHex(mid);
      }

      tagColor += ';';
    }

    result += '<a href="' + root + tag.path + '" style="font-size: ' + size.toFixed(2) + unit + ';' + (tagColor || '') + '">' + tag.name + '</a>';
  });

  return result;
};
