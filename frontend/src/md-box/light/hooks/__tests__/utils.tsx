import { isFunction } from 'lodash-es';
import { act, renderHook, RenderHookResult } from '@testing-library/react';

export interface RenderHookIntervalParams<T, V> {
  useHook: (() => T) | RenderHookResult<T, never>;
  interval: number;
  loop: number;
  mapper: (value: T) => V;
  /**
   * 在首次渲染后立即执行
   */
  afterRender?: (result: T) => void;
}

export type RenderHookIntervalReturnValue<T, V> = RenderHookResult<T, never> & {
  results: V[];
};

export const renderHookInterval = async <T, V>({
  useHook,
  mapper,
  interval,
  loop,
  afterRender,
}: RenderHookIntervalParams<T, V>): Promise<
  RenderHookIntervalReturnValue<T, V>
> => {
  const { rerender, result, unmount } = isFunction(useHook)
    ? await act(() => {
        const handle = renderHook(useHook);

        afterRender?.(handle.result.current);

        return handle;
      })
    : useHook;

  const results: V[] = [mapper(result.current)];

  for (let i = 0; i < loop; i++) {
    jest.advanceTimersByTime(interval);

    await act(rerender);

    results.push(mapper(result.current));
  }

  return {
    rerender,
    result,
    unmount,
    results,
  };
};
