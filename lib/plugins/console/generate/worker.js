var util = require('../../../util'),
  file = util.file2;

var next = function(err){
  process.send(err || null);
};

process.on('message', function(data){
  if (data.type === 'copy'){
    file.copyFile(data.src, data.dest, next);
  } else {
    file.writeFile(data.dest, data.content, next);
  }
});