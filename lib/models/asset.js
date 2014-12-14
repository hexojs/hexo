var Schema = require('warehouse').Schema;

module.exports = function(ctx){
  var Asset = new Schema({
    _id: {type: String, required: true},
    path: {type: String, required: true},
    modified: {type: Boolean, default: true}
  });

  return Asset;
};