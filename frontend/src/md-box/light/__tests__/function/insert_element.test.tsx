import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { InsertedElementItem } from '../../index';

const insertedElements: InsertedElementItem[] = [
  {
    range: 4,
    render: () => (
      <span style={spanStyle} data-testid="first_span">
        1
      </span>
    ),
  },
  {
    range: 8,
    render: () => (
      <span style={spanStyle} data-testid="second_span">
        2
      </span>
    ),
  },
  {
    range: [10, 12],
    render: (raw) => (
      <a href="http://bytedance.net" target="_blank" data-testid="third_link">
        {raw}
      </a>
    ),
  },
];

const spanStyle: React.CSSProperties = {
  borderRadius: '50%',
  background: 'green',
  width: 19,
  height: 19,
  display: 'inline-block',
  color: 'white',
  textAlign: 'center',
};

describe('自渲染元素插入测试（insertElement）', () => {
  test('标签插入，检查快照、校验元素成功插入到正确的位置', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
第二行
第三行
`}
          autoFixSyntax={{ autoFixEnding: false }}
          insertedElements={insertedElements}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();

    expect(rootView.baseElement.textContent?.trim()).toBe(
      '第一行1第二行2第三行',
    );

    expect(rootView.queryByTestId('first_span')).toBeInTheDocument();

    expect(rootView.queryByTestId('second_span')).toBeInTheDocument();

    expect(rootView.queryByTestId('third_link')).toBeInTheDocument();
  });

  test('二次渲染', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
第一行
第二行
第三行
`}
          autoFixSyntax={{ autoFixEnding: false }}
          insertedElements={insertedElements}
        />,
      ),
    );

    const prevFragment = rootView.asFragment();

    await act(() => {
      rootView.rerender(
        <MdBoxForTesting
          markDown={`
第一行
第二行
第三行
`}
          autoFixSyntax={{ autoFixEnding: false }}
          insertedElements={insertedElements.slice(0, 1)}
        />,
      );
    });

    expect(prevFragment).toMatchDiffSnapshot(rootView.asFragment());
  });
});
