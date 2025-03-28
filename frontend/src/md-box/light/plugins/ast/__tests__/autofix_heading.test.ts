import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { AutofixHeadingAstPlugin } from '../autofix_heading';

// eslint-disable-next-line max-lines-per-function
describe('标题元素的自动修复（autofixHeading）', () => {
  const processor = generateAstProcessor(AutofixHeadingAstPlugin);

  test('当末尾出现空的一级标题时，删除该节点', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'first',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: ' ',
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'first',
            },
          ],
        },
      ],
    });
  });

  test('不影响末尾的其他级别的标题', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'first',
            },
          ],
        },
        {
          type: 'heading',
          depth: 2,
          children: [
            {
              type: 'text',
              value: ' ',
            },
          ],
        },
      ],
    };

    expect(processor(ast)).toStrictEqual(ast);
  });
});
