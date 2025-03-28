import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isParent,
  isTypeOfContent,
} from '../../utils';

export class AutofixTruncatedLinkAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_link';

  config: AstPluginConfig = {
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    const truncatedLinkPattern = [
      /** 如下为修复此链接格式的各种不完整情况：[[text]](link) */
      /\[(?<text>\[[^\]\n]*)$/,
      /\[(?<text>\[[^\]\n]+\])$/,
      /\[(?<text>\[[^\]\n]+\])\]$/,
      /\[(?<text>\[[^\]\n]+\])\]\([^\)\n]*$/,
      /** 如下为修复此链接格式的各种不完整情况：[text](link) */
      /\[(?<text>[^\]\n]*)$/,
      /\[(?<text>[^\]\n]+)\]$/,
      /\[(?<text>[^\]\n]+)\]\([^\)\n]*$/,
    ];

    if (isTypeOfContent(item, 'link')) {
      stop();
      return;
    }

    if (isParent(item) || !(item.type === 'text' || item.type === 'html')) {
      return;
    }

    /** 找到位置在最后的text后，无论是否匹配截断的链接，都不进行下一次迭代，因为本函数仅处理末尾被截断的链接 */
    stop();

    const matchedPattern = truncatedLinkPattern.find((pattern) =>
      pattern.exec(item.value),
    );

    if (!matchedPattern) {
      return;
    }

    const matchedResult = matchedPattern.exec(item.value);

    if (!matchedResult) {
      return;
    }

    const matchedText = matchedResult.groups?.text;

    const matchedIndex = matchedResult.index;

    if (!matchedText) {
      insertAfter(
        [
          {
            type: item.type,
            value: item.value.slice(0, matchedIndex),
          },
        ],
        true,
      );
    } else {
      insertAfter(
        [
          {
            type: item.type,
            value: item.value.slice(0, matchedIndex),
          },
          {
            type: 'link',
            title: null,
            url: '#',
            children: [
              {
                type: 'text',
                value: matchedText,
              },
            ],
          },
        ],
        true,
      );
    }
  };
}
