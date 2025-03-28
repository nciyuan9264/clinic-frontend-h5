import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';
import { markdownPlaygroundExample } from '../../../../_internal';

describe('各种不能被纳入其他文件的、较综合的测试用例', () => {
  test('Markdown综合快照测试', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting
          markDown={markdownPlaygroundExample}
          autoFixSyntax={{ autoFixEnding: false }}
        />,
      ),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });
});
