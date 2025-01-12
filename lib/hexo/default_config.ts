export = {
  // Site
  title: 'Hexo',
  subtitle: '',
  description: '',
  author: 'John Doe',
  language: 'en',
  timezone: '',
  // URL
  url: 'http://example.com',
  root: '/',
  permalink: ':year/:month/:day/:title/',
  permalink_defaults: {} as Record<string, string>,
  pretty_urls: {
    trailing_index: true,
    trailing_html: true
  },
  // Directory
  source_dir: 'source',
  public_dir: 'public',
  tag_dir: 'tags',
  archive_dir: 'archives',
  category_dir: 'categories',
  code_dir: 'downloads/code',
  i18n_dir: ':lang',
  skip_render: [] as string[],
  // Writing
  new_post_name: ':title.md',
  default_layout: 'post',
  titlecase: false,
  external_link: {
    enable: true,
    field: 'site',
    exclude: ''
  },
  filename_case: 0,
  render_drafts: false,
  post_asset_folder: false,
  relative_link: false,
  future: true,
  syntax_highlighter: 'highlight.js',
  highlight: {
    auto_detect: false,
    line_number: true,
    tab_replace: '',
    wrap: true,
    exclude_languages: [] as string[],
    language_attr: false,
    hljs: false,
    line_threshold: 0,
    first_line_number: 'always1',
    strip_indent: true
  },
  prismjs: {
    preprocess: true,
    line_number: true,
    tab_replace: '',
    exclude_languages: [] as string[],
    strip_indent: true
  },
  use_filename_as_post_title: false,

  // Category & Tag
  default_category: 'uncategorized',
  category_map: {} as Record<string, string>,
  tag_map: {} as Record<string, string>,
  // Date / Time format
  date_format: 'YYYY-MM-DD',
  time_format: 'HH:mm:ss',
  updated_option: 'mtime',
  // * mtime: file modification date (default)
  // * empty: no more update
  // Pagination
  per_page: 10,
  pagination_dir: 'page',
  // Extensions
  theme: 'landscape',
  server: {
    cache: false
  },
  // Deployment
  deploy: {} as { type: string; [keys: string]: any } | { type: string; [keys: string]: any }[],

  // ignore files from processing
  ignore: [] as string[],

  // Category & Tag
  meta_generator: true
};
