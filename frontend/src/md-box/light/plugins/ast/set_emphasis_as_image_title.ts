import { isUndefined } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isImage,
  getByIndex,
  isTypeOfContent,
  stringifyChildren,
} from '../../utils';

export class SetEmphasisAsImageTitleAstPlugin extends BaseAstPlugin {
  name = 'set_emphasis_as_image_title';

  config: AstPluginConfig = {
    order: 'pre_order',
    isReverse: true,
  };

  modifier: AstPluginModifier = (item, { parent, index }) => {
    if (!parent || isUndefined(index) || !isImage(item)) {
      return;
    }

    const nextSibling = getByIndex(parent.children, index + 1);

    const nextNextSibling = getByIndex(parent.children, index + 2);

    if (!nextSibling || !nextNextSibling) {
      return;
    }

    /** 下一个必须是换行文本 */
    if (!isTypeOfContent(nextSibling, 'text') || nextSibling.value !== '\n') {
      return;
    }

    /** 下下个必须是斜体 */
    if (!isTypeOfContent(nextNextSibling, 'emphasis')) {
      return;
    }

    const { children } = nextNextSibling;

    const { url } = item;

    const text = stringifyChildren(children, true);

    parent.children.splice(index, 3, {
      type: 'image',
      url,
      alt: text,
    });
  };
}
