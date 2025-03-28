import { FC } from 'react';

import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { MdBoxTableProps } from '../../../contexts';

describe('表格渲染测试', () => {
  test('普通表格', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
| foo | bar |
| --- | --- |
| baz | bim |
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('不对齐、可选的竖杠', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
| abc | defghi |
:-: | -----------:
bar | baz
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('仅含表头', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
| abc | defghi |
| --- | --- |
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('自定义渲染', async () => {
    const CustomTable: FC<MdBoxTableProps> = ({
      children,
      raw: _raw,
      parents: _parents,
      ...restProps
    }) => {
      return (
        <div {...restProps}>
          <div className="header">自定义表格</div>
          <table>{children}</table>
        </div>
      );
    };

    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
| abc | defghi |
| --- | --- |
`}
          autoFixSyntax={{ autoFixEnding: false }}
          slots={{
            Table: CustomTable,
          }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
