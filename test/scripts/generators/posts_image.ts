import { join } from 'path';
import { writeFile, mkdirs, rmdir } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
chai.should();

const postsImageGenerator = require('../../../lib/plugins/generator/posts_image');

describe('posts_image generator', () => {
  const hexo = new Hexo(join(__dirname, 'posts_image_test'), { silent: true });

  before(async () => {
    await hexo.init();
  });

  after(async () => {
    await rmdir(hexo.base_dir);
  });

  beforeEach(() => {
    hexo.config.use_vscode_edit_md = false;
  });

  it('should not generate routes when use_vscode_edit_md is false', async () => {
    hexo.config.use_vscode_edit_md = false;
    const result = await postsImageGenerator.call(hexo);
    result.should.be.an('array').that.is.empty;
  });

  it('should not generate routes when image directory does not exist', async () => {
    hexo.config.use_vscode_edit_md = true;
    const result = await postsImageGenerator.call(hexo);
    result.should.be.an('array').that.is.empty;
  });

  it('should generate routes when use_vscode_edit_md is true and image directory exists', async () => {
    hexo.config.use_vscode_edit_md = true;

    // Create test image directory and file
    const imageDir = join(hexo.source_dir, '_posts', 'image');
    const testImagePath = join(imageDir, 'test.jpg');

    await mkdirs(imageDir);
    await writeFile(testImagePath, 'fake image content');

    try {
      const result = await postsImageGenerator.call(hexo);
      result.should.be.an('array').that.is.not.empty;
      result[0].should.have.property('path', 'image/test.jpg');
      result[0].should.have.property('data');
      result[0].data.should.have.property('modified', true);
      result[0].data.should.have.property('data').that.is.a('function');
    } finally {
      // Cleanup
      await rmdir(imageDir);
    }
  });

  it('should handle nested directories', async () => {
    hexo.config.use_vscode_edit_md = true;

    // Create test nested image directory and file
    const imageDir = join(hexo.source_dir, '_posts', 'image');
    const nestedDir = join(imageDir, 'subfolder');
    const testImagePath = join(nestedDir, 'nested.png');

    await mkdirs(nestedDir);
    await writeFile(testImagePath, 'fake nested image content');

    try {
      const result = await postsImageGenerator.call(hexo);
      result.should.be.an('array').that.is.not.empty;

      const nestedImage = result.find(r => r.path === 'image/subfolder/nested.png');
      nestedImage.should.not.be.undefined;
      nestedImage.should.have.property('data');
    } finally {
      // Cleanup
      await rmdir(imageDir);
    }
  });
});
