import { concat } from 'lodash-es';

import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isTypeOfContent,
} from '../../utils';
import { firstMatch } from '../../../utils';

/** 如下正则表达式列表可覆盖任意情况的不完整html */
const truncatedHtmlRegexList = [
  /**
   * 匹配结尾为如下的情况：
   * <
   * <img
   * <img /
   * <img src
   * <img src=
   * <img src="
   * <img src="abc
   * <img src="abc"
   * <img src="abc"/
   * <img src="abc" alt="test
   * <img src="abc" alt="test"
   * <img src="abc" alt="test"/
   */
  /<([a-zA-Z\-]+((\s+([a-zA-Z\-]+=(("[^"]*")|('[^']*'))))*(\s*\/?|(\s+[a-zA-Z\-]+(=(("[^"]*)|('[^']*))?)?)))?)?$/,
  /**
   * 匹配结尾为如下的情况：
   * </
   * </img
   */
  /<\/([a-zA-Z\-]+)?$/,
];

/**
 * 如下正则表达式匹配不完整的 data slot，规则比 html 宽松，因为存在 attribute 中的转义
 * 和 markdown 冲突的问题
 */
const truncatedDataSlotRegexList = [/<data-(inline|block)(\s.*)?$/];

export interface TruncateTruncatedHtmlSuffixOptions {
  /**
   * 宽松地截断 data slot
   * @default false
   */
  looseTruncateDataSlot?: boolean;
}

export const truncateTruncatedHtmlSuffix = (
  value: string,
  options: TruncateTruncatedHtmlSuffixOptions = {},
) => {
  const { looseTruncateDataSlot = false } = options;

  const firstMatched = firstMatch(
    concat(
      truncatedHtmlRegexList,
      looseTruncateDataSlot ? truncatedDataSlotRegexList : [],
    ),
    (item) => item.exec(value),
  );

  if (!firstMatched) {
    return value;
  }
  return value.slice(0, firstMatched.index);
};

export class AutofixTruncatedHtmlTagAstPlugin extends BaseAstPlugin {
  name = 'autofix_truncated_html_tag';

  config: AstPluginConfig = {
    isReverse: true,
  };

  modifier: AstPluginModifier = (
    item,
    { insertAfter, stop, looseTruncateDataSlot = false },
  ) => {
    if (!isTypeOfContent(item, 'text', 'html')) {
      return;
    }

    /** 找到位置在最后的literal后，无论是否匹配截断的链接，都不进行下一次迭代，因为本函数仅处理末尾被截断的html标签 */
    stop();

    const fixedValue = truncateTruncatedHtmlSuffix(item.value, {
      looseTruncateDataSlot,
    });

    insertAfter(
      fixedValue
        ? [
            {
              type: item.type,
              value: fixedValue,
            },
          ]
        : [],
      true,
    );
  };
}
