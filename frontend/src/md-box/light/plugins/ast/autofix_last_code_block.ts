import type { Code } from 'mdast';
import { isString } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
} from '../../utils';

export class AutofixLastCodeBlockAstPlugin extends BaseAstPlugin {
  name = 'autofix_last_code_block';

  config: AstPluginConfig = {
    order: 'in_order',
    isReverse: true,
    fixEndingOnly: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter, stop }) => {
    if (!isLiteralOfContent(item)) {
      return;
    }

    stop();

    if (item.type === 'code') {
      const { content } =
        item.value.match(/^(?<content>[\S\s]*?)\n`+$/)?.groups || {};

      if (!isString(content)) {
        return;
      }

      const replacingCode: Code = {
        ...item,
        value: content,
      };

      insertAfter([replacingCode], true);
    } else if (item.type === 'text') {
      const { prefix } =
        item.value.match(/^(?<prefix>[\s\S]*?)`{1,2}$/)?.groups || {};

      if (!isString(prefix)) {
        return;
      }

      if (prefix) {
        insertAfter(
          [
            {
              type: 'text',
              value: prefix,
            },
          ],
          true,
        );
      } else {
        insertAfter([], true);
      }
    }
  };
}
