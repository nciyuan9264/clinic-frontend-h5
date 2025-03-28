import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('标题渲染测试', () => {
  test('各级标题', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
# foo
## foo
### foo
#### foo
##### foo
###### foo
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('标题中含链接', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
## prefix[link](https://bytedance.com)suffix
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('转义的标题', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
\## foo
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('可选的标题后缀', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
## foo ###
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('禁用的Setext标题', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
Foo *bar*
=========
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
