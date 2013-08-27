var unique = function(arr){
  var a = [],
    l = arr.length;
  for (var i = 0; i < l; i++){
    for (var j = i + 1; j < l; j++){
      if (arr[i] === arr[j]) j = ++i;
    }
    a.push(arr[i]);
  }
  return a;
};