import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

// eslint-disable-next-line max-lines-per-function
describe('加粗、强调渲染测试', () => {
  test('加粗和强调', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀**加粗内容**后缀

前缀*强调内容*后缀
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('加粗、强调的组合', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
***strong emph***
***strong** in emph*
***emph* in strong**
**in strong *emph***
*in emph **strong***
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('强调文字后缀如果是中文则间隔字符', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀*强调内容*后缀
  `}
          autoFixSyntax={{ autoFixEnding: false }}
          spacingAfterChineseEm={6}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('强调文字后缀如果非中文则不间隔', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀*强调内容* 后缀
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('加粗前后有中文符号，可以正确识别为加粗', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- **123123)**：456456
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('设置 spacingAfterChineseEm 为 false 则不间隔', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀*强调内容*后缀
  `}
          autoFixSyntax={{ autoFixEnding: false }}
          spacingAfterChineseEm={false}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('加粗语法自动修复', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀**后缀
  `}
          autoFixSyntax={{ autoFixEnding: true }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot('加粗自动修复');
  });

  test('强调语法自动修复', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀*后缀
  `}
          autoFixSyntax={{ autoFixEnding: true }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot('强调自动修复');
  });
});
