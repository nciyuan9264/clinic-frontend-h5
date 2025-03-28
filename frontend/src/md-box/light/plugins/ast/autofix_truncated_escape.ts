import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isParent,
} from '../../utils';

export class AutofixTruncatedEscapePlugin extends BaseAstPlugin {
  name = 'autofix_truncated_escape';

  config: AstPluginConfig = {
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    if (isParent(item) || item.type !== 'text') {
      return;
    }

    /** 找到位置在最后的text后，无论是否匹配截断的链接，都不进行下一次迭代，因为本函数仅处理末尾被截断的转义反斜杠 */
    stop();

    const matchedResult = item.value.match(/^(?<text>[\s\S]*)\\$/);

    if (!matchedResult) {
      return;
    }

    const matchedText = matchedResult.groups?.text ?? '';

    insertAfter(
      [
        {
          type: 'text',
          value: matchedText,
        },
      ],
      true,
    );
  };
}
