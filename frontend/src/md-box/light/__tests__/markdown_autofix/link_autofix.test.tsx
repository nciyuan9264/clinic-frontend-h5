import { expectAutofix } from './utils';

/**
 * 见[Flow三端Markdown标准完备测试集](https://bytedance.feishu.cn/wiki/VjE0w7UNkiImKpkVYUdcObCdneA)
 */
test('链接自动修复测试', async () => {
  await expectAutofix([
    {
      current: 'prefix[',
      fixto: 'prefix',
    },
    {
      current: ['prefix[abc', 'prefix[abc]', 'prefix[abc](https://byte'],
      fixto: 'prefix[abc](#)',
    },
    {
      current: 'prefix[abc](https://bytedance.com)',
      fixto: 'prefix[abc](https://bytedance.com)',
    },
  ]);
});
