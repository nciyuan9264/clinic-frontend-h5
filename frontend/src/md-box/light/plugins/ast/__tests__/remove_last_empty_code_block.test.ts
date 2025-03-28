import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { RemoveLastEmptyCodeBlockAstPlugin } from '../remove_last_empty_code_block';

describe('去除末尾空代码块（removeLastEmptyCodeBlock）', () => {
  const processor = generateAstProcessor(RemoveLastEmptyCodeBlockAstPlugin);

  test('当最后出现空代码块时，空代码块被移除', () => {
    const lastCodeAst: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'prefix',
            },
          ],
        },
        {
          type: 'code',
          value: '',
          lang: '',
          meta: '',
        },
      ],
    };

    expect(processor(lastCodeAst)).toStrictEqual({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'prefix',
            },
          ],
        },
      ],
    });
  });

  test('空代码块不在最后时不被移除', () => {
    const notLastCodeAst: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'prefix',
            },
          ],
        },
        {
          type: 'code',
          value: '',
          lang: '',
          meta: '',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'suffix',
            },
          ],
        },
      ],
    };

    expect(processor(notLastCodeAst)).toStrictEqual(notLastCodeAst);
  });
});
