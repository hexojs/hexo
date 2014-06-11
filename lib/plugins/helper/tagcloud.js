var _ = require('lodash');

// https://github.com/imathis/hsl-picker/blob/master/assets/javascripts/modules/color.coffee
var rHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
  rRgb = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,?\s*(0?\.?\d+)?\s*\)$/,
  rHsl = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\%\s*,\s*(\d{1,3})\%\s*,?\s*(0?\.?\d+)?\s*\)$/;

// http://www.w3.org/TR/css3-color/#svg-color
var colorNames = {
  aliceblue: {r: 240, g: 248, b: 255, a: 1},
  antiquewhite: {r: 250, g: 235, b: 215, a: 1},
  aqua: {r: 0, g: 255, b: 255, a: 1},
  aquamarine: {r: 127, g: 255, b: 212, a: 1},
  azure: {r: 240, g: 255, b: 255, a: 1},
  beige: {r: 245, g: 245, b: 220, a: 1},
  bisque: {r: 255, g: 228, b: 196, a: 1},
  black: {r: 0, g: 0, b: 0, a: 1},
  blanchedalmond: {r: 255, g: 235, b: 205, a: 1},
  blue: {r: 0, g: 0, b: 255, a: 1},
  blueviolet: {r: 138, g: 43, b: 226, a: 1},
  brown: {r: 165, g: 42, b: 42, a: 1},
  burlywood: {r: 222, g: 184, b: 135, a: 1},
  cadetblue: {r: 95, g: 158, b: 160, a: 1},
  chartreuse: {r: 127, g: 255, b: 0, a: 1},
  chocolate: {r: 210, g: 105, b: 30, a: 1},
  coral: {r: 255, g: 127, b: 80, a: 1},
  cornflowerblue: {r: 100, g: 149, b: 237, a: 1},
  cornsilk: {r: 255, g: 248, b: 220, a: 1},
  crimson: {r: 220, g: 20, b: 60, a: 1},
  cyan: {r: 0, g: 255, b: 255, a: 1},
  darkblue: {r: 0, g: 0, b: 139, a: 1},
  darkcyan: {r: 0, g: 139, b: 139, a: 1},
  darkgoldenrod: {r: 184, g: 134, b: 11, a: 1},
  darkgray: {r: 169, g: 169, b: 169, a: 1},
  darkgreen: {r: 0, g: 100, b: 0, a: 1},
  darkgrey: {r: 169, g: 169, b: 169, a: 1},
  darkkhaki: {r: 189, g: 183, b: 107, a: 1},
  darkmagenta: {r: 139, g: 0, b: 139, a: 1},
  darkolivegreen: {r: 85, g: 107, b: 47, a: 1},
  darkorange: {r: 255, g: 140, b: 0, a: 1},
  darkorchid: {r: 153, g: 50, b: 204, a: 1},
  darkred: {r: 139, g: 0, b: 0, a: 1},
  darksalmon: {r: 233, g: 150, b: 122, a: 1},
  darkseagreen: {r: 143, g: 188, b: 143, a: 1},
  darkslateblue: {r: 72, g: 61, b: 139, a: 1},
  darkslategray: {r: 47, g: 79, b: 79, a: 1},
  darkslategrey: {r: 47, g: 79, b: 79, a: 1},
  darkturquoise: {r: 0, g: 206, b: 209, a: 1},
  darkviolet: {r: 148, g: 0, b: 211, a: 1},
  deeppink: {r: 255, g: 20, b: 147, a: 1},
  deepskyblue: {r: 0, g: 191, b: 255, a: 1},
  dimgray: {r: 105, g: 105, b: 105, a: 1},
  dimgrey: {r: 105, g: 105, b: 105, a: 1},
  dodgerblue: {r: 30, g: 144, b: 255, a: 1},
  firebrick: {r: 178, g: 34, b: 34, a: 1},
  floralwhite: {r: 255, g: 250, b: 240, a: 1},
  forestgreen: {r: 34, g: 139, b: 34, a: 1},
  fuchsia: {r: 255, g: 0, b: 255, a: 1},
  gainsboro: {r: 220, g: 220, b: 220, a: 1},
  ghostwhite: {r: 248, g: 248, b: 255, a: 1},
  gold: {r: 255, g: 215, b: 0, a: 1},
  goldenrod: {r: 218, g: 165, b: 32, a: 1},
  gray: {r: 128, g: 128, b: 128, a: 1},
  green: {r: 0, g: 128, b: 0, a: 1},
  greenyellow: {r: 173, g: 255, b: 47, a: 1},
  grey: {r: 128, g: 128, b: 128, a: 1},
  honeydew: {r: 240, g: 255, b: 240, a: 1},
  hotpink: {r: 255, g: 105, b: 180, a: 1},
  indianred: {r: 205, g: 92, b: 92, a: 1},
  indigo: {r: 75, g: 0, b: 130, a: 1},
  ivory: {r: 255, g: 255, b: 240, a: 1},
  khaki: {r: 240, g: 230, b: 140, a: 1},
  lavender: {r: 230, g: 230, b: 250, a: 1},
  lavenderblush: {r: 255, g: 240, b: 245, a: 1},
  lawngreen: {r: 124, g: 252, b: 0, a: 1},
  lemonchiffon: {r: 255, g: 250, b: 205, a: 1},
  lightblue: {r: 173, g: 216, b: 230, a: 1},
  lightcoral: {r: 240, g: 128, b: 128, a: 1},
  lightcyan: {r: 224, g: 255, b: 255, a: 1},
  lightgoldenrodyellow: {r: 250, g: 250, b: 210, a: 1},
  lightgray: {r: 211, g: 211, b: 211, a: 1},
  lightgreen: {r: 144, g: 238, b: 144, a: 1},
  lightgrey: {r: 211, g: 211, b: 211, a: 1},
  lightpink: {r: 255, g: 182, b: 193, a: 1},
  lightsalmon: {r: 255, g: 160, b: 122, a: 1},
  lightseagreen: {r: 32, g: 178, b: 170, a: 1},
  lightskyblue: {r: 135, g: 206, b: 250, a: 1},
  lightslategray: {r: 119, g: 136, b: 153, a: 1},
  lightslategrey: {r: 119, g: 136, b: 153, a: 1},
  lightsteelblue: {r: 176, g: 196, b: 222, a: 1},
  lightyellow: {r: 255, g: 255, b: 224, a: 1},
  lime: {r: 0, g: 255, b: 0, a: 1},
  limegreen: {r: 50, g: 205, b: 50, a: 1},
  linen: {r: 250, g: 240, b: 230, a: 1},
  magenta: {r: 255, g: 0, b: 255, a: 1},
  maroon: {r: 128, g: 0, b: 0, a: 1},
  mediumaquamarine: {r: 102, g: 205, b: 170, a: 1},
  mediumblue: {r: 0, g: 0, b: 205, a: 1},
  mediumorchid: {r: 186, g: 85, b: 211, a: 1},
  mediumpurple: {r: 147, g: 112, b: 219, a: 1},
  mediumseagreen: {r: 60, g: 179, b: 113, a: 1},
  mediumslateblue: {r: 123, g: 104, b: 238, a: 1},
  mediumspringgreen: {r: 0, g: 250, b: 154, a: 1},
  mediumturquoise: {r: 72, g: 209, b: 204, a: 1},
  mediumvioletred: {r: 199, g: 21, b: 133, a: 1},
  midnightblue: {r: 25, g: 25, b: 112, a: 1},
  mintcream: {r: 245, g: 255, b: 250, a: 1},
  mistyrose: {r: 255, g: 228, b: 225, a: 1},
  moccasin: {r: 255, g: 228, b: 181, a: 1},
  navajowhite: {r: 255, g: 222, b: 173, a: 1},
  navy: {r: 0, g: 0, b: 128, a: 1},
  oldlace: {r: 253, g: 245, b: 230, a: 1},
  olive: {r: 128, g: 128, b: 0, a: 1},
  olivedrab: {r: 107, g: 142, b: 35, a: 1},
  orange: {r: 255, g: 165, b: 0, a: 1},
  orangered: {r: 255, g: 69, b: 0, a: 1},
  orchid: {r: 218, g: 112, b: 214, a: 1},
  palegoldenrod: {r: 238, g: 232, b: 170, a: 1},
  palegreen: {r: 152, g: 251, b: 152, a: 1},
  paleturquoise: {r: 175, g: 238, b: 238, a: 1},
  palevioletred: {r: 219, g: 112, b: 147, a: 1},
  papayawhip: {r: 255, g: 239, b: 213, a: 1},
  peachpuff: {r: 255, g: 218, b: 185, a: 1},
  peru: {r: 205, g: 133, b: 63, a: 1},
  pink: {r: 255, g: 192, b: 203, a: 1},
  plum: {r: 221, g: 160, b: 221, a: 1},
  powderblue: {r: 176, g: 224, b: 230, a: 1},
  purple: {r: 128, g: 0, b: 128, a: 1},
  red: {r: 255, g: 0, b: 0, a: 1},
  rosybrown: {r: 188, g: 143, b: 143, a: 1},
  royalblue: {r: 65, g: 105, b: 225, a: 1},
  saddlebrown: {r: 139, g: 69, b: 19, a: 1},
  salmon: {r: 250, g: 128, b: 114, a: 1},
  sandybrown: {r: 244, g: 164, b: 96, a: 1},
  seagreen: {r: 46, g: 139, b: 87, a: 1},
  seashell: {r: 255, g: 245, b: 238, a: 1},
  sienna: {r: 160, g: 82, b: 45, a: 1},
  silver: {r: 192, g: 192, b: 192, a: 1},
  skyblue: {r: 135, g: 206, b: 235, a: 1},
  slateblue: {r: 106, g: 90, b: 205, a: 1},
  slategray: {r: 112, g: 128, b: 144, a: 1},
  slategrey: {r: 112, g: 128, b: 144, a: 1},
  snow: {r: 255, g: 250, b: 250, a: 1},
  springgreen: {r: 0, g: 255, b: 127, a: 1},
  steelblue: {r: 70, g: 130, b: 180, a: 1},
  tan: {r: 210, g: 180, b: 140, a: 1},
  teal: {r: 0, g: 128, b: 128, a: 1},
  thistle: {r: 216, g: 191, b: 216, a: 1},
  tomato: {r: 255, g: 99, b: 71, a: 1},
  turquoise: {r: 64, g: 224, b: 208, a: 1},
  violet: {r: 238, g: 130, b: 238, a: 1},
  wheat: {r: 245, g: 222, b: 179, a: 1},
  white: {r: 255, g: 255, b: 255, a: 1},
  whitesmoke: {r: 245, g: 245, b: 245, a: 1},
  yellow: {r: 255, g: 255, b: 0, a: 1},
  yellowgreen: {r: 154, g: 205, b: 50, a: 1}
};

