/* eslint-disable max-lines-per-function */
import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('列表项渲染测试', () => {
  test('列表项统一缩进', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
1.  A paragraph
    with two lines.

        indented code

    > A block quote.
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('列表项缩进不满足时排除到外边，变为原本内容', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- one

 two

-    one

    two
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});

describe('列表渲染测试', () => {
  test('无序列表“-”', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- foo
- bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('无序列表“*”', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
* foo
* bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('无序列表“+”', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
+ foo
+ bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('有序列表“.”', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
1. foo
2. bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('有序列表“)”', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
1) foo
2) bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('类型不同时另起新列表', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- foo
- bar
+ baz
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('嵌套列表', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- foo
  - bar
    - baz


      bim
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('空列表', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
-

1.

*
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
