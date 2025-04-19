import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { DataSchema } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export = (ctx: Hexo) => {
  const Data = new warehouse.Schema<DataSchema>({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
