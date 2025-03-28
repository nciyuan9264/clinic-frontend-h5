import type { Content } from 'mdast';
import { concat } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
} from '../../utils';

export class AutofixTruncatedImageAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_image';

  config: AstPluginConfig = {
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (
    item,
    { insertAfter, stop, removeTruncatedImage = false },
  ) => {
    const patterns = [
      /!$/,
      /!\[$/,
      /!\[(?<text>[^\]]*)$/,
      /!\[(?<text>[^\]]*)\]$/,
      /!\[(?<text>[^\]]*)\]\([^\)]*$/,
    ];

    const removePattern = removeTruncatedImage
      ? patterns
      : patterns.slice(0, 1);

    const truncatedImagePattern = removeTruncatedImage ? [] : patterns.slice(1);

    if (!isLiteralOfContent(item)) {
      return;
    }

    /** 找到位置在最后的literal后，无论是否匹配截断的链接，都不进行下一次迭代，因为本函数仅处理末尾被截断的链接 */
    stop();

    if (item.type !== 'text') {
      return;
    }

    const matchedTruncatedPattern = truncatedImagePattern.find((pattern) =>
      pattern.exec(item.value),
    );

    const matchedRemovePattern = removePattern.find((pattern) =>
      pattern.exec(item.value),
    );

    if (!matchedRemovePattern && !matchedTruncatedPattern) {
      return;
    }

    const matchedPattern = matchedRemovePattern ?? matchedTruncatedPattern;

    if (!matchedPattern) {
      return;
    }

    const matchedResult = matchedPattern.exec(item.value);

    if (!matchedResult) {
      return;
    }

    insertAfter(
      concat<Content>(
        {
          type: 'text',
          value: item.value.slice(0, matchedResult.index),
        },
        /** 判断是图片格式截断，则展示缩略图 */
        matchedTruncatedPattern
          ? {
              type: 'image',
              url: '',
              alt: matchedResult.groups?.text || 'image',
            }
          : [],
      ),

      true,
    );
  };
}
