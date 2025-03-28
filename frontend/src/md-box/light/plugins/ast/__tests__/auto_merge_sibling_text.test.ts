import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { AutoMergeSiblingTextAstPlugin } from '../auto_merge_sibling_text';

describe('自动合并相邻文本（autoMergeSiblingText）', () => {
  const processor = generateAstProcessor(AutoMergeSiblingTextAstPlugin);

  test('单层', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'abc',
        },
        {
          type: 'text',
          value: 'def',
        },
        {
          type: 'html',
          value: '<div />',
        },
        {
          type: 'text',
          value: '123',
        },

        {
          type: 'text',
          value: '456',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'abcdef',
        },
        {
          type: 'html',
          value: '<div />',
        },
        {
          type: 'text',
          value: '123456',
        },
      ],
    });
  });

  test('多层', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'abc',
        },
        {
          type: 'text',
          value: 'def',
        },
        {
          type: 'link',
          url: 'https://bytedance.net',
          children: [
            {
              type: 'text',
              value: '123',
            },

            {
              type: 'text',
              value: '456',
            },
          ],
        },
        {
          type: 'html',
          value: '<div />',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'abcdef',
        },
        {
          type: 'link',
          url: 'https://bytedance.net',
          children: [
            {
              type: 'text',
              value: '123456',
            },
          ],
        },
        {
          type: 'html',
          value: '<div />',
        },
      ],
    });
  });
});
