import type { Content } from 'mdast';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
  isTypeOfContent,
} from '../../utils';

const splitByLastSingleAsterisk = (source: string) => {
  if (!source.includes('*')) {
    return;
  }

  for (let index = source.length - 1; index >= 0; index--) {
    const currentChar = source[index];

    const prevChar = source[index - 1];

    const nextChar = source[index + 1];

    if (currentChar === '*' && prevChar !== '*' && nextChar !== '*') {
      return [source.slice(0, index), source.slice(index + 1)];
    }
  }
};

export class AutofixTruncatedEmphasisAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_emphasis';

  config: AstPluginConfig = {
    order: 'in_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop, parent }) => {
    /** 仅处理右下角第一个文本节点，且该文本节点的父节点为段落类型 */
    if (
      !isLiteralOfContent(item) ||
      !parent ||
      !isTypeOfContent(parent, 'paragraph')
    ) {
      stop();
      return;
    }

    if (item.type === 'text') {
      /** 分割在任意位置最后单独出现的 “*”，不支持下划线语法 */

      const matchedResult = splitByLastSingleAsterisk(item.value);

      if (!matchedResult) {
        return;
      }

      const [prefix, suffix] = matchedResult;

      const insertingContent: Content[] = [];

      if (prefix) {
        insertingContent.push({
          type: 'text',
          value: prefix,
        });
      }

      if (suffix) {
        insertingContent.push({
          type: 'emphasis',
          children: [{ type: 'text', value: suffix }],
        });
      }

      insertAfter(insertingContent, true);
    }
  };
}
