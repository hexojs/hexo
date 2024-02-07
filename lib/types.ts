import moment from 'moment';
import type default_config from './hexo/default_config';
import type Query from 'warehouse/dist/query';
import type css from './plugins/helper/css';
import type { date, date_xml, time, full_date, relative_date, time_tag, moment as _moment } from './plugins/helper/date';
import type { inspectObject, log } from './plugins/helper/debug';
import type favicon_tag from './plugins/helper/favicon_tag';
import type feed_tag from './plugins/helper/feed_tag';
import type { titlecase, word_wrap, truncate, stripHTML, escapeHTML } from './plugins/helper/format';
import type fragment_cache from './plugins/helper/fragment_cache';
import type full_url_for from './plugins/helper/full_url_for';
import type gravatar from './plugins/helper/gravatar';
import type image_tag from './plugins/helper/image_tag';
import type { current, home, home_first_page, post, page, archive, year, month, category, tag } from './plugins/helper/is';
import type js from './plugins/helper/js';
import type link_to from './plugins/helper/link_to';
import type list_archives from './plugins/helper/list_archives';
import type list_categories from './plugins/helper/list_categories';
import type list_posts from './plugins/helper/list_posts';
import type list_tags from './plugins/helper/list_tags';
import type mail_to from './plugins/helper/mail_to';
import type markdown from './plugins/helper/markdown';
import type meta_generator from './plugins/helper/meta_generator';
import type number_format from './plugins/helper/number_format';
import type open_graph from './plugins/helper/open_graph';
import type paginator from './plugins/helper/paginator';
import type relative_url from './plugins/helper/relative_url';
import type render from './plugins/helper/render';
import type search_form from './plugins/helper/search_form';
import type tag_cloud from './plugins/helper/tagcloud';
import type toc from './plugins/helper/toc';
import type url_for from './plugins/helper/url_for';
import Model from 'warehouse/dist/model';

export type NodeJSLikeCallback<R, E = any> = (err: E, result?: R) => void

export interface RenderData {
  engine?: string;
  content?: string;
  disableNunjucks?: boolean;
  markdown?: any;
  source?: string;
  titlecase?: boolean;
  title?: string;
  excerpt?: string;
  more?: string;
}

// Schema
export interface PostSchema {
  id?: string | number;
  _id?: string | number;
  title?: string;
  date?: moment.Moment,
  updated?: moment.Moment,
  comments?: boolean;
  layout?: string;
  _content?: string;
  source?: string;
  slug?: string;
  photos?: string[];
  raw?: string;
  published?: boolean;
  content?: string;
  excerpt?: string;
  more?: string;
  author?: string;
  asset_dir?: string;
  full_source?: string;
  path?: string;
  permalink?: string;
  categories?: any;
  tags?: any;
  __permalink?: string;
  __post?: boolean;
  canonical_path?: string;
  lang?: string;
  language?: string;
  prev?: PostSchema;
  next?: PostSchema;
  base?: string;
  current?: number;
  total?: number;
  description?: string;
  [key: string]: any;
}

export interface PageSchema {
  _id?: string | number;
  title?: string;
  date?: moment.Moment,
  updated?: moment.Moment,
  comments?: boolean;
  layout?: string;
  _content?: string;
  source?: string;
  path?: string;
  raw?: string;
  content?: string;
  excerpt?: string;
  more?: string;
  author?: string;
  full_source?: string;
  permalink?: string;
  tags?: any;
  canonical_path?: string;
  lang?: string;
  language?: string;
  __page?: boolean;
  base?: string;
  current?: number;
  total?: number;
  photos?: string[];
  description?: string;
}

export interface CategorySchema {
  id?: string | number;
  _id?: string | number;
  name?: string;
  parent?: string | number;
  slug?: string;
  path?: string;
  permalink?: string;
  posts?: any;
  length?: number;
}

export interface TagSchema {
  id?: string | number;
  _id?: string | number;
  name?: string;
}

export interface AssetSchema {
  _id?: string;
  path: string;
  modified: boolean;
  renderable: boolean;
  source: string;
}

export interface LocalsType {
  page: PostSchema | PageSchema;
  path: string;
  url: string;
  config: typeof default_config;
  theme: any;
  layout: string | boolean;
  env: any;
  view_dir: string;
  site: any;
  cache?: boolean;
  body?: string;
  filename?: string;
  css: typeof css;
  date: typeof date;
  date_xml: typeof date_xml;
  escape_html: typeof escapeHTML;
  favicon_tag: typeof favicon_tag;
  feed_tag: typeof feed_tag;
  fragment_cache: ReturnType<typeof fragment_cache>;
  full_date: typeof full_date;
  full_url_for: typeof full_url_for;
  gravatar: typeof gravatar;
  image_tag: typeof image_tag;
  inspect: typeof inspectObject;
  is_archive: typeof archive;
  is_category: typeof category;
  is_current: typeof current;
  is_home: typeof home;
  is_home_first_page: typeof home_first_page;
  is_month: typeof month;
  is_page: typeof page;
  is_post: typeof post;
  is_tag: typeof tag;
  is_year: typeof year;
  js: typeof js;
  link_to: typeof link_to;
  list_archives: typeof list_archives;
  list_categories: typeof list_categories;
  list_posts: typeof list_posts;
  list_tags: typeof list_tags;
  log: typeof log;
  mail_to: typeof mail_to;
  markdown: typeof markdown;
  meta_generator: typeof meta_generator;
  moment: typeof _moment;
  number_format: typeof number_format;
  open_graph: typeof open_graph;
  paginator: typeof paginator;
  partial: ReturnType<typeof render>;
  relative_date: typeof relative_date;
  relative_url: typeof relative_url;
  render: ReturnType<typeof render>;
  search_form: typeof search_form;
  strip_html: typeof stripHTML;
  tag_cloud: typeof tag_cloud;
  tagcloud: typeof tag_cloud;
  time: typeof time;
  time_tag: typeof time_tag;
  titlecase: typeof titlecase;
  toc: typeof toc;
  trim: typeof stripHTML;
  truncate: typeof truncate;
  url_for: typeof url_for;
  word_wrap: typeof word_wrap;
  __?: (key: string) => string;
  _p?: (key: string, options?: any) => string;
}

// Generator return types
export interface AssetGenerator {
  path: string;
  data: {
    modified: boolean;
    data?: () => any;
  }
}

export type SimplePostGenerator = {
  path: string;
  data: string;
}
export type NormalPostGenerator = {
  path: string;
  layout: string[];
  data: PostSchema;
}
export type PostGenerator = SimplePostGenerator | NormalPostGenerator;


export type SimplePageGenerator = {
  path: string;
  data: string;
}
export type NormalPageGenerator = {
  path: string;
  layout: string[];
  data: PageSchema;
}
export type PageGenerator = SimplePageGenerator | NormalPageGenerator;

export interface SiteLocals {
  posts: Query<PostSchema>; // _Query
  pages: Query<PageSchema>; // _Query
  categories: Model<CategorySchema>; // _Model
  tags: Model<TagSchema>; // _Model
  data: any;
}
