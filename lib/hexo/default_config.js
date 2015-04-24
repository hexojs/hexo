'use strict';

module.exports = {
  // Site
  title: 'Hexo',
  subtitle: '',
  description: '',
  author: 'John Doe',
  language: '',
  timezone: '',
  // URL
  url: 'http://yoursite.com',
  root: '/',
  permalink: ':year/:month/:day/:title/',
  permalink_defaults: {},
  // Directory
  source_dir: 'source',
  public_dir: 'public',
  tag_dir: 'tags',
  archive_dir: 'archives',
  category_dir: 'categories',
  code_dir: 'downloads/code',
  i18n_dir: ':lang',
  skip_render: [],
  // Writing
  new_post_name: ':title.md',
  default_layout: 'post',
  titlecase: false,
  external_link: true,
  filename_case: 0,
  render_drafts: false,
  post_asset_folder: false,
  relative_link: false,
  future: true,
  highlight: {
    enable: true,
    auto_detect: true, // Maintain consistent with previous version.
    line_number: true,
    tab_replace: '',
  },
  // Category & Tag
  default_category: 'uncategorized',
  category_map: {},
  tag_map: {},
  // Date / Time format
  date_format: 'YYYY-MM-DD',
  time_format: 'HH:mm:ss',
  // Pagination
  per_page: 10,
  pagination_dir: 'page',
  // Extensions
  theme: 'landscape',
  // Deployment
  deploy: {}
};
