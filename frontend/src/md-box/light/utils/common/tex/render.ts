import { Buffer } from 'buffer';

import { texPreProcessor } from './processor';
import { removeInsertElementSlotInString } from '../slots';

export const INLINE_MATH_SPAN_DATA_TYPE = 'inline-math';
export const BLOCK_MATH_SPAN_DATA_TYPE = 'block-math';

const renderSpanString = (type: string, value: string) => {
  return `<span data-type="${type}" data-value="${Buffer.from(value).toString(
    'base64',
  )}"></span>`;
};

export const renderInlineMathSpanString = (value: string) =>
  renderSpanString(
    INLINE_MATH_SPAN_DATA_TYPE,
    texPreProcessor(removeInsertElementSlotInString(value)),
  );

export const renderBlockMathSpanString = (value: string) =>
  renderSpanString(
    BLOCK_MATH_SPAN_DATA_TYPE,
    texPreProcessor(removeInsertElementSlotInString(value)),
  );

export const restoreMathPandocLatex = (src: string) => {
  return src
    .replace(
      new RegExp(
        `<span data-type="${INLINE_MATH_SPAN_DATA_TYPE}" data-value="(.*?)"></span>`,
        'g',
      ),
      (_firstMatch: string, secondMatch: string) => {
        return String.raw`\(${Buffer.from(secondMatch, 'base64').toString(
          'utf8',
        )}\)`;
      },
    )
    .replace(
      new RegExp(
        `<span data-type="${BLOCK_MATH_SPAN_DATA_TYPE}" data-value="(.*?)"></span>`,
        'g',
      ),
      (_firstMatch: string, secondMatch: string) => {
        return String.raw`\[${Buffer.from(secondMatch, 'base64').toString(
          'utf8',
        )}\]`;
      },
    );
};
