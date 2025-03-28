import katex from 'katex';

import { checkTex, findMaxLegalPrefixEndIndex } from '../common';

describe('验证公式合法（checkTex）', () => {
  test('合法公式', () => {
    expect(
      checkTex({
        tex: 'V=\\frac{1}{3}\\times l^2\\times h^2\\times\\frac{1-h^2}{h^2}',
        katex,
      }),
    ).toBe(true);
  });

  describe('不合法公式', () => {
    test('tex参数不完整', () => {
      expect(
        checkTex({
          tex: 'V=\\frac{1}{3}\\times l^2\\times h^2\\times\\frac',
          katex,
        }),
      ).toBe(false);
    });

    test('不完整圆括号，即使katex算合法，仍然将其视为不合法', () => {
      expect(
        checkTex({
          tex: 'y=2\\cos',
          katex,
        }),
      ).toBe(true);

      expect(
        checkTex({
          tex: 'y=2\\cos (',
          katex,
        }),
      ).toBe(false);

      expect(
        checkTex({
          tex: 'y=2\\cos (0.5',
          katex,
        }),
      ).toBe(false);

      expect(
        checkTex({
          tex: 'y=2\\cos (0.5)',
          katex,
        }),
      ).toBe(true);
    });
  });
});

describe('找到最大合法公式长度（findMaxLegalPrefixEndIndex）', () => {
  test('基础测试', () => {
    const target = 'V=\\frac{1}{3}\\times l^2\\times h^2\\times\\frac';

    const index = findMaxLegalPrefixEndIndex({
      src: target,
      katex,
    });

    expect(target.slice(0, index)).toBe(
      'V=\\frac{1}{3}\\times l^2\\times h^2\\times',
    );
  });
});
