'use strict';

var chalk = require('chalk');
var table = require('text-table');

function listCategory(){
    /* jshint validthis: true */
    var categories = this.model('Category');

    var data = categories.sort({name: 1}).map(function(cate){
        return [cate.name, String(cate.length)];
    });

    // Table header
    var header = ['Name', 'Posts'].map(function(str){
        return chalk.underline(str);
    });

    data.unshift(header);

    var t = table(data, {
        align: ['l', 'r'],
        stringLength: common.stringLength
    });

    console.log(t);
    if (data.length === 1) console.log('No categories.');
}

module.exports = listCategory;