import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('字符引用渲染测试', () => {
  test('html实体引用', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
&nbsp; &amp; &copy; &AElig; &Dcaron;
&frac34; &HilbertSpace; &DifferentialD;
&ClockwiseContourIntegral; &ngE;
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('unicode引用', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
&#35; &#1234; &#992; &#0;
&#X22; &#XD06; &#xcab;
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('非法引用', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={`
&nbsp &x; &#; &#x;
&#87654321;
&#abcdef0;
&ThisIsNotDefined; &hi?;
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
