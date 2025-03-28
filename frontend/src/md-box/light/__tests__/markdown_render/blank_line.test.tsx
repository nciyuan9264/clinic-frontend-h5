import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('空行渲染测试', () => {
  test('空字符串', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={''}
          autoFixSyntax={{
            autoFixEnding: false,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('空内容', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`


      `}
          autoFixSyntax={{
            autoFixEnding: false,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('前后有空内容', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`

这是普通的段落

      `}
          autoFixSyntax={{
            autoFixEnding: false,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
