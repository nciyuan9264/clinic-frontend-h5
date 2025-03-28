import { InlineMath } from 'mdast-util-math';
import { Paragraph, Root, Text } from 'mdast';
import { cloneDeep } from 'lodash-es';
import katex from 'katex';

import { generateAstProcessor } from './utils';
import {
  AutofixTruncatedTexMathDollarAstPlugin,
  findStartIndexOfNoneTexSuffix,
} from '../autofix_truncated_tex_math_dollar';

describe('找到最长的不含公式的尾缀（findStartIndexOfNoneTexSuffix）', () => {
  test('不含任何合法Tex格式', () => {
    expect(findStartIndexOfNoneTexSuffix('abcdef')).toBe(0);

    expect(findStartIndexOfNoneTexSuffix('abcdef$testq')).toBe(0);

    expect(findStartIndexOfNoneTexSuffix('abcdef$testq$123')).toBe(0);

    expect(findStartIndexOfNoneTexSuffix('abcdef$ testq$kkk')).toBe(0);

    expect(findStartIndexOfNoneTexSuffix('abcdef$testq $kkk')).toBe(0);
  });

  test('混合', () => {
    const target =
      'prefix$math_1$and$2_math_2$and$$display_math_3$$and$math_4$$math_5$and$ none_math_1$ and $none_math_2$123';

    const startIndex = findStartIndexOfNoneTexSuffix(target);

    expect(target.slice(startIndex)).toBe(
      'and$ none_math_1$ and $none_math_2$123',
    );
  });

  test('美元符号不匹配', () => {
    expect(findStartIndexOfNoneTexSuffix('$$12345$')).toBe(0);
    expect(findStartIndexOfNoneTexSuffix('$$12345$$')).toBe(9);
  });
});

