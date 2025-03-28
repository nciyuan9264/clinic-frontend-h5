import type { HTML } from 'mdast';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
  isImage,
  isParentOfContent,
  stringifyChildren,
  AstPluginPriority,
} from '../../utils';

const indicatorItem: HTML = {
  type: 'html',
  value: '<span class="indicator" />',
};

export class InsertIndicatorAstPlugin extends BaseAstPlugin {
  name = 'insert_indicator';

  config: AstPluginConfig = {
    isReverse: true,
    priority: AstPluginPriority.After,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    /** 图片后面不插入指示点 */
    if (isImage(item)) {
      stop();
      return;
    }
    /** 空列表项则直接在列表项内插入指示点 */
    if (
      isParentOfContent(item) &&
      item.type === 'listItem' &&
      !stringifyChildren(item.children, true).trim()
    ) {
      stop();
      insertAfter(
        [
          {
            ...item,
            children: [indicatorItem],
          },
        ],
        true,
      );

      return;
    }
    /** 非code的叶子结点类型则后面插入指示点 */
    if (isLiteralOfContent(item)) {
      stop();
      if (item.type === 'code') {
        return;
      }
      insertAfter([indicatorItem]);
    }
  };
}
