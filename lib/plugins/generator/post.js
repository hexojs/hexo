var extend = require('../../extend'),
  route = require('../../route');

extend.generator.register(function(locals, render, callback){
  var arr = locals.posts.sort('date', -1).toArray();

  for (var i=0, len=arr.length; i<len; i++){
    (function(i){
      var item = arr[i],
        layout = item.layout;
      item.prev = i === 0 ? null : arr[i - 1];
      item.next = i === len - 1 ? null : arr[i + 1];

      if (layout === 'false'){
        route.set(item.path, function(fn){
          fn(null, item.content);
        });
      } else {
        render(item.path, [layout, 'post', 'index'], item);
      }
    })(i);
  }

  callback();
});