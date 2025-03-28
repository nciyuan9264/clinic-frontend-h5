import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { AutofixTruncatedStrongAstPlugin } from '../autofix_truncated_strong';

// eslint-disable-next-line max-lines-per-function
describe('对末尾有不完整的加粗语法进行修复', () => {
  const processor = generateAstProcessor(AutofixTruncatedStrongAstPlugin);

  test('不完整的加粗语法（常规数量、下划线）', () => {
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
              value: '123__456',
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
              type: 'strong',
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

  test('末尾出现空列表', () => {
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
          ],
        },
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              children: [],
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
              value: '123__456',
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
              value: '123__456',
            },
          ],
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });
});
