import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('内联代码块渲染测试', () => {
  test('单行、多行内联代码块', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
前缀\`print('hello world')\`后缀


前缀\`
int a = 1;
print('hello world')
\`后缀
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
