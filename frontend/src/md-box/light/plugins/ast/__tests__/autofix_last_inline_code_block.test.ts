/* eslint-disable max-lines-per-function */
import { Root, Text, HTML, InlineCode } from 'mdast';

import { generateAstProcessor, generateAstStringProcessor } from './utils';
import { AutofixLastInlineCodeBlockAstPlugin } from '../autofix_last_inline_code_block';

const textA: Text = {
  type: 'text',
  value: 'AAA',
};

const textB: Text = {
  type: 'text',
  value: 'BBB',
};

const textC: Text = {
  type: 'text',
  value: 'CCC',
};

const textD: Text = {
  type: 'text',
  value: 'DDD',
};

const htmlA: HTML = {
  type: 'html',
  value: '<div id="a" />',
};

const htmlB: HTML = {
  type: 'html',
  value: '<div id="b" />',
};

const inlineCodeA: InlineCode = {
  type: 'inlineCode',
  value: 'console.log("AAA")',
};

const inlineCodeB: InlineCode = {
  type: 'inlineCode',
  value: 'console.log("BBB")',
};

describe('自动修复最后的不完整的内联代码块（autofixLastInlineCodeBlock）', () => {
  const processor = generateAstProcessor(AutofixLastInlineCodeBlockAstPlugin);

  describe('存在一个未匹配的引号在最后一个非叶子结点下', () => {
    describe('引号后无代码块', () => {
      test('引号前后有字符，自动修复', () => {
        const ast: Root = {
          type: 'root',
          children: [
            textA,
            {
              type: 'paragraph',
              children: [
                inlineCodeA,
                textB,
                htmlA,
                {
                  type: 'text',
                  value: 'prefix`suffix',
                },
                htmlB,
                textC,
              ],
            },
          ],
        };

        expect(processor(ast)).toStrictEqual<Root>({
          type: 'root',
          children: [
            textA,
            {
              type: 'paragraph',
              children: [
                inlineCodeA,
                textB,
                htmlA,
                {
                  type: 'text',
                  value: 'prefix',
                },
                {
                  type: 'inlineCode',
                  value: `suffix${htmlB.value}${textC.value}`,
                },
              ],
            },
          ],
        });
      });

      test('引号前面无字符，自动修复', () => {
        const ast: Root = {
          type: 'root',
          children: [
            textA,
            {
              type: 'paragraph',
              children: [
                inlineCodeA,
                textB,
                htmlA,
                {
                  type: 'text',
                  value: '`suffix',
                },
                htmlB,
                textC,
              ],
            },
          ],
        };

        expect(processor(ast)).toStrictEqual<Root>({
          type: 'root',
          children: [
            textA,
            {
              type: 'paragraph',
              children: [
                inlineCodeA,
                textB,
                htmlA,
                {
                  type: 'inlineCode',
                  value: `suffix${htmlB.value}${textC.value}`,
                },
              ],
            },
          ],
        });
      });

      test('引号前后无字符，自动修复', () => {
        const ast: Root = {
          type: 'root',
          children: [
            textA,
            {
              type: 'paragraph',
              children: [
                inlineCodeA,
                textB,
                htmlA,
                {
                  type: 'text',
                  value: '`',
                },
                htmlB,
                textC,
              ],
            },
          ],
        };

        expect(processor(ast)).toStrictEqual<Root>({
          type: 'root',
          children: [
            textA,
            {
              type: 'paragraph',
              children: [
                inlineCodeA,
                textB,
                htmlA,
                {
                  type: 'inlineCode',
                  value: `${htmlB.value}${textC.value}`,
                },
              ],
            },
          ],
        });
      });
    });

    test('其后有内联代码块，则不做改变', () => {
      const ast: Root = {
        type: 'root',
        children: [
          textA,
          {
            type: 'paragraph',
            children: [
              inlineCodeA,
              textB,
              htmlA,
              {
                type: 'text',
                value: 'prefix`suffix',
              },
              htmlB,
              inlineCodeB,
              textC,
            ],
          },
        ],
      };

      expect(processor(ast)).toStrictEqual(ast);
    });
  });

  test('不存在一个未匹配的引号在最后一个非叶子结点下，则不做改变', () => {
    const ast: Root = {
      type: 'root',
      children: [
        textA,
        {
          type: 'paragraph',
          children: [
            inlineCodeA,
            textB,
            htmlA,
            {
              type: 'text',
              value: 'prefix`suffix',
            },
            htmlB,
            textC,
          ],
        },
        textD,
      ],
    };

    expect(processor(ast)).toStrictEqual(ast);
  });
});

describe('字符串解析测试', () => {
  const reformat = generateAstStringProcessor(
    AutofixLastInlineCodeBlockAstPlugin,
  );

  test('边界case', () => {
    expect(reformat('- `<h1>`到`<h')).toBe('*   `<h1>`到`<h`');
  });
});
