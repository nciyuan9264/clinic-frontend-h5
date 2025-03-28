import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  autoDisableHtmlTag,
  isLiteralOfContent,
} from '../../utils';

export class DisableIllegalHtmlAstPlugin extends BaseAstPlugin {
  name = 'disable_illegal_html';

  config: AstPluginConfig = {
    order: 'pre_order',
    isReverse: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, enabledHtmlTags }) => {
    if (isLiteralOfContent(item) && item.type === 'html') {
      insertAfter(
        [
          {
            type: 'html',
            value: autoDisableHtmlTag(item.value, enabledHtmlTags),
          },
        ],
        true,
      );
    }
  };
}
