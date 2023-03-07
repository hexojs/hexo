import { inspect } from 'util';

// this format object as string, resolves circular reference
function inspectObject(object, options) {
  return inspect(object, options);
}

// wrapper to log to console
function log(...args) {
  return Reflect.apply(console.log, null, args);
}

export {inspectObject};
export {log};
