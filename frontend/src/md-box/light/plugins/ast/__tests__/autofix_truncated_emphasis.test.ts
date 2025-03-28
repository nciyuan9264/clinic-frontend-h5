import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { AutofixTruncatedEmphasisAstPlugin } from '../autofix_truncated_emphasis';

// eslint-disable-next-line max-lines-per-function
describe('对末尾有不完整的强调语法进行修复', () => {
  const processor = generateAstProcessor(AutofixTruncatedEmphasisAstPlugin);

  test('不完整的加粗语法（星号）', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'first',
            },
            {
              type: 'inlineCode',
              value: 'console.log(123)',
            },
            {
              type: 'text',
              value: '123*456',
            },
          ],
        },
      ],
    };

    expect(processor(example)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'first',
            },
            {
              type: 'inlineCode',
              value: 'console.log(123)',
            },
            {
              type: 'text',
              value: '123',
            },
            {
              type: 'emphasis',
              children: [
                {
                  type: 'text',
                  value: '456',
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('完整末尾不受影响', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'first',
            },
            {
              type: 'inlineCode',
              value: 'console.log(123)',
            },
            {
              type: 'text',
              value: '123',
            },
          ],
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });

  test('非末尾不受影响', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'first',
            },
            {
              type: 'inlineCode',
              value: 'console.log(abc)',
            },
            {
              type: 'text',
              value: '123_456',
            },
            {
              type: 'inlineCode',
              value: 'console.log(def)',
            },
          ],
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });

  test('非段落子节点不受影响', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'first',
            },
            {
              type: 'text',
              value: '123_456',
            },
          ],
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });
});
