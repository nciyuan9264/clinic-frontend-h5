/**
 * 支持latex公式能力
 * 对行内公式和块级公式进行区分支持
 * 在markdown文本中提取latex表达式遵循[pandoc规范](https://pandoc.org/MANUAL.html#math)
 */
import { TokenizerAndRendererExtension } from 'marked';

import {
  renderBlockMathSpanString,
  renderInlineMathSpanString,
  texMathExtract,
} from '../common';

export const inlineTex = (): TokenizerAndRendererExtension => {
  return {
    name: 'inlineTex',
    level: 'inline',
    start(src) {
      return /\$([^\$]|$)/.exec(src)?.index;
    },
    tokenizer(src) {
      const texMathResult = texMathExtract(src);
      if (!texMathResult) {
        return;
      }
      const { type, endIndex, mathText } = texMathResult;
      if (type !== 'inline') {
        return;
      }
      return {
        type: 'inlineTex',
        raw: src.slice(0, endIndex),
        mathText,
      };
    },
    renderer(token) {
      return renderInlineMathSpanString(token.mathText);
    },
  };
};

export const displayTex = (): TokenizerAndRendererExtension => {
  return {
    name: 'displayTex',
    level: 'block',
    start(src) {
      return /\$\$[^\$]+\$\$/.exec(src)?.index;
    },
    tokenizer(src) {
      const texMathResult = texMathExtract(src);
      if (!texMathResult) {
        return;
      }
      const { type, endIndex, mathText } = texMathResult;
      if (type !== 'block') {
        return;
      }
      return {
        type: 'displayTex',
        raw: src.slice(0, endIndex),
        mathText,
      };
    },
    renderer(token) {
      return renderBlockMathSpanString(token.mathText);
    },
  };
};
