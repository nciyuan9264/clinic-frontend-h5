import { FC } from 'react';

import cs from 'classnames';
import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { MdBoxParagraphProps } from '../../../contexts';

describe('段落渲染测试', () => {
  test('普通的段落', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
这是第一个段落
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('段落中间有间距', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
这是第一个段落

这是第二个段落
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('段落内支持软换行', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
这是第一个段落第一行
这是第一个段落第二行

这是第二个段落
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('自定义渲染', async () => {
    const CustomParagraph: FC<MdBoxParagraphProps> = ({
      children,
      className,
      forceBrInterSpacing: _forceBrInterSpacing,
      raw: _raw,
      parents: _parents,
      ...restProps
    }) => {
      return (
        <div className={cs('custom-paragraph', className)} {...restProps}>
          {children}
        </div>
      );
    };

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
这是第一个段落第一行
这是第一个段落第二行

这是第二个段落
`}
          autoFixSyntax={{ autoFixEnding: false }}
          slots={{
            Paragraph: CustomParagraph,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
