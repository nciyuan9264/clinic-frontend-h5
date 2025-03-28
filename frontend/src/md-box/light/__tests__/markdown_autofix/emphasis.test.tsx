import { expectAutofix } from './utils';

test('斜体自动修复测试', async () => {
  await expectAutofix([
    {
      current: '*content',
      fixto: '*content*',
    },
    {
      current: 'prefix*content',
      fixto: 'prefix*content*',
    },
  ]);
});
