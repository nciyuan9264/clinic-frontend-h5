import { generateAstProcessor } from './utils';
import { AutoSpacingAllTextAstPlugin } from '../auto_spacing_all_text';
import { parseMarkdown, stringifyMarkdown } from '../../../utils';

describe('自动在中英文之间加空格', () => {
  const processor = generateAstProcessor(AutoSpacingAllTextAstPlugin);

  test('验证一般文本插入空格正确', () => {
    const ast = parseMarkdown(`
这是包含words的语句

这是[一个bytedance的链接](https://bytedance.com)

> 这是引用中的包含words的语句

- 这是列表中包含words的语句
- 这是其他列表项

|  表格头部包含words的语句  |  其他表格头部  |
| :----: | :---: |
| 表格单元包含words的语句  |  其他表格单元   |
`);

    expect(stringifyMarkdown(processor(ast)).trim()).toBe(
      `
这是包含 words 的语句

这是[一个 bytedance 的链接](https://bytedance.com)

> 这是引用中的包含 words 的语句

*   这是列表中包含 words 的语句
*   这是其他列表项

| 表格头部包含 words 的语句 | 其他表格头部 |
| :--------------: | :----: |
| 表格单元包含 words 的语句 | 其他表格单元 |
      `.trim(),
    );
  });

  test('验证特殊文本（代码块等）不插入空格正确', () => {
    const text = `
\`\`\`Python
# 这是代码块中的包含words的语句
Print(123456)
\`\`\`

这是\`行内代码块中的包含words的语句\`。
      `.trim();

    const ast = parseMarkdown(text);

    expect(stringifyMarkdown(processor(ast)).trim()).toBe(text);
  });
});
