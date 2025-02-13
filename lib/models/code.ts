import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { CodeSchema } from '../types';

export = (ctx: Hexo) => {
  const Code = new warehouse.Schema<CodeSchema>({
    _id: { type: String, required: true },
    path: { type: String, required: true },
    content: {type: String, required: true }
  });

  return Code;
};
