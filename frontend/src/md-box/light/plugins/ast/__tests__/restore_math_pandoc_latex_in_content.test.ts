import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { RestoreMathPandocLatexInContentAstPlugin } from '../restore_math_pandoc_latex_in_content';

describe('从特殊元素中恢复latex标签的源内容（restoreMathPandocLatexInContent）', () => {
  const processor = generateAstProcessor(
    RestoreMathPandocLatexInContentAstPlugin,
  );

  test('匹配则转换', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'text',
        },
        {
          type: 'code',
          value: `prefix<span data-type="block-math" data-value="${Buffer.from(
            '1+1=2',
            'utf8',
          ).toString('base64')}" data-raw="${Buffer.from(
            String.raw`\[1+1=2\]`,
            'utf8',
          ).toString('base64')}"></span>suffix`,
        },
      ],
    };

    expect(processor(example)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'text',
        },
        {
          type: 'code',
          value: String.raw`prefix\[1+1=2\]suffix`,
        },
      ],
    });
  });
});
