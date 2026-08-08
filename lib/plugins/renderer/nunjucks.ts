import nunjucks, { Environment } from 'nunjucks';
import { readFileSync } from 'hexo-fs';
import { dirname } from 'path';
import type { StoreFunctionData } from '../../extend/renderer';

interface CacheableEnvironment extends Environment {
  invalidateCache(): void;
}

interface CompiledTemplate {
  env: CacheableEnvironment;
  template: nunjucks.Template;
}

function toArray(value) {
  if (Array.isArray(value)) {
    // Return if given value is an Array
    return value;
  } else if (typeof value.toArray === 'function') {
    return value.toArray();
  } else if (value instanceof Map) {
    const arr = [];
    value.forEach(v => arr.push(v));
    return arr;
  } else if (value instanceof Set || typeof value === 'string') {
    return [...value];
  } else if (typeof value === 'object' && value instanceof Object && Boolean(value)) {
    return Object.values(value);
  }

  return [];
}

function safeJsonStringify(json: any, spacer = undefined): string {
  if (typeof json !== 'undefined' && json !== null) {
    return JSON.stringify(json, null, spacer);
  }

  return '""';
}

const nunjucksCfg = {
  autoescape: false,
  throwOnUndefined: false,
  trimBlocks: false,
  lstripBlocks: false
};

const nunjucksAddFilter = (env: Environment): void => {
  env.addFilter('toarray', toArray);
  env.addFilter('safedump', safeJsonStringify);
};

function njkCompile(data: StoreFunctionData): CompiledTemplate {
  let env: CacheableEnvironment;
  if (data.path) {
    env = nunjucks.configure(dirname(data.path), nunjucksCfg) as CacheableEnvironment;
  } else {
    env = nunjucks.configure(nunjucksCfg) as CacheableEnvironment;
  }
  nunjucksAddFilter(env);

  const text = 'text' in data ? data.text : readFileSync(data.path);

  return {
    env,
    template: nunjucks.compile(text, env, data.path)
  };
}

function njkRenderer(data: StoreFunctionData, locals?: any): string {
  return njkCompile(data).template.render(locals);
}

njkRenderer.compile = (data: StoreFunctionData): (locals: any) => string => {
  const { env, template } = njkCompile(data);

  return locals => {
    // The top-level template is compiled directly and is not stored in the loader cache,
    // so invalidating the cache here does not recompile it. This intentionally reloads
    // extends/include/import dependencies before every render to preserve `hexo server`
    // hot updates because the renderer has no signal indicating that a dependency changed.
    // The trade-off is that unchanged dependencies are also recompiled on every render.
    // If a reliable theme-template change signal becomes available, invalidate the cache
    // in response to that signal instead of removing this call outright.
    env.invalidateCache();
    return template.render(locals);
  };
};

export = njkRenderer;
