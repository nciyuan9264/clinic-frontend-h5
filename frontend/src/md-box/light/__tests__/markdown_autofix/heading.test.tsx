import { expectAutofix } from './utils';

/**
 * 见[Flow三端Markdown标准完备测试集](https://bytedance.feishu.cn/wiki/VjE0w7UNkiImKpkVYUdcObCdneA)
 */
test('标题自动修复', async () => {
  await expectAutofix([
    {
      current: String.raw`first line
#`,
      fixto: String.raw`first line`,
    },
    {
      current: String.raw`# 这是标题`,
      fixto: String.raw`# 这是标题`,
    },
  ]);
});
