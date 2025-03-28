import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isHeading,
  isParent,
  stringifyChildren,
} from '../../utils';

export class AutofixHeadingAstPlugin extends BaseAstPlugin {
  name = 'autofix_heading';

  config: AstPluginConfig = {
    order: 'pre_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    if (!isParent(item)) {
      stop();
      return;
    }

    if (!isHeading(item)) {
      return;
    }

    if (item.depth === 1 && !stringifyChildren(item.children).trim()) {
      insertAfter([], true);
    }

    stop();
  };
}
