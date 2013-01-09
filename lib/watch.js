var watchTree = require('fs-watch-tree').watchTree,
  sourceDir = hexo.source_dir;

module.exports = function(callback){
  var processing = false;

  watchTree(sourceDir, {exclude: ['.DS_Store', 'Thumbs.db']}, function(ev){
    var info = '',
      start = new Date();

    if (ev.isDirectory()){
      info += 'Folder ';
    } else {
      info += 'File ';
    }

    if (ev.isMkdir()){
      info += 'created: ';
    } else if (ev.isDelete()){
      info += 'deleted: ';
    } else {
      info += 'modified: ';
    }

    info += ev.name;
    console.log(info);

    if (!processing){
      processing = true;
      callback(ev, function(){
        var finish = new Date(),
          elapsed = (finish.getTime() - start.getTime()) / 1000;

        processing = false;
        console.log('Regenerated in %ss.', elapsed.toFixed(3));
      });
    }
  });
};