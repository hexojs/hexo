import moment from 'moment';
import type default_config from './hexo/default_config';

export type NodeJSLikeCallback<R, E = any> = (err: E, result?: R) => void

export interface RenderData {
  engine?: string;
  content?: string;
  disableNunjucks?: boolean;
  markdown?: object;
  source?: string;
  titlecase?: boolean;
  title?: string;
  excerpt?: string;
  more?: string;
}

// Schema
export interface PostSchema {
  id?: string;
  _id?: string;
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
}

export interface PageSchema {
  _id?: string;
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
}

export interface LocalsType {
  page: PostSchema | PageSchema;
  path: string;
  url: string;
  config: typeof default_config;
  theme: object;
  layout: string;
  env: any;
  view_dir: string;
  site: object;
  cache?: boolean;
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
  posts: any; // _Query
  pages: any; // _Query
  categories: any; // _Model
  tags: any; // _Model
  data: object;
}
