import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { DataSchema } from '../types';

export = (_ctx: Hexo) => {
  const Data = new warehouse.Schema<DataSchema>({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
