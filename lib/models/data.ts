import warehouse from 'warehouse';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const Data = new warehouse.Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
