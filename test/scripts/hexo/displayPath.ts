//NEW UNIT TEST FOR displayPath FUNCTION
import { magenta } from 'picocolors';
import chai from 'chai';
import loadPlugins, { displayPath } from '../../../lib/hexo/load_plugins';

const should = chai.should();

describe('load_plugins', () => {
  describe('displayPath', () => {
    it('should return relative path with magenta formatting', () => {
      const fullPath = '/home/user/project/scripts/test.js';
      const baseDirLength = '/home/user/project/'.length;
      const expected = magenta('scripts/test.js');

      const result = displayPath(fullPath, baseDirLength);
      result.should.equal(expected);
    });

    it('should handle Windows paths', () => {
      const fullPath = 'C:\\project\\scripts\\test.js';
      const baseDirLength = 'C:\\project\\'.length;
      const expected = magenta('scripts\\test.js');

      const result = displayPath(fullPath, baseDirLength);
      result.should.equal(expected);
    });

    it('should handle paths at base directory level', () => {
      const fullPath = '/project/config.js';
      const baseDirLength = '/project/'.length;
      const expected = magenta('config.js');

      const result = displayPath(fullPath, baseDirLength);
      result.should.equal(expected);
    });
  });
});