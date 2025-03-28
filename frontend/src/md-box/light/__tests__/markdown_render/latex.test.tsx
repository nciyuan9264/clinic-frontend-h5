/* eslint-disable no-irregular-whitespace */
import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('旧协议公式渲染测试', () => {
  test('行内公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
行内公式：$W = Fd \cos\theta$

行内块公式：$$W = Fd \cos\theta$$
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('块公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
第一行

$$W = Fd \cos\theta$$

第三行
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('连续的行内公式（两个美元符号连在一起），验证能正确识别两个行内公式元素', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
prefix$123123123$$46456456$suffix
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('转义美元符号，不识别公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
行内公式：\$W = Fd \cos\theta$
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('特殊情况不识别公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
行内公式：$ W = Fd \cos\theta$
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot(
      '第一个美元符号后面不能有空格',
    );

    await act(() =>
      rootView.rerender(
        <MdBoxForTesting
          markDown={String.raw`
行内公式：$W = Fd \cos\theta $
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot(
      '第一个美元符号前面不能有空格',
    );

    await act(() =>
      rootView.rerender(
        <MdBoxForTesting
          markDown={String.raw`
行内公式：$W = Fd \cos\theta$1
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot(
      '第一个美元符号前面不能有数字',
    );
  });
});

describe('新协议公式渲染测试', () => {
  test('行内公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
行内公式：\(W = Fd \cos\theta\)后缀

行内块公式：\[W = Fd \cos\theta\]后缀
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('块公式', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
第一行

\[W = Fd \cos\theta\]

第三行
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});

test('包含特殊字符的公式渲染测试（验证 mathjax 不会崩溃）', async () => {
  const rootView = await act(() =>
    render(
      <MdBoxForTesting
        markDown={String.raw`
\(rac{d}{d t}[\ln (s-2)]=rac{s^{\prime}}{s-2}=rac{-1}{25}=rac{d}{d t}\left[-rac{t}{25}ight] .\)
`}
        autoFixSyntax={{ autoFixEnding: false }}
      />,
    ),
  );

  expect(rootView.asFragment()).toMatchSnapshot();
});

test('解析错误时展示原公式', async () => {
  const rootView = await act(() =>
    render(
      <MdBoxForTesting
        markDown={String.raw`
this is error latex:  $rac{1}{2}(2}/cdot 1|cdot 1$
`}
        autoFixSyntax={{ autoFixEnding: false }}
      />,
    ),
  );

  expect(rootView.asFragment()).toMatchSnapshot();
});
