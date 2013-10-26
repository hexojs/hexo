module.exports = {
  // Site
  title: 'Hexo',
  subtitle: '',
  description: '',
  author: 'John Doe',
  email: '',
  language: '',
  // URL
  url: 'http://yoursite.com',
  root: '/',
  permalink: ':year/:month/:day/:title/',
  tag_dir: 'tags',
  archive_dir: 'archives',
  category_dir: 'categories',
  code_dir: 'downloads/code',
  // Writing
  new_post_name: ':title.md',
  default_layout: 'post',
  auto_spacing: false,
  titlecase: false,
  external_link: true,
  max_open_file: 100,
  multi_thread: true,
  filename_case: 0,
  render_drafts: false,
  highlight: {
    enable: true,
    line_number: true,
    tab_replace: '',
  },
  // Category & Tag
  default_category: 'uncategorized',
  category_map: {},
  tag_map: {},
  // Archives
  archive: 2,
  category: 2,
  tag: 2,
  // Server
  port: 4000,
  logger: false,
  logger_format: '',
  // Date / Time format
  date_format: 'MMM D YYYY',
  time_format: 'H:mm:ss',
  // Pagination
  per_page: 10,
  pagination_dir: 'page',
  // Disqus
  disqus_shortname: '',
  // Extensions
  theme: 'light',
  exclude_generator: [],
  // Deployment
  deploy: {}
};