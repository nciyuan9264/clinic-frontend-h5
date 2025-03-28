import { expectAutofix } from './utils';

/**
 * 见[Flow三端Markdown标准完备测试集](https://bytedance.feishu.cn/wiki/VjE0w7UNkiImKpkVYUdcObCdneA)
 */
test('旧协议公式自动修复', async () => {
  await expectAutofix([
    {
      /** 自动裁剪 */
      current: String.raw`prefix$\frac{a}{\sin A} = \frac{b}{\sin`,
      fixto: String.raw`prefix$\frac{a}{\sin A} =$`,
    },
    {
      /** 裁剪时行内块公式转换行内公式： */
      current: String.raw`prefix$$W = Fd \cos\thet`,
      fixto: String.raw`prefix$W = Fd \cos$`,
    },
    /** 公式完整不进行裁剪 */
    {
      current: 'I have $100',
      fixto: 'I have $100$',
    },
    {
      current: [
        String.raw`$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}`,
        String.raw`$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}$`,
      ],
      fixto: String.raw`$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}$`,
    },
    {
      /** 不是公式，不进行裁剪 */
      current: String.raw`I have$ suffix`,
      fixto: String.raw`I have$ suffix`,
    },
  ]);
});

test('新协议公式自动修复', async () => {
  await expectAutofix([
    {
      /** 自动裁剪 */
      current: String.raw`prefix\(\frac{a}{\sin A} = \frac{b}{\sin`,
      fixto: String.raw`prefix\(\frac{a}{\sin A} =\)`,
    },
    {
      /** 裁剪时行内块公式转换行内公式： */
      current: String.raw`prefix\[W = Fd \cos\thet`,
      fixto: String.raw`prefix\(W = Fd \cos\)`,
    },
    /** 公式完整不进行裁剪 */
    {
      current: String.raw`I have \(100`,
      fixto: String.raw`I have \(100\)`,
    },
    {
      current: [
        String.raw`\(\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}`,
        String.raw`\(\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}\)`,
      ],
      fixto: String.raw`\(\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}\)`,
    },
  ]);
});
