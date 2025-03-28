import { expectAutofix } from './utils';

/**
 * 见[Flow三端Markdown标准完备测试集](https://bytedance.feishu.cn/wiki/VjE0w7UNkiImKpkVYUdcObCdneA)
 */
test('html自动修复', async () => {
  await expectAutofix([
    {
      current: [
        '<',
        '<img',
        '<img /',
        '<img src',
        '<img src=',
        '<img src="',
        '<img src="abc',
        '<img src="abc"',
        '<img src="abc"/',
        '<img src="abc" alt="test',
        '<img src="abc" alt="test"',
        '<img src="abc" alt="test"/',
        '</',
        '</img',
        '<img data-key',
        '<img data-key=',
        '<img data-key="',
        '<img data-key="abc',
        '<img data-key="abc"',
        '<img data-key="abc"/',
      ],
      fixto: '',
    },
    {
      current: '<span>spaned text</span>',
      fixto: '<span>spaned text</span>',
    },
  ]);
});
