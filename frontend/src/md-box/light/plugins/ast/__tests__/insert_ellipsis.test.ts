import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { InsertEllipsisAstPlugin } from '../insert_ellipsis';

// eslint-disable-next-line max-lines-per-function
describe('插入省略号', () => {
  const processor = generateAstProcessor(InsertEllipsisAstPlugin);

  test('在最后一个文本节点的内容后插入省略号', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'abc',
            },
            {
              type: 'text',
              value: 'def',
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'abc',
            },
            {
              type: 'text',
              value: 'def...',
            },
          ],
        },
      ],
    });
  });

  test('在最后一个链接节点后插入省略号节点', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://google.com',
              children: [
                {
                  type: 'text',
                  value: 'abc',
                },
              ],
            },
            {
              type: 'text',
              value: 'inter',
            },
            {
              type: 'link',
              url: 'https://google.com',
              children: [
                {
                  type: 'text',
                  value: 'def',
                },
              ],
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://google.com',
              children: [
                {
                  type: 'text',
                  value: 'abc',
                },
              ],
            },
            {
              type: 'text',
              value: 'inter',
            },
            {
              type: 'link',
              url: 'https://google.com',
              children: [
                {
                  type: 'text',
                  value: 'def',
                },
              ],
            },
            {
              type: 'text',
              value: '...',
            },
          ],
        },
      ],
    });
  });

  test('在最后一个内联代码块后插入省略号', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'inlineCode',
              value: "console.log('abc')",
            },
            {
              type: 'text',
              value: 'inter',
            },
            {
              type: 'inlineCode',
              value: "console.log('abc')",
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'inlineCode',
              value: "console.log('abc')",
            },
            {
              type: 'text',
              value: 'inter',
            },
            {
              type: 'inlineCode',
              value: "console.log('abc')",
            },
            {
              type: 'text',
              value: '...',
            },
          ],
        },
      ],
    });
  });

  test('在图片后不插入省略号', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'inter',
            },
            {
              type: 'image',
              url: 'http://google.com',
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>(ast);
  });

  test('在代码块后不插入省略号', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'inter',
            },
          ],
        },
        {
          type: 'code',
          value: "console.log('abc')",
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>(ast);
  });
});
