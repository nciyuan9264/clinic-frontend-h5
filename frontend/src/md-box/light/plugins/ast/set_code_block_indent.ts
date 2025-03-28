import type { Code } from 'mdast';
import { isUndefined } from 'lodash-es';

import {
  AstPluginModifier,
  BaseAstPlugin,
  getByIndex,
  isLiteralOfContent,
  isParent,
} from '../../utils';

const getStartIndexOfCodeBlockFirstLine = (line: string) => {
  const matchResult = line.match(/^(?<prefix>[\s]+)```/);

  if (!matchResult) {
    return null;
  }

  return matchResult.groups?.prefix.length ?? null;
};

export class SetCodeBlockIndentAstPlugin extends BaseAstPlugin {
  name = 'set_code_block_indent';

  modifier: AstPluginModifier = (
    item,
    { source, parent, insertAfter, skip },
  ) => {
    if (isParent(item) && parent) {
      skip();
      return;
    }

    if (!isLiteralOfContent(item)) {
      return;
    }

    if (item.type !== 'code') {
      return;
    }

    const { start } = item.position ?? {};

    if (!start) {
      return;
    }

    const { line } = start;

    const lineText = getByIndex(source.split('\n'), line - 1);

    const { meta, lang } = item;

    if (isUndefined(lineText)) {
      return;
    }

    const startIndex = getStartIndexOfCodeBlockFirstLine(lineText);

    if (startIndex === null) {
      return;
    }

    const indentMeta = `__indent=${startIndex}`;

    const newMeta = meta ? `${indentMeta} ${meta}` : indentMeta;

    const newCode: Code = {
      ...item,
      meta: newMeta,
      lang: lang ?? 'plaintext',
    };

    insertAfter([newCode], true);
  };
}
