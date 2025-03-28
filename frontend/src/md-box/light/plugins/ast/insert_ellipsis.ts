import {
  AstPluginConfig,
  AstPluginModifier,
  AstPluginPriority,
  BaseAstPlugin,
  isParentOfContent,
  isTypeOfContent,
} from '../../utils';

export const ellipsisContent = '...';

export class InsertEllipsisAstPlugin extends BaseAstPlugin {
  name = 'insert_ellipsis';

  config: AstPluginConfig = {
    isReverse: true,
    priority: AstPluginPriority.After,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    if (isParentOfContent(item) && !isTypeOfContent(item, 'link')) {
      return;
    }

    stop();

    if (isTypeOfContent(item, 'text')) {
      insertAfter(
        [
          {
            type: 'text',
            value: `${item.value}${ellipsisContent}`,
          },
        ],
        true,
      );
    }

    if (isTypeOfContent(item, 'link', 'inlineCode')) {
      insertAfter(
        [
          {
            type: 'text',
            value: ellipsisContent,
          },
        ],
        false,
      );
    }
  };
}
