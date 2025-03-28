import type { KatexOptions, default as katex } from 'katex';

import { texPreProcessor } from './processor';

export type KatexType = typeof katex;

interface TexMathResult {
  type: 'inline' | 'block';
  mathText: string;
  endIndex: number;
}

/**
 * 数学公式提取算法
 * 源自：[Pandoc TeX Math](https://pandoc.org/MANUAL.html#math)
 * 移植自：[StackEdit源码](https://github.com/benweet/stackedit/blob/HEAD/src/extensions/libs/markdownItMath.js)
 */
export const texMathExtract = (src: string): TexMathResult | undefined => {
  let startMathPos = 0;
  if (src.charCodeAt(startMathPos) !== 0x24 /* $ */) {
    return;
  }

  // Parse tex math according to http://pandoc.org/README.html#math
  let endMarker = '$';
  startMathPos += 1;
  const afterStartMarker = src.charCodeAt(startMathPos);
  if (afterStartMarker === 0x24 /* $ */) {
    endMarker = '$$';
    startMathPos += 1;
    if (src.charCodeAt(startMathPos) === 0x24 /* $ */) {
      // 3 markers are too much
      return;
    }
  } else if (
    // Skip if opening $ is succeeded by a space character
    afterStartMarker === 0x20 /* space */ ||
    afterStartMarker === 0x09 /* \t */ ||
    afterStartMarker === 0x0a /* \n */
  ) {
    return;
  }
  const endMarkerPos = src.indexOf(endMarker, startMathPos);
  if (endMarkerPos === -1) {
    return;
  }
  if (src.charCodeAt(endMarkerPos - 1) === 0x5c /* \ */) {
    return;
  }
  const nextPos = endMarkerPos + endMarker.length;
  if (endMarker.length === 1) {
    // Skip if $ is preceded by a space character
    const beforeEndMarker = src.charCodeAt(endMarkerPos - 1);
    if (
      beforeEndMarker === 0x20 /* space */ ||
      beforeEndMarker === 0x09 /* \t */ ||
      beforeEndMarker === 0x0a /* \n */
    ) {
      return;
    }
    // Skip if closing $ is succeeded by a digit (eg $5 $10 ...)
    const suffix = src.charCodeAt(nextPos);
    if (suffix >= 0x30 && suffix < 0x3a) {
      return;
    }
  }

  return {
    type: endMarker.length === 1 ? 'inline' : 'block',
    mathText: src.slice(startMathPos, endMarkerPos),
    endIndex: nextPos,
  };
};

const katexTryParseOptions: KatexOptions = {
  throwOnError: true,
  strict: true,
  output: 'mathml',
  trust: false,
};

const katexCheckTex = (katex: KatexType, tex: string) => {
  try {
    katex.renderToString(texPreProcessor(tex), katexTryParseOptions);

    return true;
  } catch (error) {
    if (error instanceof katex.ParseError) {
      return false;
    }

    throw error;
  }
};

const katexParseErrorIndex = (katex: KatexType, src: string) => {
  try {
    katex.renderToString(texPreProcessor(src), katexTryParseOptions);
  } catch (error) {
    if (error instanceof katex.ParseError) {
      return error.position;
    }
  }
};

const customCheckTex = (tex: string) => {
  const illegalPatterns = [/\([^\)]*$/];

  return !illegalPatterns.some((item) => item.test(tex));
};

export interface CheckTexParams {
  tex: string;
  katex: KatexType;
}

export const checkTex = ({ tex, katex }: CheckTexParams) => {
  return (
    katexCheckTex(katex, tex) && customCheckTex(tex)
    /** 如下方式非常耗性能，在checkTexCustomLegal没有很多badcase的情况下，暂不开启下面的mathjax合法性检查 */
    // && checkMathjaxLegal(tex)
  );
};

export interface FindMaxLegalPrefixEndIndexParams {
  src: string;
  katex: KatexType;
}

export const findMaxLegalPrefixEndIndex = ({
  src,
  katex,
}: FindMaxLegalPrefixEndIndexParams) => {
  let index = katexParseErrorIndex(katex, src) ?? src.length;

  while (index >= 0) {
    const subKatex = src.slice(0, index);

    if (
      checkTex({
        tex: subKatex,
        katex,
      })
    ) {
      return index;
    }

    index -= 1;
  }

  return index;
};