var parseColor = function(str){
  str = str.toLowerCase();

  var color = {},
    valid = true,
    r = '',
    g = '',
    b = '',
    match;

  if (rHex.test(str)){
    var txt = str.match(rHex)[1];

    if (txt.length == 6){
      r = txt.substr(0, 2);
      g = txt.substr(2, 2);
      b = txt.substr(4, 2);
    } else {
      r = txt[0] + txt[0];
      g = txt[1] + txt[1];
      b = txt[2] + txt[2];
    }

    color.r = parseInt(r, 16);
    color.g = parseInt(g, 16);
    color.b = parseInt(b, 16);
    color.a = 1;
  } else if (rRgb.test(str)){
    match = str.match(rRgb);

    color.r = +match[1];
    color.g = +match[2];
    color.b = +match[3];
    color.a = match[4] ? +match[4] : 1;
  } else if (rHsl.test(str)){
    match = str.match(rHsl);

    var h = +match[1] / 360,
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
  } else if (colorNames.hasOwnProperty(str)){
    return colorNames[str];
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
  var hex = '#';

  ['r', 'g', 'b'].forEach(function(i){
    var code = color[i].toString(16);

    hex += code.length == 1 ? code + code : code;
  });

  return hex;
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

  options = _.extend({
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
    tagColor = '',
    self = this;

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
      var mid = midColor(startColor, endColor, index / (length - 1));

      tagColor = ' color: ';

      if (mid.a < 1){
        tagColor += 'rgba(' + mid.r + ', ' + mid.g + ', ' + mid.b + ', ' + mid.a.toFixed(2).replace(/\.?0*$/, '') + ')';
      } else {
        tagColor += rgbToHex(mid);
      }

      tagColor += ';';
    }

    result += '<a href="' + self.url_for(tag.path) + '" style="font-size: ' + size.toFixed(2) + unit + ';' + (tagColor || '') + '">' + tag.name + '</a>';
  });

  return result;
};
