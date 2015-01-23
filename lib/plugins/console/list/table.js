var strip = require('strip-ansi');

module.exports = function(data){
  var firstRow = data[0];
  var colLength = firstRow.length;
  var rowLength = data.length;
  var maxColWidth = new Array(colLength);
  var result = '';
  var i, j, max, len, str;

  for (i = 0; i < colLength; i++){
    max = 0;

    for (j = 0; j < rowLength; j++){
      len = realLength(data[j][i]);
      if (len > max) max = len;
    }

    maxColWidth[i] = max;
  }

  for (i = 0; i < rowLength; i++){
    if (i) result += '\n';

    for (j = 0; j < colLength; j++){
      str = data[i][j];
      result += str + spaces(maxColWidth[j] - realLength(str) + 2);
    }
  }

  return result;
};

function realLength(str){
  str = strip(str);

  var len = str.length;
  var result = len;

  // Detect double-byte characters
  for (var i = 0; i < len; i++){
    if (str.charCodeAt(i) > 255){
      result++;
    }
  }

  return result;
}

function spaces(len){
  var result = '';

  for (var i = 0; i < len; i++){
    result += ' ';
  }

  return result;
}