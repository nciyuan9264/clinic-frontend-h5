import { expectAutofix } from './utils';

describe('图片斜体标题设置', () => {
  test('启用选项，验证设置成功', async () => {
    await expectAutofix(
      [
        {
          current: `
before
![Alt Text](https://pic1.zhimg.com/v2-b444070848d54baf536222b22a51fba4_b.jpg)
*replaced*
after
      `.trim(),
          fixto: `
before
![replaced](https://pic1.zhimg.com/v2-b444070848d54baf536222b22a51fba4_b.jpg)
after
      `,
        },
      ],
      {
        imageEmphasisTitle: true,
      },
    );
  });

  test('不启用选项，验证设置失败', async () => {
    await expectAutofix([
      {
        current: `
before
![Alt Text](https://pic1.zhimg.com/v2-b444070848d54baf536222b22a51fba4_b.jpg)
*replaced*
after
      `.trim(),
        fixto: `
before
![Alt Text](https://pic1.zhimg.com/v2-b444070848d54baf536222b22a51fba4_b.jpg)
*replaced*
after
      `,
      },
    ]);
  });
});
