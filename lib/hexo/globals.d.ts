// Node.js internal APIs module augmentation for TypeScript
declare module 'module' {
  function _nodeModulePaths(path: string): string[];
  function _resolveFilename(request: string, parent: Module, isMain?: any, options?: any): string;
  const _extensions: NodeJS.RequireExtensions, _cache: any;
}

export default global;
