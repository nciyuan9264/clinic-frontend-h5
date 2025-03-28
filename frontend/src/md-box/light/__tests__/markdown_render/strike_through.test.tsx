import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('渲染测试', () => {
  test('禁用了单波浪删除线语法，但支持双波浪删除线', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
prefix ~~Hi~~Hello, ~there~world!
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('双波浪线在开头', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
~~Hi~~Hello
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
