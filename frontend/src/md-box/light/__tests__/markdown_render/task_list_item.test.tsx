import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('任务列表渲染测试', () => {
  test('普通任务列表', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- [ ] foo
- [x] bar
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('嵌套的任务列表', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
- [x] foo
  - [ ] bar
  - [x] baz
- [ ] bim
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
