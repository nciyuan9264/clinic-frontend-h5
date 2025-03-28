import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('引用渲染测试', () => {
  test('简单多行引用', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
> # Foo
> bar
   > baz
baz
> bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('嵌套的引用', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
> > > foo
bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
