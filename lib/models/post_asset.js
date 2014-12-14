var Schema = require('warehouse').Schema;

module.exports = function(ctx){
  var PostAsset = new Schema({
    _id: {type: String, required: true},
    modified: {type: Boolean, default: true},
    // TODO: wrong post reference when set post to required
    post: {type: Schema.Types.CUID, ref: 'Post'}
  });

  return PostAsset;
};