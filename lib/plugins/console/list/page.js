var archy = require('archy');
var chalk = require('chalk');

function listPage(){
  var Page = this.model('Page');
  var nodes = Page.map(function(page){
    var title = page.title || '(no title)';

    return title + '\n' + chalk.gray(page.path);
  });

  var s = archy({
    label: 'Total: ' + Page.length,
    nodes: nodes
  });

  console.log(s);
}

module.exports = listPage;