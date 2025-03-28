import { Root } from 'mdast';

import { generateAstProcessor } from './utils';
import {
  AutofixTruncatedHtmlTagAstPlugin,
  truncateTruncatedHtmlSuffix,
} from '../autofix_truncated_html_tag';

describe('对末尾有不完整的html标签进行切除', () => {
  test('不完整的头部标签', () => {
    expect(truncateTruncatedHtmlSuffix('prefix<')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img/')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img /')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src=')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src="')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc"')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc"/')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc" /')).toBe(
      'prefix',
    );
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc" alt')).toBe(
      'prefix',
    );
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc" alt="')).toBe(
      'prefix',
    );
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc" alt="test')).toBe(
      'prefix',
    );
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc" alt="test"')).toBe(
      'prefix',
    );
    expect(
      truncateTruncatedHtmlSuffix('prefix<img src="abc" alt="test"/'),
    ).toBe('prefix');
    expect(
      truncateTruncatedHtmlSuffix('prefix<img src="abc" alt="test" /'),
    ).toBe('prefix');
  });

  test('不完整的尾部标签', () => {
    expect(truncateTruncatedHtmlSuffix('prefix</')).toBe('prefix');
    expect(truncateTruncatedHtmlSuffix('prefix</img')).toBe('prefix');
  });

  test('完整末尾不切除', () => {
    expect(truncateTruncatedHtmlSuffix('prefix<img>')).toBe('prefix<img>');
    expect(truncateTruncatedHtmlSuffix('prefix<img/>')).toBe('prefix<img/>');
    expect(truncateTruncatedHtmlSuffix('prefix<img />')).toBe('prefix<img />');
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc"/>')).toBe(
      'prefix<img src="abc"/>',
    );
    expect(truncateTruncatedHtmlSuffix('prefix<img src="abc" />')).toBe(
      'prefix<img src="abc" />',
    );

    expect(truncateTruncatedHtmlSuffix('prefix</img>')).toBe('prefix</img>');
  });

  test('正常末尾不受影响', () => {
    expect(truncateTruncatedHtmlSuffix('prefix')).toBe('prefix');
  });
});

describe('对末尾有不完整html标签的语法树进行规格化', () => {
  const processor = generateAstProcessor(AutofixTruncatedHtmlTagAstPlugin);

  test('不完整的标签', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: 'prefix<img src="abc" /',
        },
      ],
    };

    expect(processor(example)).toStrictEqual<Root>({
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: 'prefix',
        },
      ],
    });
  });

  test('完整末尾不受影响', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: 'prefix<img src="abc"/>',
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });

  test('其他场景不受影响', () => {
    const example: Root = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: 'first',
        },
        {
          type: 'code',
          value: 'console.log(123)',
        },
        {
          type: 'text',
          value: 'prefix',
        },
      ],
    };

    expect(processor(example)).toStrictEqual(example);
  });
});