// eslint-disable-next-line max-lines-per-function
describe('自动修复被截断的Tex数学公式（autofixTruncatedTexMathDollar）', () => {
  const processor = generateAstProcessor(
    AutofixTruncatedTexMathDollarAstPlugin,
    { katex },
  );

  /*
    完整公式：
    V=\frac{1}{3}\times l^2\times h^2\times\frac{1-h^2}{h^2}
  */

  const truncatedMathText: Text = {
    type: 'text',
    value:
      'prefix$math_1$and$2_math_2$and$$display_math_3$$and$math_4$$math_5$and$ none_math_1$ and $none_math_2$123 $V=\\frac{1}{3}\\times l^2\\times h^2\\times\\frac',
  };

  const fixedMathContents: [Text, InlineMath] = [
    {
      type: 'text',
      value:
        'prefix$math_1$and$2_math_2$and$$display_math_3$$and$math_4$$math_5$and$ none_math_1$ and $none_math_2$123 ',
    },
    {
      type: 'inlineMath',
      value: 'V=\\frac{1}{3}\\times l^2\\times h^2\\times',
    },
  ];

  const text1: Text = {
    type: 'text',
    value: 'This is test text',
  };

  const paragraph1: Paragraph = {
    type: 'paragraph',
    children: [text1, truncatedMathText],
  };

  const paragraph2: Paragraph = {
    type: 'paragraph',
    children: [text1, truncatedMathText],
  };

  const fixedParagraph1: Paragraph = {
    type: 'paragraph',
    children: [text1, ...fixedMathContents],
  };

  const rawExample: Root = {
    type: 'root',
    children: [paragraph2, truncatedMathText, text1, paragraph1],
  };

  const fixedRawExample: Root = {
    type: 'root',
    children: [paragraph2, truncatedMathText, text1, fixedParagraph1],
  };

  test('末尾文本节点多余内容后缀自动去除，直到内容严格合法（符合Katex的严格模式语法校验）', () => {
    const ast = cloneDeep(rawExample);

    expect(processor(ast)).toStrictEqual(fixedRawExample);
  });

  test('末尾文本节点的数学公式前后不能有空格', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '功的计算公式：$$W = Fd \\',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '功的计算公式：',
        },
        {
          type: 'inlineMath',
          value: 'W = Fd',
        },
      ],
    });
  });

  test('末尾文本节点包含合法公式，且有前面多余的内容时，转换成行内公式', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '123123123$$V=\\frac{1}{3}\\times l^2\\times h^2\\tim',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '123123123',
        },
        {
          type: 'inlineMath',
          value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
        },
      ],
    });
  });

  test('末尾文本节点包含合法公式，且前面有相邻兄弟文本节点，转换成行内公式', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '123123',
        },
        {
          type: 'text',
          value: '$$V=\\frac{1}{3}\\times l^2\\times h^2\\tim',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '123123',
        },
        {
          type: 'inlineMath',
          value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
        },
      ],
    });
  });

  describe('末尾文本节点包含合法公式，且前面没有多余的内容时', () => {
    test('双美元符号转换成行内公式', () => {
      const ast: Root = {
        type: 'root',
        children: [
          {
            type: 'text',
            value: '$$V=\\frac{1}{3}\\times l^2\\times h^2\\tim',
          },
        ],
      };

      expect(processor(ast)).toStrictEqual<Root>({
        type: 'root',
        children: [
          {
            type: 'inlineMath',
            value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
          },
        ],
      });
    });

    test('末尾文本为单美元符号仍然保持行内公式', () => {
      const ast: Root = {
        type: 'root',
        children: [
          {
            type: 'text',
            value: '$V=\\frac{1}{3}\\times l^2\\times h^2\\tim',
          },
        ],
      };

      expect(processor(ast)).toStrictEqual<Root>({
        type: 'root',
        children: [
          {
            type: 'inlineMath',
            value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
          },
        ],
      });
    });
  });

  test('末尾文本节点包含不匹配的美元符号（例如应该为$$，结果末尾只有$），自动匹配', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: '$$V=\\frac{1}{3}\\times l^2\\times h^2\\tim$',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'inlineMath',
          value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
        },
      ],
    });
  });

  test('末尾文本节点不包含合法公式，则不转换数学公式节点', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: 'abc$$\\',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: 'abc',
        },
      ],
    });
  });

  test('末尾文本节点为空，则不转换数学公式节点', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: 'abc$$',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'text',
          value: 'abc',
        },
      ],
    });
  });

  describe('末尾文本节点中找到最后一个$+数字的匹配后', () => {
    test('不超过10个输入字符，则转换公式', () => {
      const ast: Root = {
        type: 'root',
        children: [
          truncatedMathText,
          {
            type: 'text',
            value: 'abc$12.5我我我我我我我我我我',
          },
        ],
      };

      expect(processor(ast)).toStrictEqual<Root>({
        type: 'root',
        children: [
          truncatedMathText,
          {
            type: 'text',
            value: 'abc',
          },
          {
            type: 'inlineMath',
            value: '12.5',
          },
        ],
      });
    });

    describe('超过10个输入字符仍然不能使最大合法公式子串变化，则停止转换公式', () => {
      test('末尾是文本格式，返回原内容', () => {
        const ast: Root = {
          type: 'root',
          children: [
            truncatedMathText,
            {
              type: 'text',
              value: 'abc$12.5我我我我我我我我我我我',
            },
          ],
        };

        expect(processor(ast)).toStrictEqual<Root>({
          type: 'root',
          children: [
            truncatedMathText,
            {
              type: 'text',
              value: 'abc$12.5我我我我我我我我我我我',
            },
          ],
        });
      });

      test('末尾是行内公式格式，返回原内容的文本', () => {
        const ast: Root = {
          type: 'root',
          children: [
            truncatedMathText,
            {
              type: 'inlineMath',
              value: '12.5我我我我我我我我我我我',
            },
          ],
        };

        expect(processor(ast)).toStrictEqual<Root>({
          type: 'root',
          children: [
            truncatedMathText,
            {
              type: 'text',
              value: '$12.5我我我我我我我我我我我$',
            },
          ],
        });
      });

      test('末尾是单行公式，返回用段落单独包裹的原内容的文本', () => {
        const ast: Root = {
          type: 'root',
          children: [
            truncatedMathText,
            {
              type: 'math',
              value: '12.5我我我我我我我我我我我',
            },
          ],
        };

        expect(processor(ast)).toStrictEqual<Root>({
          type: 'root',
          children: [
            truncatedMathText,
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '$$12.5我我我我我我我我我我我$$',
                },
              ],
            },
          ],
        });
      });
    });
  });

  describe('末尾为公式节点时，假如能找到其最小合法公式，则转换为最小合法公式内容的公式节点', () => {
    test('为单行公式时，转换成段落包裹的行内公式', () => {
      const ast: Root = {
        type: 'root',
        children: [
          truncatedMathText,
          {
            type: 'math',
            meta: 'V=\\frac{1}{3}\\times l^2\\times h^2\\tim',
            value: '',
          },
        ],
      };

      expect(processor(ast)).toStrictEqual<Root>({
        type: 'root',
        children: [
          truncatedMathText,
          {
            type: 'paragraph',
            children: [
              {
                type: 'inlineMath',
                value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
              },
            ],
          },
        ],
      });
    });

    test('为行内公式时，转换不改变其类型', () => {
      const ast: Root = {
        type: 'root',
        children: [
          truncatedMathText,
          {
            type: 'inlineMath',
            value: 'V=\\frac{1}{3}\\times l^2\\times h^2\\tim',
          },
        ],
      };

      expect(processor(ast)).toStrictEqual<Root>({
        type: 'root',
        children: [
          truncatedMathText,
          {
            type: 'inlineMath',
            value: 'V=\\frac{1}{3}\\times l^2\\times h^2',
          },
        ],
      });
    });
  });

  test('末尾为公式节点时，最小合法公式为空，则删除此节点', () => {
    const ast: Root = {
      type: 'root',
      children: [
        truncatedMathText,
        {
          type: 'math',
          value: '\\',
        },
      ],
    };

    expect(processor(ast)).toStrictEqual<Root>({
      type: 'root',
      children: [truncatedMathText],
    });
  });
});
