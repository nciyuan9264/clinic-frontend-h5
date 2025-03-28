import type { Parent, Content } from 'mdast';

import {
  AstPluginConfig,
  AstPluginModifier,
  AstPluginPriority,
  BaseAstPlugin,
  isParent,
  isParentOfContent,
} from '../../utils';

const mergeTextChildren = (parent: Parent) => {
  const { children } = parent;

  const mergedChildren: Content[] = [];

  let currentText = '';

  for (let index = 0; index < children.length; index++) {
    const current = children[index];

    if (current.type === 'text') {
      currentText += current.value;
    }

    if (current.type !== 'text' || index === children.length - 1) {
      if (currentText) {
        mergedChildren.push({
          type: 'text',
          value: currentText,
        });
      }
      currentText = '';
    }

    if (current.type !== 'text') {
      mergedChildren.push(current);
    }
  }

  parent.children = mergedChildren;
};

export class AutoMergeSiblingTextAstPlugin extends BaseAstPlugin {
  name = 'extract_custom_autolink';

  config: AstPluginConfig = {
    priority: AstPluginPriority.AfterAll,
  };

  modifier: AstPluginModifier = (item, { skip, recursiveModifier }) => {
    if (!isParentOfContent(item)) {
      return;
    }

    mergeTextChildren(item);

    skip();

    for (const child of item.children) {
      if (isParent(child)) {
        recursiveModifier(child);
      }
    }
  };
}
