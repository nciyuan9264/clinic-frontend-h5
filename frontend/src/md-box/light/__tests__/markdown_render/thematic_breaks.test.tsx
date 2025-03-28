import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('分割线渲染测试', () => {
  test('多种分割线', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
***
---
___
_____________________________________
- - - -
  `}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
