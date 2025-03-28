import pangu from 'pangu';

import {
  AstPluginConfig,
  AstPluginModifier,
  AstPluginPriority,
  BaseAstPlugin,
  INSERT_ELEMENT_SLOT_NAME,
  isTypeOfContent,
} from '../../utils';
import { splitStringByPattern } from '../../../utils';

/** 自动插入空格时，支持分组分别插入（分组之间不会插入空格），如下是分组的匹配正则 */
const autoSpacingGroupPatterns = [
  String.raw`\{${INSERT_ELEMENT_SLOT_NAME}_[0-9]+_.*?\}`,
];

export class AutoSpacingAllTextAstPlugin extends BaseAstPlugin {
  name = 'auto_spacing_all_text';

  config: AstPluginConfig = {
    priority: AstPluginPriority.AfterAll,
    order: 'pre_order',
    isReverse: true,
  };

  modifier: AstPluginModifier = (item, { insertAfter }) => {
    if (!isTypeOfContent(item, 'text')) {
      return;
    }

    const { value } = item;

    const textGroups = splitStringByPattern(
      value,
      new RegExp(
        `(${autoSpacingGroupPatterns.map((item) => `(${item})`).join('|')})`,
        'g',
      ),
    );

    insertAfter(
      [
        {
          type: 'text',
          value: textGroups.map((item) => pangu.spacing(item)).join(''),
        },
      ],
      true,
    );
  };
}
