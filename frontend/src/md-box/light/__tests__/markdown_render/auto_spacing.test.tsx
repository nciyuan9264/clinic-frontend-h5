import { render, act } from '@testing-library/react';

import { MdBoxForTesting } from '../utils';

const text = `
这是包含words的语句

这是[一个bytedance的链接](https://bytedance.com)

> 这是引用中的包含words的语句

- 这是列表中包含words的语句
- 这是其他列表项

|  表格头部包含words的语句  |  其他表格头部  |
| :----: | :---: |
| 表格单元包含words的语句  |  其他表格单元   |

\`\`\`Python
# 这是代码块中的包含words的语句
Print(123456)
\`\`\`

这是\`行内代码块中的包含words的语句\`。
            `.trim();

describe('自动在中英文之间加空格渲染测试', () => {
  test('验证默认开启，文本被正确插入空格', async () => {
    const rootView = await act(() =>
      render(<MdBoxForTesting markDown={text} autoFixSyntax />),
    );

    expect(rootView.asFragment()).toMatchSnapshot();
  });

  test('验证响应式开启生效', async () => {
    const rootView = await act(() =>
      render(
        <MdBoxForTesting markDown={text} autoFixSyntax autoSpacing={false} />,
      ),
    );

    const beforeEnable = rootView.asFragment();

    await act(() =>
      rootView.rerender(
        <MdBoxForTesting markDown={text} autoFixSyntax autoSpacing />,
      ),
    );

    const afterEnable = rootView.asFragment();

    expect(beforeEnable).toMatchDiffSnapshot(afterEnable);
  });
});
