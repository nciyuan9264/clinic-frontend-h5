import { expectAutofix } from './utils';

/**
 * 见[Flow三端Markdown标准完备测试集](https://bytedance.feishu.cn/wiki/VjE0w7UNkiImKpkVYUdcObCdneA)
 */
test('代码块自动修复', async () => {
  await expectAutofix([
    {
      current: [
        `
\`\`\`
print('hello')
`,
      ],
      fixto: `
\`\`\`plaintext
print('hello')
\`\`\`
      `,
    },
    {
      current: [
        `
\`\`\`python
print('hello')
`,
      ],
      fixto: `
\`\`\`python
print('hello')
\`\`\`
      `,
    },
    {
      current: [
        `
\`\`\`
print('hello')
\`
`,
        `
\`\`\`
print('hello')
\`\`
`,
        `
\`\`\`
print('hello')
\`\`\`
`,
      ],
      fixto: `
\`\`\`
print('hello')
\`\`\`
      `,
    },
  ]);
});
