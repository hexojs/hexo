import moment from 'moment';

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
}
