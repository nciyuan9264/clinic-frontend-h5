import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
  isTypeOfContent,
  restoreMathPandocLatex,
} from '../../utils';

/**
 * 基于字符串替换的数学公式pandoc latex语法提取，会影响到代码块等Markdown元素的内部内容，因此
 * 这里用来恢复多余的语法提取（这样实现并不好，最好的方式是实现基于状态机的语法识别，但鉴于成本
 * 还是用的目前基于字符串的方案修补）
 */
export class RestoreMathPandocLatexInContentAstPlugin extends BaseAstPlugin {
  name = 'restore_math_pandoc_latex_in_content';

  config: AstPluginConfig = {
    order: 'pre_order',
  };

  modifier: AstPluginModifier = (item, { insertAfter }) => {
    if (!isLiteralOfContent(item)) {
      return;
    }

    if (!isTypeOfContent(item, 'code', 'inlineCode', 'math', 'inlineMath')) {
      return;
    }

    insertAfter([{ ...item, value: restoreMathPandocLatex(item.value) }], true);
  };
}
