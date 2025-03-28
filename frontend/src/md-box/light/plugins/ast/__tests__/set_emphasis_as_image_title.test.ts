import { Root } from 'mdast';
import { cloneDeep } from 'lodash-es';

import { generateAstProcessor } from './utils';
import { SetEmphasisAsImageTitleAstPlugin } from '../set_emphasis_as_image_title';

// eslint-disable-next-line max-lines-per-function
describe('设置图片后的斜体为图片的标题（setEmphasisAsImageTitle）', () => {
  const processor = generateAstProcessor(SetEmphasisAsImageTitleAstPlugin);

  test('符合格式的图片元素会被设置标题', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '前缀',
        },
        {
          type: 'image',
          url: 'http://bytedance.net',
          alt: 'prev',
        },
        {
          type: 'text',
          value: '\n',
        },
        {
          type: 'emphasis',
          children: [
            {
              type: 'text',
              value: 'replaced',
            },
          ],
        },
        {
          type: 'text',
          value: '后缀',
        },
      ],
    };

    const expectedAst: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '前缀',
        },
        {
          type: 'image',
          url: 'http://bytedance.net',
          alt: 'replaced',
        },
        {
          type: 'text',
          value: '后缀',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual(expectedAst);
  });

  test('不符合格式的图片元素不受影响', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '前缀',
        },
        {
          type: 'image',
          url: 'http://bytedance.net',
          alt: 'prev',
        },
        {
          type: 'text',
          value: '\n',
        },
        {
          type: 'text',
          value: '后缀',
        },
      ],
    };

    const expectedAst: Root = cloneDeep(ast);

    expect(processor(ast)).toStrictEqual(expectedAst);
  });
});
