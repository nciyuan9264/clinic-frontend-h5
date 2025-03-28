import { generateAstStringProcessor } from './utils';
import { RemoveCocoLinkInCodeblockAstPlugin } from '../remove_coco_link_in_code_block';

describe('删除代码块中的Coco链接（removeCocoLinkInCodeblock）', () => {
  const reformat = generateAstStringProcessor(
    RemoveCocoLinkInCodeblockAstPlugin,
  );

  test('普通代码块', () => {
    expect(
      reformat(`\`\`\`javascript
function greet() {
    [console](coco://testcocolink).log("Hello, World!");
}

greet();
\`\`\``),
    ).toBe(
      `\`\`\`javascript
function greet() {
    console.log("Hello, World!");
}

greet();
\`\`\``,
    );
  });

  test('内联代码块', () => {
    expect(
      reformat(
        '这是内联代码块`window.[console](coco://testcocolink).log("Hello, World!");`。',
      ),
    ).toBe('这是内联代码块`window.console.log("Hello, World!");`。');
  });
});
