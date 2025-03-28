import { render, act, RenderResult } from '@testing-library/react';

interface SmoothWithValueParams<T, I = unknown> {
  value: string;
  interval: number;
  loop: number;
  mapper: (view: RenderResult, interValue: I | undefined) => T;
  renderTarget: (
    value: string,
    callback: (interValue: I) => void,
  ) => JSX.Element;
  startIndex?: number;
  view?: RenderResult;
}

interface SmoothWithValueReturnValue<T> {
  result: T[];
  view: RenderResult;
}

export const rerenderWithValue = async <T, I = unknown>({
  value,
  interval,
  loop,
  mapper,
  renderTarget,
  view,
  startIndex = 0,
}: SmoothWithValueParams<T, I>): Promise<SmoothWithValueReturnValue<T>> => {
  const result: T[] = [];

  let currentInterValue: I | undefined;

  const handleRenderCallback = (interValue: I) => {
    currentInterValue = interValue;
  };

  const rootView =
    view ||
    (await act(() => {
      const view = render(
        renderTarget(value.slice(0, startIndex), handleRenderCallback),
      );
      jest.runAllTimers();
      return view;
    }));

  const rerenderMdBox = async () => {
    await act(() => {
      rootView.rerender(renderTarget(value, handleRenderCallback));
    });
  };

  for (let i = 0; i < loop; i++) {
    jest.advanceTimersByTime(interval);
    currentInterValue = undefined;
    await rerenderMdBox();
    result.push(mapper(rootView, currentInterValue));
  }

  return { result, view: rootView };
};
