/**
* Server utilities.
*
* @class server
* @namespace util
* @since 2.7.0
* @module hexo
*/

var mime = require('mime');

/**
* Redirects to a URL.
*
* @method redirect
* @param {Response} res
* @param {String} path
*/
exports.redirect = function(res, path){
  if (res == null) throw new Error('res is required.');
  if (typeof path !== 'string') throw new TypeError('path must be a string.');

  res.statusCode = 302;
  res.setHeader('Location', path);
  res.end('Redirecting to ' + path);
};

/**
* Sets Content-Type header.
*
* @method contentType
* @param {Response} res
* @param {String} type
*/
exports.contentType = function(res, type){
  if (res == null) throw new Error('res is required.');
  type = type || 'application/octet-stream';

  res.setHeader('Content-Type', ~type.indexOf('/') ? type : mime.lookup(type));
};
