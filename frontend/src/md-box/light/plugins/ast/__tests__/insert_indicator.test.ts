import { generateAstProcessor } from './utils';
import { InsertIndicatorAstPlugin } from '../insert_indicator';
import { parseMarkdown } from '../../../utils';

describe('测试标记插入函数（insertIndicator）', () => {
  const processor = generateAstProcessor(InsertIndicatorAstPlugin);

  test('在链接后插入标记', () => {
    const ast = parseMarkdown(`
这是[完整的链接](https://bytedance.com)
`);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('在一级列表后插入标记', () => {
    const ast = parseMarkdown(`
- 第一节

- 第二节
`);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('在二级列表后插入标记', () => {
    const ast = parseMarkdown(`
- 第一节

- 第二节

    - 第2.1节

    - 第2.2节
    `);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('在普通段落后插入标记', () => {
    const ast = parseMarkdown(`
测试段落
    `);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('在普通段落内的行内代码块插入标记', () => {
    const ast = parseMarkdown(`
测试段落\`这是一个行内代码块\`
`);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('在代码块后跳过插入标记', () => {
    const ast = parseMarkdown(`
这是第一行

\`\`\`haskell
测试代码
\`\`\`
    `);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('末尾图片后跳过插入标记', () => {
    const ast = parseMarkdown(`
这是第一行

![image](https://pic1.zhimg.com/v2-b444070848d54baf536222b22a51fba4_b.jpg)
    `);

    expect(processor(ast)).toMatchSnapshot();
  });

  test('综合插入场景', () => {
    const ast = parseMarkdown(`
这是[完整的链接](https://bytedance.com)

测试段落\`这是一个行内代码块\`

\`\`\`haskell
测试代码
\`\`\`

- 第一节

- 第二节

    - 第2.1节

    - 第2.2节
`);

    expect(processor(ast)).toMatchSnapshot();
  });
});
