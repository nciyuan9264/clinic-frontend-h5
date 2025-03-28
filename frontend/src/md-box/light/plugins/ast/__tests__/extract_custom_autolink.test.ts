import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { ExtractCustomAutolinkAstPlugin } from '../extract_custom_autolink';

// eslint-disable-next-line max-lines-per-function
describe('提取链接（extractCustomAutolink）', () => {
  const processor = generateAstProcessor(ExtractCustomAutolinkAstPlugin);

  test('普通文本节点中的链接提取', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '这是一行普通文本追加http://bytedance.net链接',
        },
      ],
    };

    const expectedAst: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '这是一行普通文本追加',
        },
        {
          type: 'link',
          url: 'http://bytedance.net',
          title: 'autolink',
          children: [
            {
              type: 'text',
              value: 'http://bytedance.net',
            },
          ],
        },
        {
          type: 'text',
          value: '链接',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual(expectedAst);
  });

  test('不带协议的链接提取', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '这是一行普通文本追加bytedance.net链接',
        },
      ],
    };

    const expectedAst: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '这是一行普通文本追加',
        },
        {
          type: 'link',
          url: 'https://bytedance.net',
          title: 'autolink',
          children: [
            {
              type: 'text',
              value: 'bytedance.net',
            },
          ],
        },
        {
          type: 'text',
          value: '链接',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual(expectedAst);
  });

  test('当文本节点是链接的子节点时，不进行链接提取', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'link',
          url: 'http://bytedance.net',
          children: [
            {
              type: 'text',
              value: '这是一行普通文本追加http://bytedance.net链接',
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual(ast);
  });
});
