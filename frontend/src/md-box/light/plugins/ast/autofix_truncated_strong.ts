import type { Content } from 'mdast';
import { isUndefined } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isParentOfContent,
  isTypeOfContent,
} from '../../utils';

export class AutofixTruncatedStrongAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_strong';

  config: AstPluginConfig = {
    order: 'in_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier[] = [
    (item, { insertAfter, stop, parent }) => {
      /** 仅处理右下角第一个文本节点，且该文本节点的父节点为段落类型 */
      if (
        !isTypeOfContent(item, 'text') ||
        !parent ||
        !isTypeOfContent(parent, 'paragraph')
      ) {
        stop();
        return;
      }

      const matchedGroups = item.value.match(
        /^(?<prefix>[\s\S]*?)(_{2}|\*{2})(?<suffix>[\s\S]*?)\*?$/,
      )?.groups;

      if (!matchedGroups) {
        return;
      }

      const { prefix, suffix } = matchedGroups;

      const insertingContent: Content[] = [];

      if (prefix) {
        insertingContent.push({
          type: 'text',
          value: prefix,
        });
      }

      if (suffix) {
        insertingContent.push({
          type: 'strong',
          children: [{ type: 'text', value: suffix }],
        });
      }

      insertAfter(insertingContent, true);
    },
    (item, { stop, parent, index }) => {
      /** 自底到上找父元素，非父元素则跳过 */
      if (!isParentOfContent(item)) {
        return;
      }
      /** 末尾最底层父元素不是斜体、或是斜体但是没有上层父元素、或没有父元素中其所在的下标，则中止迭代 */
      if (!isTypeOfContent(item, 'emphasis') || !parent || isUndefined(index)) {
        stop();
        return;
      }
      const prevSibling = parent.children[index - 1];
      /** 前一个兄弟节点不是文本则中止迭代 */
      if (!prevSibling || !isTypeOfContent(prevSibling, 'text')) {
        stop();
        return;
      }
      const matchResult = /(?<prefix>(.*[^\*])|^)\*$/.exec(prevSibling.value);
      /** 前一个兄弟节点末尾没有单独的星号则停止迭代 */
      if (!matchResult) {
        stop();
        return;
      }
      const { prefix } = matchResult.groups ?? {};
      const replacingContents: Content[] = [];
      if (prefix) {
        replacingContents.push({
          type: 'text',
          value: prefix,
        });
      }
      replacingContents.push({
        type: 'strong',
        children: item.children,
      });
      parent.children.splice(index - 1, 2, ...replacingContents);
    },
    (item, { stop, insertAfter }) => {
      if (!isParentOfContent(item) || item.type === 'listItem') {
        return;
      }

      /** 最后一个非列表项的 Parent 非列表则不再迭代 */
      if (item.type !== 'list') {
        stop();

        return;
      }

      /** 最后一个列表为空，代表可能是加粗前缀的星号导致，因此需要去掉该空列表 */
      if (
        !item.children.length ||
        (item.children.length === 1 && !item.children[0].children.length)
      ) {
        insertAfter([], true);
        stop();

        return;
      }
    },
  ];
}
