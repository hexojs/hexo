#!/usr/bin/env node

var lint = require("./lint/lint");

lint.checkDir("mode");
lint.checkDir("lib");
lint.checkDir("addon");
lint.checkDir("keymap");

var ok = lint.success();

var files = new (require('node-static').Server)('.');

var server = require('http').createServer(function (req, res) {
  req.addListener('end', function () {
    files.serve(req, res);
  });
}).addListener('error', function (err) {
  throw err;
}).listen(3000, function () {
  var child_process = require('child_process');
  child_process.exec("which phantomjs", function (err) {
    if (err) {
      console.error("PhantomJS is not installed. Download from http://phantomjs.org");
      process.exit(1);
    }
    var cmd = 'phantomjs test/phantom_driver.js';
    child_process.exec(cmd, function (err, stdout) {
      server.close();
      console.log(stdout);
      process.exit(err || !ok ? 1 : 0);
    });
  });
});
