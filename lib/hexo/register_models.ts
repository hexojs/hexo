import * as models from '../models';
import type Hexo from './index';

export = (ctx: Hexo): void => {
  const db = ctx.database;

  const keys = Object.keys(models);

  for (const key of keys) {
    db.model(key, models[key](ctx));
  }
};
