import type Hexo from '../../hexo';
import Promise from 'bluebird';
import { exists } from 'hexo-fs';
import { CodeSchema } from '../../types';
import type Document from 'warehouse/dist/document';

interface CodeData {
  modified: boolean;
  data: string;
}

function codeGenerator(this: Hexo): Promise<any[]> {
  return Promise.filter(this.model('Code').toArray(), (code: Document<CodeSchema>) => exists(code.source).tap(exist => {
    if (!exist) return code.remove();
  })).map((code: Document<CodeSchema>) => {
    const { path } = code;
    const data: CodeData = {
      modified: code.modified,
      data: code.content
    };

    return { path, data };
  });

}

export = codeGenerator;
