import { Code, Paragraph, Root, Text } from 'mdast';

import { generateAstProcessor, generateAstStringProcessor } from './utils';
import { AutofixLastCodeBlockAstPlugin } from '../autofix_last_code_block';

describe('自动修复完整的代码块（autofixLastCodeBlock）', () => {
  const processor = generateAstProcessor(AutofixLastCodeBlockAstPlugin);

  const codeA: Code = {
    type: 'code',
    value: 'console.log(123)\n``',
  };

  const codeAfixed: Code = {
    type: 'code',
    value: 'console.log(123)',
  };

  const textA: Text = {
    type: 'text',
    value: 'AAA',
  };

  const textB: Text = {
    type: 'text',
    value: 'AAA\n``',
  };

  const textBFixed: Text = {
    type: 'text',
    value: 'AAA\n',
  };

  const paragraph: Paragraph = {
    type: 'paragraph',
    children: [textA, textB],
  };

  const paragraphFixed: Paragraph = {
    type: 'paragraph',
    children: [textA, textBFixed],
  };

  const lastCodeAst: Root = {
    type: 'root',
    children: [paragraph, codeA],
  };

  const lastTextAst: Root = {
    type: 'root',
    children: [codeA, paragraph],
  };

  const lastTextFixedAst: Root = {
    type: 'root',
    children: [codeA, paragraphFixed],
  };

  test('当最后出现代码块时，自动删除末尾多余的引号', () => {
    expect(processor(lastCodeAst)).toStrictEqual({
      type: 'root',
      children: [paragraph, codeAfixed],
    });
  });

  test('自动修复末尾代码块起始字符', () => {
    expect(processor(lastTextAst)).toStrictEqual(lastTextFixedAst);
  });
});

describe('字符串解析测试', () => {
  const reformat = generateAstStringProcessor(AutofixLastCodeBlockAstPlugin);

  test('完整的代码块', () => {
    expect(
      reformat(
        `这是第一行
\`\`\`
console.log(123)
\`\`\`
这是最后一行`,
      ),
    ).toBe(`这是第一行

\`\`\`
console.log(123)
\`\`\`

这是最后一行`);
  });

  test('不完整的代码块', () => {
    expect(
      reformat(
        `这是第一行
\`\`\`
console.log(123)
\`\``,
      ),
    ).toBe(`这是第一行

\`\`\`
console.log(123)
\`\`\``);

    expect(
      reformat(
        `这是第一行
\`\`\`
console.log(123)
\``,
      ),
    ).toBe(`这是第一行

\`\`\`
console.log(123)
\`\`\``);

    expect(
      reformat(
        `这是第一行
\`\`\`
console.log(123)
`,
      ),
    ).toBe(`这是第一行

\`\`\`
console.log(123)
\`\`\``);

    expect(
      reformat(
        `这是第一行
\`\`\`
console.lo`,
      ),
    ).toBe(`这是第一行

\`\`\`
console.lo
\`\`\``);

    expect(reformat('这是第一行\n``')).toBe('这是第一行');
  });
});
