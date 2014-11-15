var Schema = require('warehouse').Schema;

module.exports = new Schema({
  _id: {type: String, required: true},
  mtime: {type: Number, default: Date.now}
});