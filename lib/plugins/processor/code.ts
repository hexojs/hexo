import { Pattern } from 'hexo-util';
import { relative } from 'path';
import type Hexo from '../../hexo';
import type { _File } from '../../box';

export = (ctx: Hexo) => {
  let codeDir = ctx.config.code_dir;
  if (!codeDir.endsWith('/')) codeDir += '/';
  return {
    pattern: new Pattern(path => {
      return path.startsWith(codeDir);
    }),
    process: function codeProcessor(file: _File) {
      const id = relative(ctx.config.source_dir, relative(ctx.base_dir, file.source)).replace(/\\/g, '/');
      const Code = ctx.model('Code');
      const doc = Code.findById(id);

      if (file.type === 'delete') {
        if (doc) {
          return doc.remove();
        }

        return;
      }

      return file.read().then(content => {
        return Code.save({
          _id: id,
          path: file.path,
          content
        });
      });
    }
  };
};
