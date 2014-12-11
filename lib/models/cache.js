var Schema = require('warehouse').Schema;

module.exports = function(ctx){
  var Cache = new Schema({
    _id: {type: String, required: true},
    // mtime: {type: Number, default: Date.now},
    checksum: {type: String}
  });

  return Cache;
};