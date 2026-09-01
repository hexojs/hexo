import type Hexo from '../../hexo';
import type TemplateRegistry from './template_registry';

export = (ctx: Hexo, registry: TemplateRegistry) => function(args: string[], content: string) {
  return registry.render(content, this);
};
