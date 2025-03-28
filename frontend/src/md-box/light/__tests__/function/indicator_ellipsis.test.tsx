import { FC } from 'react';

import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { MdBoxIndicatorProps } from '../../../contexts';

// eslint-disable-next-line max-lines-per-function
describe('打字机指示点测试', () => {
  test('文本后展示打字机指示点', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
`}
          showIndicator
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('indicator')).toBeInTheDocument();
  });

  test('链接后展示打字机指示点', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
[link](http://bytedance.com)
`}
          showIndicator
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('indicator')).toBeInTheDocument();
  });

  test('表格内展示打字机指示点', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
| foo | bar |
| --- | --- |
| baz | bim
`}
          showIndicator
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('indicator')).toBeInTheDocument();
  });

  test('图片后不展示打字机指示点', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
![link](http://bytedance.com/logo.png)
`}
          showIndicator
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('indicator')).not.toBeInTheDocument();
  });

  test('代码块后不展示打字机指示点', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`\`\`
print("hello")
\`\`\`
`}
          showIndicator
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('indicator')).not.toBeInTheDocument();
  });

  test('打字机指示点与省略号共存', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
  第一行
  `}
          showIndicator
          showEllipsis
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('indicator')).toBeInTheDocument();

    expect(rootView.baseElement.textContent?.trim()).toBe('第一行...');
  });

  test('二次渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
`}
          showIndicator
        />,
      ),
    );

    const prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={`
第一行
`}
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(rootView.asFragment());
  });

  test('自定义指示点', async () => {
    const CustomIndicator: FC<MdBoxIndicatorProps> = () => {
      return (
        <span style={{ color: 'grey' }} data-testid="custom-indicator">
          Waiting
        </span>
      );
    };

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
`}
          showIndicator
          slots={{
            Indicator: CustomIndicator,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.queryByTestId('custom-indicator')).toBeInTheDocument();
  });
});

describe('省略号插入测试', () => {
  test('文本后插入省略号', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
`}
          showEllipsis
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.baseElement.textContent?.trim()).toBe('第一行...');
  });

  test('行内内容后插入省略号', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
\`print("hello")\`
`}
          showEllipsis
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.baseElement.textContent?.trim()).toBe('print("hello")...');
  });

  test('图片后不插入省略号', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
prefix![link](http://bytedance.com/logo.png)
`}
          showEllipsis
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.baseElement.textContent?.trim()).toBe('prefix');
  });

  test('二次渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
`}
          showEllipsis
        />,
      ),
    );

    const prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={`
第一行
`}
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(rootView.asFragment());
  });
});
