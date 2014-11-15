var Schema = require('warehouse').Schema;

module.exports = new Schema({
  _id: {type: String, required: true},
  path: {type: String, required: true},
  modified: {type: Boolean, default: true},
  post_id: Schema.Types.CUID,
  post_path: String
});