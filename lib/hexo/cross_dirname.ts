const DIRNAME_POSIX_REGEX
  = /^((?:\.(?![^/]))|(?:(?:\/?|)(?:[\s\S]*?)))(?:\/+?|)(?:(?:\.{1,2}|[^/]+?|)(?:\.[^./]*|))(?:[/]*)$/;
const DIRNAME_WIN32_REGEX
  = /^((?:\.(?![^\\]))|(?:(?:\\?|)(?:[\s\S]*?)))(?:\\+?|)(?:(?:\.{1,2}|[^\\]+?|)(?:\.[^.\\]*|))(?:[\\]*)$/;
const EXTRACT_PATH_REGEX = /@?(?<path>[file://]?[^(\s]+):[0-9]+:[0-9]+/;
const WIN_POSIX_DRIVE_REGEX = /^\/[A-Z]:\/*/;

const pathDirname = (path: string) => {
  let dirname = DIRNAME_POSIX_REGEX.exec(path)?.[1];

  if (!dirname) {
    dirname = DIRNAME_WIN32_REGEX.exec(path)?.[1];
  }

  if (!dirname) {
    throw new Error(`Can't extract dirname from ${path}`);
  }

  return dirname;
};

const getPathFromErrorStack = () => {
  let path = '';
  const stack = new Error().stack;

  if (!stack) {
    console.warn('Error has no stack!');
    return path;
  }

  // Node.js
  let initiator: string | undefined = stack.split('\n').slice(4, 5)[0];

  // Other
  if (!initiator) {
    initiator = stack.split('\n').slice(3, 4)[0];
  }

  if (initiator) {
    path = EXTRACT_PATH_REGEX.exec(initiator)?.groups?.path || '';
  }

  if (!initiator || !path) {
    console.warn('Can\'t get path from error stack!');
  }

  return path;
};

const getPath = () => {
  let path = getPathFromErrorStack();

  // Remove protocol
  const protocol = 'file://';
  if (path.indexOf(protocol) >= 0) {
    path = path.slice(protocol.length);
  }

  // Transform to win32 path
  if (WIN_POSIX_DRIVE_REGEX.test(path)) {
    path = path.slice(1).replace(/\//g, '\\');
  }

  return path;
};

/**
 * Cross platform implementation for `__dirname`.
 *
 * @note Please do not use this method in nested other methods,
 * instead always use it in the root of your file, otherwise it may return wrong results.
 * @returns What `__dirname` would return in CJS
 */
export const getDirname = () => {
  const path = getPath();
  const dirname = pathDirname(path);
  return dirname;
};

/**
 * Cross platform implementation for `__filename`.
 *
 * @note Please do not use this method in nested other methods,
 * instead always use it in the root of your file, otherwise it may return wrong results.
 * @returns What `__filename` would return in CJS
 */
export const getFilename = () => {
  const filename = getPath();
  return filename;
};
