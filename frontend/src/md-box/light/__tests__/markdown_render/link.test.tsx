import { FC } from 'react';

import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { MdBoxLinkProps } from '../../../contexts';

describe('普通链接渲染测试', () => {
  test('基础语法', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
[link](https://bytedance.com)
[link](https://bytedance.com "bytedance title")
[link]()
[link](</my uri>)
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('自定义渲染', async () => {
    const CustomLink: FC<MdBoxLinkProps> = ({ children, href }) => {
      return (
        <a className="custom-link" href={href}>
          {children}
        </a>
      );
    };

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
[link](https://bytedance.com)
`}
          slots={{
            Link: CustomLink,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});

describe('业务自定义的AutoLink提取算法渲染测试', () => {
  test('合法情况', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
1. https://www.baidu.com/：中国最大的搜索引擎，提供搜索、网页、音乐、图片、贴吧、知道等多种服务。
2. https://www.google.com/：全球最大的搜索引擎，提供搜索、地图、翻译、电子邮箱等服务。
3. https://www.gov.cn/xinwen/2023-01/17/content_5737514.html：包含被转义后可能导致Autolink识别失败的符号（下划线）
`}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('不合法情况', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
1. {xnliang@buaa.edu：非法链接
`}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});

describe('非 http / https 的自定义链接', () => {
  const customLinkText = `
1. [first](first://quick-open/abc)：第一个自定义链接
2. [second](second://quick-open/abc)：第二个自定义链接
3. [third](third://quick-open/abc)：第三个自定义链接
`;

  test('允许渲染', async () => {
    const rootView = await act(() =>
      render(<MdBoxForTesting markDown={customLinkText} />),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('不允许渲染', async () => {
    const rootView = await act(() =>
      render(<MdBoxForTesting markDown={customLinkText} customLink={false} />),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('允许部分渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={customLinkText}
          customLink={(link) => link.startsWith('second://')}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
