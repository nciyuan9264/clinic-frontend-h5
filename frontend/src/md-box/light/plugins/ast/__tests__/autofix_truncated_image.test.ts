import { generateAstStringProcessor } from './utils';
import { AutofixTruncatedImageAstPlugin } from '../autofix_truncated_image';

// eslint-disable-next-line max-lines-per-function
describe('规格化被截断的图片（autofixTruncatedImage）', () => {
  const reformat = generateAstStringProcessor(AutofixTruncatedImageAstPlugin);

  const reformatWithRemoveTruncated = generateAstStringProcessor(
    AutofixTruncatedImageAstPlugin,
    { removeTruncatedImage: true },
  );

  test('普通文本', () => {
    expect(reformat('这是一行普通文本')).toBe('这是一行普通文本');
  });

  test('仅有感叹号', () => {
    expect(reformat('这是一行普通文本的!')).toBe('这是一行普通文本的');
  });

  describe('被截断时条件保留空图片', () => {
    test('图片没有文本部分', () => {
      expect(reformat('这是一行普通文本的![')).toBe(
        '这是一行普通文本的![image]()',
      );
    });

    test('图片的文本部分不完整', () => {
      expect(reformat('这是一行普通文本的![图片')).toBe(
        '这是一行普通文本的![图片]()',
      );
    });

    test('图片仅有文本部分', () => {
      expect(reformat('这是一行普通文本的![]')).toBe(
        '这是一行普通文本的![image]()',
      );

      expect(reformat('这是一行普通文本的![图片1]')).toBe(
        '这是一行普通文本的![图片1]()',
      );
    });

    test('图片的图片部分不完整', () => {
      expect(reformat('这是一行普通文本的![](http://byte')).toBe(
        '这是一行普通文本的![image]()',
      );

      expect(reformat('这是一行普通文本的![图片1](http://byte')).toBe(
        '这是一行普通文本的![图片1]()',
      );
    });
  });

  describe('被截断时直接删除截断的部分', () => {
    test('图片没有文本部分', () => {
      expect(reformatWithRemoveTruncated('这是一行普通文本的![')).toBe(
        '这是一行普通文本的',
      );
    });

    test('图片的文本部分不完整', () => {
      expect(reformatWithRemoveTruncated('这是一行普通文本的![图片')).toBe(
        '这是一行普通文本的',
      );
    });

    test('图片仅有文本部分', () => {
      expect(reformatWithRemoveTruncated('这是一行普通文本的![]')).toBe(
        '这是一行普通文本的',
      );

      expect(reformatWithRemoveTruncated('这是一行普通文本的![图片1]')).toBe(
        '这是一行普通文本的',
      );
    });

    test('图片的图片部分不完整', () => {
      expect(
        reformatWithRemoveTruncated('这是一行普通文本的![](http://byte'),
      ).toBe('这是一行普通文本的');

      expect(
        reformatWithRemoveTruncated('这是一行普通文本的![图片1](http://byte'),
      ).toBe('这是一行普通文本的');
    });
  });

  test('完整的图片', () => {
    expect(reformat('这是一行普通文本的![](http://bytedance.net)')).toBe(
      '这是一行普通文本的![](http://bytedance.net)',
    );

    expect(reformat('这是一行普通文本的![图片1](http://bytedance.net)')).toBe(
      '这是一行普通文本的![图片1](http://bytedance.net)',
    );
  });

  test('仅修复最后的不完整图片，不影响其他的“不完整图片”，防止误伤', () => {
    expect(
      reformat(`第一行[其他文本

第二行![截断的不完整图片`),
    ).toBe(
      `第一行\\[其他文本

第二行![截断的不完整图片]()`,
    );

    expect(
      reformat(`第一行[其他文本

第二行![完整图片](https://bytedance.net)`),
    ).toBe(
      `第一行\\[其他文本

第二行![完整图片](https://bytedance.net)`,
    );
  });
});
