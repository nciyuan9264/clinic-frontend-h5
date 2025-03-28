import { isUndefined } from 'lodash-es';

import {
  AstPluginModifier,
  BaseAstPlugin,
  getByIndex,
  isLiteralOfContent,
} from '../../utils';

export class RemoveBreakBeforeHtmlAstPlugin extends BaseAstPlugin {
  name = 'remove_break_before_html';

  modifier: AstPluginModifier = (item, { parent, index }) => {
    if (
      !isLiteralOfContent(item) ||
      item.type !== 'html' ||
      !parent ||
      isUndefined(index)
    ) {
      return;
    }

    const prevNode = getByIndex(parent?.children, index - 1);

    if (!prevNode || prevNode.type !== 'break') {
      return;
    }

    parent.children.splice(index - 1, 1);
  };
}
