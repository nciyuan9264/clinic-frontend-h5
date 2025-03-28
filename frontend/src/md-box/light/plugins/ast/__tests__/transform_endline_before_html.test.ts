import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { TransformEndlineBeforeHtmlAstPlugin } from '../transform_endline_before_html';

describe('自动转换html前的换行符为br标签（transformEndlineBeforeHtml）', () => {
  const processor = generateAstProcessor(TransformEndlineBeforeHtmlAstPlugin);

  test('前面文本末尾有换行符，则转换', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first\n',
        },
        {
          type: 'text',
          value: 'te\nxt\n',
        },
        {
          type: 'html',
          value: '<span>html</span>',
        },
      ],
    };

    expect(processor(example)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first\n',
        },
        {
          type: 'text',
          value: 'te\nxt',
        },
        {
          type: 'html',
          value: '<br />',
        },
        {
          type: 'html',
          value: '<span>html</span>',
        },
      ],
    });
  });

  test('前面文本末尾无换行符，则不转换', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first\n',
        },
        {
          type: 'text',
          value: 'te\nxt',
        },
        {
          type: 'html',
          value: '<span>html</span>',
        },
      ],
    };

    expect(processor(example)).toStrictEqual<Root>(example);
  });
});
