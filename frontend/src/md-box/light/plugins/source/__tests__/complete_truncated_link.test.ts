import { generateSourceProcessor } from './utils';
import { CompleteTruncatedLinkSourcePlugin } from '../complete_truncated_link';

describe('自动补全末尾不完整链接', () => {
  const processor = generateSourceProcessor(CompleteTruncatedLinkSourcePlugin);

  test('匹配时补全', () => {
    expect(processor('187212793123[baidu](123')).toBe('187212793123[baidu](#)');
  });

  test('不匹配时不补全', () => {
    expect(processor('187212793123[baid')).toBe('187212793123[baid');
  });

  test('不影响图片格式', () => {
    expect(processor('187212793123![baidu](123')).toBe(
      '187212793123![baidu](123',
    );
  });
});
