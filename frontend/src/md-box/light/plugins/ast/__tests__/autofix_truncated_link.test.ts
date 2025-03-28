import { generateAstStringProcessor } from './utils';
import { AutofixTruncatedLinkAstPlugin } from '../autofix_truncated_link';

describe('规格化被截断的链接（autofixTruncatedLink）', () => {
  const reformat = generateAstStringProcessor(AutofixTruncatedLinkAstPlugin);

  test('普通文本', () => {
    expect(reformat('这是一行普通文本')).toBe('这是一行普通文本');
  });

  test('链接没有文本部分', () => {
    expect(reformat('这是一行普通文本的[')).toBe('这是一行普通文本的');

    expect(reformat('这是一行普通文本的[[')).toBe('这是一行普通文本的[\\[](#)');
  });

  test('链接的文本部分不完整', () => {
    expect(reformat('这是一行普通文本的[链接')).toBe(
      '这是一行普通文本的[链接](#)',
    );

    expect(reformat('这是一行普通文本的[[123')).toBe(
      '这是一行普通文本的[\\[123](#)',
    );
  });

  test('链接仅有文本部分', () => {
    expect(reformat('这是一行普通文本的[链接1]')).toBe(
      '这是一行普通文本的[链接1](#)',
    );

    expect(reformat('这是一行普通文本的[[123]]')).toBe(
      '这是一行普通文本的[\\[123\\]](#)',
    );
  });

  test('链接的链接部分不完整', () => {
    expect(reformat('这是一行普通文本的[链接1](http://byte')).toBe(
      '这是一行普通文本的[链接1](#)',
    );

    expect(reformat('这是一行普通文本的[[123]](http://byte')).toBe(
      '这是一行普通文本的[\\[123\\]](#)',
    );
  });

  test('完整的链接', () => {
    expect(reformat('这是一行普通文本的[链接1](http://bytedance.net)')).toBe(
      '这是一行普通文本的[链接1](http://bytedance.net)',
    );

    expect(reformat('这是一行普通文本的[[123]](http://bytedance.net)')).toBe(
      '这是一行普通文本的[\\[123\\]](http://bytedance.net)',
    );
  });

  test('仅消除最后的不完整链接，不影响其他的“不完整链接”，防止误伤', () => {
    expect(
      reformat(`第一行[其他文本

第二行[截断的不完整链接`),
    ).toBe(
      `第一行\\[其他文本

第二行[截断的不完整链接](#)`,
    );

    expect(
      reformat(`第一行[其他文本

第二行[完整链接](https://bytedance.net)`),
    ).toBe(
      `第一行\\[其他文本

第二行[完整链接](https://bytedance.net)`,
    );

    /** 多行时只修复最后一行 */
    expect(
      reformat(`第一行[其他文本
第二行[其他文本`),
    ).toBe(
      `第一行\\[其他文本
第二行[其他文本](#)`,
    );

    /** 不完整链接在非末尾行且末尾行无不完整链接时，不修复 */
    expect(
      reformat(`第一行[其他文本
第二行`),
    ).toBe(
      `第一行\\[其他文本
第二行`,
    );
  });
});
