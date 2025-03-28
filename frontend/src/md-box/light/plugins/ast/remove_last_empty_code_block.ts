import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
} from '../../utils';

export class RemoveLastEmptyCodeBlockAstPlugin extends BaseAstPlugin {
  name = 'remove_last_empty_code_block';

  config: AstPluginConfig = {
    order: 'in_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    if (!isLiteralOfContent(item)) {
      return;
    }

    stop();

    if (item.type !== 'code') {
      return;
    }

    const { value, lang, meta } = item;

    if (!value && !lang && !meta) {
      insertAfter([], true);
    }
  };
}
