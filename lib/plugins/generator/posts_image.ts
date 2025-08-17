import { join } from 'path';
import { exists, stat, listDir, createReadStream } from 'hexo-fs';
import Promise from 'bluebird';
import type Hexo from '../../hexo';
import type { BaseGeneratorReturn } from '../../types';

interface PostsImageGenerator extends BaseGeneratorReturn {
    data: {
        modified: boolean;
        data: () => any;
    }
}

/**
 * Generator for copying \source\_posts\image folder to public directory
 * Only works when use_vscode_edit_md is enabled in config
 */
function postsImageGenerator(this: Hexo): Promise<PostsImageGenerator[]> {
  // Check if use_vscode_edit_md is enabled
  if (!this.config.use_vscode_edit_md) {
    return Promise.resolve([]);
  }

  const sourceDir = this.source_dir;
  const postsImageDir = join(sourceDir, '_posts', 'image');

  // Check if the image directory exists
  return exists(postsImageDir).then(exist => {
    if (!exist) {
      return [];
    }

    return stat(postsImageDir).then(stats => {
      if (!stats.isDirectory()) {
        return [];
      }

      // List all files in the image directory recursively
      return listDirRecursive(postsImageDir);
    });
  }).then(files => {
    // Generate route for each file
    return files.map(filePath => {
      const relativePath = filePath.substring(postsImageDir.length + 1);
      const publicPath = join('image', relativePath).replace(/\\/g, '/');

      return {
        path: publicPath,
        data: {
          modified: true,
          data: () => createReadStream(filePath)
        }
      };
    });
  }).catch(err => {
    // Log error but don't fail the build
    this.log.debug('Posts image generator error:', err);
    return [];
  });
}

/**
 * Recursively list all files in a directory
 */
function listDirRecursive(dir: string): Promise<string[]> {
  return listDir(dir).then(items => {
    return Promise.map(items, item => {
      const fullPath = join(dir, item);
      return stat(fullPath).then(stats => {
        if (stats.isDirectory()) {
          return listDirRecursive(fullPath);
        }
        return [fullPath];
      });
    });
  }).then(results => {
    return ([] as string[]).concat(...results);
  });
}

export = postsImageGenerator;
