'use strict';

// https://github.com/imathis/hsl-picker/blob/master/assets/javascripts/modules/color.coffee
var rHex3 = /^#([0-9a-f]{3})$/;
var rHex6 = /^#([0-9a-f]{6})$/;
var rRGB = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,?\s*(0?\.?\d+)?\s*\)$/;
var rHSL = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\%\s*,\s*(\d{1,3})\%\s*,?\s*(0?\.?\d+)?\s*\)$/;

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

function tagcloudHelper(tags, options) {
  if (!options && (!tags || !tags.hasOwnProperty('length'))) {
    options = tags;
    tags = this.site.tags;
  }

  if (!tags || !tags.length) return '';
  options = options || {};

  var min = options.min_font || 10;
  var max = options.max_font || 20;
  var orderby = options.orderby || 'name';
  var order = options.order || 1;
  var unit = options.unit || 'px';
  var color = options.color;
  var transform = options.transform;
  var separator = options.separator || ' ';
  var result = [];
  var self = this;
  var startColor, endColor;

  if (color) {
    startColor = new Color(options.start_color);
    endColor = new Color(options.end_color);

    if (!startColor || !endColor) color = false;
  }

  // Sort the tags
  if (orderby === 'random' || orderby === 'rand') {
    tags = tags.random();
  } else {
    tags = tags.sort(orderby, order);
  }

  // Ignore tags with zero posts
  tags = tags.filter(function(tag) {
    return tag.length;
  });

  // Limit the number of tags
  if (options.amount) {
    tags = tags.limit(options.amount);
  }

  var sizes = [];

  tags.sort('length').forEach(function(tag) {
    var length = tag.length;
    if (~sizes.indexOf(length)) return;

    sizes.push(length);
  });

  var length = sizes.length - 1;

  tags.forEach(function(tag) {
    var ratio = length ? (sizes.indexOf(tag.length) / length) : 0;
    var size = min + (max - min) * ratio;
    var style = 'font-size: ' + parseFloat(size.toFixed(2)) + unit + ';';

    if (color) {
      var midColor = startColor.mix(endColor, ratio);
      style += ' color: ' + midColor.toString();
    }

    result.push(
      '<a href="' + self.url_for(tag.path) + '" style="' + style + '">' +
      (transform ? transform(tag.name) : tag.name) +
      '</a>'
    );
  });

  return result.join(separator);
}

function Color(color) {
  if (typeof color === 'object') {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
  } else if (typeof color === 'string') {
    this.parse(color);
  } else {
    throw new TypeError('color is required!');
  }

  if (this.r < 0 || this.r > 255 ||
      this.g < 0 || this.g > 255 ||
      this.b < 0 || this.b > 255 ||
      this.a < 0 || this.a > 1) {
    throw new Error(color + ' is invalid.');
  }
}

Color.prototype.parse = function(color) {
  color = color.toLowerCase();

  if (colorNames.hasOwnProperty(color)) {
    var obj = colorNames[color];

    this.r = obj.r;
    this.g = obj.g;
    this.b = obj.b;
    this.a = obj.a;

    return;
  }

  var match, txt, code;

  if (rHex3.test(color)) {
    txt = color.substring(1);
    code = parseInt(txt, 16);

    this.r = ((code & 0xF00) >> 8) * 17;
    this.g = ((code & 0xF0) >> 4) * 17;
    this.b = (code & 0xF) * 17;
    this.a = 1;
  } else if (rHex6.test(color)) {
    txt = color.substring(1);
    code = parseInt(txt, 16);

    this.r = (code & 0xFF0000) >> 16;
    this.g = (code & 0xFF00) >> 8;
    this.b = code & 0xFF;
    this.a = 1;
  } else if (rRGB.test(color)) {
    match = color.match(rRGB);

    this.r = match[1] | 0;
    this.g = match[2] | 0;
    this.b = match[3] | 0;
    this.a = match[4] ? +match[4] : 1;
  } else if (rHSL.test(color)) {
    match = color.match(rHSL);

    var h = +match[1] / 360;
    var s = +match[2] / 100;
    var l = +match[3] / 100;

    this.a = match[4] ? +match[4] : 1;

    if (!s) {
      this.r = this.g = this.b = l * 255;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
    var p = 2 * l - q;

    var rt = h + 1 / 3;
    var gt = h;
    var bt = h - 1 / 3;

    this.r = convertHue(p, q, rt);
    this.g = convertHue(p, q, gt);
    this.b = convertHue(p, q, bt);
  } else {
    throw new Error(color + ' is not a supported color format.');
  }
};

Color.prototype.toString = function() {
  if (this.a === 1) {
    var r = convertRGB(this.r);
    var g = convertRGB(this.g);
    var b = convertRGB(this.b);

    if (this.r % 17 || this.g % 17 || this.b % 17) {
      return '#' + r + g + b;
    }

    return '#' + r[0] + g[0] + b[0];
  }

  return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + parseFloat(this.a.toFixed(2)) + ')';
};

Color.prototype.mix = function(color, ratio) {
  switch (ratio){
    case 0:
      return new Color(this);

    case 1:
      return new Color(color);
  }

  return new Color({
    r: Math.round(mixValue(this.r, color.r, ratio)),
    g: Math.round(mixValue(this.g, color.g, ratio)),
    b: Math.round(mixValue(this.b, color.b, ratio)),
    a: mixValue(this.a, color.a, ratio)
  });
};

function convertHue(p, q, h) {
  if (h < 0) h++;
  if (h > 1) h--;

  var color;

  if (h * 6 < 1) {
    color = p + (q - p) * h * 6;
  } else if (h * 2 < 1) {
    color = q;
  } else if (h * 3 < 2) {
    color = p + (q - p) * ((2 / 3) - h) * 6;
  } else {
    color = p;
  }

  return Math.round(color * 255);
}

function convertRGB(value) {
  var str = value.toString(16);
  if (value < 16) return '0' + str;

  return str;
}

function mixValue(a, b, ratio) {
  return a + (b - a) * ratio;
}

module.exports = tagcloudHelper;
