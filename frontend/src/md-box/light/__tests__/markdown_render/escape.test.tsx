import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

describe('转义渲染测试', () => {
  test('特殊符号前加反斜杠，反斜杠会被消费掉用于转义', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
\!\"\#\$\%\&\'\)\(\*\+\,\-\.\/\:\;\<\=\>\?\@\]\[\\\^\_\`\{\|\}\~
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('在非特殊符号前的反斜杠，反斜杠不会被消费，不会进行转义', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={String.raw`
\→\A\a\ \3\φ\«
`}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
