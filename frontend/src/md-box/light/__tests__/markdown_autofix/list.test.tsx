import { expectAutofix } from './utils';

// eslint-disable-next-line max-lines-per-function
describe('有序列表自动修复测试', () => {
  test('可能是列表前缀的内容在列表项内，验证成功去除', async () => {
    await expectAutofix([
      {
        current: `
1. first
2. second
3
`.trim(),
        fixto: `
1. first
2. second
`.trim(),
      },
      {
        current: `
1. first
2. second
3.
`.trim(),
        fixto: `
1. first
2. second
3.
`.trim(),
      },
      {
        current: `
1. first
2. second
3. t
`.trim(),
        fixto: `
1. first
2. second
3. t
`.trim(),
      },
    ]);
  });

  test('可能是列表前缀的内容在列表项外新起一个段落，验证成功去除', async () => {
    await expectAutofix([
      {
        current: `
1. first
2. second

3
`.trim(),
        fixto: `
1. first
2. second
`.trim(),
      },
      {
        current: `
1. first
2. second

3.
`.trim(),
        fixto: `
1. first
2. second

3.
`.trim(),
      },
      {
        current: `
1. first
2. second

3. t
`.trim(),
        fixto: `
1. first
2. second

3. t
`.trim(),
      },
    ]);
  });

  test('可能是列表前缀的内容在已有段落后出现，验证成功去除', async () => {
    /** 可能是列表前缀的内容在段落后 */
    await expectAutofix([
      {
        current: `
this is paragraph
1.`,
        fixto: `
this is paragraph
`,
      },
      {
        current: `
this is paragraph
1. `,
        fixto: `
this is paragraph
1. `,
      },
      {
        current: `
this is paragraph
-   `,
        fixto: `
this is paragraph
`,
      },
      {
        current: `
this is paragraph
-  bullet item `,
        fixto: `
this is paragraph
- bullet item`,
      },
    ]);
  });
});
