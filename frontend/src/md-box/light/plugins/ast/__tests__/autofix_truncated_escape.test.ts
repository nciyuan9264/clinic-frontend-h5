import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { AutofixTruncatedEscapePlugin } from '../autofix_truncated_escape';

describe('对末尾有不完整的反斜杠进行移除', () => {
  const processor = generateAstProcessor(AutofixTruncatedEscapePlugin);

  test('不完整的转义', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: '123\nabcdef\\',
        },
      ],
    };

    expect(processor(example)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: '123\nabcdef',
        },
      ],
    });
  });

  test('完整末尾不受影响', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: 'p\\refix',
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });
});
