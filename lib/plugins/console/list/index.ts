import abbrev from 'abbrev';
import page from './page';
import post from './post';
import route from './route';
import tag from './tag';
import category from './category';
import type Hexo from '../../../hexo';

const store = {
  page, post, route, tag, category
};

const alias = abbrev(Object.keys(store));

function listConsole(this: Hexo, args) {
  const type = args._.shift();

  // Display help message if user didn't input any arguments
  if (!type || !alias[type]) {
    return this.call('help', {_: ['list']});
  }

  return this.load().then(() => Reflect.apply(store[alias[type]], this, [args]));
}

export = listConsole;
