import Hexo from '../../../hexo';

/**
 * before_post_render `data` parameter
 *
 * @example
 * hexo.extend.filter.register('before_post_render', function(data){ console.log(data.content) })
 */
export interface extend_filter_before_post_render_data {
  [key: string]: any;
  content: string | null | undefined;
  source: string;
  config: Hexo['config'];
}
