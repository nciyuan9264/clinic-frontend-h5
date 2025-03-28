import type { Content } from 'mdast';
import { concat, isString } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isParent,
  texMathExtract,
  isLiteralOfContent,
  findMaxLegalPrefixEndIndex,
} from '../../utils';
import { isNumeric } from '../../../utils';

const indexOfFirstLegalDollar = (src: string) => {
  const matchResult = src.match(/(?<prefix>[^\$\\]|^)(\$|\$\$)(?!\$)/);
  if (!matchResult) {
    return -1;
  }
  const { index = 0 } = matchResult;
  const prefix = matchResult?.groups?.prefix;
  if (!isString(prefix)) {
    return -1;
  }
  return index + prefix.length;
};

const lengthOfDollorPrefix = (src: string) => {
  const matchResult = src.match(/^\$*/);

  if (!matchResult) {
    return 0;
  }

  return matchResult[0].length;
};

export const findStartIndexOfNoneTexSuffix = (src: string) => {
  let currentIndex: number = indexOfFirstLegalDollar(src);

  let startIndexOfNoneTex = 0;

  let isCustomMoved = true;

  while (currentIndex !== -1) {
    const texMathResult = texMathExtract(src.slice(currentIndex));

    if (texMathResult) {
      const { endIndex } = texMathResult;

      currentIndex += endIndex;

      isCustomMoved = false;

      startIndexOfNoneTex = currentIndex;
    } else {
      const subIndex = indexOfFirstLegalDollar(src.slice(currentIndex));

      if (subIndex === -1) {
        break;
      }

      if (isCustomMoved) {
        currentIndex += Math.max(
          subIndex,
          lengthOfDollorPrefix(src.slice(currentIndex)),
        );
      } else {
        currentIndex += subIndex;
      }

      isCustomMoved = true;
    }
  }

  return startIndexOfNoneTex;
};

/** 假如合法公式前缀仅为纯数字，且此数字后有不能被进一步公式解析的字符串超过此数字时，暂停自动修复 */
const RAW_NUMBER_REST_STRING_LENGTH_THRESHOLD = 10;

const enSentenceRegexFullMatch = /^[0-9a-zA-Z\s"'\.,\-\(\)]$/;

const enSentenceRegexWithCountOfPrefixMatch = /^[0-9a-zA-Z\s"'\.,\-\(\)]{15}/;

const unpairedLongMathRegex = /^\s*(\\begin)/;

const shouldStopAutofix = (value: string, maxLegalPrefixLen: number) => {
  const trimedValue = value.trim();

  const subLegalString = trimedValue.slice(0, maxLegalPrefixLen);

  const totalLength = trimedValue.length;

  if (unpairedLongMathRegex.exec(trimedValue)) {
    return false;
  }

  if (!subLegalString || isNumeric(subLegalString)) {
    return (
      totalLength - maxLegalPrefixLen > RAW_NUMBER_REST_STRING_LENGTH_THRESHOLD
    );
  }

  if (
    enSentenceRegexFullMatch.exec(subLegalString) &&
    totalLength - maxLegalPrefixLen > RAW_NUMBER_REST_STRING_LENGTH_THRESHOLD
  ) {
    return true;
  }

  if (enSentenceRegexWithCountOfPrefixMatch.exec(subLegalString)) {
    return true;
  }

  return false;
};

export class AutofixTruncatedTexMathDollarAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_tex_math_dollar';

  config: AstPluginConfig = {
    order: 'in_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop, katex }) => {
    if (!katex || isParent(item)) {
      return;
    }

    if (isLiteralOfContent(item)) {
      /** 找到位置在最后的Literal叶子结点后，无论是否匹配，都不进行下一次迭代，因为本函数仅处理末尾被截断的公式 */
      stop();
    }

    if (item.type === 'text') {
      const startIndex = findStartIndexOfNoneTexSuffix(item.value);

      const matchedResult = item.value
        .slice(startIndex)
        .match(
          /^(?<prefix>[\s\S]*?([^\$\\]|^))(?<inter>\$|\$\$)(?!\$)(?<value>[^\$]*?)(?<suffix>\$*)$/,
        );

      const groups = matchedResult?.groups;

      if (!groups) {
        return;
      }

      const { prefix, value } = groups;

      const maxLegalPrefixLen = findMaxLegalPrefixEndIndex({
        src: value,
        katex,
      });

      if (shouldStopAutofix(value, maxLegalPrefixLen)) {
        return;
      }

      const mathContent = value.slice(0, maxLegalPrefixLen).trim();

      const summaryPrefix = `${item.value.slice(0, startIndex)}${prefix}`;

      insertAfter(
        concat<Content>(
          summaryPrefix
            ? {
                type: 'text',
                value: summaryPrefix,
              }
            : [],
          mathContent
            ? {
                type: 'inlineMath',
                value: mathContent,
              }
            : [],
        ),
        true,
      );
    } else if (item.type === 'inlineMath' || item.type === 'math') {
      const rawValue =
        item.type === 'math' ? item.meta ?? item.value : item.value;

      const maxLegalPrefixLen = findMaxLegalPrefixEndIndex({
        src: rawValue,
        katex,
      });

      if (shouldStopAutofix(rawValue, maxLegalPrefixLen)) {
        const insertingContent: Content =
          item.type === 'inlineMath'
            ? {
                type: 'text',
                value: `$${rawValue}$`,
              }
            : {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: `$$${rawValue}$$`,
                  },
                ],
              };

        insertAfter([insertingContent], true);
        return;
      }

      const mathContent = rawValue.slice(0, maxLegalPrefixLen).trim();

      const insertingContent: Content =
        item.type === 'inlineMath'
          ? {
              type: 'inlineMath',
              value: mathContent,
            }
          : {
              type: 'paragraph',
              children: [
                {
                  type: 'inlineMath',
                  value: mathContent,
                },
              ],
            };

      insertAfter(mathContent ? [insertingContent] : [], true);
    }
  };
}
