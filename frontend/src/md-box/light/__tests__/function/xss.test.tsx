import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('防止 XSS 注入测试', () => {
  test('注入 latex href 命令，验证注入不成功', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={'$$ href{javascript:alert(1)}{Click Me!} $$'}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
