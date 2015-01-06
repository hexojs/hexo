var archy = require('archy');
var chalk = require('chalk');

function listPost(){
  var Post = this.model('Post');
  var nodes = Post.map(function(post){
    var title = post.title || '(no title)';

    return title + '\n' + chalk.gray(post.path);
  });

  var s = archy({
    label: 'Total: ' + Post.length,
    nodes: nodes
  });

  console.log(s);
}

module.exports = listPost;