import React, { ComponentType, useMemo } from 'react';

import { withSuspense } from '../utils';
import { withRetry } from '../../utils';

export interface UseLazyComponentOptions {
  /**
   * 重试次数
   * @default 5
   */
  retryTimes?: number;
  /**
   * 重试间隔，单位 ms
   * @default 100
   */
  retryInterval?: number;
}

interface WithDefault<T> {
  default: T;
}

export const useLazyComponent = <T>(
  loader: () => Promise<WithDefault<ComponentType<T>>>,
  fallback: ComponentType<T>,
  options: UseLazyComponentOptions = {},
) => {
  const { retryTimes = 5, retryInterval = 100 } = options;

  return useMemo(
    () =>
      withSuspense(
        React.lazy(
          withRetry<WithDefault<ComponentType<T>>>(loader, {
            tryTimes: retryTimes,
            interval: retryInterval,
            fallback: {
              default: fallback,
            },
          }),
        ) as ComponentType<T>,
        fallback,
      ),
    [retryTimes, retryInterval],
  );
};
