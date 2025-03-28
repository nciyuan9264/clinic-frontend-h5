import { concat } from 'lodash-es';
import { act, renderHook } from '@testing-library/react';

import { renderHookInterval } from './utils';
import { useSmoothText } from '../smooth';

const smoothedText = '123456789012345678901234567890';

describe('平滑化方法测试（useSmoothText）', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('初始固定文本，验证从头到尾平滑化', async () => {
    const renderHandle = await renderHookInterval({
      useHook: () => useSmoothText(smoothedText),
      mapper: (item) => item.text,
      interval: 30,
      loop: 50,
    });

    expect(renderHandle.results).toMatchSnapshot('正常流式平滑化直到结束');
  });

  test('调用 flushCursor，验证光标直接调整到末尾', async () => {
    const renderHandle = await renderHookInterval({
      useHook: () => useSmoothText(smoothedText),
      mapper: (item) => item.text,
      interval: 30,
      loop: 10,
    });

    await act(() => {
      renderHandle.result.current.flushCursor();
    });

    const secondRenderHandle = await renderHookInterval({
      useHook: renderHandle,
      mapper: (item) => item.text,
      interval: 30,
      loop: 10,
    });

    expect(
      concat(renderHandle.results, secondRenderHandle.results),
    ).toMatchSnapshot('第十次后光标调整到末尾');
  });

  test('在启用平滑化的同时调用 flushCursor，验证初始从改位置开始', async () => {
    let currentText = smoothedText;

    let currentEnable = false;

    const renderHandle = await act(() =>
      renderHook(() => useSmoothText(currentText, currentEnable)),
    );

    await act(() => {
      currentEnable = true;

      renderHandle.result.current.flushCursor();

      renderHandle.rerender();
    });

    currentText += smoothedText;

    const { results } = await renderHookInterval({
      useHook: renderHandle,
      mapper: (item) => item.text,
      interval: 30,
      loop: 30,
    });

    expect(results).toMatchSnapshot('直接从初始文本末尾作为开始进行流式');
  });
});
