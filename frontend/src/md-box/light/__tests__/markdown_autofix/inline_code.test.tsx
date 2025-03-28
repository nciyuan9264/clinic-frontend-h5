import { expectAutofix } from './utils';

/**
 * 见[Flow三端Markdown标准完备测试集](https://bytedance.feishu.cn/wiki/VjE0w7UNkiImKpkVYUdcObCdneA)
 */
test('内联代码块自动修复', async () => {
  await expectAutofix([
    {
      current: 'prefix`abcdef',
      fixto: 'prefix`abcdef`',
    },
    {
      current: 'prefix`abcdef`',
      fixto: 'prefix`abcdef`',
    },
  ]);
});
