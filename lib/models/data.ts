import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { DataSchema } from '../types';

const data = (_ctx: Hexo) => {
  const Data = new warehouse.Schema<DataSchema>({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};

// For ESM compatibility
export default data;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = data;
  // For ESM compatibility
  module.exports.default = data;
}
