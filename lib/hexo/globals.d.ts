// Node.js internal APIs module augmentation for TypeScript
declare module 'module' {
  function _nodeModulePaths(path: string): string[];
  function _resolveFilename(request: string, parent: Module, isMain?: any, options?: any): string;
  const _extensions: NodeJS.RequireExtensions, _cache: any;
}

// define global variable for plugins written in typescript (ESM & CJS)
declare global {
  // For globalThis.hexo (ESM and CJS)
  declare var hexo: Hexo;

  namespace NodeJS {
    interface Global {
      hexo: Hexo;
    }
  }
}

export default global;
