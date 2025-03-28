import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import { SetCodeBlockIndentAstPlugin } from '../set_code_block_indent';

// eslint-disable-next-line max-lines-per-function
describe('设置代码块缩进（setCodeBlockIndent）', () => {
  test('会检测代码块首行的缩进，并设置到 meta 中', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '前缀',
        },
        {
          type: 'code',
          value: 'console.log(12345)',
          lang: 'javascript',
          meta: 'align=left',
          position: {
            start: {
              line: 2,
              column: 1,
              offset: 0,
            },
            end: {
              line: 4,
              column: 1,
              offset: 4,
            },
          },
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
          type: 'code',
          value: 'console.log(12345)',
          lang: 'javascript',
          meta: '__indent=3 align=left',
          position: {
            start: {
              line: 2,
              column: 1,
              offset: 0,
            },
            end: {
              line: 4,
              column: 1,
              offset: 4,
            },
          },
        },
        {
          type: 'text',
          value: '后缀',
        },
      ],
    };

    expect(
      generateAstProcessor(SetCodeBlockIndentAstPlugin, {
        source: `
前缀
   \`\`\`
console.log(12345)
   \`\`\`
后缀
      `.trim(),
      })(ast),
    ).toStrictEqual(expectedAst);
  });

  test('代码块在列表项中的缩进不视为缩进', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '前缀',
        },
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'code',
                  value: 'console.log(12345)',
                  lang: 'javascript',
                  meta: 'align=left',
                  position: {
                    start: {
                      line: 2,
                      column: 1,
                      offset: 0,
                    },
                    end: {
                      line: 4,
                      column: 1,
                      offset: 4,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'text',
          value: '后缀',
        },
      ],
    };

    expect(
      generateAstProcessor(SetCodeBlockIndentAstPlugin, {
        source: `
前缀
  -    \`\`\`
       console.log(12345)
       \`\`\`
后缀
      `.trim(),
      })(ast),
    ).toStrictEqual(ast);

    expect(ast).toStrictEqual(ast);
  });
});
