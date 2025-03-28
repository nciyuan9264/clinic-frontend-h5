import { Content, Parent } from 'mdast';
import { findLast, isString } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isParent,
  stringifyChildren,
} from '../../utils';
import { assert } from '../../../utils';

const getLastTextNodeByRegex = (ast: Parent, regex: RegExp) => {
  const target = findLast(ast.children, (item): item is Content =>
    Boolean(item.type === 'text' && item.value.match(regex)),
  );

  if (!target) {
    return;
  }

  assert(target.type === 'text', 'lastUnPaired.type must be text');

  const index = ast.children.findIndex((item) => item === target);

  assert(index >= 0, 'lastUnPairedIndex must >= 0');

  return { target, index };
};

const UNPAIRED_REGEX = /^(?<prefix>.*([^\\`]|^))`(?!`)(?<suffix>.*?)$/;

export class AutofixLastInlineCodeBlockAstPlugin extends BaseAstPlugin {
  name = 'autofix_last_inline_code_block';

  config: AstPluginConfig = {
    order: 'in_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { stop }) => {
    if (!isParent(item)) {
      return;
    }

    /** 仅找到第一个紧贴右边界的非叶节点 */
    stop();

    const lastUnPaired = getLastTextNodeByRegex(item, UNPAIRED_REGEX);

    if (!lastUnPaired) {
      return;
    }

    const { target: lastUnPairedTarget, index: lastUnPairedIndex } =
      lastUnPaired;

    /** 未配对的内联代码块引号后不能有内联代码块 */
    if (
      item.children
        .slice(lastUnPairedIndex + 1)
        .find((item) => item.type === 'inlineCode')
    ) {
      return;
    }

    const { prefix, suffix } =
      lastUnPairedTarget.value.match(UNPAIRED_REGEX)?.groups || {};

    if (!isString(suffix) || !isString(prefix)) {
      return;
    }

    const insertingContent: Content[] = [];

    if (prefix) {
      insertingContent.push({
        type: 'text',
        value: prefix,
      });
    }

    const concatenatedInlineCode = `${suffix}${stringifyChildren(
      item.children.slice(lastUnPairedIndex + 1),
      true,
    )}`;

    if (concatenatedInlineCode) {
      insertingContent.push({
        type: 'inlineCode',
        value: concatenatedInlineCode,
      });
    }

    item.children.splice(
      lastUnPairedIndex,
      item.children.length - lastUnPairedIndex,
      ...insertingContent,
    );
  };
}
