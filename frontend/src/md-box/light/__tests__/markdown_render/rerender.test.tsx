import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('二次渲染测试（rerender）', () => {
  test('Markdown普通文本二次渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
这是第一个段落

这是第
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    const prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={`
  这是第一个段落

  这是第二个段落
        `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(rootView.asFragment());
  });
});
