var Schema = require('warehouse').Schema;

module.exports = function(ctx){
  return new Schema({
    _id: {type: String, required: true},
    path: {type: String, required: true},
    modified: {type: Boolean, default: true},
    post: {type: Schema.Types.CUID, ref: 'Post'}
  });
};