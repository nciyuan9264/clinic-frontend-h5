import { isUndefined } from 'lodash-es';

import { timeoutPromise } from './common';

interface RetryAsyncOptions<T> {
  /**
   * 重试次数
   * @default 5
   */
  tryTimes?: number;
  /**
   * 重试间隔，单位 ms
   * @default 100
   */
  interval?: number | ((nextTryIndex: number) => number);

  fallback?: T;

  onRetryError?: (error: unknown, tryIndex: number) => void;
}

export const retryAsync = async <T>(
  func: () => Promise<T>,
  {
    tryTimes = 5,
    interval = 100,
    fallback,
    onRetryError,
  }: RetryAsyncOptions<T>,
): Promise<T> => {
  for (let i = 0; i < tryTimes; i++) {
    const nextTryIndex = i + 1;

    try {
      return await func();
    } catch (e) {
      if (nextTryIndex >= tryTimes) {
        if (!isUndefined(fallback)) {
          return fallback;
        }

        throw e;
      }
      onRetryError?.(e, i);
    }

    const intervalNum =
      typeof interval === 'number' ? interval : interval(nextTryIndex);
    await timeoutPromise(intervalNum);
  }

  throw Error('retry times out of limit');
};

export type PromiseFunctionType<T extends Array<unknown>, R> = (
  ...params: T
) => Promise<R>;

export const withRetry = <R, T extends Array<unknown> = []>(
  func: PromiseFunctionType<T, R>,
  options: RetryAsyncOptions<R>,
): PromiseFunctionType<T, R> => {
  return (...params) => {
    return retryAsync(() => func(...params), options);
  };
};
