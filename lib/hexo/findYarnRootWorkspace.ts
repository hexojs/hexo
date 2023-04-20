import { existsSync, readFileSync } from 'hexo-fs';
import micromatch from 'micromatch';
import { dirname, join, normalize, relative } from 'path';

/**
 * search yarn root workspace folder
 * @param ctx
 */
function findYarnRootWorkspace(ctx: { base_dir: string }): string | null {
  const baseDir = ctx.base_dir;

  /**
   * extract workspaces from package.json
   * @param manifest
   * @returns
   */
  const extractWorkspaces = function(manifest: Record<string, any>) {
    const workspaces = (manifest || {}).workspaces;
    return (workspaces && workspaces.packages) || (Array.isArray(workspaces) ? workspaces : null);
  };

  /**
   * read package.json from given folder
   * @param dir
   * @returns
   */
  const readPackageJSON = function(dir: string): Record<string, any> {
    const file = join(dir, 'package.json');
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file).toString());
    }
    return null;
  };

  let previous = null;
  let current = normalize(baseDir);
  // loop searching
  do {
    const manifest = readPackageJSON(current);
    const workspaces = extractWorkspaces(manifest);

    if (workspaces) {
      const relativePath = relative(current, baseDir);
      if (relativePath === '' || micromatch([relativePath], workspaces).length > 0) {
        return current;
      }
      return null;
    }

    previous = current;
    current = dirname(current);
  } while (current !== previous);

  return null;
}

module.exports = findYarnRootWorkspace;
