import { inspect } from 'util';

// this format object as string, resolves circular reference
function inspectObject(object: any, options: boolean) {
  return inspect(object, options);
}

// wrapper to log to console
function log(...args: any[]) {
  return Reflect.apply(console.log, null, args);
}

export {inspectObject};
export {log};
