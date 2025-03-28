import { expectAutofix } from './utils';

test('加粗自动修复测试', async () => {
  await expectAutofix([
    {
      current: '**content',
      fixto: '**content**',
    },
    {
      current: '**content*',
      fixto: '**content**',
    },
    {
      current: 'prefix**content',
      fixto: 'prefix**content**',
    },
    {
      current: 'prefix**content*',
      fixto: 'prefix**content**',
    },
    {
      current: `prefix
*
      `.trim(),
      fixto: 'prefix',
    },
  ]);
});
