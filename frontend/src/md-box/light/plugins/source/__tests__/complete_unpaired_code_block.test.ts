import { generateSourceProcessor } from './utils';
import { CompleteUnpairedCodeBlockSourcePlugin } from '../complete_unpaired_code_block';

describe('自动补全未匹配的代码块', () => {
  const processor = generateSourceProcessor(
    CompleteUnpairedCodeBlockSourcePlugin,
  );

  test('当全都匹配时，不补全', () => {
    const str = `
first line
\`\`\`
first code content
\`\`\`
second line
\`\`\`
second code content
\`\`\`
third line
    `;
    expect(processor(str)).toBe(str);
  });

  test('当发现不匹配时，末尾拼接使其匹配', () => {
    const str = `
first line
\`\`\`
first code content
\`\`\`
second line
\`\`\`
second code content
    `;

    expect(processor(str)).toBe(`
first line
\`\`\`
first code content
\`\`\`
second line
\`\`\`
second code content
\`\`\``);
  });
});
