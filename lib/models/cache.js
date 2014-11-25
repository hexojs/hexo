var Schema = require('warehouse').Schema;

module.exports = function(ctx){
  return new Schema({
    _id: {type: String, required: true},
    mtime: {type: Number, default: Date.now}
  });
};