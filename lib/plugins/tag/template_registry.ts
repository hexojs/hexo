import { basename, extname, join } from 'path';
import { exists, listDir, readFile } from 'hexo-fs';
import Handlebars from 'handlebars';
import type Hexo from '../../hexo';

class TemplateRegistry {
  public ctx: Hexo;
  public env: typeof Handlebars;
  public cache: Map<string, Handlebars.TemplateDelegate>;
  private loaded: boolean;

  constructor(ctx: Hexo) {
    this.ctx = ctx;
    this.env = Handlebars.create();
    this.cache = new Map();
    this.loaded = false;
    this.registerHelpers();
  }

  registerHelpers() {
    const { ctx, env } = this;

    env.registerHelper('url_for', function(path) {
      return ctx.extend.helper.get('url_for').call(this, path);
    });

    env.registerHelper('full_url_for', function(path) {
      return ctx.extend.helper.get('full_url_for').call(this, path);
    });
  }

  async loadPartials() {
    if (this.loaded) return;
    this.loaded = true;

    const dir = join(this.ctx.source_dir, this.ctx.config.inline_template.partial_dir);
    const exist = await exists(dir);
    if (!exist) return;

    const files = await listDir(dir);
    for (const file of files) {
      if (extname(file) !== '.hbs') continue;
      const source = await readFile(join(dir, file));
      this.env.registerPartial(basename(file, '.hbs'), source);
    }
  }

  async render(source: string, locals: any): Promise<string> {
    await this.loadPartials();

    let template = this.cache.get(source);
    if (!template) {
      template = this.env.compile(source, {
        compat: this.ctx.config.inline_template.compat
      });
      this.cache.set(source, template);
    }

    return template(locals);
  }
}

export = TemplateRegistry;
