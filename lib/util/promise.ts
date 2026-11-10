// Small helpers that stand in for the bluebird APIs Hexo used to rely on.
// Every helper here returns a native Promise.

import type { NodeJSLikeCallback } from '../types';

type MaybePromise<T> = T | PromiseLike<T>;
type ItemsInput<T> = MaybePromise<Iterable<MaybePromise<T>>>;

interface MapOptions {
  concurrency?: number;
}

// bluebird wraps primitive errors (and falsy reasons) into Error objects.
function toError(err: any): any {
  if (err !== null && (typeof err === 'object' || typeof err === 'function')) return err;
  return new Error(String(err));
}

/**
 * Like bluebird `Promise.method`: wraps `fn` so it always returns a native
 * promise, and a synchronous throw becomes a rejection. `this` is preserved.
 */
export function method<A extends any[], R>(fn: (...args: A) => R): (this: any, ...args: A) => Promise<Awaited<R>> {
  return function(this: any, ...args: A): Promise<Awaited<R>> {
    try {
      return Promise.resolve(Reflect.apply(fn, this, args)) as Promise<Awaited<R>>;
    } catch (err) {
      return Promise.reject(err);
    }
  };
}

// bluebird's promisify copies the own properties of the original function
// (e.g. `disableNunjucks`, `compile`) onto the promisified one.
const noCopyProps = /^(?:length|name|arguments|caller|callee|prototype|__isPromisified__)$/;

export function copyProps<T extends object>(from: object, to: T): T {
  for (const key of Object.getOwnPropertyNames(from)) {
    if (noCopyProps.test(key)) continue;
    try {
      Object.defineProperty(to, key, Object.getOwnPropertyDescriptor(from, key));
    } catch {
      // ignore, as bluebird does
    }
  }
  return to;
}

/**
 * Like bluebird `Promise.promisify`: calls `fn` with the same `this` and the
 * given arguments plus a Node-style callback, and resolves with the
 * callback's first result value. A synchronous throw becomes a rejection.
 */
export function promisify<R = any>(fn: (...args: any[]) => any): (this: any, ...args: any[]) => Promise<R> {
  const promisified = function(this: any, ...args: any[]): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      Reflect.apply(fn, this, [...args, (err: any, value?: R) => {
        if (err) reject(toError(err));
        else resolve(value);
      }]);
    });
  };
  return copyProps(fn, promisified);
}

/**
 * Like bluebird `.asCallback(callback)`: if `callback` is a function it is
 * called with `(err)` on rejection or `(null, value)` on fulfilment
 * (`(null)` when the value is undefined). Returns the (native) promise.
 */
export function asCallback<T>(promise: MaybePromise<T>, callback?: NodeJSLikeCallback<any>): Promise<T> {
  const p = Promise.resolve(promise);
  if (typeof callback !== 'function') return p;

  const invoke = (args: any[]) => {
    try {
      Reflect.apply(callback, undefined, args);
    } catch (err) {
      // Same as bluebird: an error thrown by the callback is rethrown asynchronously.
      setTimeout(() => { throw err; }, 0);
    }
  };

  p.then(
    value => invoke(value === undefined ? [null] : [null, value]),
    reason => {
      if (!reason) {
        const wrapped: any = new Error(`${reason}`);
        wrapped.cause = reason;
        reason = wrapped;
      }
      invoke([reason]);
    }
  );

  return p;
}

/**
 * Like bluebird `Promise.fromCallback`.
 */
export function fromCallback<T = any>(resolver: (callback: NodeJSLikeCallback<T>) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    resolver((err, value) => {
      if (err) reject(toError(err));
      else resolve(value);
    });
  });
}

/**
 * Like bluebird `Promise.each`: runs `fn` on each item one at a time, in
 * order, waiting for the promise it returns before moving on. Resolves with
 * the (resolved) items.
 */
export async function promiseEach<T>(items: ItemsInput<T>, fn: (item: T, index: number, length: number) => unknown): Promise<T[]> {
  const list = Array.from(await items);
  const values: T[] = [];
  for (let i = 0; i < list.length; i++) {
    const value = await list[i];
    values.push(value);
    await fn(value, i, list.length);
  }
  return values;
}

function normalizeConcurrency(concurrency?: number): number {
  // Same rule as bluebird: anything that isn't a finite number >= 1 means "no limit".
  if (typeof concurrency === 'number' && isFinite(concurrency) && concurrency >= 1) return Math.ceil(concurrency);
  return 0;
}

/**
 * Like bluebird `Promise.map`: maps items (or a promise of items) with `fn`.
 * Without a `concurrency` option every call starts right away; with one,
 * at most `concurrency` calls are pending at any time (a worker pool).
 * Results keep the order of the input.
 */
export async function promiseMap<T, R>(
  items: ItemsInput<T>,
  fn: (item: T, index: number, length: number) => MaybePromise<R>,
  options: MapOptions = {}
): Promise<R[]> {
  const values = await Promise.all(Array.from(await items));
  const { length } = values;
  const mapper = method(fn);
  const limit = normalizeConcurrency(options.concurrency);

  if (!limit || limit >= length) {
    return Promise.all(values.map((value, i) => mapper(value, i, length))) as Promise<R[]>;
  }

  const results: R[] = new Array(length);
  let next = 0;
  let failed = false;

  const worker = async (): Promise<void> => {
    while (!failed && next < length) {
      const i = next++;
      try {
        results[i] = await mapper(values[i], i, length) as R;
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  };

  const workers: Promise<void>[] = [];
  for (let i = 0; i < limit; i++) workers.push(worker());
  await Promise.all(workers);
  return results;
}

/**
 * Like bluebird `Promise.filter`: keeps the items for which `fn` returns (or
 * resolves to) a truthy value.
 */
export async function promiseFilter<T>(
  items: ItemsInput<T>,
  fn: (item: T, index: number, length: number) => unknown,
  options: MapOptions = {}
): Promise<T[]> {
  const values = await Promise.all(Array.from(await items));
  const keep = await promiseMap(values, fn, options);
  return values.filter((_, i) => keep[i]);
}

/**
 * Like bluebird `Promise.reduce` with an initial value: runs `fn` one item at
 * a time, in order, waiting for each step before the next.
 */
export async function promiseReduce<T, U>(
  items: ItemsInput<T>,
  fn: (accumulator: U, item: T, index: number, length: number) => MaybePromise<U>,
  initialValue: MaybePromise<U>
): Promise<U> {
  const list = Array.from(await items);
  let accumulator = await initialValue;
  for (let i = 0; i < list.length; i++) {
    accumulator = await fn(accumulator, await list[i], i, list.length);
  }
  return accumulator;
}
