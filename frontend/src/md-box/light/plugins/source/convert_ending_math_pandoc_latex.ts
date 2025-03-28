import { isUndefined } from 'lodash-es';

import {
  BaseSourcePlugin,
  findMaxLegalPrefixEndIndex,
  renderBlockMathSpanString,
  renderInlineMathSpanString,
  SourcePluginConfig,
  SourcePluginModifier,
} from '../../utils';

export class ConvertEndingMathPandocLatexSourcePlugin extends BaseSourcePlugin {
  name = 'convert_ending_math_pandoc_latex';

  config: SourcePluginConfig = {
    fixEndingOnly: true,
  };

  modifier: SourcePluginModifier[] = [
    /** 行内公式 */
    ({ source, katex }) => {
      if (!katex) {
        return source;
      }

      const matchResult = source.match(/\\\((?<ending>[\s\S]*?)$/);

      if (!matchResult?.groups || isUndefined(matchResult.index)) {
        return source;
      }

      const mathText = matchResult.groups.ending ?? '';

      if (mathText.match(/((\\\()|(\\\)))/)) {
        return source;
      }

      const legalPrefix = mathText
        .slice(0, findMaxLegalPrefixEndIndex({ src: mathText, katex }))
        .trim();

      const srcPrefix = source.slice(0, matchResult.index);

      if (!legalPrefix) {
        return srcPrefix;
      }

      return `${srcPrefix}${renderInlineMathSpanString(legalPrefix)}`;
    },
    /** 块公式 */
    ({ source, katex }) => {
      if (!katex) {
        return source;
      }

      const matchResult = source.match(/\\\[(?<ending>[\s\S]*?)$/);

      if (!matchResult?.groups || isUndefined(matchResult.index)) {
        return source;
      }

      const mathText = matchResult.groups.ending ?? '';

      if (mathText.match(/((\\\[)|(\\\]))/)) {
        return source;
      }

      const legalPrefix = mathText
        .slice(0, findMaxLegalPrefixEndIndex({ src: mathText, katex }))
        .trim();

      const srcPrefix = source.slice(0, matchResult.index);

      if (!legalPrefix) {
        return srcPrefix;
      }

      return `${srcPrefix}${renderBlockMathSpanString(legalPrefix)}`;
    },
  ];
}
