import {
  AstPluginConfig,
  AstPluginModifier,
  BaseAstPlugin,
  isLiteralOfContent,
} from '../../utils';

/**
 * [mdast-util-to-markdown源码中](https://github1s.com/syntax-tree/mdast-util-to-markdown/blob/HEAD/lib/util/container-phrasing.js#L58-L63)
 * 将html前面的文本末尾的换行符替换成了空格，导致html标签不能在文本后换行，影响数学公式html标签
 * 的展示，因此本文件用于将html前的文本末尾换行替换成br标签
 */
export class TransformEndlineBeforeHtmlAstPlugin extends BaseAstPlugin {
  name = 'transform_endline_before_html';

  config: AstPluginConfig = {
    order: 'pre_order',
  };

  modifier: AstPluginModifier = (item, { index, parent }) => {
    if (
      !isLiteralOfContent(item) ||
      item.type !== 'html' ||
      !parent ||
      !index
    ) {
      return;
    }

    const prevSibling = parent.children[index - 1];

    if (prevSibling.type !== 'text') {
      return;
    }

    const endlingWithInlineRegex = /(\r?\n|\r)$/;

    if (!endlingWithInlineRegex.test(prevSibling.value)) {
      return;
    }

    parent.children.splice(
      index - 1,
      1,
      {
        type: 'text',
        value: prevSibling.value.replace(endlingWithInlineRegex, ''),
      },
      {
        type: 'html',
        value: '<br />',
      },
    );
  };
}
