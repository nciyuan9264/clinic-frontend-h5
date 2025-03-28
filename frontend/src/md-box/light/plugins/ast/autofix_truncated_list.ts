import { isUndefined } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isParent,
  isRoot,
  isTypeOfContent,
} from '../../utils';

export class AutofixTruncatedListAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_list';

  config: AstPluginConfig = {
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier[] = [
    (item, { insertAfter, stop, index, parent }) => {
      if (isParent(item)) {
        /** 仅允许遍历时访问 root、paragraph 类型的父节点 */
        if (!isTypeOfContent(item, 'paragraph') && !isRoot(item)) {
          stop();
        }
        return;
      }

      /** 仅允许遍历时访问 text 类型的叶子结点 */
      if (!isTypeOfContent(item, 'text')) {
        stop();

        return;
      }

      /** text 叶子结点必须是父节点的唯一子节点 */
      if (
        isUndefined(index) ||
        index !== 0 ||
        !parent ||
        parent.children.length > 1
      ) {
        stop();

        return;
      }

      const endlinePureNumberMatchResult =
        /^(?<prefix>.*)\n\s*(?<value>([0-9]+?\.?)|(\-\s*))$/.exec(item.value);

      /** text 必须为纯数字 */
      if (endlinePureNumberMatchResult) {
        const { prefix } = endlinePureNumberMatchResult.groups ?? {};

        insertAfter(
          [
            {
              type: 'text',
              value: prefix,
            },
          ],
          true,
        );
      } else if (/^\s*[0-9]+$/.exec(item.value)) {
        insertAfter([], true);
      }

      stop();
    },
    (item, { insertAfter, stop, index, parent, parents }) => {
      if (isParent(item)) {
        /** 仅允许遍历时访问 root、list、listItem、paragraph 类型的父节点 */
        if (
          !isTypeOfContent(item, 'list', 'listItem', 'paragraph') &&
          !isRoot(item)
        ) {
          stop();
        }
        return;
      }

      /** 仅允许遍历时访问 text 类型的叶子结点 */
      if (!isTypeOfContent(item, 'text')) {
        stop();

        return;
      }

      /** 当前节点必须是列表的内层节点 */
      if (
        !parent ||
        !isTypeOfContent(parents[0], 'paragraph') ||
        !isTypeOfContent(parents[1], 'listItem') ||
        !isTypeOfContent(parents[2], 'list')
      ) {
        stop();

        return;
      }

      /** 当前节点必须是末尾的节点 */
      if (index !== parent.children.length - 1) {
        stop();
        return;
      }

      const matchResult = /^(?<prefix>.*)\n\s*(?<value>[0-9]+?)$/.exec(
        item.value,
      );

      /** 最后的列表项最后一行为纯数字 */
      if (matchResult) {
        const { prefix } = matchResult.groups ?? {};

        insertAfter(
          [
            {
              type: 'text',
              value: prefix,
            },
          ],
          true,
        );
      }

      stop();
    },
  ];
}
